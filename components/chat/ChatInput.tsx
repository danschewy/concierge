'use client';

import { useState, useRef, useCallback, useEffect, KeyboardEvent } from 'react';
import { Send, Mic } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isProcessing: boolean;
  onVoiceToggle?: () => void;
  prefillText?: string;
  onPrefillClear?: () => void;
}

export default function ChatInput({ onSend, isProcessing, onVoiceToggle, prefillText, onPrefillClear }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle prefill
  useEffect(() => {
    if (prefillText) {
      setInput(prefillText);
      onPrefillClear?.();
      textareaRef.current?.focus();
    }
  }, [prefillText, onPrefillClear]);

  const handleSend = useCallback(() => {
    if (!input.trim() || isProcessing) return;
    onSend(input);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [input, isProcessing, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const target = e.target;
    target.style.height = 'auto';
    target.style.height = Math.min(target.scrollHeight, 120) + 'px';
  };

  return (
    <div className="sticky bottom-0 z-20 bg-zinc-950/80 backdrop-blur-xl border-t border-[var(--border-default)] p-3">
      <div className="flex items-end gap-2">
        <button
          onClick={onVoiceToggle}
          className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors shrink-0"
          aria-label="Toggle voice"
        >
          <Mic className="w-5 h-5" />
        </button>

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={isProcessing ? 'Thinking...' : 'Where do you need to be? What can I handle for you?'}
            disabled={isProcessing}
            rows={1}
            className="w-full resize-none bg-zinc-900 border border-[var(--border-default)] focus:border-violet-500/40
              rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600
              focus:outline-none focus:ring-1 focus:ring-violet-500/20
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200"
            aria-label="Chat message input"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!input.trim() || isProcessing}
          className="p-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white
            disabled:opacity-30 disabled:cursor-not-allowed
            transition-colors shrink-0"
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
