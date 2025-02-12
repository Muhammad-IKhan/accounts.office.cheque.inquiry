import { PAGINATION_CONFIG } from './constants.js';
import { store } from './store.js';

export class DOMManager {
    constructor() {
        this.elements = {};
    }

    initialize() {
        this.elements = {
            tableBody: document.getElementById('checksTable'),
            searchInput: document.getElementById('search'),
            tableContainer: document.getElementById('tableContainer'),
            emptyState: document.getElementById('emptyState'),
            resultContainer: document.getElementById('result'),
            paginationControls: null
        };

        if (!this.validateElements()) {
            throw new Error('Required DOM elements not found');
        }

        return this.elements;
    }

    validateElements() {
        return Object.values(this.elements).every(element => 
            element !== null && element !== this.elements.paginationControls
        );
    }

    createPaginationControls() {
        const container = document.createElement('div');
        container.className = 'pagination-controls';

        const prevButton = document.createElement('button');
        prevButton.id = 'prevPage';
        prevButton.className = 'pagination-btn';
        prevButton.textContent = '< Previous';

        const pageInfo = document.createElement('span');
        pageInfo.id = 'pageInfo';
        pageInfo.className = 'page-info';

        const nextButton = document.createElement('button');
        nextButton.id = 'nextPage';
        nextButton.className = 'pagination-btn';
        nextButton.textContent = 'Next >';

        const rowsPerPageSelect = document.createElement('select');
        rowsPerPageSelect.id = 'rowsPerPageSelect';
        rowsPerPageSelect.className = 'rows-per-page';

        PAGINATION_CONFIG.PAGE_SIZE_OPTIONS.forEach(size => {
            const option = document.createElement('option');
            option.value = size;
            option.textContent = `${size} per page`;
            if (size === store.paginationState.rowsPerPage) {
                option.selected = true;
            }
            rowsPerPageSelect.appendChild(option);
        });

        container.appendChild(prevButton);
        container.appendChild(pageInfo);
        container.appendChild(nextButton);
        container.appendChild(rowsPerPageSelect);

        this.elements.tableBody.parentNode.after(container);
        this.elements.paginationControls = container;
        return container;
    }
}
