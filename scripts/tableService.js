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
            console.error('XML parsing error:', error);
            return false;
        }
    }

    populateTable(elements) {
        const { tableBody } = this.domManager.elements;
        tableBody.empty();

        Array.from(elements).forEach(element => {
            const row = this.createTableRow(element);
            tableBody.append(row);
        });
    }

    createTableRow(element) {
        const row = $('<tr>');

        Object.entries(TABLE_CONFIG.columns).forEach(([field, config]) => {
            const cell = $('<td>');
            let value = $(element).find(field).text().trim() || '';

            if (field === 'AMOUNT') {
                value = formatAmount(value);
            }

            cell.text(value).attr('data-field', field);
            row.append(cell);
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
        const { tableBody } = this.domManager.elements;
        const rows = tableBody.find('tr').toArray();
        const isNumeric = column.type === 'number';

        rows.sort((a, b) => {
            const aValue = $(a).find('td').eq(column.index).text().trim();
            const bValue = $(b).find('td').eq(column.index).text().trim();
            return this.compareValues(aValue, bValue, isNumeric);
        });

        tableBody.empty().append(rows);
    }

    compareValues(a, b, isNumeric) {
        if (isNumeric) {
            return (parseFloat(a.replace(/,/g, '')) || 0) - (parseFloat(b.replace(/,/g, '')) || 0);
        }
        return a.localeCompare(b, undefined, { numeric: true });
    }
}
