
import { GoogleGenAI, Type } from "@google/genai";

export interface ClassificationResult {
  category: string;
  priority: 'Low' | 'Medium' | 'High';
}

// Lazily initialize the AI client to prevent app crash on load if API_KEY is not set.
let ai: GoogleGenAI | null = null;

const getAiInstance = (): GoogleGenAI | null => {
  if (ai) {
    return ai;
  }

  // In deployment environments like Vercel, process.env.API_KEY might not be available
  // on the client-side, causing a crash. This check prevents the crash.
  if (!process.env.API_KEY) {
    console.error("Gemini API key is not configured. Please set the API_KEY environment variable in your deployment settings.");
    return null;
  }

  try {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai;
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI:", error);
    return null;
  }
};

export const classifyDocument = async (description: string): Promise<ClassificationResult | null> => {
  const aiInstance = getAiInstance();
  if (!aiInstance) {
    // Fallback if AI client fails to initialize.
    return { category: 'Unclassified', priority: 'Medium' };
  }

  try {
    const response = await aiInstance.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Based on the following document description, classify it into a relevant category (e.g., HR, Finance, Procurement, Academic, General) and assign a priority level (Low, Medium, High). Description: "${description}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              description: "The document category. Examples: HR, Finance, Procurement, Academic, General.",
            },
            priority: {
              type: Type.STRING,
              description: "The priority level. Must be one of: Low, Medium, High.",
            },
          },
          propertyOrdering: ["category", "priority"],
        },
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText) as ClassificationResult;
    
    // Basic validation
    if (result && result.category && ['Low', 'Medium', 'High'].includes(result.priority)) {
        return result;
    } else {
        throw new Error("Invalid classification format received from AI.");
    }

  } catch (error) {
    console.error("Error classifying document with Gemini:", error);
    // Fallback in case of API error
    return { category: 'Unclassified', priority: 'Medium' };
  }
};
