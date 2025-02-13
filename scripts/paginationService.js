//paginationService.js

import { PAGINATION_CONFIG } from './constants.js';
import { store } from './store.js';

import { PAGINATION_CONFIG } from './constants.js';
import { store } from './store.js';

export class PaginationService {
    constructor(domManager) {
        this.domManager = domManager;
    }

    createPaginationControls() {
        const { paginationControls } = this.domManager.elements;

        const controls = `
            <button id="prevPage" class="btn btn-outline-primary">&lt; Previous</button>
            <span id="pageInfo" class="mx-2"></span>
            <button id="nextPage" class="btn btn-outline-primary">Next &gt;</button>
            <select id="rowsPerPageSelect" class="form-select d-inline-block w-auto ms-2">
                ${PAGINATION_CONFIG.PAGE_SIZE_OPTIONS.map(size => 
                    `<option value="${size}"${size === store.paginationState.rowsPerPage ? ' selected' : ''}>
                        ${size} per page
                    </option>`
                ).join('')}
            </select>
        `;

        paginationControls.html(controls);
        return paginationControls;
    }

    updatePaginationInfo() {
        const pageInfo = $('#pageInfo');
        if (pageInfo.length) {
            pageInfo.text(`Page ${store.paginationState.currentPage} of ${store.paginationState.totalPages}`);
        } else {
            console.error('Element with id "pageInfo" not found');
        }
    }

    resetPagination() {
        store.paginationState.currentPage = 1;
        this.updatePaginationInfo();
    }
}
