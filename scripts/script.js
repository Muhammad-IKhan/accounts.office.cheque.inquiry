// This class handles everything related to the XML table, including parsing XML, rendering the table, searching, and sorting.
class XMLTableHandler {
    constructor() {
        // Initialize references to important DOM elements.
        // These elements are used to interact with the table, search input, and display messages.
        this.tableBody = document.getElementById('checksTable'); // The table body where rows will be added.
        this.searchInput = document.getElementById('search'); // The input field for searching.
        this.tableContainer = document.getElementById('tableContainer'); // The container for the table.
        this.emptyState = document.getElementById('emptyState'); // A message shown when no data is displayed.
        this.resultContainer = document.getElementById('result'); // A message shown for search results.

        // Define the columns in the table and their properties.
        // Each column has an index (its position in the table) and a type (number or string).
        this.columns = {
            SNO: { index: 0, type: 'number' }, // Serial Number (numeric).
            NARRATION: { index: 1, type: 'string' }, // Description (text).
            AMOUNT: { index: 2, type: 'number' }, // Amount (numeric).
            CHEQ_NO: { index: 3, type: 'number' }, // Cheque Number (numeric).
            NAR: { index: 4, type: 'string' }, // Narration (text).
            BNO: { index: 5, type: 'number' }, // Batch Number (numeric).
            PVN: { index: 6, type: 'number' }, // Payment Voucher Number (numeric).
            DD: { index: 7, type: 'string' } // Demand Draft (text).
        };

        // Set up event listeners for search and sorting.
        this.initializeEventListeners();
    }

