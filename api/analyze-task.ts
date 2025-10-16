import { GoogleGenAI, Type } from '@google/genai';

// This is a Vercel serverless function that acts as a secure proxy to the Google AI API.

// Define the expected JSON schema for the AI's response
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

// Vercel automatically handles the request and response objects.
// We can use `any` for simplicity as we can't guarantee @vercel/node types are installed.
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).setHeader('Allow', 'POST').json({ error: 'Method Not Allowed' });
  }

  // Securely check for the API key on the server side
  if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set on the server.");
    return res.status(500).json({ error: "Server configuration error." });
  }

  try {
    const { highPriorityTask, currentTaskText, taskType } = req.body;

    if (!highPriorityTask || !currentTaskText || !taskType) {
      return res.status(400).json({ error: "Missing required parameters: highPriorityTask, currentTaskText, and taskType are required." });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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

    return res.status(200).json(parsed);

  } catch (error: any) {
    console.error("Error in AI task analysis function:", error);
    return res.status(500).json({ error: "Failed to get a response from the AI model.", details: error.message });
  }
}
