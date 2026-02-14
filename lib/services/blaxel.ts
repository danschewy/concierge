/**
 * Blaxel agent proxy service.
 *
 * Proxies requests to a Blaxel-hosted agent backend.
 * Falls back to mock status when BLAXEL_AGENT_URL is not configured.
 */

const BLAXEL_TIMEOUT_MS = 30000;

function isBlaxelConfigured(): boolean {
  return !!process.env.BLAXEL_AGENT_URL;
}

function getBaseUrl(): string {
  return process.env.BLAXEL_AGENT_URL ?? '';
}

export async function executeAgent(
  task: string
): Promise<{ taskId: string; status: string }> {
  if (!isBlaxelConfigured()) {
    console.warn('BLAXEL_AGENT_URL not set, returning mock status');
    return {
      taskId: `task-${Date.now()}`,
      status: 'queued',
    };
  }

  try {
    const response = await fetch(`${getBaseUrl()}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ task }),
      signal: AbortSignal.timeout(BLAXEL_TIMEOUT_MS),
    });

    if (!response.ok) {
      console.error(`Blaxel API error: ${response.status}`);
      return {
        taskId: `task-${Date.now()}`,
        status: 'error',
      };
    }

    const data = await response.json();

    return {
      taskId: data.taskId ?? data.id ?? `task-${Date.now()}`,
      status: data.status ?? 'queued',
    };
  } catch (error) {
    console.error('Error executing Blaxel agent:', error);
    return {
      taskId: `task-${Date.now()}`,
      status: 'error',
    };
  }
}

export async function getAgentStatus(
  taskId: string
): Promise<{ status: string; result?: unknown }> {
  if (!isBlaxelConfigured()) {
    console.warn('BLAXEL_AGENT_URL not set, returning mock status');
    return {
      status: 'completed',
      result: { message: 'Mock agent task completed successfully' },
    };
  }

  try {
    const response = await fetch(`${getBaseUrl()}/tasks/${taskId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(BLAXEL_TIMEOUT_MS),
    });

    if (!response.ok) {
      console.error(`Blaxel API error: ${response.status}`);
      return { status: 'error' };
    }

    const data = await response.json();

    return {
      status: data.status ?? 'unknown',
      result: data.result,
    };
  } catch (error) {
    console.error('Error fetching Blaxel agent status:', error);
    return { status: 'error' };
  }
}
