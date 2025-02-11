// Global variables to store DOM elements and data
let tableBody, searchInput, tableContainer, emptyState, resultContainer;
let xmlData;

// Column configuration object defining the structure and data types for table columns
const columns = {
    SNO: { index: 0, type: 'number' },
    NARRATION: { index: 1, type: 'string' },
    AMOUNT: { index: 2, type: 'number' },
    CHEQ_NO: { index: 3, type: 'number' },
    NAR: { index: 4, type: 'string' },
    BNO: { index: 5, type: 'number' },
    PVN: { index: 6, type: 'number' },
    DD: { index: 7, type: 'string' }
};

/**
 * Initializes the application by setting up DOM elements and event listeners
 * This function runs when the DOM content is fully loaded
 */
function initializeApplication() {
    console.log('Initializing...');
    
    // Get references to DOM elements
    tableBody = document.getElementById('checksTable');
    searchInput = document.getElementById('search');
    tableContainer = document.getElementById('tableContainer');
    emptyState = document.getElementById('emptyState');
    resultContainer = document.getElementById('result');
    
    // Set up event listeners for search and sorting
    initializeEventListeners();
    
    // Start fetching XML data
    fetchXMLData().then(() => {
        console.log('Init df complete, resetting tb to default state');
        resetTable();
    });
}

/**
 * Sets up all necessary event listeners for the application
 * Includes search functionality and column sorting
 */
function initializeEventListeners() {
    console.log('Setting up event listeners for sa and so');
    
    // Add Enter key listener for search input
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          //  console.log('Enter key pressed in search input, initiating search...');
            searchAndFilterXML();
        }
    });
    
    // Add click listeners for column sorting
    Object.keys(columns).forEach(columnName => {
        const header = document.querySelector(`th[data-column="${columnName}"]`);
        if (header) {
            header.addEventListener('click', () => {
              //  console.log(`Column header clicked: ${columnName}, initiating sort...`);
                sortTable(columnName);
            });
        }
    });
}

/**
 * Parses XML string data and populates the table
 * @param {string} xmlString - The XML data to parse (optional)
 * @returns {boolean} - Success status of parsing operation
 */
function parseXMLToTable(xmlString = null) {
    console.log('Beginning XML parsing process...');
    try {
        // Use the provided XML string or fall back to the global xmlData
        const xmlToParse = xmlString || xmlData;

        // Replace newline character (&#10;) with <br /> tag in the entire XML
        const xmlWithBreaks = xmlToParse.replace(/&#10;/g, '<br />');

        // Parse the modified XML string
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlWithBreaks, "text/xml");

        // Validate XML parsing
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
            throw new Error(`XML parsing error detected: ${parserError.textContent}`);
        }

        // Get all relevant elements
        const gPvnElements = xmlDoc.getElementsByTagName('G_PVN');
        console.log(`Successfully found ${gPvnElements.length} G_PVN elements in XML`);

        // Clear existing table content for fresh data
        tableBody.innerHTML = '';

        // Create table rows for each element
        Array.from(gPvnElements).forEach((element, index) => {
            //console.log(`Processing element ${index + 1} of ${gPvnElements.length}`);
            const row = createTableRow(element);
            tableBody.appendChild(row);
        });

        console.log('Table population completed successfully');
        return true;
    } catch (error) {
        console.error('Error encountered during XML parsing:', error);
        showError('Failed to parse XML data. Please check the data format.');
        return false;
    }
}

/**
 * Creates a table row from an XML element
 * @param {Element} element - The XML element to convert
 * @returns {HTMLTableRowElement} - The created table row
 */
