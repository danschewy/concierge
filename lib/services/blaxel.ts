import type { AsyncTaskKind, AsyncTaskRef, AsyncTaskStatus } from '@/lib/types';

const BLAXEL_TIMEOUT_MS = 30_000;
const BLAXEL_API_BASE_URL = process.env.BLAXEL_API_BASE_URL ?? 'https://api.blaxel.ai/v0';

const JOB_ENV_BY_KIND: Record<AsyncTaskKind, string> = {
  doordash_delivery_watch: 'BLAXEL_DOORDASH_WATCH_JOB_ID',
  mock_uber_delay: 'BLAXEL_MOCK_UBER_DELAY_JOB_ID',
};

interface BlaxelExecutionSnapshot {
  id: string;
  status: AsyncTaskStatus;
  rawStatus: string;
  result?: unknown;
}

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === 'object' ? (value as UnknownRecord) : null;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function getBlaxelApiKey(): string | null {
  return process.env.BLAXEL_API_KEY ?? process.env.BL_API_KEY ?? null;
}

function getConfiguredJobId(kind: AsyncTaskKind): string | null {
  return process.env[JOB_ENV_BY_KIND[kind]] ?? null;
}

function normalizeBlaxelStatus(rawStatus?: string | null): AsyncTaskStatus {
  const normalized = (rawStatus ?? '').toUpperCase();
  if (
    normalized === 'SUCCESS' ||
    normalized === 'SUCCEEDED' ||
    normalized === 'COMPLETED' ||
    normalized === 'DONE'
  ) {
    return 'success';
  }
  if (
    normalized === 'FAILED' ||
    normalized === 'CANCELED' ||
    normalized === 'CANCELLED' ||
    normalized === 'TIMED_OUT' ||
    normalized === 'ERROR'
  ) {
    return 'failed';
  }
  if (
    normalized === 'RUNNING' ||
    normalized === 'IN_PROGRESS' ||
    normalized === 'PROCESSING'
  ) {
    return 'running';
  }
  return 'queued';
}

function parseExecutionSnapshot(payload: unknown): BlaxelExecutionSnapshot | null {
  const root = asRecord(payload);
  if (!root) return null;

  const metadata = asRecord(root.metadata);
  const id =
    asString(root.execution_id) ??
    asString(root.executionId) ??
    asString(metadata?.id) ??
    asString(root.id);

  if (!id) return null;

  const rawStatus =
    asString(root.status) ??
    asString(metadata?.status) ??
    'WAITING';

  return {
    id,
    rawStatus,
    status: normalizeBlaxelStatus(rawStatus),
    result: root.result ?? root.output ?? metadata?.result,
  };
}

function findExecutionInList(payload: unknown, executionId: string): BlaxelExecutionSnapshot | null {
  const root = asRecord(payload);
  const rawItems = Array.isArray(payload)
    ? payload
    : Array.isArray(root?.items)
      ? root.items
      : Array.isArray(root?.executions)
        ? root.executions
        : null;
  if (!rawItems) return null;

  for (const item of rawItems) {
    const parsed = parseExecutionSnapshot(item);
    if (parsed?.id === executionId) {
      return parsed;
    }
  }

  return null;
}

async function fetchBlaxel(
  path: string,
  init: RequestInit
): Promise<Response> {
  const apiKey = getBlaxelApiKey();
  if (!apiKey) {
    throw new Error('Blaxel API key is not configured');
  }

  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${apiKey}`);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(`${BLAXEL_API_BASE_URL}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
    signal: AbortSignal.timeout(BLAXEL_TIMEOUT_MS),
  });
}

async function getExecutionById(
  jobId: string,
  executionId: string
): Promise<BlaxelExecutionSnapshot | null> {
  try {
    const byIdResponse = await fetchBlaxel(
      `/jobs/${encodeURIComponent(jobId)}/executions/${encodeURIComponent(executionId)}`,
      { method: 'GET' }
    );

    if (byIdResponse.ok) {
      return parseExecutionSnapshot(await byIdResponse.json());
    }
  } catch (error) {
    console.error('Failed to fetch Blaxel execution by ID:', error);
  }

  try {
    const listResponse = await fetchBlaxel(
      `/jobs/${encodeURIComponent(jobId)}/executions?limit=100&offset=0`,
      { method: 'GET' }
    );

    if (!listResponse.ok) return null;
    return findExecutionInList(await listResponse.json(), executionId);
  } catch (error) {
    console.error('Failed to list Blaxel executions:', error);
    return null;
  }
}

