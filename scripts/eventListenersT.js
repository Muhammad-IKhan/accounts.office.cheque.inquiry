// eventListeners.js
// Import the objects
import { initializeDOMElements } from './domElements.js';
import {columns, searchAndFilterXML, sortTable, resetTable } from './tableFunctions.js';



  const { searchInput } = initializeDOMElements();


/**
 * Sets up all necessary event listeners for the application
 */
export function initializeEventListeners() {
    console.log('Setting up event listeners...');

     // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachEventListeners);
    } else {
        attachEventListeners();
    }
}




function attachEventListeners() {

    if (searchInput) {
        searchInput.addEventListener('input', debounce(searchAndFilterXML, 300));
        console.log(' entering search...');
    } else {
        console.error('Search input element not found');
    }

    if (searchButton) {
        searchButton.addEventListener('click', searchAndFilterXML);
          console.log('Search button clicked, initiating search...');
    } else {
        console.error('Search button not found');
    }

    if (searchButton) {
        searchButton.addEventListener('Enter', searchAndFilterXML);
          console.log('Enter clicked, initiating search...');
    } else {
        console.error('Search button not found');
    }

    if (resetButton) {
        resetButton.addEventListener('click', resetTable);
        console.log('Search button clicked, initiating search...');
    } else {
        console.error('Reset button not found');
    }

    // Add event listeners to table headers
    tableHeaders.forEach(header => {
        if (header) {
            header.addEventListener('click', () => {
                const columnName = header.getAttribute('data-column');
                if (columnName) {
                    sortTable(columnName);
                }
            });
        }
    });
}


/**
 * Debounce function to limit the rate of function execution
 * @param {Function} func - The function to debounce
 * @param {number} wait - The delay in milliseconds
 * @returns {Function} - The debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export functions to global scope for inline HTML handlers
window.searchAndFilterXML = searchAndFilterXML;
window.resetTable = resetTable;
window.sortTable = sortTable;


        // // Add click listeners for column sorting
        // Object.keys(columns).forEach(columnName => {
        //     const header = document.querySelector(`th[data-column="${columnName}"]`);
        //     if (header) {
        //         header.addEventListener('click', () => {
        //             console.log(`Column header clicked: ${columnName}, initiating sort...`);
        //             sortTable(columnName);
        //         });
        //     }
        // });


