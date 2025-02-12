//paginationService.js

import { PAGINATION_CONFIG } from './constants.js';
import { store } from './store.js';

export class PaginationService {
    constructor(domManager) {
        this.domManager = domManager;
    }

    createPaginationControls() {
        const container = document.createElement('div');
        container.className = 'pagination-controls';
        container.innerHTML = `
            <button id="prevPage" class="pagination-btn">&lt; Previous</button>
            <span id="pageInfo" class="page-info"></span>
            <button id="nextPage" class="pagination-btn">Next &gt;</button>
            <select id="rowsPerPageSelect" class="rows-per-page">
                ${PAGINATION_CONFIG.PAGE_SIZE_OPTIONS.map(size => 
                    `<option value="${size}"${size === store.paginationState.rowsPerPage ? ' selected' : ''}>
                        ${size} per page
                    </option>`
                ).join('')}
            </select>
        `;
        
        this.domManager.elements.tableBody.parentNode.after(container);
        this.domManager.elements.paginationControls = container;
        return container;
    }
}
