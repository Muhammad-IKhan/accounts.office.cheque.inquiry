/**
 * XMLTableHandler - jQuery implementation for handling XML data in a table
 * This class manages the XML data loading, searching, sorting, and display
 * for a cheque information system.
 */
class XMLTableHandler {
    constructor() {
        // Cache jQuery selections for better performance
        this.$tableBody = $('#checksTable');
        this.$searchInput = $('#search');
        this.$tableContainer = $('#tableContainer');
        this.$emptyState = $('#emptyState');
        this.$result = $('#result');
        this.$searchBtn = $('#searchBtn');
        this.$resetBtn = $('#resetBtn');

        // Column configuration with data types and indices
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

        // Initialize the event handlers
        this.initializeEventListeners();
    }

    /**
     * Sets up all event listeners for the table functionality
     */
    initializeEventListeners() {
        // Search input handler for Enter key
        this.$searchInput.on('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchAndFilterXML();
            }
        });

        // Live search handler with debounce
        let searchTimeout;
        this.$searchInput.on('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => this.searchAndFilterXML(), 300);
        });

        // Button click handlers
        this.$searchBtn.on('click', () => this.searchAndFilterXML());
        this.$resetBtn.on('click', () => this.resetTable());

        // Column sorting handlers
        $('th[data-column]').on('click', (e) => {
            const columnName = $(e.currentTarget).data('column');
            this.sortTable(columnName);
        });
    }

    /**
     * Fetches XML data from server or localStorage
     * @returns {Promise<boolean>} - Success status of the fetch operation
     */
    async fetchXMLData() {
        try {
            console.log('Initiating XML data fetch...');

            // First try to load from localStorage
            const storedXML = localStorage.getItem('xmlData');
            if (storedXML) {
                console.log('Found cached XML data, attempting to use it...');
                const parseResult = this.parseXMLToTable(storedXML);
                if (parseResult) {
                    console.log('Successfully used cached XML data');
                    return true;
                }
            }

            // If no cached data or parsing failed, fetch from server
            console.log('Fetching fresh XML data...');
            
            // Fetch single XML file for testing
            const fileUrl = '/accounts.office.cheque.inquiry/public/data/testMerging.xml';
            console.log(`Fetching: ${fileUrl}`);
            
            try {
                const response = await $.ajax({
                    url: fileUrl,
                    dataType: 'text', // Important: Get as text, not XML
                    method: 'GET'
                });

                // Wrap the response in a root element if not already present
                let xmlData = response.trim();
                if (!xmlData.startsWith('<?xml')) {
                    xmlData = '<?xml version="1.0" encoding="UTF-8"?>\n<root>' + xmlData + '</root>';
                }

                console.log('XML data fetched successfully');
                
                // Store in localStorage for future use
                localStorage.setItem('xmlData', xmlData);
                this.xmlData = xmlData;
                
                // Parse and display the data
                return this.parseXMLToTable(xmlData);
                
            } catch (fetchError) {
                console.error('Error fetching XML:', fetchError);
                throw fetchError;
            }

        } catch (error) {
            console.error('XML fetch error:', error);
            
            // Show error to user
            this.showError('Failed to load data. Please try refreshing the page.');
            return false;
        }
    }

    /**
     * Parses XML data and populates the table
     * @param {string} xmlString - The XML data to parse
     * @returns {boolean} - Success status of the parsing operation
     */
    parseXMLToTable(xmlString = null) {
        try {
            console.log('Starting XML parsing...');
            
            if (!xmlString) {
                throw new Error('No XML data provided');
            }

            // Parse the XML string into a document
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "text/xml");
            
            // Check for parsing errors
            const parserError = xmlDoc.querySelector('parsererror');
            if (parserError) {
                console.error('XML parsing error:', parserError.textContent);
                throw new Error('XML parsing failed');
            }

            // Get all cheque entries
            const gPvnElements = $(xmlDoc).find('G_PVN');
            console.log(`Found ${gPvnElements.length} cheque entries`);

            if (gPvnElements.length === 0) {
                console.warn('No G_PVN elements found in XML');
                this.showError('No data found in the XML file');
                return false;
            }

            // Clear and populate table
            this.$tableBody.empty();
            
            gPvnElements.each((_, element) => {
                const $row = this.createTableRow(element);
                this.$tableBody.append($row);
            });

            console.log('Table population complete');
            return true;
        } catch (error) {
            console.error('parseXMLToTable error:', error);
            this.showError('Failed to parse XML data: ' + error.message);
            return false;
        }
    }

    /**
     * Creates a table row from XML element data
     * @param {Element} element - The XML element containing row data
     * @returns {jQuery} - jQuery object containing the created row
     */
    createTableRow(element) {
        const $row = $('<tr>');
        
        // Create cells for each column
        Object.keys(this.columns).forEach(field => {
            const value = $(element).find(field).text().trim() || '';
            const $cell = $('<td>').attr('data-field', field);
            
            // Format amount values
            if (field === 'AMOUNT') {
                try {
                    $cell.text(parseFloat(value).toLocaleString('en-US'));
                } catch (error) {
                    console.warn(`Invalid amount: ${value}`);
                    $cell.text('0');
                }
            } else {
                $cell.text(value);
            }
            
            $row.append($cell);
        });

        return $row;
    }

    
    /**
     * Searches and filters table rows based on input
     */
    searchAndFilterXML() {
        const searchTerm = this.$searchInput.val().toLowerCase();
        
        if (!searchTerm) {
            this.resetTable();
            return;
        }

        this.$tableContainer.show();
        this.$emptyState.hide();
        this.$result.show();

        let matchCount = 0;
        
        // Filter rows
        this.$tableBody.find('tr').each((_, row) => {
            const $row = $(row);
            const matches = $row.text().toLowerCase().includes(searchTerm);
            
            $row.toggle(matches);
            if (matches) matchCount++;
        });

        this.updateSearchResults(searchTerm, matchCount);
    }

    /**
     * Updates the search results message
     * @param {string} searchTerm - The search term
     * @param {number} matchCount - Number of matches found
     */
    updateSearchResults(searchTerm, matchCount) {
        const alertClass = matchCount > 0 ? 'alert-success' : 'alert-warning';
        const icon = matchCount > 0 ? 'check-circle' : 'times-circle';
        const message = matchCount > 0 
            ? `Found ${matchCount} results for "${searchTerm}"`
            : 'No results found.';

        this.$result
            .removeClass('alert-success alert-warning')
            .addClass(alertClass)
            .html(`<i class="fas fa-${icon}"></i> ${message}`)
            .show();
    }

    /**
     * Sorts the table by column
     * @param {string} columnName - Name of the column to sort by
     */
    sortTable(columnName) {
        const column = this.columns[columnName];
        if (!column) return;

        const $header = $(`th[data-column="${columnName}"]`);
        const isAscending = !$header.hasClass('sort-asc');

        // Update sort indicators
        $('th').removeClass('sort-asc sort-desc');
        $header.addClass(isAscending ? 'sort-asc' : 'sort-desc');

        // Sort rows
        const rows = this.$tableBody.find('tr').get();
        rows.sort((a, b) => {
            const aValue = $(a).find(`td:eq(${column.index})`).text().trim();
            const bValue = $(b).find(`td:eq(${column.index})`).text().trim();

            if (column.type === 'number') {
                const aNum = parseFloat(aValue.replace(/,/g, '')) || 0;
                const bNum = parseFloat(bValue.replace(/,/g, '')) || 0;
                return isAscending ? aNum - bNum : bNum - aNum;
            }

            return isAscending
                ? aValue.localeCompare(bValue, undefined, { numeric: true })
                : bValue.localeCompare(aValue, undefined, { numeric: true });
        });

        this.$tableBody.append(rows);
    }

    /**
     * Resets the table to its initial state
     */
    resetTable() {
        this.$searchInput.val('');
        this.$tableContainer.hide();
        this.$emptyState.show();
        this.$result.hide();
    }

    /**
     * Shows error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        this.$result
            .removeClass('alert-success alert-warning')
            .addClass('alert-danger')
            .html(`<i class="fas fa-exclamation-circle"></i> ${message}`)
            .show();
    }
}

// Initialize the handler when the DOM is ready
$(document).ready(() => {
    const handler = new XMLTableHandler();
    handler.fetchXMLData().then(() => {
        handler.resetTable();
    });
});

// Service Worker registration
if ('serviceWorker' in navigator) {
    $(window).on('load', () => {
        const swPath = '/accounts.office.cheque.inquiry/service-worker.js';
        
        navigator.serviceWorker.register(swPath, {
            scope: '/accounts.office.cheque.inquiry/'
        })
        .then(registration => {
            console.log('ServiceWorker registration successful with scope:', registration.scope);
        })
        .catch(err => {
            console.error('ServiceWorker registration failed:', err);
        });
    });
}
