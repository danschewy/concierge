'use client';

import { useState, useCallback } from 'react';
import type { AgentState } from '@/lib/types';

export function useAgentState() {
  const [agentState, setAgentState] = useState<AgentState>('idle');
  const [currentTool, setCurrentTool] = useState<string | null>(null);

  const startThinking = useCallback(() => {
    setAgentState('thinking');
    setCurrentTool(null);
  }, []);

  const startExecuting = useCallback((toolName: string) => {
    setAgentState('executing');
    setCurrentTool(toolName);
  }, []);

  const finishExecuting = useCallback(() => {
    setAgentState('thinking');
    setCurrentTool(null);
  }, []);

  const setIdle = useCallback(() => {
    setAgentState('idle');
    setCurrentTool(null);
  }, []);

  return {
    agentState,
    currentTool,
    startThinking,
    startExecuting,
    finishExecuting,
    setIdle,
    isProcessing: agentState !== 'idle',
  };
}
