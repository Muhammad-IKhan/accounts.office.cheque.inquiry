// Configuration and State Management
const CONFIG = {
    ROWS_PER_PAGE: {
        MOBILE: 5,
        DESKTOP: 7
    },
    LOCAL_STORAGE_KEY: 'xmlData',
    XML_FILES_PATH: '/accounts.office.cheque.inquiry/public/data/files.json'
};

const TableState = {
    sort: {
        currentColumn: null,
        direction: 'asc'
    },
    pagination: {
        currentPage: 1,
        rowsPerPage: CONFIG.ROWS_PER_PAGE.MOBILE,
        totalPages: 1
    }
};

// Column definitions with validation rules
const COLUMNS = {
    SNO: { 
        index: 0, 
        type: 'number',
        validate: value => !isNaN(value)
    },
    NARRATION: { 
        index: 1, 
        type: 'string',
        validate: value => typeof value === 'string'
    },
    AMOUNT: { 
        index: 2, 
        type: 'number',
        validate: value => !isNaN(parseFloat(value)),
        format: value => parseFloat(value).toLocaleString('en-US')
    },
    CHEQ_NO: { 
        index: 3, 
        type: 'number',
        validate: value => !isNaN(value)
    },
    NAR: { 
        index: 4, 
        type: 'string',
        validate: value => typeof value === 'string'
    },
    BNO: { 
        index: 5, 
        type: 'number',
        validate: value => !isNaN(value)
    },
    PVN: { 
        index: 6, 
        type: 'number',
        validate: value => !isNaN(value)
    },
    DD: { 
        index: 7, 
        type: 'string',
        validate: value => typeof value === 'string',
        format: value => value.replace(/&#10;/g, '<br>')
    }
};

class TableManager {
    constructor() {
        this.elements = {};
        this.xmlData = null;
    }

    async initialize() {
        try {
            this.initializeDOMElements();
            this.setupEventListeners();
            await this.loadXMLData();
            this.resetTable();
            return true;
        } catch (error) {
            console.error('Initialization failed:', error);
            this.showError('Failed to initialize the application');
            return false;
        }
    }

    initializeDOMElements() {
        this.elements = {
            tableBody: document.getElementById('checksTable'),
            searchInput: document.getElementById('search'),
            tableContainer: document.getElementById('tableContainer'),
            emptyState: document.getElementById('emptyState'),
            resultContainer: document.getElementById('result'),
            paginationControls: document.querySelector('.pagination-controls')
        };

        if (!Object.values(this.elements).every(element => element)) {
            throw new Error('Required DOM elements not found');
        }
    }

    setupEventListeners() {
        // Search functionality
        this.elements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchAndFilterXML();
            }
        });

        // Column sorting
        Object.keys(COLUMNS).forEach(columnName => {
            const header = document.querySelector(`th[data-column="${columnName}"]`);
            if (header) {
                header.addEventListener('click', () => this.sortTable(columnName));
            }
        });
    }

    async loadXMLData() {
        try {
            const filesResponse = await fetch(CONFIG.XML_FILES_PATH);
            if (!filesResponse.ok) throw new Error('Failed to fetch files list');
            
            const xmlFiles = await filesResponse.json();
            let combinedXMLData = '<root>';
            
            for (const file of xmlFiles) {
                const fileResponse = await fetch(`/accounts.office.cheque.inquiry/public/data/${file}`);
                if (!fileResponse.ok) throw new Error(`Failed to fetch file: ${file}`);
                combinedXMLData += await fileResponse.text();
            }
            
            combinedXMLData += '</root>';
            localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY, combinedXMLData);
            this.xmlData = combinedXMLData;
            
            return this.parseXMLToTable();
        } catch (error) {
            console.error('XML data loading failed:', error);
            const storedXML = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY);
            if (storedXML) {
                this.xmlData = storedXML;
                return this.parseXMLToTable();
            }
            throw error;
        }
    }

    parseXMLToTable() {
        if (!this.xmlData) throw new Error('No XML data available');

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(this.xmlData.replace(/&#10;/g, '<br />'), "text/xml");
        
        if (xmlDoc.querySelector('parsererror')) {
            throw new Error('XML parsing failed');
        }

        const elements = xmlDoc.getElementsByTagName('G_PVN');
        this.elements.tableBody.innerHTML = '';
        
        Array.from(elements).forEach(element => {
            this.elements.tableBody.appendChild(this.createTableRow(element));
        });

        return true;
    }

    createTableRow(element) {
        const row = document.createElement('tr');
        
        Object.entries(COLUMNS).forEach(([field, config]) => {
            const cell = document.createElement('td');
            let value = element.getElementsByTagName(field)[0]?.textContent.trim() || '-';

            if (config.validate(value)) {
                value = config.format ? config.format(value) : value;
            } else {
                value = '-';
            }

            if (config.type === 'string' && field === 'DD') {
                cell.innerHTML = value;
            } else {
                cell.textContent = value;
            }

            cell.setAttribute('data-field', field);
            row.appendChild(cell);
        });

        return row;
    }

    searchAndFilterXML() {
        const searchTerm = this.elements.searchInput.value.toLowerCase();
        
        if (!searchTerm) {
            this.resetTable();
            return;
        }

        this.elements.tableContainer.style.display = 'block';
        this.elements.emptyState.style.display = 'none';
        this.elements.resultContainer.style.display = 'block';

        const rows = this.elements.tableBody.querySelectorAll('tr');
        let matchCount = 0;

        rows.forEach(row => {
            const matches = Array.from(row.cells).some(cell => {
                const cellText = cell.textContent.toLowerCase();
                return cellText.includes(searchTerm);
            });

            row.style.display = matches ? '' : 'none';
            if (matches) matchCount++;
        });

        this.updateSearchResults(searchTerm, matchCount);
        matchCount > 0 ? this.initializePagination() : this.hidePagination();
    }

    sortTable(columnName) {
        const column = COLUMNS[columnName];
        if (!column) {
            console.error(`Invalid column name: ${columnName}`);
            return;
        }

        try {
            // Update sort state
            if (TableState.sort.currentColumn === columnName) {
                TableState.sort.direction = TableState.sort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                TableState.sort.currentColumn = columnName;
                TableState.sort.direction = 'asc';
            }

            this.updateSortIndicators(columnName);

            const rows = Array.from(this.elements.tableBody.querySelectorAll('tr'));
            const isNumeric = column.type === 'number';

            rows.sort((a, b) => {
                const aValue = this.getCellValue(a.cells[column.index], isNumeric);
                const bValue = this.getCellValue(b.cells[column.index], isNumeric);
                
                const comparison = this.compareValues(aValue, bValue, isNumeric);
                return TableState.sort.direction === 'asc' ? comparison : -comparison;
            });

            // Reappend sorted rows
            rows.forEach(row => this.elements.tableBody.appendChild(row));
            this.updatePagination();
        } catch (error) {
            console.error('Sorting failed:', error);
            this.showError('Failed to sort table');
        }
    }

    getCellValue(cell, isNumeric) {
        const value = cell.textContent.trim();
        if (isNumeric) {
            return parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
        }
        return value;
    }

    compareValues(a, b, isNumeric) {
        if (isNumeric) {
            return a - b;
        }
        return a.localeCompare(b, undefined, { numeric: true });
    }

    updateSortIndicators(activeColumn) {
        try {
            // Remove existing indicators
            document.querySelectorAll('th[data-column] .sort-indicator').forEach(indicator => {
                indicator.remove();
            });

            // Add indicator to active column
            const activeHeader = document.querySelector(`th[data-column="${activeColumn}"]`);
            if (activeHeader) {
                const indicator = document.createElement('span');
                indicator.className = 'sort-indicator';
                indicator.innerHTML = TableState.sort.direction === 'asc' ? ' ↑' : ' ↓';
                activeHeader.appendChild(indicator);
            }
        } catch (error) {
            console.error('Failed to update sort indicators:', error);
        }
    }

    initializePagination(itemsPerPage = CONFIG.ROWS_PER_PAGE.MOBILE) {
        try {
            TableState.pagination.rowsPerPage = itemsPerPage;
            
            if (!this.elements.paginationControls) {
                this.createPaginationControls();
            }

            this.showPagination();
            this.updatePagination();
        } catch (error) {
            console.error('Pagination initialization failed:', error);
            this.showError('Failed to initialize pagination');
        }
    }

    createPaginationControls() {
        try {
            const controls = document.createElement('div');
            controls.className = 'pagination-controls';
            controls.innerHTML = `
                <button id="prevPage" class="pagination-btn">&lt; Previous</button>
                <span id="pageInfo" class="page-info"></span>
                <button id="nextPage" class="pagination-btn">Next &gt;</button>
                <select id="rowsPerPageSelect" class="rows-per-page">
                    <option value="${CONFIG.ROWS_PER_PAGE.MOBILE}">Mobile view</option>
                    <option value="${CONFIG.ROWS_PER_PAGE.DESKTOP}">Desktop view</option>
                </select>
            `;

            this.elements.tableBody.parentNode.before(controls);
            this.elements.paginationControls = controls;
            this.setupPaginationEventListeners();
        } catch (error) {
            console.error('Failed to create pagination controls:', error);
            throw error;
        }
    }

    setupPaginationEventListeners() {
        try {
            const controls = this.elements.paginationControls;
            
            controls.querySelector('#prevPage').addEventListener('click', () => {
                if (TableState.pagination.currentPage > 1) {
                    TableState.pagination.currentPage--;
                    this.updatePagination();
                }
            });

            controls.querySelector('#nextPage').addEventListener('click', () => {
                if (TableState.pagination.currentPage < TableState.pagination.totalPages) {
                    TableState.pagination.currentPage++;
                    this.updatePagination();
                }
            });

            controls.querySelector('#rowsPerPageSelect').addEventListener('change', (e) => {
                TableState.pagination.rowsPerPage = parseInt(e.target.value);
                TableState.pagination.currentPage = 1;
                this.updatePagination();
            });
        } catch (error) {
            console.error('Failed to setup pagination listeners:', error);
            throw error;
        }
    }

    updatePagination() {
        try {
            const visibleRows = Array.from(this.elements.tableBody.querySelectorAll('tr'))
                .filter(row => row.style.display !== 'none');
            
            const totalRows = visibleRows.length;
            const { currentPage, rowsPerPage } = TableState.pagination;

            // Update total pages
            TableState.pagination.totalPages = Math.ceil(totalRows / rowsPerPage);

            // Validate current page
            if (currentPage > TableState.pagination.totalPages) {
                TableState.pagination.currentPage = TableState.pagination.totalPages;
            }

            // Calculate indices
            const startIndex = (currentPage - 1) * rowsPerPage;
            const endIndex = Math.min(startIndex + rowsPerPage, totalRows);

            // Update row visibility
            visibleRows.forEach((row, index) => {
                row.style.display = (index >= startIndex && index < endIndex) ? '' : 'none';
            });

            this.updatePaginationInfo(totalRows, startIndex, endIndex);
            this.updatePaginationControls();
        } catch (error) {
            console.error('Pagination update failed:', error);
            this.showError('Failed to update pagination');
        }
    }

    updatePaginationInfo(totalRows, startIndex, endIndex) {
        try {
            const pageInfo = this.elements.paginationControls.querySelector('#pageInfo');
            if (pageInfo) {
                pageInfo.textContent = `Showing ${startIndex + 1}-${endIndex} of ${totalRows} entries | Page ${TableState.pagination.currentPage} of ${TableState.pagination.totalPages}`;
            }
        } catch (error) {
            console.error('Failed to update pagination info:', error);
        }
    }

    updatePaginationControls() {
        try {
            const { currentPage, totalPages } = TableState.pagination;
            const prevButton = this.elements.paginationControls.querySelector('#prevPage');
            const nextButton = this.elements.paginationControls.querySelector('#nextPage');

            if (prevButton && nextButton) {
                prevButton.disabled = currentPage === 1;
                nextButton.disabled = currentPage === totalPages;
            }
        } catch (error) {
            console.error('Failed to update pagination controls:', error);
        }
    }

    showPagination() {
        if (this.elements.paginationControls) {
            this.elements.paginationControls.style.display = 'block';
        }
    }

    hidePagination() {
        if (this.elements.paginationControls) {
            this.elements.paginationControls.style.display = 'none';
        }
    }

    resetPagination() {
        TableState.pagination.currentPage = 1;
        this.updatePagination();
    }

    resetTable() {
        try {
            this.elements.searchInput.value = '';
            this.elements.tableContainer.style.display = 'none';
            this.elements.emptyState.style.display = 'block';
            this.elements.resultContainer.style.display = 'none';
            this.hidePagination();
        } catch (error) {
            console.error('Failed to reset table:', error);
        }
    }

    updateSearchResults(searchTerm, matchCount) {
        try {
            this.elements.resultContainer.innerHTML = matchCount > 0
                ? `<i class="fas fa-check-circle"></i> Found ${matchCount} results for "${searchTerm}"`
                : '<i class="fas fa-times-circle"></i> No results found.';
        } catch (error) {
            console.error('Failed to update search results:', error);
        }
    }

    showError(message) {
        try {
            this.elements.resultContainer.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
            this.elements.resultContainer.style.display = 'block';
        } catch (error) {
            console.error('Failed to show error message:', error);
        }
    }
}
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    const tableManager = new TableManager();
    tableManager.initialize().catch(error => {
        console.error('Application initialization failed:', error);
    });
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/accounts.office.cheque.inquiry/service-worker.js', {
            scope: '/accounts.office.cheque.inquiry/'
        }).catch(error => {
            console.error('Service Worker registration failed:', error);
        });
    });
}
