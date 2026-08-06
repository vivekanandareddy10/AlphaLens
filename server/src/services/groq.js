import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

let modelInstance = null;

class GroqChatModel {
  constructor({ apiKey, model, temperature = 0.2, maxRetries = 2 }) {
    this.apiKey = apiKey;
    this.model = model;
    this.temperature = temperature;
    this.maxRetries = maxRetries;
  }

  async invoke(prompt) {
    let lastError;

    for (let attempt = 0; attempt <= this.maxRetries; attempt += 1) {
      try {
        const response = await axios.post(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            model: this.model,
            messages: [{ role: "user", content: prompt }],
            temperature: this.temperature,
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              "Content-Type": "application/json",
            },
            timeout: 30000,
          }
        );

        const content = response?.data?.choices?.[0]?.message?.content || "";
        return { content };
      } catch (error) {
        lastError = error;
        if (attempt === this.maxRetries) {
          throw error;
        }
      }
    }

    throw lastError;
  }
}

export function getGroqModel() {
  console.log("Groq key loaded:", !!process.env.GROQ_API_KEY);

  if (!modelInstance) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is missing in your .env file");
    }

    modelInstance = new GroqChatModel({
      apiKey: process.env.GROQ_API_KEY,
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      maxRetries: 2,
    });
  }

  return modelInstance;
}