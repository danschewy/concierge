import { NextResponse } from 'next/server';
import * as blaxel from '@/lib/services/blaxel';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = await blaxel.executeAgent(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Agent execute error:', error);
    return NextResponse.json(
      { error: 'Failed to execute agent' },
      { status: 500 }
    );
  }
}
