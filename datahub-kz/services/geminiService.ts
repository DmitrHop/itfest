import { GoogleGenAI } from "@google/genai";
import { UNIVERSITIES } from "../constants";

// Construct a system context based on our data
const DATA_CONTEXT = JSON.stringify(UNIVERSITIES.map(u => ({
  name: u.name,
  city: u.city,
  rating: u.rating,
  priceRange: `${Math.min(...u.programs.map(p => p.price))} - ${Math.max(...u.programs.map(p => p.price))} KZT`,
  programs: u.programs.map(p => p.name).join(", "),
  employment: u.employmentRate
})));

const SYSTEM_INSTRUCTION = `
You are the AI Assistant for "DataHub KZ", a platform for choosing universities in Kazakhstan. 
Your goal is to help students, parents, and applicants find the best university.
You have access to the following data about top universities: ${DATA_CONTEXT}.

Rules:
1. Answer strictly based on facts. If you don't know, suggest checking the official catalog.
2. Be helpful, encouraging, and professional.
3. If asked about prices, mention they are in KZT (Tenge).
4. If asked for recommendations, ask for their preferred major, city, or budget first.
5. Keep answers concise (under 200 words) unless asked for details.
6. Respond in the same language as the user (Russian, Kazakh, or English).
`;

let aiClient: GoogleGenAI | null = null;

const getClient = () => {
  if (!aiClient) {
    if (!process.env.API_KEY) {
      console.warn("API_KEY is missing. AI features will not work.");
      return null;
    }
    aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return aiClient;
};

export const sendMessageToGemini = async (
  message: string,
  history: { role: string; text: string }[]
): Promise<string> => {
  const client = getClient();
  if (!client) return "Извините, API ключ не настроен. Пожалуйста, проверьте конфигурацию.";

  try {
    const chat = client.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message });
    return result.text || "Извините, я не смог сформировать ответ.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Произошла ошибка при связи с сервером ИИ. Попробуйте позже.";
  }
};