// domElements.js
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
            element !== null || element === this.elements.paginationControls);
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
        
        this.elements.tableBody.parentNode.after(container);
        this.elements.paginationControls = container;
        return container;
    }
}
