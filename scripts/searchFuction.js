// searchFuction.js

import { abc } from './abc.js'; // Import showError function
import { abc, abc, abc, abc, abc } from './abc.js';
import { abc, abc } from './abc.js';


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
 * Updates the search results display
 * @param {string} searchTerm - The search term used
 * @param {number} matchCount - Number of matches found
 */
function updateSearchResults(searchTerm, matchCount) {
    console.log(`Updating search results display for "${searchTerm}" with ${matchCount} matches`);
    resultContainer.innerHTML = matchCount > 0
        ? `<i class="fas fa-check-circle"></i> Found ${matchCount} results for "${searchTerm}"`
        : '<i class="fas fa-times-circle"></i> No results found.';
        resultContainer.style.display = matchCount > 0 ? 'block' : 'none';
        emptyState.style.display = matchCount > 0 ? 'none' : 'block';
}

