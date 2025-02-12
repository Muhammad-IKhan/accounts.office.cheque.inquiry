// domElementsT.js

// Global variables to store DOM elements
export let xmlData;
export let tableContainer, tableBody;
export let searchInput, emptyState;
export let searchButton, resetButton, tableHeaders;
export let resultContainer;
export let paginationContainer;
export let prevButton, nextButton;


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

    searchButton = document.querySelector('.btn-primary');
    resetButton = document.querySelector('.btn-secondary');
    tableHeaders = document.querySelectorAll('th[data-column]');

    paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination-controls';
    paginationContainer.innerHTML = `
        <button id="prevPage" class="pagination-btn">&lt; Previous</button>
        <span id="pageInfo" class="page-info"></span>
        <button id="nextPage" class="pagination-btn">Next &gt;</button>
        <select id="rowsPerPageSelect" class="rows-per-page">
            <option value="5">5 per page</option>
            <option value="10" selected>10 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
        </select>
    `;
   prevButton = document.getElementById('prevPage');
   nextButton = document.getElementById('nextPage');
    
    // Return the DOM elements as an object
    return {
        tableContainer,
        tableBody,
        // xmlData,
        searchInput,
        emptyState,
        searchButton,
       resetButton,
        tableHeaders,
        resultContainer,
      
    };
}
