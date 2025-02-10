class XMLTableHandler {
    constructor() {
        // Core DOM elements
        this.tableBody = document.getElementById('checksTable');
        this.searchInput = document.getElementById('search');
        this.tableContainer = document.getElementById('tableContainer');
        this.emptyState = document.getElementById('emptyState');
        this.resultContainer = document.getElementById('result');
        this.debug = true; // Enable debugging

        // Column configuration
        this.columns = {
            SNO: { index: 0, type: 'number' },
            NARRATION: { index: 1, type: 'string' },
            AMOUNT: { index: 2, type: 'number' },
            CHEQ_NO: { index: 3, type: 'number' },
            NAR: { index: 4, type: 'string' },
            BNO: { index: 5, type: 'number' },
            PVN: { index: 6, type: 'number' },
            DD: { index: 7, type: 'string' }
        };

        this.currentSortColumn = null;
        this.currentSortDirection = 'asc';
        this.bindEvents();
        this.log('XMLTableHandler initialized 555');
    }

    log(message, data = null) {
        if (this.debug) {
            console.log(`[XMLTableHandler] ${message}`, data || '');
        }
    }

    bindEvents() {
        // Search events
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.log('Search triggered by Enter key');
                this.searchAndFilterXML();
            }

            // In constructor or bindEvents method
Object.keys(this.columns).forEach(columnName => {
    const header = document.querySelector(`th[data-column="${columnName}"]`);
    if (header) {
        header.addEventListener('click', () => {
            this.handleSort(columnName);
        });
    }
});
        });

        // Column sorting
        Object.keys(this.columns).forEach(columnName => {
            const header = document.querySelector(`th[data-column="${columnName}"]`);
            if (header) {
                header.addEventListener('click', () => {
                    this.log(`Sorting by column: ${columnName}`);
                    this.handleSort(columnName);
                });
            }
        });
    }

    handleSort(columnName) {
        try {
            const column = this.columns[columnName];
            if (!column) throw new Error(`Invalid column: ${columnName}`);

            // Toggle sort direction if same column
            if (this.currentSortColumn === columnName) {
                this.currentSortDirection = this.currentSortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                this.currentSortColumn = columnName;
                this.currentSortDirection = 'asc';
            }

            this.log(`Sorting ${columnName} ${this.currentSortDirection}`);
            this.sortTable();
            this.updateSortIndicators(columnName);
        } catch (error) {
            this.log('Sort error:', error);
            this.showError(`Sorting failed: ${error.message}`);
        }
    }

    updateSortIndicators(columnName) {
        document.querySelectorAll('th').forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc');
            const arrow = th.querySelector('.sort-arrow');
            if (arrow) arrow.remove();
        });

        const header = document.querySelector(`th[data-column="${columnName}"]`);
        if (header) {
            const className = `sort-${this.currentSortDirection}`;
            header.classList.add(className);
            
            const arrow = document.createElement('span');
            arrow.className = 'sort-arrow';
            arrow.textContent = this.currentSortDirection === 'asc' ? ' ↑' : ' ↓';
            header.appendChild(arrow);
        }
    }

    sortTable() {
        if (!this.currentSortColumn) return;

        const rows = Array.from(this.tableBody.getElementsByTagName('tr'));
        const column = this.columns[this.currentSortColumn];

        const sortedRows = rows.sort((a, b) => {
            let aVal = this.getCellValue(a, column.index);
            let bVal = this.getCellValue(b, column.index);

            if (column.type === 'number') {
                aVal = this.parseNumericValue(aVal);
                bVal = this.parseNumericValue(bVal);
            }

            const sortFactor = this.currentSortDirection === 'asc' ? 1 : -1;
            
            if (column.type === 'number') {
                return (aVal - bVal) * sortFactor;
            } else {
                return aVal.localeCompare(bVal) * sortFactor;
            }
        });

        // Clear and repopulate table
        while (this.tableBody.firstChild) {
            this.tableBody.removeChild(this.tableBody.firstChild);
        }
        sortedRows.forEach(row => this.tableBody.appendChild(row));
    }

    getCellValue(row, index) {
        return row.cells[index]?.textContent.trim() || '';
    }

    parseNumericValue(value) {
        return parseFloat(value.replace(/,/g, '')) || 0;
    }

    async fetchXMLData() {
        try {
            this.log('Fetching XML data...');
            const response = await fetch('/accounts.office.cheque.inquiry/public/data/files.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const files = await response.json();
            this.log('Files to process:', files);

            let combinedXML = '<root>';
            for (const file of files) {
                const fileData = await this.fetchSingleFile(file);
                combinedXML += fileData;
            }
            combinedXML += '</root>';

            localStorage.setItem('xmlData', combinedXML);
            this.xmlData = combinedXML;
            
            return this.parseXMLToTable(combinedXML);
        } catch (error) {
            this.log('Fetch error:', error);
            this.handleFetchError();
            return false;
        }
    }

    async fetchSingleFile(filename) {
        const response = await fetch(`/accounts.office.cheque.inquiry/public/data/${filename}`);
        if (!response.ok) throw new Error(`Failed to fetch ${filename}`);
        return await response.text();
    }

    handleFetchError() {
        const cachedData = localStorage.getItem('xmlData');
        if (cachedData) {
            this.log('Using cached XML data');
            return this.parseXMLToTable(cachedData);
        }
        this.showError('Failed to load data');
        return false;
    }

    parseXMLToTable(xmlString) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "text/xml");
            
            if (xmlDoc.querySelector('parsererror')) {
                throw new Error('XML parsing failed');
            }

            const elements = xmlDoc.getElementsByTagName('G_PVN');
            this.log(`Found ${elements.length} records`);

            this.tableBody.innerHTML = '';
            Array.from(elements).forEach(element => {
                this.tableBody.appendChild(this.createTableRow(element));
            });

            return true;
        } catch (error) {
            this.log('Parse error:', error);
            this.showError('Failed to parse XML');
            return false;
        }
    }

    createTableRow(element) {
        const row = document.createElement('tr');
        
        Object.keys(this.columns).forEach(field => {
            const cell = document.createElement('td');
            let value = element.getElementsByTagName(field)[0]?.textContent.trim() || '';
            
            if (field === 'AMOUNT') {
                value = this.formatAmount(value);
            }
            
            cell.textContent = value;
            cell.setAttribute('data-field', field);
            row.appendChild(cell);
        });

        return row;
    }

    formatAmount(value) {
        try {
            return parseFloat(value).toLocaleString('en-US');
        } catch {
            return '0';
        }
    }

    searchAndFilterXML() {
        const searchTerm = this.searchInput.value.toLowerCase();
        this.log('Searching for:', searchTerm);

        if (!searchTerm) {
            this.resetTable();
            return;
        }

        let matchCount = 0;
        const rows = this.tableBody.getElementsByTagName('tr');

        Array.from(rows).forEach(row => {
            const text = Array.from(row.cells)
                .map(cell => cell.textContent.toLowerCase())
                .join(' ');
            
            const matches = text.includes(searchTerm);
            row.style.display = matches ? '' : 'none';
            if (matches) matchCount++;
        });

        this.updateSearchResults(searchTerm, matchCount);
        this.updateDisplayState(true);
    }

    updateSearchResults(term, count) {
        const message = count > 0 
            ? `Found ${count} results for "${term}"`
            : 'No results found';
            
        this.resultContainer.innerHTML = `
            <i class="fas fa-${count > 0 ? 'check' : 'times'}-circle"></i> ${message}
        `;
    }

    updateDisplayState(searching) {
        this.tableContainer.style.display = searching ? 'block' : 'none';
        this.emptyState.style.display = searching ? 'none' : 'block';
        this.resultContainer.style.display = searching ? 'block' : 'none';
    }

    resetTable() {
        this.searchInput.value = '';
        this.updateDisplayState(false);
    }

    showError(message) {
        this.resultContainer.innerHTML = `
            <i class="fas fa-exclamation-circle"></i> ${message}
        `;
        this.resultContainer.style.display = 'block';
    }
}

// Initialize handler
document.addEventListener('DOMContentLoaded', () => {
    const handler = new XMLTableHandler();
    handler.fetchXMLData().then(() => handler.resetTable());
});

// Service Worker registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/accounts.office.cheque.inquiry/service-worker.js', {
            scope: '/accounts.office.cheque.inquiry/'
        }).then(reg => {
            console.log('ServiceWorker registered:', reg.scope);
        }).catch(err => {
            console.error('ServiceWorker failed:', err);
        });
    });
}
