// XML Table Handler with improved error handling and logging
class XMLTableHandler {
    constructor() {
        this.config = {
            selectors: {
                tableBody: 'checksTable',
                table: 'chequeTable',
                search: 'search',
                tableContainer: 'tableContainer',
                emptyState: 'emptyState',
                result: 'result'
            },
            paths: {
                xml: '/accounts.office.cheque.inquiry/public/data/data.xml',
                serviceWorker: '/accounts.office.cheque.inquiry/service-worker.js'
            },
            fields: ['SNO', 'NARRATION', 'AMOUNT', 'CHEQ_NO', 'NAR', 'BNO', 'PVN', 'DD'],
            numericFields: ['AMOUNT', 'SNO', 'CHEQ_NO', 'PVN', 'BNO']
        };

        this.xmlData = null;
        this.init();
    }

    log(type, message, data = null) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${type}] ${message}`;
        
        switch(type) {
            case 'ERROR':
                console.error(logMessage, data);
                break;
            case 'WARN':
                console.warn(logMessage, data);
                break;
            default:
                console.log(logMessage, data);
        }
    }

    getElement(id) {
        const element = document.getElementById(id);
        if (!element) {
            throw new Error(`Element not found: ${id}`);
        }
        return element;
    }

    async init() {
        try {
            await this.setupEventListeners();
            await this.initializeServiceWorker();
            await this.parseXMLToTable();
            this.resetTable();
            this.log('INFO', 'Application initialized successfully');
        } catch (error) {
            this.log('ERROR', 'Initialization failed', error);
            this.showError('Failed to initialize application');
        }
    }

    async setupEventListeners() {
        try {
            // Search event listeners
            const searchInput = this.getElement(this.config.selectors.search);
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchAndFilterXML();
                }
            });

            // Add live search functionality
            searchInput.addEventListener('input', () => {
                this.searchAndFilterXML();
            });

            this.log('INFO', 'Event listeners setup complete');
        } catch (error) {
            this.log('ERROR', 'Failed to setup event listeners', error);
            throw error;
        }
    }

    async parseXMLToTable(data = null) {
        try {
            const parser = new DOMParser();
            const xmlString = data || this.xmlData || this.getDefaultXMLData();
            const xmlDoc = parser.parseFromString(xmlString, "text/xml");

            // Check for parsing errors
            const parserError = xmlDoc.querySelector('parsererror');
            if (parserError) {
                throw new Error(`XML parsing error: ${parserError.textContent}`);
            }

            const gPvnElements = xmlDoc.getElementsByTagName('G_PVN');
            this.log('INFO', `Found ${gPvnElements.length} G_PVN elements`);

            const tableBody = this.getElement(this.config.selectors.tableBody);
            
            Array.from(gPvnElements).forEach((element, index) => {
                const row = this.createTableRow(element);
                tableBody.appendChild(row);
            });

            this.log('INFO', 'Table population complete');
            return true;
        } catch (error) {
            this.log('ERROR', 'Failed to parse XML to table', error);
            this.showError('Failed to load data');
            return false;
        }
    }

    createTableRow(element) {
        const row = document.createElement('tr');
        
        this.config.fields.forEach(field => {
            const cell = document.createElement('td');
            let value = element.getElementsByTagName(field)[0]?.textContent.trim() || '';
            
            if (field === 'AMOUNT' && value) {
                try {
                    value = parseFloat(value).toLocaleString('en-US');
                } catch (error) {
                    this.log('WARN', `Invalid amount value: ${value}`);
                    value = '0';
                }
            }
            
            cell.textContent = value;
            row.appendChild(cell);
        });

        return row;
    }

    async fetchXMLData() {
        try {
            this.log('INFO', 'Fetching XML data');
            const response = await fetch(this.config.paths.xml);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.text();
            localStorage.setItem('xmlData', data);
            this.xmlData = data;
            
            this.log('INFO', 'XML data fetched and stored successfully');
            return this.parseXMLToTable(data);
        } catch (error) {
            this.log('ERROR', 'Failed to fetch XML data', error);
            
            const storedXML = localStorage.getItem('xmlData');
            if (storedXML) {
                this.log('INFO', 'Loading XML from localStorage');
                return this.parseXMLToTable(storedXML);
            }
            
            this.showError('Failed to load data');
            return false;
        }
    }

    resetTable() {
        try {
            this.getElement(this.config.selectors.search).value = '';
            this.getElement(this.config.selectors.tableContainer).style.display = 'none';
            this.getElement(this.config.selectors.emptyState).style.display = 'block';
            this.getElement(this.config.selectors.result).style.display = 'none';
            this.log('INFO', 'Table reset complete');
        } catch (error) {
            this.log('ERROR', 'Failed to reset table', error);
        }
    }

    searchAndFilterXML() {
        try {
            const searchTerm = this.getElement(this.config.selectors.search).value.toLowerCase();
            
            if (!searchTerm) {
                this.resetTable();
                return;
            }

            const tableContainer = this.getElement(this.config.selectors.tableContainer);
            const emptyState = this.getElement(this.config.selectors.emptyState);
            const resultContainer = this.getElement(this.config.selectors.result);

            tableContainer.style.display = 'block';
            emptyState.style.display = 'none';
            resultContainer.style.display = 'block';

            const rows = document.querySelectorAll(`#${this.config.selectors.tableBody} tr`);
            let matchCount = 0;

            rows.forEach(row => {
                const cells = row.getElementsByTagName('td');
                const matchesSearch = Array.from(cells).some(cell => 
                    cell.textContent.toLowerCase().includes(searchTerm)
                );

                row.style.display = matchesSearch ? '' : 'none';
                if (matchesSearch) matchCount++;
            });

            resultContainer.innerHTML = matchCount > 0
                ? `<i class="fas fa-check-circle"></i> Found ${matchCount} results for "${searchTerm}"`
                : '<i class="fas fa-times-circle"></i> No results found.';

            this.log('INFO', `Search complete: ${matchCount} results found for "${searchTerm}"`);
        } catch (error) {
            this.log('ERROR', 'Search operation failed', error);
            this.showError('Search failed');
        }
    }

    sortTable(columnName) {
        try {
            const table = this.getElement(this.config.selectors.table);
            const tbody = table.querySelector('tbody');
            const columnIndex = this.config.fields.indexOf(columnName);

            if (columnIndex === -1) {
                throw new Error(`Invalid column name: ${columnName}`);
            }

            const currentHeader = table.querySelector(`th:nth-child(${columnIndex + 1})`);
            const isAscending = !currentHeader.classList.contains('sort-asc');

            // Reset sort indicators
            table.querySelectorAll('th').forEach(th => {
                th.classList.remove('sort-asc', 'sort-desc');
            });
            currentHeader.classList.add(isAscending ? 'sort-asc' : 'sort-desc');

            const rows = Array.from(tbody.querySelectorAll('tr'));
            this.sortRows(rows, columnIndex, columnName, isAscending);
            
            rows.forEach(row => tbody.appendChild(row));
            this.log('INFO', `Table sorted by ${columnName} ${isAscending ? 'ascending' : 'descending'}`);
        } catch (error) {
            this.log('ERROR', 'Sort operation failed', error);
            this.showError('Failed to sort table');
        }
    }

    sortRows(rows, columnIndex, columnName, isAscending) {
        rows.sort((a, b) => {
            const aValue = a.getElementsByTagName('td')[columnIndex].textContent.trim();
            const bValue = b.getElementsByTagName('td')[columnIndex].textContent.trim();

            if (this.config.numericFields.includes(columnName)) {
                const aNum = parseFloat(aValue.replace(/,/g, '')) || 0;
                const bNum = parseFloat(bValue.replace(/,/g, '')) || 0;
                return isAscending ? aNum - bNum : bNum - aNum;
            }

            return isAscending
                ? aValue.localeCompare(bValue, undefined, { numeric: true })
                : bValue.localeCompare(aValue, undefined, { numeric: true });
        });
    }

    showError(message) {
        try {
            const resultContainer = this.getElement(this.config.selectors.result);
            resultContainer.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
            resultContainer.style.display = 'block';
            this.log('ERROR', message);
        } catch (error) {
            this.log('ERROR', 'Failed to show error message', error);
        }
    }

    async initializeServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register(
                    this.config.paths.serviceWorker,
                    { scope: '/accounts.office.cheque.inquiry/' }
                );
                this.log('INFO', 'ServiceWorker registered successfully', registration.scope);
            } catch (error) {
                this.log('ERROR', 'ServiceWorker registration failed', error);
            }
        }
    }

    getDefaultXMLData() {
        return `
            <G_PVN>
                <BNO>1</BNO>
                <HEAD>2207</HEAD>
                <PVN>1</PVN>
                <NARRATION>RAHAM DARAZ DRIVER BISE BANNU</NARRATION>
                <AMOUNT>28680</AMOUNT>
                <ENT_DAT>01-FEB-25</ENT_DAT>
                <CHEQ_NO>4498646</CHEQ_NO>
                <CHEQ_DATE>03-FEB-25</CHEQ_DATE>
                <SNO>1</SNO>
                <DD></DD>
                <NAR>TA/DA GENERAL</NAR>
            </G_PVN>
        `;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.xmlTableHandler = new XMLTableHandler();
    } catch (error) {
        console.error('Failed to initialize application:', error);
    }
});
