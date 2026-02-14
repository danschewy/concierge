import { blaxelTelemetry } from "@blaxel/telemetry";

async function step2(name: string) {
  console.log(`Step 2 ${name}`);
  await step2_a(name);
  await step2_b(name);
  console.log(`Step 2 ${name} done`);
}

async function step2_a(name: string) {
  const span = blaxelTelemetry.tracer.startSpan('step2_a', {
    attributes: {
      'step.name': 'step2_a',
      'step.argument.name': name,
    }
  });
  try {
    console.log(`Step 2_a ${name}`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(`Step 2_a ${name} done`);
  } catch (error) {
    span.recordException(error as any);
    throw error;
  } finally {
    span.end();
  }
}

async function step2_b(name: string) {
  const span = blaxelTelemetry.tracer.startSpan('step2_b', {
    attributes: {
      'step.name': 'step2_b',
      'step.argument.name': name,
    }
  });
  try {
    console.log(`Step 2_b ${name}`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(`Step 2_b ${name} done`);
  } catch (error) {
    span.recordException(error as any);
    throw error;
  } finally {
    span.end();
  }
}

// Automatically add a span to the function to retrieve it in the blaxel telemetry interface
export default (name: string) => blaxelTelemetry.tracer.startActiveSpan('step2', async (span) => {
  await step2(name)
  span.end()
});