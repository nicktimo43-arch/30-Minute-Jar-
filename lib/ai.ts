
import { GoogleGenAI, Type } from '@google/genai';

// Safely initialize the AI client only if the API key is available.
// This prevents the app from crashing in browser environments where `process` is not defined.
let ai: GoogleGenAI | null = null;
try {
    // Vercel and other platforms might not expose `process` to the client.
    // This check prevents a ReferenceError.
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    } else {
        console.warn("Google AI API key not found. AI features will be disabled. Make sure to set up your environment variables.");
    }
} catch (error) {
    console.error("Error initializing GoogleGenAI:", error);
}


const responseSchema = {
    type: Type.OBJECT,
    properties: {
        isRelevant: {
            type: Type.BOOLEAN,
            description: 'Is the task relevant to the high-priority goal?',
        },
        feedback: {
            type: Type.STRING,
            description: 'A concise, one-sentence feedback. If irrelevant, explain why. If relevant, give encouragement.',
        },
        suggestedText: {
            type: Type.STRING,
            description: 'An improved, more specific version of the task text. If irrelevant, suggest a better task.',
        },
    },
    required: ['isRelevant', 'feedback', 'suggestedText'],
};

export interface AITaskResponse {
    isRelevant: boolean;
    feedback: string;
    suggestedText: string;
}

export const getTaskCorrection = async (
    highPriorityTask: string,
    currentTaskText: string,
    taskType: 'input' | 'output'
): Promise<AITaskResponse> => {
    
    // If the AI client failed to initialize, provide a default permissive response.
    if (!ai) {
        console.log("AI is not available. Skipping task correction.");
        return {
            isRelevant: true,
            feedback: '',
            suggestedText: currentTaskText,
        };
    }

    const taskTypeDescription = taskType === 'input' ? 'Consume' : 'Produce';

    const systemInstruction = `You are a strict but helpful productivity coach. The user's main goal is: "${highPriorityTask}".
The user wants to add a new "${taskTypeDescription}" task: "${currentTaskText}".

Your job is to analyze if this new task is a concrete, actionable step towards the main goal.
- A 'Consume' task must be for research, learning, or gathering information DIRECTLY related to the main goal.
- A 'Produce' task must be an action that creates, builds, or writes something that is part of the main goal.

Vague tasks like "read", "work", or "code" are not acceptable.

If the task is relevant, 'isRelevant' must be true. Make it more specific and actionable in 'suggestedText'. The feedback should be positive encouragement.
If the task is irrelevant or too vague, 'isRelevant' must be false. The feedback must explain why it's not a good task and 'suggestedText' should be an example of a good task that would be relevant.

Keep all text concise and conversational.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze the user's new task based on the system instructions.`,
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema,
            }
        });

        const jsonString = response.text.trim();
        const parsed = JSON.parse(jsonString);
        
        if (typeof parsed.isRelevant !== 'boolean' || typeof parsed.feedback !== 'string' || typeof parsed.suggestedText !== 'string') {
            throw new Error("Invalid JSON schema from AI");
        }

        return parsed;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        // Fallback in case of API error
        throw new Error("Could not get AI feedback from the model.");
    }
};
