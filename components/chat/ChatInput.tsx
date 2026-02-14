'use client';

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react';
import { Send, Mic, Loader2, Square } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isProcessing: boolean;
  onVoiceToggle?: () => void;
  prefillText?: string;
  onPrefillClear?: () => void;
}

const MIN_TEXTAREA_HEIGHT = 120;
const MAX_TEXTAREA_HEIGHT_CAP = 360;
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

function toUserFacingError(error: unknown, fallback: string): string {
  if (!(error instanceof Error) || !error.message.trim()) {
    return fallback;
  }

  const message = error.message.trim();
  if (message.length > 180) {
    return fallback;
  }

  return message;
}

export default function ChatInput({ onSend, isProcessing, onVoiceToggle, prefillText, onPrefillClear }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [maxTextareaHeight, setMaxTextareaHeight] = useState(220);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initialTextareaHeightRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const resizeTextarea = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const measuredHeight = textarea.scrollHeight;

    if (!initialTextareaHeightRef.current) {
      initialTextareaHeightRef.current = measuredHeight;
    }

    const initialHeight = initialTextareaHeightRef.current;
    const hasText = input.trim().length > 0;
    const boundedHeight = Math.min(measuredHeight, maxTextareaHeight);
    const nextHeight = hasText
      ? Math.max(initialHeight, boundedHeight)
      : initialHeight;

    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = hasText && measuredHeight > maxTextareaHeight ? 'auto' : 'hidden';
  }, [input, maxTextareaHeight]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateMaxHeight = () => {
      const adaptiveHeight = Math.round(window.innerHeight * 0.4);
      setMaxTextareaHeight(
        Math.min(MAX_TEXTAREA_HEIGHT_CAP, Math.max(MIN_TEXTAREA_HEIGHT, adaptiveHeight))
      );
    };

    updateMaxHeight();
    window.addEventListener('resize', updateMaxHeight);
    return () => window.removeEventListener('resize', updateMaxHeight);
  }, []);

  useLayoutEffect(() => {
    resizeTextarea();
  }, [input, maxTextareaHeight, resizeTextarea]);

  // Handle prefill
  useEffect(() => {
    if (prefillText) {
      setInput(prefillText);
      onPrefillClear?.();
      resizeTextarea();
      textareaRef.current?.focus();
    }
  }, [prefillText, onPrefillClear, resizeTextarea]);

  const releaseMediaStream = useCallback(() => {
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    mediaStreamRef.current = null;
  }, []);

  const transcribeAudio = useCallback(async (blob: Blob) => {
    if (blob.size === 0) {
      setVoiceError('No audio captured. Try speaking a little longer.');
      return;
    }

    setIsTranscribing(true);
    setVoiceError(null);

    try {
      const formData = new FormData();
      const fileType = blob.type || 'audio/webm';
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

      setInput((prev) => {
        const trimmedPrev = prev.trim();
        return trimmedPrev ? `${trimmedPrev} ${transcript}` : transcript;
      });
      requestAnimationFrame(resizeTextarea);
      textareaRef.current?.focus();
    } catch (error) {
      console.error('Voice transcription failed:', error);
      setVoiceError(toUserFacingError(error, 'Transcription failed. Please try again.'));
    } finally {
      setIsTranscribing(false);
    }
  }, [resizeTextarea]);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setVoiceError('Voice input is not supported in this browser.');
      return;
    }

    setVoiceError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const supportsPreferredType = typeof MediaRecorder.isTypeSupported === 'function'
        && MediaRecorder.isTypeSupported(PREFERRED_AUDIO_MIME_TYPE);
      const mimeType = supportsPreferredType
        ? PREFERRED_AUDIO_MIME_TYPE
        : '';
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
        setVoiceError('Recording failed. Please try again.');
        setIsRecording(false);
        releaseMediaStream();
      };

      recorder.onstop = () => {
        if (audioChunksRef.current.length === 0) {
          setVoiceError('No audio captured. Try speaking a little longer.');
          mediaRecorderRef.current = null;
          setIsRecording(false);
          releaseMediaStream();
          return;
        }

        const chunkType = audioChunksRef.current[0]?.type || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: chunkType });
        audioChunksRef.current = [];
        mediaRecorderRef.current = null;
        setIsRecording(false);
        releaseMediaStream();
        void transcribeAudio(audioBlob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start(250);
      setIsRecording(true);
    } catch (error) {
      console.error('Microphone access failed:', error);
      setVoiceError('Microphone permission denied.');
      releaseMediaStream();
    }
  }, [releaseMediaStream, transcribeAudio]);

  const handleMicClick = useCallback(() => {
    if (isTranscribing || isProcessing) return;
    if (onVoiceToggle) {
      onVoiceToggle();
      return;
    }
    if (isRecording) {
      stopRecording();
    } else {
      void startRecording();
    }
  }, [isTranscribing, isProcessing, onVoiceToggle, isRecording, stopRecording, startRecording]);

  useEffect(() => {
    return () => {
      stopRecording();
      releaseMediaStream();
    };
  }, [stopRecording, releaseMediaStream]);

  const handleSend = useCallback(() => {
    if (!input.trim() || isProcessing || isTranscribing || isRecording) return;
    onSend(input);
    setInput('');
  }, [input, isProcessing, isTranscribing, isRecording, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  return (
    <div className="sticky bottom-0 z-20 bg-zinc-950/80 backdrop-blur-xl border-t border-[var(--border-default)] p-3">
      <div className="flex items-end gap-2">
        <button
          onClick={handleMicClick}
          disabled={isProcessing || isTranscribing}
          className={`p-2 rounded-lg transition-colors shrink-0 disabled:cursor-not-allowed disabled:opacity-60 ${
            isRecording
              ? 'bg-rose-500 text-white hover:bg-rose-400'
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
          }`}
          aria-label={isRecording ? 'Stop voice recording' : 'Start voice recording'}
        >
          {isTranscribing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isRecording ? (
            <Square className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={
              isRecording
                ? 'Listening... tap stop when done'
                : isTranscribing
                  ? 'Transcribing your audio...'
                  : isProcessing
                    ? 'Thinking...'
                    : 'Where do you need to be? What can I handle for you?'
            }
            disabled={isProcessing || isTranscribing}
            rows={1}
            className="w-full resize-none bg-zinc-900 border border-[var(--border-default)] focus:border-violet-500/40
              rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600
              focus:outline-none focus:ring-1 focus:ring-violet-500/20
              disabled:opacity-50 disabled:cursor-not-allowed overflow-y-auto
              transition-all duration-200"
            aria-label="Chat message input"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!input.trim() || isProcessing || isTranscribing || isRecording}
          className="p-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white
            disabled:opacity-30 disabled:cursor-not-allowed
            transition-colors shrink-0"
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      {(isRecording || isTranscribing || voiceError) && (
        <p
          className={`mt-2 text-[11px] ${
            voiceError ? 'text-rose-400' : 'text-zinc-500'
          }`}
          aria-live="polite"
        >
          {voiceError || (isRecording ? 'Listening... tap the red button to stop.' : 'Transcribing...')}
        </p>
      )}
    </div>
  );
}
