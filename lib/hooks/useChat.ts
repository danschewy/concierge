'use client';

import { useState, useCallback, useRef } from 'react';
import type { ChatMessage, CardType } from '@/lib/types';
import type { ToolName } from '@/lib/types/tools';
import { generateId } from '@/lib/utils/format';
import { getDemoMessages } from '@/lib/mock-data';

// Map tool names to card types
const TOOL_CARD_MAP: Partial<Record<ToolName, CardType>> = {
  get_subway_status: 'subway_status',
  get_weather: 'weather',
  get_bike_availability: 'bike_availability',
  book_ride: 'ride_status',
  order_food: 'food_order',
  create_delivery: 'errand',
  book_reservation: 'reservation',
  search_events: 'event',
  search_restaurants: 'restaurant',
  search_web: 'search_results',
  check_budget: 'budget_summary',
};

interface StreamEvent {
  type: 'reasoning' | 'tool_call' | 'tool_result' | 'assistant' | 'error' | 'done';
  content?: string;
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  result?: unknown;
  cardType?: CardType;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(getDemoMessages());
  const [isProcessing, setIsProcessing] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages(prev => [...prev, msg]);
  }, []);

  const updateMessage = useCallback((id: string, updates: Partial<ChatMessage>) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isProcessing) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      status: 'complete',
    };
    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    // Build message history for the API
    const apiMessages = [...messages, userMsg]
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    try {
      abortRef.current = new AbortController();
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) throw new Error('Chat request failed');
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let currentReasoningId: string | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event: StreamEvent = JSON.parse(line);
            handleStreamEvent(event, currentReasoningId, (id) => { currentReasoningId = id; });
          } catch {
            // Skip malformed lines
          }
        }
      }

      // Process remaining buffer
      if (buffer.trim()) {
        try {
          const event: StreamEvent = JSON.parse(buffer);
          handleStreamEvent(event, currentReasoningId, (id) => { currentReasoningId = id; });
        } catch {
          // Skip
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      addMessage({
        id: generateId(),
        role: 'assistant',
        content: 'Something went wrong. Please try again.',
        timestamp: new Date(),
        status: 'error',
      });
    } finally {
      setIsProcessing(false);
    }

    function handleStreamEvent(
      event: StreamEvent,
      currentReasoningId: string | null,
      setReasoningId: (id: string | null) => void
    ) {
      switch (event.type) {
        case 'reasoning': {
          if (currentReasoningId) {
            // Append to existing reasoning
            updateMessage(currentReasoningId, {
              content: event.content || '',
              status: 'complete',
            });
          } else {
            const id = generateId();
            setReasoningId(id);
            addMessage({
              id,
              role: 'reasoning',
              content: event.content || '',
              timestamp: new Date(),
              status: 'complete',
            });
          }
          break;
        }
        case 'tool_call': {
          setReasoningId(null);
          addMessage({
            id: generateId(),
            role: 'tool_call',
            content: '',
            toolName: event.toolName,
            toolArgs: event.toolArgs,
            status: 'pending',
            timestamp: new Date(),
          });
          break;
        }
        case 'tool_result': {
          const toolName = event.toolName as ToolName;
          const cardType = event.cardType || TOOL_CARD_MAP[toolName];

          // Update the tool_call status to complete
          setMessages(prev => {
            const lastToolCall = [...prev].reverse().find(
              m => m.role === 'tool_call' && m.toolName === event.toolName && m.status === 'pending'
            );
            if (lastToolCall) {
              return prev.map(m =>
                m.id === lastToolCall.id ? { ...m, status: 'complete' as const } : m
              );
            }
            return prev;
          });

          if (cardType) {
            addMessage({
              id: generateId(),
              role: 'tool_result',
              content: '',
              toolName: event.toolName,
              toolResult: event.result,
              cardType,
              status: 'complete',
              timestamp: new Date(),
            });
          }
          break;
        }
        case 'assistant': {
          setReasoningId(null);
          addMessage({
            id: generateId(),
            role: 'assistant',
            content: event.content || '',
            timestamp: new Date(),
            status: 'complete',
          });
          break;
        }
        case 'error': {
          setReasoningId(null);
          addMessage({
            id: generateId(),
            role: 'assistant',
            content: event.content || 'An error occurred.',
            timestamp: new Date(),
            status: 'error',
          });
          break;
        }
        case 'done': {
          // Done
          break;
        }
      }
    }
  }, [messages, isProcessing, addMessage, updateMessage]);

  const cancelRequest = useCallback(() => {
    abortRef.current?.abort();
    setIsProcessing(false);
  }, []);

  return {
    messages,
    isProcessing,
    sendMessage,
    cancelRequest,
    addMessage,
  };
}
