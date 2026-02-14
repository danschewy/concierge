import { NextResponse } from 'next/server';
import * as weather from '@/lib/services/weather';

export async function GET() {
  try {
    // Defaults to SoHo, Manhattan
    const data = await weather.getWeather();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Weather error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}
