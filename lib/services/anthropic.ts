import Anthropic from '@anthropic-ai/sdk';

/**
 * Anthropic API client wrapper.
 *
 * Provides a configured Anthropic client instance.
 * The SDK automatically reads ANTHROPIC_API_KEY from the environment.
 */

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error(
        'ANTHROPIC_API_KEY environment variable is required. ' +
          'Set it in your .env.local file.'
      );
    }

    client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  return client;
}