function createTableRow(element) {
    console.log('Creating new table row from XML element');
    const row = document.createElement('tr');

    Object.keys(columns).forEach(field => {
        const cell = document.createElement('td');
        let value = element.getElementsByTagName(field)[0]?.textContent.trim() || '-';

        // Special handling for AMOUNT field
        if (field === 'AMOUNT') {
            console.log(`Formatting amount value: ${value}`);
            try {
                value = parseFloat(value).toLocaleString('en-US');
            } catch (error) {
                console.warn(`Invalid amount value detected: ${value}, defaulting to 0`);
                value = '0';
            }
        }

        // Replace &#10; with <br> for the DD tag (or any other tag with newlines)
        if (field === 'DD') {
            value = value.replace(/&#10;/g, '<br>'); // Replace newline characters with <br>
            cell.innerHTML = value; // Use innerHTML to render <br> tags
        } else {
            cell.textContent = value; // Use textContent for plain text
        }

        cell.setAttribute('data-field', field);
        row.appendChild(cell);
    });

    return row;
}


/**
 * Fetches XML data from server and processes it
 * @returns {Promise<boolean>} - Success status of fetch operation
 */
async function fetchXMLData() {
  //  console.log('Starting XML data fetch process...');
    try {
        const filesResponse = await fetch('/accounts.office.cheque.inquiry/public/data/files.json');
        
        if (!filesResponse.ok) {
            throw new Error(`HTTP error during files fetch: ${filesResponse.status}`);
        }
        
        const xmlFiles = await filesResponse.json();
       // console.log(`Found ${xmlFiles.length} XML files to process`);
        
        let combinedXMLData = '<root>';
        
        // Process each XML file
        for (const file of xmlFiles) {
          //  console.log(`Fetching file: ${file}`);
            const fileUrl = `/accounts.office.cheque.inquiry/public/data/${file}`;
            const fileResponse = await fetch(fileUrl);
            
            if (!fileResponse.ok) {
                throw new Error(`Failed to fetch file ${file}: ${fileResponse.status}`);
            }
            
            const data = await fileResponse.text();
            combinedXMLData += data;
            //console.log(`Successfully appended data from ${file}`);
        }
        
        combinedXMLData += '</root>';
        
        // Store data for future use
        localStorage.setItem('xmlData', combinedXMLData);
        xmlData = combinedXMLData;
        
        console.log('XML data fetch and combination complete');
        return parseXMLToTable(combinedXMLData);
    } catch (error) {
        console.error('Error in XML data fetch:', error);
        
        // Attempt to load from localStorage
        const storedXML = localStorage.getItem('xmlData');
        if (storedXML) {
            console.log('Falling back to stored XML data from localStorage');
            return parseXMLToTable(storedXML);
        }
        
        showError('Failed to load XML data. Please check your connection.');
        return false;
    }
}

/**
 * Performs search and filtering on the table data
 */
function searchAndFilterXML() {
    // Get the search term from the input and convert it to lowercase
    const searchTerm = searchInput.value.toLowerCase();
    console.log(`Performing search with term: "${searchTerm}"`);

    // If the search term is empty, reset the table and hide pagination
    if (!searchTerm) {
        console.log('Empty search term, resetting table and hiding pagination');
        resetTable();
        hidePagination(); // Hide pagination controls
        return;
    }

    // Show the relevant containers (table, result container) and hide the empty state
    tableContainer.style.display = 'block';
    emptyState.style.display = 'none';
    resultContainer.style.display = 'block';

    // Get all the rows in the table body
    const rows = tableBody.querySelectorAll('tr');
    let matchCount = 0;

    // Iterate over each row to filter based on the search term
    rows.forEach(row => {
        // Get all the cells in the current row
        const cells = row.getElementsByTagName('td');
        let matchesSearch = false;

        // Iterate over each cell in the row
        Array.from(cells).forEach(cell => {
            // Get the text content of the cell, or replace it with '-' if it's empty
            const cellText = (isNaN(Number(cell.textContent.trim())) || cell.textContent.trim() === '') ? '-' : cell.textContent.trim().toLowerCase();
            console.log(`Cell content: "${cellText}"`);

            // Check if the cell content includes the search term
            if (cellText.includes(searchTerm)) {
                matchesSearch = true;
            }

            // Update the cell content to display '-' if it's empty
            if (!cell.textContent.trim()) {
                cell.textContent = '-';
                console.log(`Empty cell detected, replaced with "-"`);
            }

            // Handle empty or NaN values specifically for the "Amount" cell
            if (cell.classList.contains('amount') && (isNaN(cell.textContent.trim()) || cell.textContent.trim() === '-')) {
                cell.textContent = '-';
                console.log(`Empty or NaN amount cell detected, replaced with "-"`);
            }
        });

        // Show or hide the row based on whether it matches the search term
        row.style.display = matchesSearch ? '' : 'none';
        if (matchesSearch) {
            matchCount++;
            console.log(`Row matches search term: "${searchTerm}"`);
        } else {
            console.log(`Row does not match search term: "${searchTerm}"`);
        }
    });

    // Log the total number of matches found
    console.log(`Search complete. Found ${matchCount} matches`);

    // Update the search results and initialize pagination
    updateSearchResults(searchTerm, matchCount);

    // Show or hide pagination based on the number of matches
    if (matchCount > 0) {
        initializePagination(); // Show pagination controls
    } else {
        hidePagination(); // Hide pagination controls if no results
    }
}

/**
 * Shows the pagination controls
 */
function showPagination() {
    const paginationContainer = document.querySelector('.pagination-controls');
    if (paginationContainer) {
        paginationContainer.style.display = 'block';
        console.log('Pagination controls shown');
    }
}

/**
 * Hides the pagination controls
 */
function hidePagination() {
    const paginationContainer = document.querySelector('.pagination-controls');
    if (paginationContainer) {
        paginationContainer.style.display = 'none';
        console.log('Pagination controls hidden');
    }
}


function resetTable() {
    console.log('Resetting table to initial state');
    searchInput.value = '';
    tableContainer.style.display = 'none';
    emptyState.style.display = 'block';
    resultContainer.style.display = 'none';
    hidePagination(); // Hide pagination controls
}

// Helper function to update search results (assuming this function exists)
function updateSearchResults(searchTerm, matchCount) {
    resultContainer.textContent = `Found ${matchCount} results for "${searchTerm}"`;
 //   console.log(`Updated search results with term: "${searchTerm}" and match count: ${matchCount}`);
}

// Helper function to initialize pagination (assuming this function exists)
function initializePagination() {
    console.log('Pagination initialized');
}




/**
 * Updates the search results display
 * @param {string} searchTerm - The search term used
 * @param {number} matchCount - Number of matches found
 */
function updateSearchResults(searchTerm, matchCount) {
   // console.log(`Updating search results display for "${searchTerm}" with ${matchCount} matches`);
    resultContainer.innerHTML = matchCount > 0
        ? `<i class="fas fa-check-circle"></i> Found ${matchCount} results for "${searchTerm}"`
        : '<i class="fas fa-times-circle"></i> No results found.';
}






// Track current sort state for columns
let sortState = {
    currentColumn: null,
    direction: 'asc'
};

/**
 * Sorts the table by specified column with toggle functionality
 * @param {string} columnName - Name of the column to sort by
 */
function sortTable(columnName) {
    console.log(`Initiating table sort by column: ${columnName}`);
    const column = columns[columnName];
    
    if (!column) {
        console.error(`Invalid column name provided: ${columnName}`);
        return;
    }
    
    // Update sort direction
    if (sortState.currentColumn === columnName) {
        sortState.direction = sortState.direction === 'asc' ? 'desc' : 'asc';
    } else {
        sortState.currentColumn = columnName;
        sortState.direction = 'asc';
    }
    
    // Update visual indicators
    updateSortIndicators(columnName);
    
    const rows = Array.from(tableBody.querySelectorAll('tr'));
    const isNumeric = column.type === 'number';
    
    console.log(`Sorting ${rows.length} rows as ${isNumeric ? 'numeric' : 'string'} values in ${sortState.direction} order`);
    
    rows.sort((a, b) => {
        const aValue = a.cells[column.index].textContent.trim();
        const bValue = b.cells[column.index].textContent.trim();
        
        let comparison;
        if (isNumeric) {
            const aNum = parseFloat(aValue.replace(/,/g, '')) || 0;
            const bNum = parseFloat(bValue.replace(/,/g, '')) || 0;
            comparison = aNum - bNum;
        } else {
            comparison = aValue.localeCompare(bValue, undefined, { numeric: true });
        }
        
        return sortState.direction === 'asc' ? comparison : -comparison;
    });
    
    // Reappend sorted rows
    rows.forEach(row => tableBody.appendChild(row));
    console.log(`Table sort complete in ${sortState.direction} order`);
}

/**
 * Updates the visual sort indicators in column headers
 * @param {string} activeColumn - Currently sorted column name
 */
function updateSortIndicators(activeColumn) {
    // Remove existing indicators
    document.querySelectorAll('th[data-column] .sort-indicator').forEach(indicator => indicator.remove());
    
    // Add indicator to active column
    const activeHeader = document.querySelector(`th[data-column="${activeColumn}"]`);
    if (activeHeader) {
        const indicator = document.createElement('span');
        indicator.className = 'sort-indicator';
        indicator.innerHTML = sortState.direction === 'asc' ? ' ↑' : ' ↓';
        activeHeader.appendChild(indicator);
    }
}

/**
 * Resets the table to its initial state
 */
function resetTable() {
    console.log('Resetting table to initial state');
    searchInput.value = '';
    tableContainer.style.display = 'none';
    emptyState.style.display = 'block';
    resultContainer.style.display = 'none';
}





// Pagination state configuration
let paginationState = {
    currentPage: 1,
    rowsPerPage: 10,
    totalPages: 1
};

/**
 * Initializes pagination for the table
 * @param {number} itemsPerPage - Number of rows to display per page (default: 10)
 */
function initializePagination(itemsPerPage = 5) {
    console.log('Initializing pagination system...');
    paginationState.rowsPerPage = itemsPerPage;

    // Create pagination controls if they don't already exist
    const paginationContainer = document.querySelector('.pagination-controls');
    if (!paginationContainer) {
        createPaginationControls();
    }

    // Show pagination controls
    showPagination();

    // Initial pagination render
    updatePagination();
}

/**
 * Creates and appends pagination control elements to the DOM
 */
function createPaginationControls() {
    console.log('Creating pagination control elements');
    
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination-controls';
    paginationContainer.innerHTML = `
        <button id="prevPage" class="pagination-btn">&lt; Previous</button>
        <span id="pageInfo" class="page-info"></span>
        <button id="nextPage" class="pagination-btn">Next &gt;</button>
        <select id="rowsPerPageSelect" class="rows-per-page">
            <option value="5" selected>Mobile user</option>
            <option value="7" >Desktop user</option>
        </select>
    `;
    
    // Add controls after the table
    tableBody.parentNode.before(paginationContainer);
    
    // Set up event listeners
    setupPaginationEventListeners();
}

/**
 * Sets up event listeners for pagination controls
 */
function setupPaginationEventListeners() {
    document.getElementById('prevPage').addEventListener('click', () => {
        if (paginationState.currentPage > 1) {
            paginationState.currentPage--;
            updatePagination();
        }
    });
    
    document.getElementById('nextPage').addEventListener('click', () => {
        if (paginationState.currentPage < paginationState.totalPages) {
            paginationState.currentPage++;
            updatePagination();
        }
    });
    
    document.getElementById('rowsPerPageSelect').addEventListener('change', (e) => {
        paginationState.rowsPerPage = parseInt(e.target.value);
        paginationState.currentPage = 1; // Reset to first page
        updatePagination();
    });
}

/**
 * Updates the table display based on current pagination state
 */
function updatePagination() {
    console.log(`Updating pagination: Page ${paginationState.currentPage}, Rows per page: ${paginationState.rowsPerPage}`);
    
    const rows = Array.from(tableBody.querySelectorAll('tr'));
    const totalRows = rows.length;
    
    // Calculate total pages
    paginationState.totalPages = Math.ceil(totalRows / paginationState.rowsPerPage);
    
    // Ensure current page is valid
    if (paginationState.currentPage > paginationState.totalPages) {
        paginationState.currentPage = paginationState.totalPages;
    }
    
    // Calculate start and end indices
    const startIndex = (paginationState.currentPage - 1) * paginationState.rowsPerPage;
    const endIndex = Math.min(startIndex + paginationState.rowsPerPage, totalRows);
    
    
    // Show/hide rows based on current page
    rows.forEach((row, index) => {
        row.style.display = (index >= startIndex && index < endIndex) ? '' : 'none';
    });
    
    // Update pagination info display
    updatePaginationInfo(totalRows, startIndex, endIndex);
    
    // Update button states
    updatePaginationControls();
}

/**
 * Updates the pagination information display
 * @param {number} totalRows - Total number of rows in the table
 * @param {number} startIndex - Start index of current page
 * @param {number} endIndex - End index of current page
 */
function updatePaginationInfo(totalRows, startIndex, endIndex) {
    const pageInfo = document.getElementById('pageInfo');
    pageInfo.textContent = `Showing ${startIndex + 1}-${endIndex} of ${totalRows} entries | Page ${paginationState.currentPage} of ${paginationState.totalPages}`;
}

/**
 * Updates the state of pagination control buttons
 */
function updatePaginationControls() {
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    
    // Disable/enable buttons based on current page
    prevButton.disabled = paginationState.currentPage === 1;
    nextButton.disabled = paginationState.currentPage === paginationState.totalPages;
}

/**
 * Resets pagination to first page
 * Useful after searching or sorting
 */
function resetPagination() {
    console.log('Resetting pagination to first page');
    paginationState.currentPage = 1;
    updatePagination();
}





/**
 * Displays error messages to the user
 * @param {string} message - Error message to display
 */
function showError(message) {
    console.error(`Displaying error message: ${message}`);
    resultContainer.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    resultContainer.style.display = 'block';
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApplication);

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        const swPath = '/accounts.office.cheque.inquiry/service-worker.js';
        console.log('Attempting to register Service Worker...');
        
        navigator.serviceWorker.register(swPath, {
            scope: '/accounts.office.cheque.inquiry/'
        })
        .then(registration => {
            console.log('Service Worker successfully registered with scope:', registration.scope);
        })
        .catch(err => {
            console.error('Service Worker registration failed:', err);
        });
    });
}
