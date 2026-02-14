import { NextResponse } from 'next/server';

const DEFAULT_MODEL_ID = 'scribe_v1';

type ElevenLabsTranscription = {
  text?: string;
  transcript?: string;
  segments?: Array<{ text?: string }>;
  words?: Array<{ text?: string }>;
};

function getTextFromResponse(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return '';
  const response = payload as ElevenLabsTranscription;
  const primary = response.text ?? response.transcript;
  if (typeof primary === 'string' && primary.trim()) {
    return primary.trim();
  }

  const segmentText = response.segments
    ?.map((segment) => segment.text?.trim() || '')
    .filter(Boolean)
    .join(' ')
    .trim();
  if (segmentText) return segmentText;

  const wordText = response.words
    ?.map((word) => word.text?.trim() || '')
    .filter(Boolean)
    .join(' ')
    .trim();
  if (wordText) return wordText;

  return '';
}

function isBlobLike(value: unknown): value is Blob {
  return !!value && typeof value === 'object' && 'size' in value && 'type' in value;
}

function extensionFromMimeType(mimeType: string): string {
  if (mimeType.includes('webm')) return 'webm';
  if (mimeType.includes('mp4')) return 'mp4';
  if (mimeType.includes('mpeg')) return 'mp3';
  if (mimeType.includes('wav')) return 'wav';
  if (mimeType.includes('ogg')) return 'ogg';
  return 'webm';
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing ELEVENLABS_API_KEY' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('audio');

    if (!isBlobLike(file)) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: 'Audio file is empty' },
        { status: 400 }
      );
    }

    const upstreamFormData = new FormData();
    const fileName = 'name' in file && typeof file.name === 'string' && file.name.trim()
      ? file.name
      : `speech.${extensionFromMimeType(file.type || '')}`;
    upstreamFormData.append('file', file, fileName);
    upstreamFormData.append(
      'model_id',
      process.env.ELEVENLABS_STT_MODEL_ID || DEFAULT_MODEL_ID
    );

    const languageCode = process.env.ELEVENLABS_STT_LANGUAGE_CODE;
    if (languageCode) {
      upstreamFormData.append('language_code', languageCode);
    }

    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
      },
      body: upstreamFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs STT error:', response.status, errorText);
      return NextResponse.json(
        { error: errorText || 'Failed to transcribe audio' },
        { status: 502 }
      );
    }

    const payload = (await response.json()) as unknown;
    const text = getTextFromResponse(payload);

    if (!text) {
      return NextResponse.json(
        { error: 'No transcript returned from ElevenLabs' },
        { status: 502 }
      );
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Voice transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}
