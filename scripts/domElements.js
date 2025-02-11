// domElements.js

export let xmlData;
// Global variables to store DOM elements
export let tableBody, searchInput, tableContainer, emptyState, resultContainer;

/**
 * Initializes DOM elements and returns them
 * @returns {Object} - An object containing references to DOM elements
 */
export function initializeDOMElements() {
    console.log('Initializing DOM elements...');
    
    tableBody = document.getElementById('checksTable');
    searchInput = document.getElementById('search');
    tableContainer = document.getElementById('tableContainer');
    emptyState = document.getElementById('emptyState');
    resultContainer = document.getElementById('result');
    
    // Return the DOM elements as an object
    return {
        tableBody,
        searchInput,
        tableContainer,
        emptyState,
        resultContainer
    };
}
