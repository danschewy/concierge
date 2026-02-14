import type { SearchResult } from '@/lib/types';
import { mockSearchResults } from '@/lib/mock-data';

const TAVILY_API = 'https://api.tavily.com/search';

interface TavilyResult {
  title: string;
  url: string;
  content: string;
}

interface TavilyResponse {
  results: TavilyResult[];
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export async function searchWeb(query: string): Promise<SearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    console.warn('TAVILY_API_KEY not set, using mock data');
    return mockSearchResults;
  }

  try {
    const response = await fetch(TAVILY_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: 'basic',
        max_results: 5,
        include_answer: false,
      }),
    });

    if (!response.ok) {
      console.error(`Tavily API error: ${response.status}`);
      return mockSearchResults;
    }

    const data: TavilyResponse = await response.json();

    if (!data.results || data.results.length === 0) {
      return mockSearchResults;
    }

    return data.results.map((result) => ({
      title: result.title,
      url: result.url,
      snippet: result.content.slice(0, 200),
      domain: extractDomain(result.url),
    }));
  } catch (error) {
    console.error('Error fetching Tavily search:', error);
    return mockSearchResults;
  }
}