export function isLongTaskConfigured(kind: AsyncTaskKind): boolean {
  return !!(getBlaxelApiKey() && getConfiguredJobId(kind));
}

export function createLocalTaskRef(kind: AsyncTaskKind): AsyncTaskRef {
  return {
    kind,
    provider: 'local',
    executionId: `local-${kind}-${Date.now()}`,
    status: 'running',
    createdAt: new Date().toISOString(),
  };
}

export async function startLongTask(
  kind: AsyncTaskKind,
  taskPayload: Record<string, unknown>
): Promise<AsyncTaskRef | null> {
  const apiKey = getBlaxelApiKey();
  const jobId = getConfiguredJobId(kind);
  if (!apiKey || !jobId) {
    return null;
  }

  try {
    const response = await fetchBlaxel(
      `/jobs/${encodeURIComponent(jobId)}/executions`,
      {
        method: 'POST',
        body: JSON.stringify({
          tasks: [taskPayload],
        }),
      }
    );

    if (!response.ok) {
      console.error(`Blaxel create execution failed: ${response.status}`);
      return null;
    }

    const snapshot = parseExecutionSnapshot(await response.json());
    if (!snapshot) {
      return null;
    }

    return {
      kind,
      provider: 'blaxel',
      executionId: snapshot.id,
      jobId,
      status: snapshot.status,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to start Blaxel long task:', error);
    return null;
  }
}

export async function refreshLongTask(task: AsyncTaskRef): Promise<AsyncTaskRef> {
  if (task.provider !== 'blaxel' || !task.jobId) {
    return task;
  }

  const snapshot = await getExecutionById(task.jobId, task.executionId);
  if (!snapshot) {
    // Blaxel listing/indexing can lag behind create; don't false-fail UI cards.
    return task;
  }

  return {
    ...task,
    status: snapshot.status,
  };
}

/**
 * Legacy generic agent proxy support.
 * Kept for compatibility with existing /api/agent routes.
 */
function isLegacyAgentProxyConfigured(): boolean {
  return !!process.env.BLAXEL_AGENT_URL;
}

function getLegacyAgentBaseUrl(): string {
  return process.env.BLAXEL_AGENT_URL ?? '';
}

export async function executeAgent(
  task: string
): Promise<{ taskId: string; status: string }> {
  if (!isLegacyAgentProxyConfigured()) {
    return {
      taskId: `task-${Date.now()}`,
      status: 'queued',
    };
  }

  try {
    const response = await fetch(`${getLegacyAgentBaseUrl()}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ task }),
      signal: AbortSignal.timeout(BLAXEL_TIMEOUT_MS),
    });

    if (!response.ok) {
      return {
        taskId: `task-${Date.now()}`,
        status: 'error',
      };
    }

    const data = asRecord(await response.json());
    return {
      taskId:
        asString(data?.taskId) ??
        asString(data?.id) ??
        `task-${Date.now()}`,
      status: asString(data?.status) ?? 'queued',
    };
  } catch {
    return {
      taskId: `task-${Date.now()}`,
      status: 'error',
    };
  }
}

export async function getAgentStatus(
  taskId: string
): Promise<{ status: string; result?: unknown }> {
  if (!isLegacyAgentProxyConfigured()) {
    return {
      status: 'completed',
      result: { message: 'Mock agent task completed successfully' },
    };
  }

  try {
    const response = await fetch(`${getLegacyAgentBaseUrl()}/tasks/${taskId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(BLAXEL_TIMEOUT_MS),
    });

    if (!response.ok) {
      return { status: 'error' };
    }

    const data = asRecord(await response.json());
    return {
      status: asString(data?.status) ?? 'unknown',
      result: data?.result,
    };
  } catch {
    return { status: 'error' };
  }
}
