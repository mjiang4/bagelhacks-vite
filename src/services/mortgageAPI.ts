/**
 * Mortgage API service for interacting with the backend
 */

const API_BASE_URL = 'http://localhost:8000';

/**
 * Send a mortgage query to the backend and get a response
 * @param question The user's mortgage-related question
 * @returns The answer from the mortgage analysis system
 */
export const askMortgageQuestion = async (question: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ask-query/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    return data.answer;
  } catch (error) {
    console.error('Error asking mortgage question:', error);
    throw error;
  }
}; 