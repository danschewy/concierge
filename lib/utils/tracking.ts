import type { AsyncTaskRef, AsyncTaskKind, AsyncTaskProvider, AsyncTaskStatus } from '@/lib/types';

const VALID_KINDS: AsyncTaskKind[] = ['doordash_delivery_watch', 'mock_uber_delay'];
const VALID_PROVIDERS: AsyncTaskProvider[] = ['blaxel', 'local'];
const VALID_STATUSES: AsyncTaskStatus[] = ['queued', 'running', 'success', 'failed'];

export function serializeTrackingQuery(tracking?: AsyncTaskRef): string {
  if (!tracking) return '';

  const params = new URLSearchParams({
    trackingKind: tracking.kind,
    trackingProvider: tracking.provider,
    trackingExecutionId: tracking.executionId,
    trackingStatus: tracking.status,
    trackingCreatedAt: tracking.createdAt,
  });

  if (tracking.jobId) {
    params.set('trackingJobId', tracking.jobId);
  }

  return params.toString();
}

export function parseTrackingQuery(searchParams: URLSearchParams): AsyncTaskRef | null {
  const kind = searchParams.get('trackingKind');
  const provider = searchParams.get('trackingProvider');
  const executionId = searchParams.get('trackingExecutionId');
  const status = searchParams.get('trackingStatus');
  const createdAt = searchParams.get('trackingCreatedAt');
  const jobId = searchParams.get('trackingJobId') ?? undefined;

  if (
    !kind ||
    !provider ||
    !executionId ||
    !status ||
    !createdAt ||
    !VALID_KINDS.includes(kind as AsyncTaskKind) ||
    !VALID_PROVIDERS.includes(provider as AsyncTaskProvider) ||
    !VALID_STATUSES.includes(status as AsyncTaskStatus)
  ) {
    return null;
  }

  return {
    kind: kind as AsyncTaskKind,
    provider: provider as AsyncTaskProvider,
    executionId,
    status: status as AsyncTaskStatus,
    createdAt,
    jobId,
  };
}
