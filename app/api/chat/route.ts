import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSystemPrompt } from '@/lib/agent/system-prompt';
import { TOOL_DEFINITIONS } from '@/lib/agent/tools';
import { executeTool } from '@/lib/agent/tool-executor';
import type { ToolName } from '@/lib/types/tools';
import {
  mockSubwayStatus,
  mockWeather,
  mockRideStatus,
  mockFoodOrder,
  mockCalendarEvents,
} from '@/lib/mock-data';

// Map tool names to card types for the frontend
const TOOL_CARD_MAP: Partial<Record<ToolName, string>> = {
  get_subway_status: 'subway_status',
  get_weather: 'weather',
  get_bike_availability: 'bike_availability',
  book_ride: 'ride_status',
  order_food: 'food_order',
  create_delivery: 'errand',
  book_reservation: 'reservation',
  search_events: 'event',
  search_restaurants: 'restaurant',
  search_web: 'search_results',
  check_budget: 'budget_summary',
  check_calendar: 'calendar',
  add_to_calendar: 'calendar',
};

function createSSEEvent(data: Record<string, unknown>): string {
  return JSON.stringify(data) + '\n';
}

function createMockStream(): ReadableStream {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      const events = [
        { type: 'reasoning', content: "Let me check your schedule and figure out the fastest way to get you there..." },
        { type: 'tool_call', toolName: 'check_calendar', toolArgs: { count: 3 } },
        { type: 'tool_result', toolName: 'check_calendar', result: mockCalendarEvents, cardType: 'calendar' },
        { type: 'reasoning', content: "You have 'Hackathon Demo' at David Geffen Hall in 25 minutes. Let me check the subway first." },
        { type: 'tool_call', toolName: 'get_subway_status', toolArgs: { station: 'Spring St', line: '6' } },
        { type: 'tool_result', toolName: 'get_subway_status', result: mockSubwayStatus, cardType: 'subway_status' },
        { type: 'reasoning', content: "Signal delays on the 1/2/3 lines. Let me check the weather and get you a ride instead." },
        { type: 'tool_call', toolName: 'get_weather', toolArgs: {} },
        { type: 'tool_result', toolName: 'get_weather', result: mockWeather, cardType: 'weather' },
        { type: 'tool_call', toolName: 'book_ride', toolArgs: { pickup: 'Broadway & Spring St', dropoff: 'David Geffen Hall', ride_type: 'UberX' } },
        { type: 'tool_result', toolName: 'book_ride', result: mockRideStatus, cardType: 'ride_status' },
        { type: 'reasoning', content: "You haven't eaten since this morning. Let me get something delivered to Geffen Hall." },
        { type: 'tool_call', toolName: 'order_food', toolArgs: { restaurant_id: 'absolute-bagels', items: ['Everything Bagel w/ Cream Cheese', 'Iced Coffee'], delivery_address: 'David Geffen Hall' } },
        { type: 'tool_result', toolName: 'order_food', result: mockFoodOrder, cardType: 'food_order' },
        { type: 'assistant', content: "All set. Marcus is 4 minutes away in a black Model Y \u2014 he'll pick you up on Broadway. I also ordered you a bagel and iced coffee from Absolute Bagels, should arrive at Geffen Hall in about 20 minutes. You're at 62% of your weekly budget. Good luck with the demo!" },
        { type: 'done' },
      ];

      for (const event of events) {
        controller.enqueue(encoder.encode(createSSEEvent(event)));
        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, event.type === 'reasoning' ? 400 : 200));
      }

      controller.close();
    },
  });
}

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // If no API key, return mock demo stream
    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(createMockStream(), {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Format messages for the Anthropic API
          const formattedMessages: Anthropic.MessageParam[] = messages
            .filter((m: { role: string }) => m.role === 'user' || m.role === 'assistant')
            .map((m: { role: string; content: string }) => ({
              role: m.role as 'user' | 'assistant',
              content: m.content,
            }));

          // Conversation loop: keep going until we get a response with no tool calls
          let currentMessages = [...formattedMessages];
          let continueLoop = true;

          while (continueLoop) {
            continueLoop = false;

            const response = await anthropic.messages.create({
              model: 'claude-sonnet-4-20250514',
              max_tokens: 4096,
              system: getSystemPrompt(),
              tools: TOOL_DEFINITIONS as Anthropic.Tool[],
              messages: currentMessages,
              stream: true,
            });

            let currentText = '';
            let hasToolUse = false;
            const toolResults: Anthropic.ToolResultBlockParam[] = [];

            // Accumulate tool_use blocks for batch processing
            interface ToolUseBlock {
              id: string;
              name: string;
              input: Record<string, unknown>;
            }
            const toolUseBlocks: ToolUseBlock[] = [];
            let currentToolId = '';
            let currentToolName = '';
            let currentToolInput = '';

            for await (const event of response) {
              if (event.type === 'content_block_start') {
                if (event.content_block.type === 'text') {
                  currentText = '';
                } else if (event.content_block.type === 'tool_use') {
                  hasToolUse = true;
                  currentToolId = event.content_block.id;
                  currentToolName = event.content_block.name;
                  currentToolInput = '';
                }
              } else if (event.type === 'content_block_delta') {
                if (event.delta.type === 'text_delta') {
                  currentText += event.delta.text;

                  // Check if this contains thinking/reasoning markers
                  const isThinking = event.delta.text.includes('<thinking>') ||
                    currentText.includes('<thinking>');

                  if (isThinking) {
                    // Strip thinking tags for display
                    const cleaned = event.delta.text
                      .replace(/<\/?thinking>/g, '')
                      .trim();
                    if (cleaned) {
                      controller.enqueue(
                        encoder.encode(createSSEEvent({
                          type: 'reasoning',
                          content: cleaned,
                        }))
                      );
                    }
                  } else {
                    controller.enqueue(
                      encoder.encode(createSSEEvent({
                        type: 'assistant',
                        content: event.delta.text,
                      }))
                    );
                  }
                } else if (event.delta.type === 'input_json_delta') {
                  currentToolInput += event.delta.partial_json;
                }
              } else if (event.type === 'content_block_stop') {
                if (currentToolId && currentToolName) {
                  let parsedInput: Record<string, unknown> = {};
                  try {
                    if (currentToolInput) {
                      parsedInput = JSON.parse(currentToolInput);
                    }
                  } catch {
                    parsedInput = {};
                  }

                  toolUseBlocks.push({
                    id: currentToolId,
                    name: currentToolName,
                    input: parsedInput,
                  });

                  currentToolId = '';
                  currentToolName = '';
                  currentToolInput = '';
                }
              } else if (event.type === 'message_stop') {
                // Process all accumulated tool_use blocks
                if (toolUseBlocks.length > 0) {
                  for (const tool of toolUseBlocks) {
                    // Send tool_call event
                    controller.enqueue(
                      encoder.encode(createSSEEvent({
                        type: 'tool_call',
                        toolName: tool.name,
                        toolArgs: tool.input,
                      }))
                    );

                    // Execute the tool
                    try {
                      const result = await executeTool(
                        tool.name as ToolName,
                        tool.input
                      );

                      const cardType = TOOL_CARD_MAP[tool.name as ToolName];

                      // Send tool_result event
                      controller.enqueue(
                        encoder.encode(createSSEEvent({
                          type: 'tool_result',
                          toolName: tool.name,
                          result,
                          cardType: cardType || undefined,
                        }))
                      );

                      toolResults.push({
                        type: 'tool_result',
                        tool_use_id: tool.id,
                        content: JSON.stringify(result),
                      });
                    } catch (toolError) {
                      const errorMessage = toolError instanceof Error
                        ? toolError.message
                        : 'Tool execution failed';

                      controller.enqueue(
                        encoder.encode(createSSEEvent({
                          type: 'error',
                          content: `Tool ${tool.name} failed: ${errorMessage}`,
                        }))
                      );

                      toolResults.push({
                        type: 'tool_result',
                        tool_use_id: tool.id,
                        content: JSON.stringify({ error: errorMessage }),
                        is_error: true,
                      });
                    }
                  }
                }
              }
            }

            // If there were tool uses, add the assistant message and tool results,
            // then continue the loop
            if (hasToolUse && toolResults.length > 0) {
              // Build the assistant content blocks for the current turn
              const assistantContent: Anthropic.ContentBlockParam[] = [];

              if (currentText.trim()) {
                assistantContent.push({
                  type: 'text',
                  text: currentText,
                });
              }

              for (const tool of toolUseBlocks) {
                assistantContent.push({
                  type: 'tool_use',
                  id: tool.id,
                  name: tool.name,
                  input: tool.input,
                });
              }

              currentMessages = [
                ...currentMessages,
                {
                  role: 'assistant',
                  content: assistantContent,
                },
                {
                  role: 'user',
                  content: toolResults,
                },
              ];

              continueLoop = true;
            }
          }

          // Send done event
          controller.enqueue(encoder.encode(createSSEEvent({ type: 'done' })));
          controller.close();
        } catch (streamError) {
          const errorMessage = streamError instanceof Error
            ? streamError.message
            : 'Unknown streaming error';

          controller.enqueue(
            encoder.encode(createSSEEvent({
              type: 'error',
              content: errorMessage,
            }))
          );
          controller.enqueue(encoder.encode(createSSEEvent({ type: 'done' })));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
