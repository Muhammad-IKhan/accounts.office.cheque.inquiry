//errorHandler.js

export function handleError(error, context = '') {
    console.error(`Error in ${context}:`, error);
    // You can add more sophisticated error handling here (e.g., logging, UI notifications).
}
