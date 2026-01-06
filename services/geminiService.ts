import { GoogleGenAI, Type } from "@google/genai";
import { AIIntent, CommandResponse } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseAIIntent = async (query: string): Promise<AIIntent | null> => {
  const ai = getAI();
  const systemInstruction = `
    You are an AI Orchestrator for an E-commerce CMS. 
    Analyze the user's natural language command and map it to an intent.
    Actions available: 
    - SEARCH: Find products, orders, or customers.
    - REPORT: Generate sales, tax, or performance reports.
    - PREDICT: Forecast stock levels or sales trends.
    - NAVIGATE: Switch views (dashboard, products, etc.).
    - CONTENT: Help write emails, pages, or descriptions.
    - UNKNOWN: Use when intent is unclear.
    
    Return a structured JSON object.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: query,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            action: { type: Type.STRING, enum: ['SEARCH', 'REPORT', 'PREDICT', 'NAVIGATE', 'CONTENT', 'UNKNOWN'] },
            params: { type: Type.OBJECT, description: "Key-value pairs extracted from command" },
            confidence: { type: Type.NUMBER },
            reasoning: { type: Type.STRING }
          },
          required: ["action", "params", "confidence", "reasoning"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Intent parsing failed:", error);
    return null;
  }
};

export const executeCommand = async (query: string): Promise<CommandResponse> => {
  const intent = await parseAIIntent(query);
  
  if (!intent || intent.action === 'UNKNOWN') {
    return { 
      message: "I'm not quite sure what you need. Could you try rephrasing? For example: 'Show me sales for last week' or 'Find boots in Chicago'.",
      suggestions: ["Weekly sales report", "Search sneakers", "Check inventory levels"]
    };
  }

  // Implementation of specific command logic
  switch(intent.action) {
    case 'NAVIGATE':
      return { 
        message: `Sure, switching you over to the ${intent.params.target || 'requested'} view.`,
        viewToOpen: intent.params.target?.toLowerCase()
      };
    case 'REPORT':
      return {
        message: `I've prepared the ${intent.params.type || 'Sales'} report you requested for ${intent.params.period || 'the current period'}.`,
        suggestions: ["Export as PDF", "Email to manager", "Compare with last month"]
      };
    case 'PREDICT':
      return {
        message: `Based on your burn rate, SKU ${intent.params.sku || 'XYZ'} will likely stock out in 14 days. I suggest reordering now.`,
        suggestions: ["Automate reorder", "Check other hubs"]
      };
    case 'SEARCH':
      return {
        message: `Searching for ${intent.params.query || 'items'}... I found several matches in your catalog.`,
        viewToOpen: 'products'
      };
    default:
      return { message: "Executing command..." };
  }
};

export const generateProductDescription = async (productName: string, attributes: string[]) => {
  const ai = getAI();
  const prompt = `Generate a compelling, SEO-friendly e-commerce product description for "${productName}". 
  Key attributes: ${attributes.join(", ")}. 
  Keep it under 150 words. Focus on benefits and quality.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini description generation failed:", error);
    return "Error generating description. Please try again.";
  }
};

export const analyzeSalesTrends = async (data: any) => {
  const ai = getAI();
  const prompt = `As a senior business analyst, analyze this weekly sales data and provide 3 concise bullet points of actionable insights: ${JSON.stringify(data)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return "Unable to analyze trends at this moment.";
  }
};

export const generateSEOTags = async (productName: string, description: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a JSON object with SEO title, meta description, and 5 keywords for: ${productName}. Description: ${description}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            metaDescription: { type: Type.STRING },
            keywords: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
          },
          required: ["title", "metaDescription", "keywords"]
        },
      },
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("SEO generation failed:", error);
    return null;
  }
};

export const suggestPermissions = async (roleName: string, scope?: string): Promise<{ permissions: string[], reasoning: string } | null> => {
  const ai = getAI();
  const systemInstruction = `
    You are a Security Policy Architect for an Enterprise E-commerce CMS.
    Based on the Role Name and optional Job Scope/Description provided, suggest a set of granular permissions following the principle of least privilege.
    
    Available Modules: users, roles, products, categories, orders, customers, payments, reports, settings, content.
    Available Actions: view, create, edit, delete, approve, export.
    
    Permission format: module.action (e.g., products.view).
    
    Guidelines:
    - If the role/scope mentions "View only" or "Read", only include 'view' actions.
    - If it's a "Manager", give 'view', 'edit', and 'create' across relevant modules.
    - If it's "Support", focus on customers and orders.
    - If it's "Warehouse", focus on products, categories (view), and orders (view).
    
    Return a structured JSON object.
  `;

  const userPrompt = `
    Role Name: "${roleName}"
    ${scope ? `Intended Scope: "${scope}"` : ""}
    Please synthesize a relevant security policy.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            permissions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of strings in 'module.action' format"
            },
            reasoning: {
              type: Type.STRING,
              description: "A professional, one-sentence explanation of why these permissions were chosen for this specific persona."
            }
          },
          required: ["permissions", "reasoning"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Permission suggestion failed:", error);
    return null;
  }
};
