// errorHandling.js

import { resultContainer } from './domElements.js';

/**
 * Displays error messages to the user
 * @param {string} message - Error message to display
 */
export function showError(message) {
    console.error(`Displaying error message: ${message}`);
    resultContainer.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    resultContainer.style.display = 'block';
}
