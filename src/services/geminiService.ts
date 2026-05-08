import { GoogleGenAI } from "@google/genai";
import { Thread } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getCampusAssistantResponse(userQuery: string, threads: Thread[]) {
  const context = threads.slice(0, 10).map(t => {
    return `Title: ${t.title}\nCategory: ${t.category}\nContent: ${t.preview}\n`;
  }).join('\n---\n');

  const systemInstruction = `You are the CampusForum Assistant. 
  You help students navigate campus life based on the discussions in the forum.
  Use the following recent forum threads as context if relevant, but also use your general knowledge about campus life (registration, libraries, tech weeks, etc.).
  Keep responses concise, helpful, and "campus-cool".
  
  Current Forum Context:
  ${context}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userQuery,
      config: {
        systemInstruction
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error from Campus Assistant:", error);
    return "I'm having trouble connecting to the campus network. Please try again later!";
  }
}
