
import { GoogleGenAI, Type } from "@google/genai";

export interface ClassificationResult {
  category: string;
  priority: 'Low' | 'Medium' | 'High';
}

// FIX: Initialize GoogleGenAI directly as per guidelines, assuming API_KEY is always present from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const classifyDocument = async (description: string): Promise<ClassificationResult | null> => {
  // FIX: Removed conditional check for AI initialization to align with guidelines that API key is always available.
  try {
    const response = await ai.models.generateContent({
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
          // FIX: Use propertyOrdering as shown in the JSON response schema examples in the guidelines.
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
