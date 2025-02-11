// eventListeners.js
// Import the objects
import { searchAndFilterXML, sortTable } from './tableFunctions.js';
import { initializeDOMElements } from './domElements.js';
import { columns } from './tableFunctions.js'; 


/**
 * Sets up all necessary event listeners for the application
 */
export function initializeEventListeners() {
    console.log('Setting up event listeners...');
    
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
