// domManager.js

import { PAGINATION_CONFIG } from './constants.js';

export class DOMManager {
    constructor() {
        this.elements = {};
    }

    initialize() {
        this.elements = {
            tableBody: $('#checksTable'),
            searchInput: $('#search'),
            tableContainer: $('.table-responsive'),
            emptyState: $('#emptyState'),
            resultContainer: $('#result'),
            paginationControls: $('#paginationControls')
        };

        if (!this.validateElements()) {
            throw new Error('Required DOM elements not found');
        }

        return this.elements;
    }

    validateElements() {
        return Object.values(this.elements).every(element => element.length > 0);
    }
}
