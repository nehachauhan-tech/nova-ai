import { config } from "dotenv";
config({ path: ".env.local" });

import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

async function runTest(modelId) {
  try {
    const command = new ConverseCommand({
      modelId,
      messages: [{ role: "user", content: [{ text: "Hello" }] }],
    });
    const res = await client.send(command);
    console.log(`Success with ${modelId}`);
  } catch (err) {
    console.error(`Failed with ${modelId}:`, err.message);
  }
}

async function main() {
    await runTest("us.amazon.nova-pro-v1:0");
    await runTest("amazon.nova-pro-v1:0");
    await runTest("us.amazon.nova-2-sonic-v1:0");
    await runTest("amazon.nova-2-sonic-v1:0");
}
main();
