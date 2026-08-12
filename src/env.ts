import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["DEV", "HLG", "PROD"]).default("PROD"),
  DATABASE_URL: z.string(),
  PORT: z.number().default(3333),
});

const envVerify = envSchema.safeParse(process.env);

if (envVerify.success === false) {
  console.error("⚠️ Invalid environment variables!", envVerify.error);

  throw new Error("Invalid environment variables!");
}

export const env = envVerify.data;
