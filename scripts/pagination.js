// pagination.js

import { tableBody } from './domElements.js';

// Pagination state configuration
export let paginationState = {
    currentPage: 1,
    rowsPerPage: 10,
    totalPages: 1
};

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
 * Resets pagination to first page
 */
export function resetPagination() {
    console.log('Resetting pagination to first page');
    paginationState.currentPage = 1;
    updatePagination();
}
