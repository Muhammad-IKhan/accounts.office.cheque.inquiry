
// pagination.js

import { tableBody } from './domElements.js';

// Pagination state configuration
export let paginationState = {
    currentPage: 1,
    rowsPerPage: 10,
    totalPages: 1
};

/**
 * Creates and appends pagination control elements to the DOM
 */
function createPaginationControls() {
    console.log('Creating pagination control elements');
    
    const paginationContainer = document.createElement('div');
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
    
    // Add controls after the table
    tableBody.parentNode.after(paginationContainer);
    
    // Set up event listeners
    setupPaginationEventListeners();
}

/**
 * Sets up event listeners for pagination controls
 */
function setupPaginationEventListeners() {
    document.getElementById('prevPage').addEventListener('click', () => {
        if (paginationState.currentPage > 1) {
            paginationState.currentPage--;
            updatePagination();
        }
    });
    
    document.getElementById('nextPage').addEventListener('click', () => {
        if (paginationState.currentPage < paginationState.totalPages) {
            paginationState.currentPage++;
            updatePagination();
        }
    });
    
    document.getElementById('rowsPerPageSelect').addEventListener('change', (e) => {
        paginationState.rowsPerPage = parseInt(e.target.value);
        paginationState.currentPage = 1; // Reset to first page
        updatePagination();
    });
}


/**
 * Initializes pagination for the table
 * @param {number} itemsPerPage - Number of rows to display per page (default: 10)
 */
export function initializePagination(itemsPerPage = 10) {
    console.log('Initializing pagination system...');
    paginationState.rowsPerPage = itemsPerPage;
    createPaginationControls();
    updatePagination();
}

/**
 * Updates the table display based on current pagination state
 */
export function updatePagination() {
    console.log(`Updating pagination: Page ${paginationState.currentPage}, Rows per page: ${paginationState.rowsPerPage}`);
    
    const rows = Array.from(tableBody.querySelectorAll('tr'));
    const totalRows = rows.length;
    
    paginationState.totalPages = Math.ceil(totalRows / paginationState.rowsPerPage);
    
    if (paginationState.currentPage > paginationState.totalPages) {
        paginationState.currentPage = paginationState.totalPages;
    }
    
    const startIndex = (paginationState.currentPage - 1) * paginationState.rowsPerPage;
    const endIndex = Math.min(startIndex + paginationState.rowsPerPage, totalRows);
    
    rows.forEach((row, index) => {
        row.style.display = (index >= startIndex && index < endIndex) ? '' : 'none';
    });
    
    updatePaginationInfo(totalRows, startIndex, endIndex);
    updatePaginationControls();
}


/**
 * Updates the pagination information display
 * @param {number} totalRows - Total number of rows in the table
 * @param {number} startIndex - Start index of current page
 * @param {number} endIndex - End index of current page
 */
function updatePaginationInfo(totalRows, startIndex, endIndex) {
    const pageInfo = document.getElementById('pageInfo');
    pageInfo.textContent = `Showing ${startIndex + 1}-${endIndex} of ${totalRows} entries | Page ${paginationState.currentPage} of ${paginationState.totalPages}`;
}

/**
 * Updates the state of pagination control buttons
 */
function updatePaginationControls() {
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    
    // Disable/enable buttons based on current page
    prevButton.disabled = paginationState.currentPage === 1;
    nextButton.disabled = paginationState.currentPage === paginationState.totalPages;
}

/**
 * Resets pagination to first page
 */
export function resetPagination() {
    console.log('Resetting pagination to first page');
    paginationState.currentPage = 1;
    updatePagination();
}
