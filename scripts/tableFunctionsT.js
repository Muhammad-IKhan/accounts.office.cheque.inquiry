// tableFunctions.js

import { showError } from './errorHandling.js'; // Import showError function
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

// Export sortState so it's accessible throughout the module
export const sortState = {
    currentColumn: null,
    direction: 'asc'
};


/**
 * Creates a table row from an XML element
 * @param {Element} element - The XML element to convert
 * @returns {HTMLTableRowElement} - The created table row
 */
export function createTableRow(element) {
    //console.log('Creating new table row from XML element');
    const row = document.createElement('tr');
    
    Object.keys(columns).forEach(field => {
        const cell = document.createElement('td');
        let value = element.getElementsByTagName(field)[0]?.textContent.trim() || '';
        
        // Special handling for AMOUNT field
        if (field === 'AMOUNT') {
            //console.log(`Formatting amount value: ${value}`);
            try {
                value = parseFloat(value).toLocaleString('en-US');
            } catch (error) {
                console.warn(`Invalid amount value detected: ${value}, defaulting to 0`);
                value = '0';
            }
        }
        
        cell.textContent = value;
        cell.setAttribute('data-field', field);
        row.appendChild(cell);
    });
    
    return row;
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

    // Clear and re-append sorted rows
    while (tableBody.firstChild) {
        tableBody.removeChild(tableBody.firstChild);
    }
    
    rows.forEach(row => tableBody.appendChild(row));
    console.log(`Table sort complete in ${sortState.direction} order`);
    resetPagination();
}

function updateSortIndicators(columnName) {
    const headers = document.querySelectorAll('th[data-column]');
    headers.forEach(header => {
        const icon = header.querySelector('.sort-icon');
        if (icon) {
            if (header.getAttribute('data-column') === columnName) {
                icon.textContent = sortState.direction === 'asc' ? '↑' : '↓';
            } else {
                icon.textContent = '↓';
            }
        }
    });
}

export function resetTable() {
    console.log('Resetting table to initial state');
    tableContainer.style.display = 'none';
    emptyState.style.display = 'block';
    resultContainer.style.display = 'none';
}
