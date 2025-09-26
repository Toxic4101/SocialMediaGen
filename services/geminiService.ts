import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage, Product } from "../types";

// Custom Error for rate limiting
export class QuotaExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuotaExceededError';
  }
}
export class ModelUnavailableError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ModelUnavailableError';
    }
}
export class InvalidRequestError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidRequestError';
    }
}
export class AiServerError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AiServerError';
    }
}

let ai: GoogleGenAI | null = null;

const getAiClient = (): GoogleGenAI => {
    if (ai) return ai;
    try {
        // FIX: Simplified to strictly follow guidelines. The API key must be obtained
        // exclusively from process.env.API_KEY. The constructor will throw an error if
        // the API key is missing, which is caught below.
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        return ai;
    } catch (e) {
        console.error("Failed to initialize GoogleGenAI:", e);
        throw new Error("Could not initialize AI service. Is the API_KEY configured correctly?");
    }
};

const handleApiError = (error: any, context: string): never => {
    console.error(`Error in ${context}:`, error);
    const errorMessage = error.message?.toLowerCase() || JSON.stringify(error).toLowerCase();

    if (errorMessage.includes('quota') || errorMessage.includes('rate limit') || errorMessage.includes('resource has been exhausted')) {
        throw new QuotaExceededError(`API quota exceeded during ${context}. The AI will cool down.`);
    }
     if (errorMessage.includes('503') || errorMessage.includes('model is overloaded')) {
        throw new ModelUnavailableError(`The AI model is currently unavailable or overloaded. Please try again later.`);
    }
    if (errorMessage.includes('400') || errorMessage.includes('invalid')) {
         throw new InvalidRequestError(`The request to the AI was invalid. Context: ${context}.`);
    }
     if (errorMessage.includes('500') || errorMessage.includes('internal')) {
        throw new AiServerError(`An internal server error occurred with the AI service. Please try again later.`);
    }
    throw new Error(`An unknown error occurred in ${context}.`);
};

export const generateProductDrafts = async (existingNames: string[]): Promise<Partial<Product>[]> => {
    const ai = getAiClient();
    const DRAFT_SCHEMA = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: "A catchy, unique name for a digital product (e.g., e-book, template)." },
                description: { type: Type.STRING, description: "A concise, one-sentence description for the product." },
            },
            required: ["name", "description"]
        }
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate 2 new, unique digital product concepts. Avoid these existing names: ${existingNames.join(', ')}.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: DRAFT_SCHEMA,
            },
        });
        return JSON.parse(response.text) as Partial<Product>[];
    } catch (error) {
        handleApiError(error, 'product draft generation');
    }
};

export const enrichProductDetails = async (productDraft: Partial<Product>): Promise<Partial<Product>> => {
    const ai = getAiClient();
    const ENRICHMENT_SCHEMA = {
        type: Type.OBJECT,
        properties: {
            price: { type: Type.NUMBER, description: "The product's price, between 29.99 and 149.99." },
            details: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 3-4 key features or benefits of the product." },
            usageInstructions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 2-3 brief instructions on how to use the product." },
            imagePrompt: { type: Type.STRING, description: "A detailed DALL-E or Midjourney prompt to generate a visually stunning, professional image for this product." },
        },
        required: ["price", "details", "usageInstructions", "imagePrompt"]
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Enrich the following product concept with more details. Name: "${productDraft.name}". Description: "${productDraft.description}".`,
            config: {
                responseMimeType: "application/json",
                responseSchema: ENRICHMENT_SCHEMA,
            },
        });
        return JSON.parse(response.text) as Partial<Product>;
    } catch (error) {
        handleApiError(error, 'product detail enrichment');
    }
};


export const generateSocialMediaPost = async (product: Product): Promise<string> => {
    const ai = getAiClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate an engaging social media post to announce a new product: "${product.name}". Description: "${product.description}". Include relevant hashtags.`,
        });
        return response.text;
    } catch (error) {
        handleApiError(error, 'social media post generation');
    }
};

export const generateProductImage = async (prompt: string): Promise<string> => {
    const ai = getAiClient();
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });

        if (!response.generatedImages || response.generatedImages.length === 0) {
            throw new Error("API did not return any images.");
        }
        return response.generatedImages[0].image.imageBytes;
    } catch (error) {
        handleApiError(error, 'product image generation');
    }
};

export const getChatbotResponse = async (product: Product, history: ChatMessage[]): Promise<string> => {
    const ai = getAiClient();
    
    const systemInstruction = `You are a friendly AI support agent for Cortex Commerce, answering questions about: "${product.name}". Description: "${product.description}". Price: $${product.price.toFixed(2)}. Key Features: ${product.details?.join(', ')}. Your role is to answer questions concisely based *only* on this provided product info. Do not make up features. Be helpful and brief.`;

    const contents = history.map(msg => ({
        role: msg.sender === 'USER' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: { systemInstruction }
        });
        return response.text;
    } catch (error) {
        handleApiError(error, 'chatbot response');
    }
};