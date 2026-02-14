import type { FinancialSummary } from '@/lib/types';
import { mockFinancialSummary } from '@/lib/mock-data';

const PLAID_ENVS: Record<string, string> = {
  sandbox: 'https://sandbox.plaid.com',
  development: 'https://development.plaid.com',
  production: 'https://production.plaid.com',
};

function getPlaidBaseUrl(): string {
  const env = process.env.PLAID_ENV ?? 'sandbox';
  return PLAID_ENVS[env] ?? PLAID_ENVS.sandbox;
}

function getPlaidHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID ?? '',
    'PLAID-SECRET': process.env.PLAID_SECRET ?? '',
  };
}

function isPlaidConfigured(): boolean {
  return !!(process.env.PLAID_CLIENT_ID && process.env.PLAID_SECRET);
}

export async function getBalance(): Promise<{ checkingBalance: number }> {
  if (!isPlaidConfigured()) {
    console.warn('Plaid credentials not set, using mock data');
    return { checkingBalance: mockFinancialSummary.checkingBalance };
  }

  try {
    const baseUrl = getPlaidBaseUrl();

    // In sandbox mode, we need an access token. For a real app this would
    // come from a Link token exchange. Here we attempt to use a stored token.
    const accessToken = process.env.PLAID_ACCESS_TOKEN;
    if (!accessToken) {
      console.warn('PLAID_ACCESS_TOKEN not set, using mock data');
      return { checkingBalance: mockFinancialSummary.checkingBalance };
    }

    const response = await fetch(`${baseUrl}/accounts/balance/get`, {
      method: 'POST',
      headers: getPlaidHeaders(),
      body: JSON.stringify({
        access_token: accessToken,
      }),
    });

    if (!response.ok) {
      console.error(`Plaid API error: ${response.status}`);
      return { checkingBalance: mockFinancialSummary.checkingBalance };
    }

    const data = await response.json();
    const checkingAccount = data.accounts?.find(
      (acct: { type: string; subtype: string }) =>
        acct.type === 'depository' && acct.subtype === 'checking'
    );

    return {
      checkingBalance: checkingAccount?.balances?.current ?? mockFinancialSummary.checkingBalance,
    };
  } catch (error) {
    console.error('Error fetching Plaid balance:', error);
    return { checkingBalance: mockFinancialSummary.checkingBalance };
  }
}

export async function getTransactions(
  period?: string
): Promise<FinancialSummary> {
  if (!isPlaidConfigured()) {
    console.warn('Plaid credentials not set, using mock data');
    return mockFinancialSummary;
  }

  try {
    const baseUrl = getPlaidBaseUrl();
    const accessToken = process.env.PLAID_ACCESS_TOKEN;

    if (!accessToken) {
      console.warn('PLAID_ACCESS_TOKEN not set, using mock data');
      return mockFinancialSummary;
    }

    // Calculate date range based on period
    const endDate = new Date().toISOString().split('T')[0];
    let startDate: string;

    switch (period) {
      case 'month':
        startDate = new Date(Date.now() - 30 * 86400000)
          .toISOString()
          .split('T')[0];
        break;
      case 'day':
        startDate = endDate;
        break;
      case 'week':
      default:
        startDate = new Date(Date.now() - 7 * 86400000)
          .toISOString()
          .split('T')[0];
        break;
    }

    const response = await fetch(`${baseUrl}/transactions/get`, {
      method: 'POST',
      headers: getPlaidHeaders(),
      body: JSON.stringify({
        access_token: accessToken,
        start_date: startDate,
        end_date: endDate,
        options: {
          count: 100,
        },
      }),
    });

    if (!response.ok) {
      console.error(`Plaid API error: ${response.status}`);
      return mockFinancialSummary;
    }

    const data = await response.json();
    const transactions: Array<{
      amount: number;
      category: string[];
      date: string;
    }> = data.transactions ?? [];

    // Aggregate spending by category
    const categoryTotals: Record<string, number> = {};
    let totalSpend = 0;
    const dailySpendMap: Record<string, number> = {};

    const categoryColors: Record<string, string> = {
      'Food and Drink': '#34d399',
      Travel: '#8b5cf6',
      Entertainment: '#22d3ee',
      Shopping: '#fbbf24',
      Transfer: '#f472b6',
      Payment: '#a78bfa',
      Recreation: '#fb923c',
    };

    for (const txn of transactions) {
      // Plaid amounts are positive for debits
      if (txn.amount > 0) {
        const category = txn.category?.[0] ?? 'Other';
        categoryTotals[category] = (categoryTotals[category] ?? 0) + txn.amount;
        totalSpend += txn.amount;
        dailySpendMap[txn.date] =
          (dailySpendMap[txn.date] ?? 0) + txn.amount;
      }
    }

    const categories = Object.entries(categoryTotals)
      .map(([name, amount]) => ({
        name,
        amount: Math.round(amount * 100) / 100,
        color: categoryColors[name] ?? '#94a3b8',
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);

    // Build daily spend array for the last 7 days
    const dailySpend: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000)
        .toISOString()
        .split('T')[0];
      dailySpend.push(Math.round((dailySpendMap[date] ?? 0) * 100) / 100);
    }

    // Get checking balance
    const { checkingBalance } = await getBalance();

    return {
      checkingBalance,
      weeklySpend: Math.round(totalSpend * 100) / 100,
      weeklyBudget: mockFinancialSummary.weeklyBudget, // Budget comes from user settings
      categories,
      dailySpend,
    };
  } catch (error) {
    console.error('Error fetching Plaid transactions:', error);
    return mockFinancialSummary;
  }
}