    // This method sets up event listeners for the search input and column headers.
    initializeEventListeners() {
        // Listen for the "Enter" key in the search input to trigger the search.
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchAndFilterXML();
            }
        });

        // Add click listeners to each column header for sorting.
        Object.keys(this.columns).forEach(columnName => {
            const header = document.querySelector(`th[data-column="${columnName}"]`);
            if (header) {
                header.addEventListener('click', () => this.sortTable(columnName));
            }
        });
    }

    // This method parses the XML data and populates the table with rows.
    parseXMLToTable(xmlString = null) {
        try {
            // Use the DOMParser to convert the XML string into a document object.
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString || this.xmlData, "text/xml");

            // Check for errors in the XML parsing process.
            const parserError = xmlDoc.querySelector('parsererror');
            if (parserError) {
                throw new Error('XML parsing error: ' + parserError.textContent);
            }

            // Get all <G_PVN> elements from the XML document.
            const gPvnElements = xmlDoc.getElementsByTagName('G_PVN');

            // Clear the existing table content.
            this.tableBody.innerHTML = '';

            // Loop through each <G_PVN> element and create a table row for it.
            Array.from(gPvnElements).forEach((element) => {
                const row = this.createTableRow(element);
                this.tableBody.appendChild(row);
            });

            console.log('Table populated successfully.');
            return true;
        } catch (error) {
            console.error('Error in parseXMLToTable:', error);
            this.showError('Failed to parse XML data.');
            return false;
        }
    }

    // This method creates a table row from an XML element.
    createTableRow(element) {
        const row = document.createElement('tr'); // Create a new table row.

        // Loop through each column and create a table cell for it.
        Object.keys(this.columns).forEach(field => {
            const cell = document.createElement('td'); // Create a new table cell.
            let value = element.getElementsByTagName(field)[0]?.textContent.trim() || ''; // Get the value from the XML.

            // Format the AMOUNT column as a number with commas.
            if (field === 'AMOUNT') {
                value = parseFloat(value).toLocaleString('en-US');
            }

            cell.textContent = value; // Set the cell's text content.
            row.appendChild(cell); // Add the cell to the row.
        });

        return row; // Return the completed row.
    }

    // This method fetches XML data from a file or uses cached data from localStorage.
    async fetchXMLData() {
        try {
            // Fetch the XML data from the server.
            const response = await fetch('/accounts.office.cheque.inquiry/public/data/data.xml');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.text(); // Get the XML data as text.
            localStorage.setItem('xmlData', data); // Store the data in localStorage for offline use.
            this.xmlData = data; // Save the data in the class property.

            // Parse the XML data and populate the table.
            return this.parseXMLToTable(data);
        } catch (error) {
            console.error('Error fetching XML:', error);

            // If fetching fails, try to load the data from localStorage.
            const storedXML = localStorage.getItem('xmlData');
            if (storedXML) {
                console.log('Loading XML from localStorage.');
                return this.parseXMLToTable(storedXML);
            }

            this.showError('Failed to load XML data.');
            return false;
        }
    }

    // This method filters the table rows based on the search term.
    searchAndFilterXML() {
        const searchTerm = this.searchInput.value.toLowerCase(); // Get the search term in lowercase.

        // If the search term is empty, reset the table.
        if (!searchTerm) {
            this.resetTable();
            return;
        }

        // Show the table and hide the empty state message.
        this.tableContainer.style.display = 'block';
        this.emptyState.style.display = 'none';
        this.resultContainer.style.display = 'block';

        const rows = this.tableBody.querySelectorAll('tr'); // Get all table rows.
        let matchCount = 0; // Count how many rows match the search term.

        // Loop through each row and check if it matches the search term.
        rows.forEach(row => {
            const cells = row.getElementsByTagName('td'); // Get all cells in the row.
            const matchesSearch = Array.from(cells).some(cell => 
                cell.textContent.toLowerCase().includes(searchTerm) // Check if any cell contains the search term.
            );

            // Show or hide the row based on whether it matches the search term.
            row.style.display = matchesSearch ? '' : 'none';
            if (matchesSearch) matchCount++; // Increment the match count.
        });

        // Update the search results message.
        this.updateSearchResults(searchTerm, matchCount);
    }

    // This method updates the search results message.
    updateSearchResults(searchTerm, matchCount) {
        this.resultContainer.innerHTML = matchCount > 0
            ? `<i class="fas fa-check-circle"></i> Found ${matchCount} results for "${searchTerm}"`
            : '<i class="fas fa-times-circle"></i> No results found.';
    }

    // This method sorts the table by a specific column.
    sortTable(columnName) {
        const column = this.columns[columnName]; // Get the column configuration.
        if (!column) {
            console.error('Column not found:', columnName);
            return;
        }

        const rows = Array.from(this.tableBody.querySelectorAll('tr')); // Get all table rows.

        // Sort the rows based on the column's type (number or string).
        rows.sort((a, b) => {
            const aValue = a.cells[column.index].textContent.trim(); // Get the value from the first row.
            const bValue = b.cells[column.index].textContent.trim(); // Get the value from the second row.

            if (column.type === 'number') {
                // For numeric columns, convert the values to numbers and compare them.
                const aNum = parseFloat(aValue.replace(/,/g, '')) || 0;
                const bNum = parseFloat(bValue.replace(/,/g, '')) || 0;
                return aNum - bNum;
            } else {
                // For string columns, use localeCompare to compare the values.
                return aValue.localeCompare(bValue, undefined, { numeric: true });
            }
        });

        // Re-append the sorted rows to the table.
        rows.forEach(row => this.tableBody.appendChild(row));
    }

    // This method resets the table to its initial state.
    resetTable() {
        this.searchInput.value = ''; // Clear the search input.
        this.tableContainer.style.display = 'none'; // Hide the table.
        this.emptyState.style.display = 'block'; // Show the empty state message.
        this.resultContainer.style.display = 'none'; // Hide the search results message.
    }

    // This method displays an error message.
    showError(message) {
        this.resultContainer.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        this.resultContainer.style.display = 'block';
    }
}

// When the page loads, initialize the XMLTableHandler and fetch the XML data.
document.addEventListener('DOMContentLoaded', () => {
    const handler = new XMLTableHandler();
    handler.fetchXMLData().then(() => {
        handler.resetTable();
    });
});

// Register a service worker for offline functionality.
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        const swPath = '/accounts.office.cheque.inquiry/service-worker.js';
        navigator.serviceWorker.register(swPath, {
            scope: '/accounts.office.cheque.inquiry/'
        })
        .then(registration => {
            console.log('ServiceWorker registered with scope:', registration.scope);
        })
        .catch(err => {
            console.error('ServiceWorker registration failed:', err);
        });
    });
}
