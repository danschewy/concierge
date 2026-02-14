import { NextResponse } from 'next/server';
import * as doordash from '@/lib/services/doordash';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Delivery ID is required' },
        { status: 400 }
      );
    }

    const status = await doordash.getDeliveryStatus(id);
    return NextResponse.json(status);
  } catch (error) {
    console.error('DoorDash status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch delivery status' },
      { status: 500 }
    );
  }
}
