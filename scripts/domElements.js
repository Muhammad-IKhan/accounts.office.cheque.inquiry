// domElements.js

// Global variables to store DOM elements
export let tableBody, searchInput, tableContainer, emptyState, resultContainer;
export let xmlData;

/**
 * Initializes DOM elements
 */
export function initializeDOMElements() {
    console.log('Initializing DOM elements...');
    
    tableBody = document.getElementById('checksTable');
    searchInput = document.getElementById('search');
    tableContainer = document.getElementById('tableContainer');
    emptyState = document.getElementById('emptyState');
    resultContainer = document.getElementById('result');
}
