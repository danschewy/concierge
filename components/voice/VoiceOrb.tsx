'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TranscriptPill from './TranscriptPill';

type VoiceState = 'idle' | 'listening' | 'transcribing' | 'error';

interface VoiceOrbProps {
  onTranscript?: (text: string, role: 'user' | 'agent') => void;
}

const stateConfig: Record<VoiceState, { color: string; glow: string; label: string }> = {
  idle: { color: 'bg-zinc-700', glow: 'shadow-zinc-700/20', label: 'Talk to Valet' },
  listening: { color: 'bg-violet-500', glow: 'shadow-violet-500/30', label: 'Listening...' },
  transcribing: { color: 'bg-zinc-500', glow: 'shadow-zinc-500/20', label: 'Transcribing...' },
  error: { color: 'bg-rose-500', glow: 'shadow-rose-500/30', label: 'Tap to retry' },
};

const PREFERRED_AUDIO_MIME_TYPE = 'audio/webm;codecs=opus';

function audioExtensionFromMimeType(mimeType: string): string {
  if (mimeType.includes('webm')) return 'webm';
  if (mimeType.includes('mp4')) return 'mp4';
  if (mimeType.includes('mpeg')) return 'mp3';
  if (mimeType.includes('wav')) return 'wav';
  if (mimeType.includes('ogg')) return 'ogg';
  return 'webm';
}

async function parseTranscriptionResponse(response: Response): Promise<{ text?: string; error?: string }> {
  const raw = await response.text();
  if (!raw) return {};
  try {
    return JSON.parse(raw) as { text?: string; error?: string };
  } catch {
    return { error: raw };
  }
}

export default function VoiceOrb({ onTranscript }: VoiceOrbProps) {
  const [state, setState] = useState<VoiceState>('idle');
  const [userTranscript, setUserTranscript] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const releaseMediaStream = useCallback(() => {
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    mediaStreamRef.current = null;
  }, []);

  const applyTranscript = useCallback((text: string) => {
    if (typeof window === 'undefined') return;
    const globalWindow = window as unknown as Record<string, unknown>;
    const prefill = globalWindow.__gothamPrefill;
    if (typeof prefill === 'function') {
      (prefill as (transcript: string) => void)(text);
    }
  }, []);

  const transcribeAudio = useCallback(async (blob: Blob) => {
    if (blob.size === 0) {
      setState('error');
      return;
    }

    setState('transcribing');

    try {
      const fileType = blob.type || 'audio/webm';
      const formData = new FormData();
      const extension = audioExtensionFromMimeType(fileType);
      const file = new File([blob], `speech-${Date.now()}.${extension}`, { type: fileType });
      formData.append('audio', file);

      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData,
      });

      const payload = await parseTranscriptionResponse(response);
      if (!response.ok) {
        throw new Error(payload.error || 'Failed to transcribe');
      }

      const transcript = (payload.text || '').trim();
      if (!transcript) {
        throw new Error('Empty transcript');
      }

      setUserTranscript(transcript);
      applyTranscript(transcript);
      onTranscript?.(transcript, 'user');
      setState('idle');
    } catch (error) {
      console.error('Voice orb transcription failed:', error);
      setState('error');
    }
  }, [applyTranscript, onTranscript]);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setState('error');
      return;
    }

    setUserTranscript('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const supportsPreferredType = typeof MediaRecorder.isTypeSupported === 'function'
        && MediaRecorder.isTypeSupported(PREFERRED_AUDIO_MIME_TYPE);
      const mimeType = supportsPreferredType ? PREFERRED_AUDIO_MIME_TYPE : '';
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      audioChunksRef.current = [];

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        setState('error');
        releaseMediaStream();
      };

      recorder.onstop = () => {
        if (audioChunksRef.current.length === 0) {
          mediaRecorderRef.current = null;
          releaseMediaStream();
          setState('error');
          return;
        }

        const chunkType = audioChunksRef.current[0]?.type || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: chunkType });
        audioChunksRef.current = [];
        mediaRecorderRef.current = null;
        releaseMediaStream();
        void transcribeAudio(audioBlob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start(250);
      setState('listening');
    } catch (error) {
      console.error('Voice orb recording failed:', error);
      setState('error');
      releaseMediaStream();
    }
  }, [releaseMediaStream, transcribeAudio]);

  const handleClick = useCallback(() => {
    if (state === 'transcribing') return;

    if (state === 'listening') {
      stopRecording();
      return;
    }

    if (state === 'idle' || state === 'error') {
      void startRecording();
    }
  }, [state, startRecording, stopRecording]);

  useEffect(() => {
    return () => {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== 'inactive') {
        recorder.onstop = null;
        recorder.stop();
      }
      releaseMediaStream();
    };
  }, [releaseMediaStream]);

  const config = stateConfig[state];
  const isActive = state === 'listening' || state === 'transcribing';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2">
      {/* Transcript pill */}
      <AnimatePresence>
        {isActive && (
          <TranscriptPill
            userText={userTranscript}
            agentText=""
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
            ${state === 'transcribing' ? 'animate-pulse' : ''}
            transition-colors duration-300
          `}
          aria-label={config.label || 'Voice orb'}
          aria-live="polite"
        >
          {/* Audio bars */}
          {state === 'listening' && (
            <div className="flex items-center gap-0.5 h-7">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: [12, 24, 16, 28, 12],
                  }}
                  transition={{
                    duration: 0.8,
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

          {/* Transcribing spinner */}
          {state === 'transcribing' && (
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
