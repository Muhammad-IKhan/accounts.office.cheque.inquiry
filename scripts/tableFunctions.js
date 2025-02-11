// tableFunctions.js

import { tableBody, searchInput, tableContainer, emptyState, resultContainer } from './domElements.js';
import { updatePagination, resetPagination } from './pagination.js';

// Column configuration object
export const columns = {
    SNO: { index: 0, type: 'number' },
    NARRATION: { index: 1, type: 'string' },
    AMOUNT: { index: 2, type: 'number' },
    CHEQ_NO: { index: 3, type: 'number' },
    NAR: { index: 4, type: 'string' },
    BNO: { index: 5, type: 'number' },
    PVN: { index: 6, type: 'number' },
    DD: { index: 7, type: 'string' }
};

/**
 * Performs search and filtering on the table data
 */
export function searchAndFilterXML() {
    const searchTerm = searchInput.value.toLowerCase();
    console.log(`Performing search with term: "${searchTerm}"`);
    
    if (!searchTerm) {
        console.log('Empty search term, resetting table');
        resetTable();
        return;
    }
    
    tableContainer.style.display = 'block';
    emptyState.style.display = 'none';
    resultContainer.style.display = 'block';
    
    const rows = tableBody.querySelectorAll('tr');
    let matchCount = 0;
    
    rows.forEach(row => {
        const cells = row.getElementsByTagName('td');
        const matchesSearch = Array.from(cells).some(cell => 
            cell.textContent.toLowerCase().includes(searchTerm)
        );
        
        row.style.display = matchesSearch ? '' : 'none';
        if (matchesSearch) matchCount++;
    });
    
    console.log(`Search complete. Found ${matchCount} matches`);
    updateSearchResults(searchTerm, matchCount);
    resetPagination();
}

/**
 * Sorts the table by specified column with toggle functionality
 * @param {string} columnName - Name of the column to sort by
 */
export function sortTable(columnName) {
    console.log(`Initiating table sort by column: ${columnName}`);
    const column = columns[columnName];
    
    if (!column) {
        console.error(`Invalid column name provided: ${columnName}`);
        return;
    }
    
    // Update sort direction
    if (sortState.currentColumn === columnName) {
        sortState.direction = sortState.direction === 'asc' ? 'desc' : 'asc';
    } else {
        sortState.currentColumn = columnName;
        sortState.direction = 'asc';
    }
    
    updateSortIndicators(columnName);
    
    const rows = Array.from(tableBody.querySelectorAll('tr'));
    const isNumeric = column.type === 'number';
    
    console.log(`Sorting ${rows.length} rows as ${isNumeric ? 'numeric' : 'string'} values in ${sortState.direction} order`);
    
    rows.sort((a, b) => {
        const aValue = a.cells[column.index].textContent.trim();
        const bValue = b.cells[column.index].textContent.trim();
        
        let comparison;
        if (isNumeric) {
            const aNum = parseFloat(aValue.replace(/,/g, '')) || 0;
            const bNum = parseFloat(bValue.replace(/,/g, '')) || 0;
            comparison = aNum - bNum;
        } else {
            comparison = aValue.localeCompare(bValue, undefined, { numeric: true });
        }
        
        return sortState.direction === 'asc' ? comparison : -comparison;
    });
    
    rows.forEach(row => tableBody.appendChild(row));
    console.log(`Table sort complete in ${sortState.direction} order`);
    resetPagination();
}
