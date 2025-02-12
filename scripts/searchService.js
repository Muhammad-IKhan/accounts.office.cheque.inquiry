// searchService.js
export class SearchService {
    constructor(domManager) {
        this.domManager = domManager;
    }

    searchAndFilter() {
        const searchTerm = this.domManager.elements.searchInput.value.toLowerCase();
        if (!searchTerm) {
            this.resetSearch();
            return;
        }

        const matches = this.filterRows(searchTerm);
        this.updateUIWithResults(searchTerm, matches);
    }

    filterRows(searchTerm) {
        const rows = this.domManager.elements.tableBody.querySelectorAll('tr');
        let matchCount = 0;

        rows.forEach(row => {
            const matches = Array.from(row.cells).some(cell => 
                cell.textContent.toLowerCase().includes(searchTerm)
            );
            row.style.display = matches ? '' : 'none';
            if (matches) matchCount++;
        });

        return matchCount;
    }

    updateUIWithResults(searchTerm, matchCount) {
        const { resultContainer, emptyState, tableContainer } = this.domManager.elements;
        
        resultContainer.innerHTML = matchCount > 0
            ? `<i class="fas fa-check-circle"></i> Found ${matchCount} results for "${searchTerm}"`
            : '<i class="fas fa-times-circle"></i> No results found.';
            
        resultContainer.style.display = 'block';
        emptyState.style.display = matchCount > 0 ? 'none' : 'block';
        tableContainer.style.display = matchCount > 0 ? 'block' : 'none';
    }

    resetSearch() {
        const { tableContainer, emptyState, resultContainer } = this.domManager.elements;
        tableContainer.style.display = 'none';
        emptyState.style.display = 'block';
        resultContainer.style.display = 'none';
    }
}
