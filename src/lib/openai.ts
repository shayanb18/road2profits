import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  console.warn("[WARN] OPENAI_API_KEY not set — AI features will be disabled");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "missing",
});
