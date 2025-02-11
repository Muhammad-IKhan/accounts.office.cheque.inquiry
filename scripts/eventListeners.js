// eventListeners.js
// Import the objects
import { searchAndFilterXML, sortTable, resetTable } from './tableFunctions.js';
import { initializeDOMElements } from './domElements.js';
import { columns } from './tableFunctions.js'; 


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
    const searchInput = document.getElementById('search');
    const searchButton = document.querySelector('.btn-primary');
    const resetButton = document.querySelector('.btn-secondary');
    const tableHeaders = document.querySelectorAll('th[data-column]');

    if (searchInput) {
        searchInput.addEventListener('input', debounce(searchAndFilterXML, 300));
    } else {
        console.error('Search input element not found');
    }

    if (searchButton) {
        searchButton.addEventListener('click', searchAndFilterXML);
    } else {
        console.error('Search button not found');
    }

    if (resetButton) {
        resetButton.addEventListener('click', resetTable);
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



    /*
    const { searchInput } = initializeDOMElements();
    const searchButton = document.getElementById('searchButton'); // Add this line
    const resetButton = document.getElementById('resetButton');

    
    // Add Enter key listener for search input
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            console.log('Enter key pressed in search input, initiating search...');
            searchAndFilterXML();
        }
    });

    // Add click listener for search button
    searchButton.addEventListener('click', () => {
        console.log('Search button clicked, initiating search...');
        searchAndFilterXML();
    });


    // Check if elements exist before adding event listeners
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                console.log('Enter key pressed in search input, initiating search...');
                searchAndFilterXML();
            }
        });
    } else {
        console.error('Search input not found');
    }

    if (searchButton) {
        searchButton.addEventListener('click', () => {
            console.log('Search button clicked, initiating search...');
            searchAndFilterXML();
        });
    } else {
        console.error('Search button not found');
    }

    if (resetButton) {
        resetButton.addEventListener('click', () => {
            console.log('Reset button clicked, resetting table...');
            resetTable();
        });
    } else {
        console.error('Reset button not found');
    }

    
    // Add click listeners for column sorting
    Object.keys(columns).forEach(columnName => {
        const header = document.querySelector(`th[data-column="${columnName}"]`);
        if (header) {
            header.addEventListener('click', () => {
                console.log(`Column header clicked: ${columnName}, initiating sort...`);
                sortTable(columnName);
            });
        }
    });
}


*/
