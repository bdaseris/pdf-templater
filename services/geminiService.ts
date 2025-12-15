import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTextContent = async (prompt: string, currentContent?: string): Promise<string> => {
  try {
    const fullPrompt = `
      You are a professional copywriter for document templates.
      User request: "${prompt}"
      ${currentContent ? `Context (current text): "${currentContent}"` : ''}
      
      Output ONLY the generated text suitable for a document template. 
      Keep it professional and concise. Do not include markdown formatting or quotes around the output.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });

    return response.text?.trim() || "Generated text unavailable.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating text. Please check API configuration.";
  }
};
