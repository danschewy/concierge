import { NextResponse } from 'next/server';
import * as plaid from '@/lib/services/plaid';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || undefined;

    const transactions = await plaid.getTransactions(period);
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Plaid transactions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
