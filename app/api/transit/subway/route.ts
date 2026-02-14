import { NextResponse } from 'next/server';
import * as mta from '@/lib/services/mta';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const station = searchParams.get('station');
    const line = searchParams.get('line') || undefined;

    if (!station) {
      return NextResponse.json(
        { error: 'Station parameter is required' },
        { status: 400 }
      );
    }

    const status = await mta.getSubwayStatus(station, line);
    return NextResponse.json(status);
  } catch (error) {
    console.error('Subway status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subway status' },
      { status: 500 }
    );
  }
}
