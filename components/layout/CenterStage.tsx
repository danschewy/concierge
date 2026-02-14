'use client';

import { useCallback, useState } from 'react';
import AgentFeed from '@/components/chat/AgentFeed';
import ChatInput from '@/components/chat/ChatInput';
import NewMessagesPill from '@/components/chat/NewMessagesPill';
import { useChat } from '@/lib/hooks/useChat';
import { useAutoScroll } from '@/lib/hooks/useAutoScroll';

interface CenterStageProps {
  onVoiceToggle?: () => void;
  onQuickAction?: (handler: (text: string) => void) => void;
}

export default function CenterStage({ onVoiceToggle }: CenterStageProps) {
  const { messages, isProcessing, sendMessage } = useChat();
  const { containerRef, hasNewMessages, scrollToBottom } = useAutoScroll(messages.length);
  const [prefillText, setPrefillText] = useState('');

  const handlePrefill = useCallback((text: string) => {
    setPrefillText(text);
  }, []);

  // Expose prefill handler for parent to use
  if (typeof window !== 'undefined') {
    (window as unknown as Record<string, unknown>).__gothamPrefill = handlePrefill;
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 relative">
      {/* Feed */}
      <div ref={containerRef} className="flex-1 overflow-y-auto px-4 relative">
        <AgentFeed messages={messages} />
        <NewMessagesPill visible={hasNewMessages} onClick={scrollToBottom} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={sendMessage}
        isProcessing={isProcessing}
        onVoiceToggle={onVoiceToggle}
        prefillText={prefillText}
        onPrefillClear={() => setPrefillText('')}
      />
    </div>
  );
}
