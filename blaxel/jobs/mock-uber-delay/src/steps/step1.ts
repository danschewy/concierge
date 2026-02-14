import { blaxelTelemetry } from "@blaxel/telemetry";

async function step1(name: string){
  console.log(`Step 1 ${name}`);
  await new Promise(resolve => setTimeout(resolve, 2000));
  console.log(`Step 1 ${name} done`);
}

// Automatically add a span to the function to retrieve it in the blaxel telemetry interface
export default (name: string) => blaxelTelemetry.tracer.startActiveSpan('step1', async (span) => {
  await step1(name)
  span.end()
});