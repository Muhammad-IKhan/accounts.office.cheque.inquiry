// domManager.js

import { PAGINATION_CONFIG } from './constants.js';

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
}
