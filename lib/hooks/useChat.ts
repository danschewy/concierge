'use client';

import { useState, useCallback, useRef } from 'react';
import type { ChatMessage, CardType } from '@/lib/types';
import type { ToolName } from '@/lib/types/tools';
import { generateId } from '@/lib/utils/format';
import { appendMissionHistory } from '@/lib/utils/mission-history';

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

interface UserLocation {
  latitude: number;
  longitude: number;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const userLocationRef = useRef<UserLocation | null>(null);
  const hasPromptedForLocationRef = useRef(false);

  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages(prev => [...prev, msg]);
  }, []);

  const updateMessage = useCallback((id: string, updates: Partial<ChatMessage>) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  }, []);

  const appendMessageContent = useCallback((
    id: string,
    chunk: string,
    status: ChatMessage['status'] = 'streaming'
  ) => {
    if (!chunk) return;
    setMessages(prev =>
      prev.map(m =>
        m.id === id
          ? { ...m, content: `${m.content}${chunk}`, status }
          : m
      )
    );
  }, []);

  const requestBrowserLocation = useCallback(async (): Promise<UserLocation | null> => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      return null;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          userLocationRef.current = location;
          resolve(location);
        },
        () => resolve(null),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5 * 60 * 1000,
        }
      );
    });
  }, []);

  const resolveUserLocation = useCallback(async (): Promise<UserLocation | null> => {
    if (userLocationRef.current) {
      return userLocationRef.current;
    }

    if (hasPromptedForLocationRef.current) {
      return null;
    }

    hasPromptedForLocationRef.current = true;
    return requestBrowserLocation();
  }, [requestBrowserLocation]);

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
      const userLocation = await resolveUserLocation();
      abortRef.current = new AbortController();
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          userLocation: userLocation ?? undefined,
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) throw new Error('Chat request failed');
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let currentReasoningId: string | null = null;
      let currentAssistantId: string | null = null;

      const completeMessage = (id: string | null) => {
        if (!id) return;
        updateMessage(id, { status: 'complete' });
      };

      const closeReasoning = () => {
        completeMessage(currentReasoningId);
        currentReasoningId = null;
      };

      const closeAssistant = () => {
        completeMessage(currentAssistantId);
        currentAssistantId = null;
      };

      const handleStreamEvent = (event: StreamEvent) => {
        switch (event.type) {
          case 'reasoning': {
            const chunk = event.content || '';
            if (!chunk) break;
            closeAssistant();
            if (currentReasoningId) {
              appendMessageContent(currentReasoningId, chunk);
            } else {
              const id = generateId();
              currentReasoningId = id;
              addMessage({
                id,
                role: 'reasoning',
                content: chunk,
                timestamp: new Date(),
                status: 'streaming',
              });
            }
            break;
          }
          case 'tool_call': {
            closeReasoning();
            closeAssistant();
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
            closeReasoning();
            closeAssistant();

            const toolName = event.toolName as ToolName;
            const cardType = event.cardType || TOOL_CARD_MAP[toolName];

            if (event.toolName) {
              appendMissionHistory(event.toolName, event.result);
            }

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
            const chunk = event.content || '';
            if (!chunk) break;
            closeReasoning();
            if (currentAssistantId) {
              appendMessageContent(currentAssistantId, chunk);
            } else {
              const id = generateId();
              currentAssistantId = id;
              addMessage({
                id,
                role: 'assistant',
                content: chunk,
                timestamp: new Date(),
                status: 'streaming',
              });
            }
            break;
          }
          case 'error': {
            closeReasoning();
            closeAssistant();
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
            closeReasoning();
            closeAssistant();
            break;
          }
        }
      };

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
            handleStreamEvent(event);
          } catch {
            // Skip malformed lines
          }
        }
      }

      // Process remaining buffer
      if (buffer.trim()) {
        try {
          const event: StreamEvent = JSON.parse(buffer);
          handleStreamEvent(event);
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

  }, [messages, isProcessing, addMessage, updateMessage, appendMessageContent, resolveUserLocation]);

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
