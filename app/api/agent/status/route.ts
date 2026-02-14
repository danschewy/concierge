import { NextResponse } from 'next/server';
import * as blaxel from '@/lib/services/blaxel';

export async function GET() {
  try {
    const status = await blaxel.getAgentStatus('default');
    return NextResponse.json(status);
  } catch (error) {
    console.error('Agent status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent status' },
      { status: 500 }
    );
  }
}
