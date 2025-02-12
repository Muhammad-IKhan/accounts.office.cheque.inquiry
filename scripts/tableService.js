// tableService.js

import { TABLE_CONFIG } from './constants.js';
import { store } from './store.js';
import { formatAmount } from './utils.js';

export class TableService {
    constructor(domManager) {
        this.domManager = domManager;
    }

    parseXMLToTable() {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(store.xmlData, "text/xml");
            
            if (xmlDoc.querySelector('parsererror')) {
                throw new Error('XML parsing failed');
            }
            
            const elements = xmlDoc.getElementsByTagName('G_PVN');
            this.populateTable(elements);
            
            return true;
        } catch (error) {
            handleError(error, 'XML parsing');
            return false;
        }
    }

    populateTable(elements) {
        this.domManager.elements.tableBody.innerHTML = '';
        Array.from(elements).forEach(element => {
            const row = this.createTableRow(element);
            this.domManager.elements.tableBody.appendChild(row);
        });
    }

    createTableRow(element) {
        const row = document.createElement('tr');
        
        Object.entries(TABLE_CONFIG.columns).forEach(([field, config]) => {
            const cell = document.createElement('td');
            let value = element.getElementsByTagName(field)[0]?.textContent.trim() || '';
            
            if (field === 'AMOUNT') {
                value = formatAmount(value);
            }
            
            cell.textContent = value;
            cell.setAttribute('data-field', field);
            row.appendChild(cell);
        });
        
        return row;
    }

    sortTable(columnName) {
        const column = TABLE_CONFIG.columns[columnName];
        if (!column) return;

        this.updateSortState(columnName);
        this.performSort(column);
        this.updateSortIndicators(columnName);
    }

    updateSortState(columnName) {
        if (store.sortState.currentColumn === columnName) {
            store.sortState.direction = store.sortState.direction === 'asc' ? 'desc' : 'asc';
        } else {
            store.sortState.currentColumn = columnName;
            store.sortState.direction = 'asc';
        }
    }

    performSort(column) {
        const rows = Array.from(this.domManager.elements.tableBody.querySelectorAll('tr'));
        const isNumeric = column.type === 'number';
        
        rows.sort((a, b) => {
            const comparison = this.compareValues(
                a.cells[column.index].textContent.trim(),
                b.cells[column.index].textContent.trim(),
                isNumeric
            );
            return store.sortState.direction === 'asc' ? comparison : -comparison;
        });

        this.reorderTableRows(rows);
    }

    compareValues(a, b, isNumeric) {
        if (isNumeric) {
            return (parseFloat(a.replace(/,/g, '')) || 0) - (parseFloat(b.replace(/,/g, '')) || 0);
        }
        return a.localeCompare(b, undefined, { numeric: true });
    }

    reorderTableRows(rows) {
        const fragment = document.createDocumentFragment();
        rows.forEach(row => fragment.appendChild(row));
        this.domManager.elements.tableBody.appendChild(fragment);
    }
}
