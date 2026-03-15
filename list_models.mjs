import { config } from "dotenv";
config({ path: ".env.local" });

import { BedrockClient, ListFoundationModelsCommand } from "@aws-sdk/client-bedrock";

const client = new BedrockClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

async function run() {
  const command = new ListFoundationModelsCommand({});
  const response = await client.send(command);
  const models = response.modelSummaries.map(m => m.modelId).filter(id => id.includes("nova"));
  console.log("Nova models available:");
  console.dir(models, {maxArrayLength: null});
}

run().catch(console.error);
