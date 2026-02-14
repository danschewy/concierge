import { blaxelTelemetry } from "@blaxel/telemetry";

async function step3(name: string){
  console.log(`Step 3 ${name}`);
  await new Promise(resolve => setTimeout(resolve, 2000));
  console.log(`Step 3 ${name} done`);
}

// Automatically add a span to the function to retrieve it in the blaxel telemetry interface
export default (name: string) => blaxelTelemetry.tracer.startActiveSpan('step3', async (span) => {
  await step3(name)
  span.end()
});