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
    
    // Add Enter key listener for search input
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            console.log('Enter key pressed in search input, initiating search...');
            searchAndFilterXML();
        }
    });
    
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
