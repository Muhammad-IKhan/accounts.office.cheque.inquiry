// app.js

import { DOMManager } from './domManager.js';
import { XMLService } from './xmlService.js';
import { TableService } from './tableService.js';
import { SearchService } from './searchService.js';
import { EventService } from './eventService.js';
import { PaginationService } from './paginationService.js';
import { setupServiceWorker } from './serviceWorker.js';
import { handleError } from './errorHandler.js';

export class App {
    constructor() {
        this.domManager = new DOMManager();
        this.xmlService = new XMLService(this.domManager);
        this.tableService = new TableService(this.domManager);
        this.searchService = new SearchService(this.domManager);
        this.eventService = new EventService(this.domManager, this.tableService, this.searchService);
        this.paginationService = new PaginationService(this.domManager);
    }

    async initialize() {
        try {
            this.domManager.initialize();
            await this.initializeData();
            this.eventService.setupEventListeners();
            this.paginationService.createPaginationControls();
            setupServiceWorker();
        } catch (error) {
            handleError(error, 'App initialization');
        }
    }

    async initializeData() {
        const success = await this.xmlService.fetchXMLData();
        if (success) {
            this.tableService.parseXMLToTable();
            this.searchService.resetSearch();
        }
    }
}
