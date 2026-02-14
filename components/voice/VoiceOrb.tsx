'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TranscriptPill from './TranscriptPill';

type VoiceState = 'idle' | 'connecting' | 'listening' | 'speaking' | 'error';

interface VoiceOrbProps {
  onTranscript?: (text: string, role: 'user' | 'agent') => void;
}

const stateConfig: Record<VoiceState, { color: string; glow: string; label: string }> = {
  idle: { color: 'bg-zinc-700', glow: 'shadow-zinc-700/20', label: 'Talk to Valet' },
  connecting: { color: 'bg-zinc-500', glow: 'shadow-zinc-500/20', label: 'Connecting...' },
  listening: { color: 'bg-violet-500', glow: 'shadow-violet-500/30', label: 'Listening...' },
  speaking: { color: 'bg-cyan-400', glow: 'shadow-cyan-400/30', label: '' },
  error: { color: 'bg-rose-500', glow: 'shadow-rose-500/30', label: 'Tap to retry' },
};

export default function VoiceOrb({ onTranscript }: VoiceOrbProps) {
  const [state, setState] = useState<VoiceState>('idle');
  const [userTranscript, setUserTranscript] = useState('');
  const [agentTranscript, setAgentTranscript] = useState('');

  const handleClick = useCallback(async () => {
    if (state === 'idle' || state === 'error') {
      const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
      if (!agentId) {
        setState('error');
        return;
      }

      setState('connecting');
      try {
        // Dynamic import ElevenLabs when needed
        const { useConversation } = await import('@elevenlabs/react');
        // For now, simulate the connection
        setTimeout(() => setState('listening'), 1500);
      } catch {
        setState('error');
      }
    } else {
      // End session
      setState('idle');
      setUserTranscript('');
      setAgentTranscript('');
    }
  }, [state]);

  const config = stateConfig[state];
  const isActive = state === 'listening' || state === 'speaking';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2">
      {/* Transcript pill */}
      <AnimatePresence>
        {isActive && (userTranscript || agentTranscript) && (
          <TranscriptPill
            userText={userTranscript}
            agentText={agentTranscript}
            isListening={state === 'listening'}
          />
        )}
      </AnimatePresence>

      {/* Pulse rings when active */}
      <div className="relative">
        <AnimatePresence>
          {state === 'listening' && (
            <>
              <motion.div
                initial={{ scale: 1, opacity: 0.4 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full bg-violet-500/30"
              />
              <motion.div
                initial={{ scale: 1, opacity: 0.3 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
                className="absolute inset-0 rounded-full bg-violet-500/20"
              />
            </>
          )}
        </AnimatePresence>

        {/* Main orb */}
        <motion.button
          onClick={handleClick}
          whileTap={{ scale: 0.95 }}
          className={`
            relative w-16 h-16 rounded-full ${config.color} shadow-lg ${config.glow}
            flex items-center justify-center
            ${state === 'idle' ? 'animate-breathing' : ''}
            ${state === 'connecting' ? 'animate-pulse' : ''}
            transition-colors duration-300
          `}
          aria-label={config.label || 'Voice orb'}
          aria-live="polite"
        >
          {/* Audio bars */}
          {(state === 'listening' || state === 'speaking') && (
            <div className="flex items-center gap-0.5 h-7">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: state === 'listening'
                      ? [12, 24, 16, 28, 12]
                      : [10, 18, 14, 20, 10],
                  }}
                  transition={{
                    duration: state === 'listening' ? 0.8 : 1.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.1,
                  }}
                  className="w-1 rounded-full bg-white/90"
                />
              ))}
            </div>
          )}

          {/* Idle mic icon */}
          {state === 'idle' && (
            <svg className="w-6 h-6 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
            </svg>
          )}

          {/* Connecting spinner */}
          {state === 'connecting' && (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}

          {/* Error icon */}
          {state === 'error' && (
            <span className="text-white text-xl">!</span>
          )}
        </motion.button>
      </div>

      {/* Label */}
      <span className="text-[10px] text-zinc-500 font-medium">{config.label}</span>
    </div>
  );
}
