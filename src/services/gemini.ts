import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const generateProductDescription = async (productName: string, category: string) => {
  if (!apiKey) {
    throw new Error("Gemini API key is not configured");
  }

  const genAI = new GoogleGenAI({ apiKey });
  const model = genAI.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a luxury, poetic, and enticing product description for a perfume named "${productName}" in the "${category}" category. Keep it under 100 words. Focus on the notes, the feeling it evokes, and its exclusivity.`,
  });

  const response = await model;
  return response.text;
};
