import { DOMManager } from './domManager.js';
import { XMLService } from './xmlService.js';
import { TableService } from './tableService.js';
import { SearchService } from './searchService.js';

export class App {
    constructor() {
        this.domManager = new DOMManager();
        this.xmlService = new XMLService(this.domManager);
        this.tableService = new TableService(this.domManager);
        this.searchService = new SearchService(this.domManager);
    }

    async initialize() {
        try {
            this.domManager.initialize();
            await this.initializeData();
            this.setupEventListeners();
            this.setupServiceWorker();
        } catch (error) {
            console.error('Initialization error:', error);
        }
    }

    async initializeData() {
        const success = await this.xmlService.fetchXMLData();
        if (success) {
            this.tableService.parseXMLToTable();
            this.searchService.resetSearch();
        } else {
            console.error('Failed to initialize data.');
        }
    }

    setupEventListeners() {
        const searchInput = this.domManager.elements.searchInput;
        searchInput?.addEventListener('input', this.debounce(
            () => this.searchService.searchAndFilter(), 300
        ));

        document.querySelectorAll('th[data-column]').forEach(header => {
            header?.addEventListener('click', () => {
                const column = header.getAttribute('data-column');
                if (column) this.tableService.sortTable(column);
            });
        });
    }

    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/accounts.office.cheque.inquiry/service-worker.js', {
                scope: '/accounts.office.cheque.inquiry/'
            }).catch(error => console.error('SW registration failed:', error));
        }
    }

    debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
}
