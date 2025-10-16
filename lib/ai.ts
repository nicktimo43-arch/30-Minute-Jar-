import { NoteType } from '../types';

export interface AITaskResponse {
    isRelevant: boolean;
    feedback: string;
    suggestedText: string;
}

/**
 * Sends a task to the backend serverless function for analysis by the AI model.
 * This function no longer calls the AI directly, but acts as a client to our secure API proxy.
 */
export const getTaskCorrection = async (
    highPriorityTask: string,
    currentTaskText: string,
    taskType: NoteType
): Promise<AITaskResponse> => {
    try {
        const response = await fetch('/api/analyze-task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                highPriorityTask,
                currentTaskText,
                taskType,
            }),
        });
        
        const responseData = await response.json();

        if (!response.ok) {
            // Log the detailed error from the server but throw a more generic one to the UI.
            console.error("API proxy error:", response.status, responseData.error);
            throw new Error(responseData.error || 'The server returned an error.');
        }

        return responseData;

    } catch (error) {
        console.error("Error calling task analysis API:", error);
        // The calling component (`TaskPlanner`) will catch this and display a user-friendly message.
        // Re-throwing the error ensures the loading state is correctly handled.
        throw new Error("Could not get AI feedback. Please try again.");
    }
};
