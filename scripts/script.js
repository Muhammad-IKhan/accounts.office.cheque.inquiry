class XMLTableHandler {
    constructor() {
        // Initialize DOM elements for table interaction
        this.tableBody = document.getElementById('checksTable');
        this.searchInput = document.getElementById('search');
        this.tableContainer = document.getElementById('tableContainer');
        this.emptyState = document.getElementById('emptyState');
        this.resultContainer = document.getElementById('result');
        
        // Define column configuration with data types and indices
        this.columns = {
            SNO: { index: 0, type: 'number' },    // Serial number
            NARRATION: { index: 1, type: 'string' }, // Transaction description
            AMOUNT: { index: 2, type: 'number' },  // Transaction amount
            CHEQ_NO: { index: 3, type: 'number' }, // Cheque number
            NAR: { index: 4, type: 'string' },    // Additional narration
            BNO: { index: 5, type: 'number' },    // Batch number
            PVN: { index: 6, type: 'number' },    // Payment voucher number
            DD: { index: 7, type: 'string' }      // Date
        };

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Handle Enter key press for search
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchAndFilterXML();
            }
        });

        // Set up column sorting functionality
        Object.keys(this.columns).forEach(columnName => {
            const header = document.querySelector(`th[data-column="${columnName}"]`);
            if (header) {
                header.addEventListener('click', () => this.sortTable(columnName));
            }
        });
    }

    /**
     * Parses XML data and populates the table
     * @param {string} xmlString - XML data to parse (optional)
     * @returns {boolean} Success status of parsing operation
     */
    parseXMLToTable(xmlString = null) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString || this.xmlData, "text/xml");
            
            // Validate XML parsing
            if (xmlDoc.querySelector('parsererror')) {
                throw new Error('XML parsing error: ' + xmlDoc.querySelector('parsererror').textContent);
            }

            const gPvnElements = xmlDoc.getElementsByTagName('G_PVN');
            this.tableBody.innerHTML = '';

            // Create table rows from XML elements
            Array.from(gPvnElements).forEach((element) => {
                this.tableBody.appendChild(this.createTableRow(element));
            });

            return true;
        } catch (error) {
            console.error('Error in parseXMLToTable:', error);
            this.showError('Failed to parse XML data');
            return false;
        }
    }

    /**
     * Creates a table row from XML element data
     * @param {Element} element - XML element containing row data
     * @returns {HTMLTableRowElement} Created table row
     */
    createTableRow(element) {
        const row = document.createElement('tr');
        
        Object.keys(this.columns).forEach(field => {
            const cell = document.createElement('td');
            let value = element.getElementsByTagName(field)[0]?.textContent.trim() || '';
            
            // Format amount values with proper number formatting
            if (field === 'AMOUNT') {
                value = this.formatAmount(value);
            }
            
            cell.textContent = value;
            cell.setAttribute('data-field', field);
            row.appendChild(cell);
        });

        return row;
    }

    /**
     * Formats amount values with proper number formatting
     * @param {string} value - Amount value to format
     * @returns {string} Formatted amount
     */
    formatAmount(value) {
        try {
            return parseFloat(value).toLocaleString('en-US');
        } catch {
            console.warn(`Invalid amount value: ${value}`);
            return '0';
        }
    }

    /**
     * Fetches and combines XML data from multiple files
     * @returns {Promise<boolean>} Success status of fetch operation
     */
    async fetchXMLData() {
        try {
            const filesResponse = await fetch('/accounts.office.cheque.inquiry/public/data/files.json');
            if (!filesResponse.ok) throw new Error(`HTTP error! Status: ${filesResponse.status}`);

            const xmlFiles = await filesResponse.json();
            let combinedXMLData = '<root>';

            // Fetch and combine all XML files
            for (const file of xmlFiles) {
                const fileResponse = await fetch(`/accounts.office.cheque.inquiry/public/data/${file}`);
                if (!fileResponse.ok) throw new Error(`Failed to fetch ${file}`);
                combinedXMLData += await fileResponse.text();
            }

            combinedXMLData += '</root>';
            
            // Cache the combined XML data
            localStorage.setItem('xmlData', combinedXMLData);
            this.xmlData = combinedXMLData;
            
            return this.parseXMLToTable(combinedXMLData);
        } catch (error) {
            console.error('Error fetching XML:', error);
            // Attempt to use cached data if available
            const storedXML = localStorage.getItem('xmlData');
            return storedXML ? this.parseXMLToTable(storedXML) : false;
        }
    }

    /**
     * Handles search functionality across table data
     */
    searchAndFilterXML() {
        const searchTerm = this.searchInput.value.toLowerCase();
        
        if (!searchTerm) {
            this.resetTable();
            return;
        }

        this.tableContainer.style.display = 'block';
        this.emptyState.style.display = 'none';
        this.resultContainer.style.display = 'block';

        let matchCount = 0;
        const rows = this.tableBody.querySelectorAll('tr');

        rows.forEach(row => {
            const matchesSearch = Array.from(row.getElementsByTagName('td'))
                .some(cell => cell.textContent.toLowerCase().includes(searchTerm));
            row.style.display = matchesSearch ? '' : 'none';
            if (matchesSearch) matchCount++;
        });

        this.updateSearchResults(searchTerm, matchCount);
    }

    /**
     * Updates search results display
     * @param {string} searchTerm - Current search term
     * @param {number} matchCount - Number of matches found
     */
    updateSearchResults(searchTerm, matchCount) {
        const icon = matchCount > 0 ? 'check' : 'times';
        this.resultContainer.innerHTML = 
            `<i class="fas fa-${icon}-circle"></i> ${matchCount > 0 ? 
            `Found ${matchCount} results for "${searchTerm}"` : 
            'No results found.'}`;
    }

    /**
     * Sorts table data by specified column
     * @param {string} columnName - Name of column to sort by
     */
    sortTable(columnName) {
        const column = this.columns[columnName];
        if (!column) return;

        const header = document.querySelector(`th[data-column="${columnName}"]`);
        if (!header) return;

        // Toggle sort direction
        const isAscending = !header.classList.contains('sort-asc');
        
        // Update sort indicators
        document.querySelectorAll('th').forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc');
        });
        header.classList.add(isAscending ? 'sort-asc' : 'sort-desc');

        // Sort rows
        const rows = Array.from(this.tableBody.querySelectorAll('tr'));
        const sortedRows = this.sortRows(rows, column, isAscending);
        
        // Update table with sorted rows
        sortedRows.forEach(row => this.tableBody.appendChild(row));
    }

    /**
     * Sorts array of table rows
     * @param {Array<HTMLTableRowElement>} rows - Array of table rows
     * @param {Object} column - Column configuration
     * @param {boolean} isAscending - Sort direction
     * @returns {Array<HTMLTableRowElement>} Sorted array of rows
     */
    sortRows(rows, column, isAscending) {
        return rows.sort((a, b) => {
            const aValue = a.cells[column.index].textContent.trim();
            const bValue = b.cells[column.index].textContent.trim();

            if (column.type === 'number') {
                const aNum = parseFloat(aValue.replace(/,/g, '')) || 0;
                const bNum = parseFloat(bValue.replace(/,/g, '')) || 0;
                return isAscending ? aNum - bNum : bNum - aNum;
            }

            return isAscending ?
                aValue.localeCompare(bValue, undefined, { numeric: true }) :
                bValue.localeCompare(aValue, undefined, { numeric: true });
        });
    }

    /**
     * Resets table to initial state
     */
    resetTable() {
        this.searchInput.value = '';
        this.tableContainer.style.display = 'none';
        this.emptyState.style.display = 'block';
        this.resultContainer.style.display = 'none';
    }

    /**
     * Displays error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        this.resultContainer.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        this.resultContainer.style.display = 'block';
    }
}

// Initialize handler and register service worker
document.addEventListener('DOMContentLoaded', () => {
    const handler = new XMLTableHandler();
    handler.fetchXMLData().then(() => handler.resetTable());
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/accounts.office.cheque.inquiry/service-worker.js', {
            scope: '/accounts.office.cheque.inquiry/'
        }).then(registration => {
            console.log('ServiceWorker registered:', registration.scope);
        }).catch(err => {
            console.error('ServiceWorker registration failed:', err);
        });
    });
}
