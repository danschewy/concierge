import { blStartJob } from '@blaxel/core';
import { blaxelTelemetry } from '@blaxel/telemetry';

type JobArguments = {
  ride_id: string;
  stage_schedule?: Array<{
    status: string;
    delay_seconds: number;
  }>;
};

const DEFAULT_STAGE_SCHEDULE: Array<{ status: string; delay_seconds: number }> = [
  { status: 'driver_assigned', delay_seconds: 0 },
  { status: 'en_route', delay_seconds: 25 },
  { status: 'arriving', delay_seconds: 55 },
  { status: 'complete', delay_seconds: 80 },
];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function mockUberDelayJob({
  ride_id,
  stage_schedule = DEFAULT_STAGE_SCHEDULE,
}: JobArguments) {
  return blaxelTelemetry.tracer.startActiveSpan(
    'mockUberDelayJob',
    {
      attributes: {
        'job.name': 'mockUberDelayJob',
        'job.ride_id': ride_id,
      },
      root: true,
    },
    async (span) => {
      const sortedStages = [...stage_schedule]
        .filter((stage) => Number.isFinite(stage.delay_seconds))
        .sort((a, b) => a.delay_seconds - b.delay_seconds);

      const startedAt = Date.now();
      let lastStatus = sortedStages[0]?.status ?? 'driver_assigned';

      for (const stage of sortedStages) {
        const targetTimestamp = startedAt + stage.delay_seconds * 1000;
        const waitMs = Math.max(0, targetTimestamp - Date.now());

        if (waitMs > 0) {
          await sleep(waitMs);
        }

        lastStatus = stage.status;
        console.log(
          `[mock-uber-delay] ride ${ride_id} -> ${stage.status} at +${stage.delay_seconds}s`
        );
      }

      span.setAttribute('job.final_status', lastStatus);
      span.setAttribute('job.stage_count', sortedStages.length);
      span.end();
      return;
    }
  );
}

blStartJob(mockUberDelayJob);
