import { NextResponse } from 'next/server';
import * as weather from '@/lib/services/weather';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = Number.parseFloat(searchParams.get('latitude') || '');
    const longitude = Number.parseFloat(searchParams.get('longitude') || '');

    const data = await weather.getWeather(
      Number.isFinite(latitude) ? latitude : undefined,
      Number.isFinite(longitude) ? longitude : undefined
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error('Weather error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}
