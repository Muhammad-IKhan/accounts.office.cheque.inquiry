// eventService.js

import { debounce } from './utils.js';

export class EventService {
    constructor(domManager, tableService, searchService) {
        this.domManager = domManager;
        this.tableService = tableService;
        this.searchService = searchService;
    }

    setupEventListeners() {
        const { searchInput } = this.domManager.elements;

        searchInput.on('input', debounce(() => {
            this.searchService.searchAndFilter();
        }, 300));

        $('th[data-column]').on('click', (event) => {
            const column = $(event.currentTarget).attr('data-column');
            if (column) this.tableService.sortTable(column);
        });
    }
}
