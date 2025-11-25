import { GoogleGenAI } from "@google/genai";

// Initialize the client with the API key from the environment.
// System instruction: Assume process.env.API_KEY is pre-configured and valid.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const refineText = async (text: string, tone: 'professional' | 'concise' | 'friendly'): Promise<string> => {
  try {
    const prompt = `Rewrite the following text to be ${tone} suitable for a corporate chat environment. Do not add quotes or explanations, just the text.\n\nText: "${text}"`;
    
    // System instruction: Use ai.models.generateContent with model and contents.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    // System instruction: Access response.text directly.
    return response.text?.trim() || text;
  } catch (error) {
    console.error("Error refining text with Gemini:", error);
    return text;
  }
};

export const suggestReply = async (history: string[]): Promise<string[]> => {
    try {
        const conversation = history.join('\n');
        const prompt = `Given the following chat history, suggest 3 short, professional responses for the user.\n\n${conversation}\n\nFormat: JSON array of strings.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json'
            }
        });
        
        const jsonText = response.text;
        if (!jsonText) return [];
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Error suggesting replies:", e);
        return [];
    }
}