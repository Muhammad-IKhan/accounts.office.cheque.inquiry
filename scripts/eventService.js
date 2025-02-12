//

import { debounce } from './utils.js';

export class EventService {
    constructor(domManager, tableService, searchService) {
        this.domManager = domManager;
        this.tableService = tableService;
        this.searchService = searchService;
    }

    setupEventListeners() {
        const searchInput = this.domManager.elements.searchInput;
        searchInput?.addEventListener('input', debounce(
            () => this.searchService.searchAndFilter(), 300
        ));

        document.querySelectorAll('th[data-column]').forEach(header => {
            header?.addEventListener('click', () => {
                const column = header.getAttribute('data-column');
                if (column) this.tableService.sortTable(column);
            });
        });
    }
}
