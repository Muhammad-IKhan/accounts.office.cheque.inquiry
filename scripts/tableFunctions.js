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


/**
 * Creates a table row from an XML element
 * @param {Element} element - The XML element to convert
 * @returns {HTMLTableRowElement} - The created table row
 */
export function createTableRow(element) {
    console.log('Creating new table row from XML element');
    const row = document.createElement('tr');
    
    Object.keys(columns).forEach(field => {
        const cell = document.createElement('td');
        let value = element.getElementsByTagName(field)[0]?.textContent.trim() || '';
        
        // Special handling for AMOUNT field
        if (field === 'AMOUNT') {
            console.log(`Formatting amount value: ${value}`);
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
 * Parses XML string data and populates the table
 * @param {string} xmlString - The XML data to parse (optional)
 * @returns {boolean} - Success status of parsing operation
 */
export function parseXMLToTable(xmlString = null) {
    console.log('Beginning XML parsing process...');
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString || xmlData, "text/xml");
        
        // Validate XML parsing
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
            throw new Error(`XML parsing error detected: ${parserError.textContent}`);
        }
        
        // Get all relevant elements
        const gPvnElements = xmlDoc.getElementsByTagName('G_PVN');
        console.log(`Successfully found ${gPvnElements.length} G_PVN elements in XML`);
        
        // Clear existing table content for fresh data
        tableBody.innerHTML = '';
        
        // Create table rows for each element
        Array.from(gPvnElements).forEach((element, index) => {
            console.log(`Processing element ${index + 1} of ${gPvnElements.length}`);
            const row = createTableRow(element);
            tableBody.appendChild(row);
        });
        
        console.log('Table population completed successfully');
        return true;
    } catch (error) {
        console.error('Error encountered during XML parsing:', error);
        showError('Failed to parse XML data. Please check the data format.');
        return false;
    }
}

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
