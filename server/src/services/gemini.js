import { ChatGroq } from "@langchain/groq";

let modelInstance = null;

export function getGroqModel() {
  if (!modelInstance) {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      throw new Error("GROQ_API_KEY is missing in .env");
    }

    modelInstance = new ChatGroq({
      apiKey,
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      maxRetries: 2,
    });
  }

  return modelInstance;
}