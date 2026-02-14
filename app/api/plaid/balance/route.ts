import { NextResponse } from 'next/server';
import * as plaid from '@/lib/services/plaid';

export async function GET() {
  try {
    const balance = await plaid.getBalance();
    return NextResponse.json(balance);
  } catch (error) {
    console.error('Plaid balance error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch account balance' },
      { status: 500 }
    );
  }
}
