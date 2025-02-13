// searchService.js

export class SearchService {
    constructor(domManager) {
        this.domManager = domManager;
    }

    searchAndFilter() {
        const { searchInput, tableBody, resultContainer, emptyState, tableContainer } = this.domManager.elements;
        const searchTerm = searchInput.val().toLowerCase();

        if (!searchTerm) {
            this.resetSearch();
            return;
        }

        const matches = this.filterRows(searchTerm);
        this.updateUIWithResults(searchTerm, matches);
    }

    filterRows(searchTerm) {
        const rows = tableBody.find('tr');
        let matchCount = 0;

        rows.each((index, row) => {
            const matches = $(row).find('td').toArray().some(cell => 
                $(cell).text().toLowerCase().includes(searchTerm)
            );
            $(row).toggle(matches);
            if (matches) matchCount++;
        });

        return matchCount;
    }

    updateUIWithResults(searchTerm, matchCount) {
        const { resultContainer, emptyState, tableContainer } = this.domManager.elements;

        resultContainer.html(matchCount > 0
            ? `<i class="fas fa-check-circle"></i> Found ${matchCount} results for "${searchTerm}"`
            : '<i class="fas fa-times-circle"></i> No results found.'
        ).show();

        emptyState.toggle(matchCount === 0);
        tableContainer.toggle(matchCount > 0);
    }

    resetSearch() {
        const { tableContainer, emptyState, resultContainer } = this.domManager.elements;
        tableContainer.hide();
        emptyState.show();
        resultContainer.hide();
    }
}
