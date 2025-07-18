// scripts/index.js

class XMLTableHandler {
    constructor() {
        console.group('🚀 Initializing XMLTableHandler...');
        try {
            this.defineColumns();
            this.initializeDOMElements();
            this.initializeState();
            this.initializeEventListeners();
            this.applyConfig();

            // Fetch and display data
            this.fetchXMLData().then(() => {
                this.resetTable();
                console.log('✅ Initial data load complete');
            }).catch(error => {
                console.error('❌ Initial data load failed:', error);
                this.showError('Failed to load initial data: ' + error.message);
            });
        } catch (error) {
            console.error('❌ Constructor Error:', error.message);
            this.showError('Failed to initialize table handler: ' + error.message);
        } finally {
            console.groupEnd();
        }
    }

    /**
     * Applies configuration settings for maximum pages and search term limit.
     */
    applyConfig() {
        console.group('⚙️ Applying configurations...');
        this.config = {
            maxPages: 3, // Maximum number of page links to display in pagination
            minPages: 1,  // Minimum number of pages to display in pagination
            searchTermMinLength: 3, // Minimum length of the search term before triggering a search
            dataFilesJsonPath: '/accounts.office.cheque.inquiry/public/data/files.json', // Path to the files.json
             dataFilesBasePath: '/accounts.office.cheque.inquiry/public/data/' // Base path for XML data files
        };
        console.log(`⚙️ Configuration: maxPages = ${this.config.maxPages}, minPages = ${this.config.minPages}, searchTermMinLength = ${this.config.searchTermMinLength}, dataFilesJsonPath = ${this.config.dataFilesJsonPath}, dataFilesBasePath = ${this.config.dataFilesBasePath}`);
        console.groupEnd();
    }

    /**
     * Define table columns configuration
     * Each column has its index, data type, display title, and search properties
     */
    defineColumns() {
        console.group('📊 Defining table columns...'); // Start a console group
        this.columns = {
            NARRATION: {label: 'Payee', index: 0, type: 'string', required: true, title: 'Payee', searchable: true },
            CHEQ_NO: {label: 'Cheque No', index: 1, type: 'number', required: true, title: 'Cheque No', searchable: false },
            DD: {label: 'Status', index: 2, type: 'string', required: true, title: 'Status', searchable: false }
        };
        console.table(this.columns); // Display columns as a table in console
        console.groupEnd(); // End the console group
    }

    /**
     * Initialize all required DOM elements
     * Throws error if any required element is missing
     */
    initializeDOMElements() {
        console.group('🔍 Finding DOM elements...');
        const requiredElements = {
            'checksTable': 'tableBody',
            'search': 'searchInput',
            'narCategory': 'narFilter',
            'statusFilter': 'statusFilter',
            'tableContainer': 'tableContainer',
            'emptyState': 'emptyState',
            'result': 'resultContainer',
            'noResults': 'noResults',
            'pagination': 'pagination',
            'filter2': 'filter2',
            'searchBtn': 'searchBtn',
            'rowsPerPage': 'rowsPerPageSelect',
            'scrollToTop': 'scrollToTop',
            'themeToggle': 'themeToggle',
            'loading': 'loading'

        };

        for (const [id, prop] of Object.entries(requiredElements)) {
            const element = document.getElementById(id);
            if (!element) {
                console.error(`❌ Required element #${id} not found in DOM`); // Log if not found
                this[prop] = null; // Assign null to avoid further errors
                console.warn(`⚠️ Assigning null to this.${prop} due to missing element`);
            } else {
                this[prop] = element;
                console.log(`✓ Found element #${id}`);
            }
        }

        console.log('🔍 After finding, this.pagination:', this.pagination);
        console.groupEnd();
    }

    /**
     * Initialize application state with default values
     */
    initializeState() {
        console.group('🏁 Initializing application state...'); // Start a console group
        this.state = {
            enableLiveUpdate: false,
            tableResetEnabled: true,
            backspaceDefault: true,
            xmlData: '',
            lastSearchTerm: '',
            currentStatusFilter: 'all',
            lastFilterCategory: 'all',
            paginationEnabled: true,
            rowsPerPage: 6,
            currentPage: 1,
            visibleRowsCount: 0,
            sortColumn: null,
            sortDirection: 'asc'
        };
        console.table(this.state); // Display state as a table in console
        console.groupEnd(); // End the console group
    }

    /**
     * Setup all event listeners for search, filter, pagination and sorting
     */
    initializeEventListeners() {
        console.group('👂 Setting up event listeners...'); // Start a console group

        // Search events
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                console.log('🔎 Search triggered by Enter key');
                this.performSearch();
            }
            this.handleBackspace(e);
        });

        this.searchBtn.addEventListener('click', () => {
            console.log('🔎 Search triggered by button click');
            this.performSearch();
        });

        // Filter events
        this.narFilter.addEventListener('change', () => {
            console.log('🔄 NAR filter changed:', this.narFilter.value);
            this.applyFilters();
        });

        this.statusFilter.addEventListener('change', () => {
            console.log('🔄 Status filter changed:', this.statusFilter.value);
            this.applyFilters();
        });

        // Rows per page change
        this.rowsPerPageSelect.addEventListener('change', () => {
            const newValue = parseInt(this.rowsPerPageSelect.value);
            console.log(`📄 Rows per page changed to ${newValue}`);
            this.state.rowsPerPage = newValue;
            this.state.currentPage = 1; // Reset to first page
            this.updatePagination();
        });

        // Sorting events
        document.querySelectorAll('th[data-column]').forEach(header => {
            header.addEventListener('click', () => {
                const column = header.dataset.column;
                console.log(`🔃 Sort requested for column: ${column}`);
                this.sortTable(column);
            });
        });

        // Theme toggle functionality
        this.themeToggle.addEventListener("click", function () {
            document.body.classList.toggle("dark-mode");
            // Update theme icon
            if (document.body.classList.contains("dark-mode")) {
                themeToggle.innerHTML =
                '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
            } else {
                themeToggle.innerHTML =
                '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
            }
            // Store theme preference
            localStorage.setItem(
              "theme",
              document.body.classList.contains("dark-mode") ? "dark" : "light"
            );
          });
  
          // Load saved theme preference
          if (localStorage.getItem("theme") === "dark") {
            document.body.classList.add("dark-mode");
            this.themeToggle.innerHTML =
              '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
          }
  
          // Scroll to top button
          this.scrollToTop.addEventListener("click", function () {
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          });

        console.log('✅ All event listeners initialized');
        console.groupEnd(); // End the console group
    }

    /**
     * Handles backspace functionality in the search input.
     * Resets the table when appropriate and logs actions in a collapsible console group.
     * @param {KeyboardEvent} e - The keyboard event.
     */
    handleBackspace(e) {
        console.groupCollapsed('⌫ Handling Backspace Event'); // Start a collapsed console group
        try {
            if (e.key === 'Backspace' && this.state.tableResetEnabled) {
                const inputBefore = this.searchInput.value.trim();
                this.noResults.style.display = "none";


                setTimeout(() => {
                    const inputAfter = this.searchInput.value.trim();
                    console.log(`🔍 Input before backspace: "${inputBefore}", Input after backspace: "${inputAfter}"`);

                    if (this.state.backspaceDefault && inputBefore.length > 1) {
                        const caretPosition = this.searchInput.selectionStart;
                        this.resetTable();
                        this.searchInput.value = inputAfter;
                        this.searchInput.setSelectionRange(caretPosition, caretPosition);
                        this.state.backspaceDefault = false;
                        console.log('⌫ Backspace triggered table reset');
                    }
                    if (inputAfter.length > 0) {
                        this.state.backspaceDefault = true;
                    }

                    // Check if the search term is now too short and reset if necessary
                    if (inputAfter.length < this.config.searchTermMinLength && inputAfter.length > 0) {
                        console.log(`🔎 Search term "${inputAfter}" is now too short after backspace. Resetting table.`);
                        this.resetTable();
                    }
                    if (inputAfter.length === 0) {
                        this.resetTable();
                    }
                }, 0);
            }
        } finally {
            console.groupEnd(); // End the console group
        }
    }

    /**
     * Initialize pagination controls
     */
    initializePagination() {
        console.log('🔢 Initializing pagination controls...');
        this.updatePagination();
    }

    /**
     * Update pagination based on current page and rows per page
     * Handles visibility of rows and rendering pagination controls
     */
    updatePagination() {
    if (!this.state.paginationEnabled) {
        console.log('⏩ Pagination is disabled, skipping update');
        return;
    }

    console.log(`📄 Updating pagination for page ${this.state.currentPage}`);

    // Get filtered rows from state
    const filteredRows = this.state.filteredRows || [];
    console.log(`👁️ Found ${filteredRows.length} filtered rows`);

    // Calculate total pages
    const totalPages = Math.ceil(filteredRows.length / this.state.rowsPerPage);
    this.state.currentPage = Math.min(this.state.currentPage, totalPages || 1);

    console.log(`📚 Total pages: ${totalPages}, Current page: ${this.state.currentPage}`);

    // Hide all rows first
    this.tableBody.querySelectorAll('tr').forEach(row => row.style.display = 'none');

    // Show rows for the current page
    const startIndex = (this.state.currentPage - 1) * this.state.rowsPerPage;
    const endIndex = startIndex + this.state.rowsPerPage;

    filteredRows.slice(startIndex, endIndex).forEach(row => {
        row.style.display = '';
    });

    // Re-render pagination controls
    this.renderPaginationControls(totalPages);
}

    /**
     * Render pagination control buttons
     * @param {number} totalPages - Total number of pages
     */
     renderPaginationControls(totalPages) {
    console.log('Inside renderPaginationControls, this.pagination:', this.pagination);

    const controls = this.pagination;
    if (!controls) {
        console.error("❌ Pagination element is null or undefined!");
        return;
    }

    controls.innerHTML = '';

    if (totalPages <= 1) {
        controls.style.display = 'none'; // Hide pagination if only one page
        console.log('🔢 Hiding pagination controls (single page)');
        return;
    }

    controls.style.display = 'flex'; // Show pagination controls
    console.log('🔢 Rendering pagination controls');

    // Previous Button
    this.createPaginationButton('Previous', () => {
        if (this.state.currentPage > 1) {
            this.state.currentPage--;
            console.log(`⬅️ Moving to previous page: ${this.state.currentPage}`);
            this.updatePagination();
        }
    }, this.state.currentPage === 1);

    // Page numbers (1 to 5 or fewer)
    const startPage = Math.max(1, this.state.currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        this.createPaginationButton(i, () => {
            this.state.currentPage = i;
            console.log(`🖱️ Navigating to page: ${this.state.currentPage}`);
            this.updatePagination();
        }, this.state.currentPage === i);
    }

    // Next Button
    this.createPaginationButton('Next', () => {
        if (this.state.currentPage < totalPages) {
            this.state.currentPage++;
            console.log(`➡️ Moving to next page: ${this.state.currentPage}`);
            this.updatePagination();
        }
    }, this.state.currentPage === totalPages);
}
    
    /**
     * Create a pagination button with appropriate handlers
     * @param {string|number} text - Button text
     * @param {Function} onClick - Click handler
     * @param {boolean} disabled - Whether button should be disabled
     */
    createPaginationButton(text, onClick, disabled = false) {
        const button = document.createElement('button');
        button.className = `page-btn${disabled ? ' disabled' : ''}`;
        button.textContent = text;
        button.disabled = disabled;
        button.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default behavior
            onClick();
        });
        this.pagination.appendChild(button);
    }

    /**
     * Fetch XML data from server files or use cached data
     * @returns {Promise<boolean>} - True if data was successfully processed
     */
    async fetchXMLData() {
        console.group('📥 Fetching XML data...'); // Start a console group
        try {
            const filesResponse = await fetch(this.config.dataFilesJsonPath);
            if (!filesResponse.ok) throw new Error(`HTTP error! Status: ${filesResponse.status} - ${this.config.dataFilesJsonPath}`);
            const xmlFiles = await filesResponse.json();
            console.log(`📄 Found ${xmlFiles.length} XML files to process`);

            let combinedXML = '<root>';
            for (const file of xmlFiles) {
                console.log(`🔄 Processing file: ${file}`);
                const fileResponse = await fetch(this.config.dataFilesBasePath + file);
                if (!fileResponse.ok) throw new Error(`HTTP error for file: ${file} - Status: ${fileResponse.status} - Path: ${this.config.dataFilesBasePath + file}`);
                let xmlContent = await fileResponse.text();
                xmlContent = xmlContent.replace(/<\?xml[^>]+\?>/, '').replace(/<\/?root>/g, '');
                combinedXML += xmlContent;
            }
            combinedXML += '</root>';

            console.log('💾 Saving combined XML to local storage');
            localStorage.setItem('xmlData', combinedXML);
            this.state.xmlData = combinedXML;

            const result = this.parseXMLToTable(combinedXML);
            this.initializePagination(); // Initialize pagination after parsing data
            return result;
        } catch (error) {
            console.error('❌ Error fetching XML:', error);
            const storedXML = localStorage.getItem('xmlData');
            if (storedXML) {
                console.log('📋 Using cached XML data from local storage');
                this.state.xmlData = storedXML;
                const result = this.parseXMLToTable(storedXML);
                this.initializePagination(); // Initialize pagination after parsing data
                return result;
            }
            throw error;
        } finally {
            console.groupEnd(); // End the console group
        }
    }

    /**
     * Parse XML string into table rows
     * @param {string} xmlString - XML data to parse
     * @returns {boolean} - True if parsing was successful
     */
    parseXMLToTable(xmlString) {
        console.group('🔄 Parsing XML data to table...'); // Start a console group
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString || this.state.xmlData, "text/xml");

        if (xmlDoc.querySelector('parsererror')) {
            const error = xmlDoc.querySelector('parsererror').textContent;
            console.error('❌ XML parsing error:', error);
            throw new Error('XML parsing error: ' + error);
        }

        const entries = xmlDoc.getElementsByTagName('G_PVN');
        console.log(`📊 Found ${entries.length} entries to display`);
        this.tableBody.innerHTML = '';

        Array.from(entries).forEach((element, index) => {
            const row = this.createTableRow(element);
            this.tableBody.appendChild(row);
            if (index === 0 || index === entries.length - 1 || index % 100 === 0) {
                console.log(`📝 Processed ${index + 1}/${entries.length} rows`);
            }
        });

        this.state.visibleRowsCount = entries.length;
        console.log('✅ XML parsing complete');
        console.groupEnd(); // End the console group
        return true;
    }

    /**
     * Create a table row from XML element
     * @param {Element} element - XML element to convert to row
     * @returns {HTMLTableRowElement} - The created table row
     */
    createTableRow(element) {
        const row = document.createElement('tr');
        
        // Extract NAR value and set it as a data attribute on the row
        const narValue = element.getElementsByTagName('NAR')[0]?.textContent?.trim() || '';
        row.setAttribute('data-nar', narValue.toLowerCase());
      
        // Loop through columns and create cells
        Object.entries(this.columns).forEach(([field, config]) => {
          const cell = document.createElement('td');
          
          // Extract value from the XML element
          let value = element.getElementsByTagName(field)[0]?.textContent?.trim() || '';
      
          // Format the value if it's a number (e.g., AMOUNT)
          if (config.type === 'number' && field === 'AMOUNT') {
            value = this.formatAmount(value);
          }
      
          // Set the cell content
          cell.textContent = value;
      
          // Add data-label attribute for mobile layout
          cell.setAttribute('data-label', config.label || field);
      
          // Add data-field attribute (if needed for other functionality)
          cell.setAttribute('data-field', field);
      
          // Add status class for the 'DD' column
        //   if (field === 'DD') {
        //     cell.className = this.getStatusColor(value);
        //   }

        // Add status class and icon for the 'DD' column
        if (field === 'DD') {
            const statusInfo = this.getStatusColor(value);
            cell.innerHTML = `
                <span class="${statusInfo.class}">
                    ${statusInfo.icon} ${value}
                </span>
            `;
        }
      
          // Append the cell to the row
          row.appendChild(cell);
        });
      
        return row;
      }

    /**
     * Format amount as locale string
     * @param {string} value - Amount value to format
     * @returns {string} - Formatted amount
     */
    formatAmount(value) {
        try {
            return parseFloat(value).toLocaleString('en-US');
        } catch (error) {
            console.warn(`⚠️ Invalid amount value: ${value}`, error);
            return '0';
        }
    }
    
    /** 
     * Get CSS class name for status color
     * @param {string} status - Status text
     * @returns {object} - Object containing CSS class name and icon
     */
       getStatusColor(status) {
        const statusIcons = {
        'In Work': '🔧',
        'In Work: Not Signed Yet': '📝⏳', 
        'In Work: Not Signed Yet Sent To Chairman Sb. for Sign': '📤🖋️',
        'ready': '💵✅',
        'despatched': '🚚',
        'despatched through gpo': '📮🚚',
        'despatched to lakki camp office': '🚚📦',
        'received by:': '📬',
        'received byself': '👤✅',
        'received by: in c/o': '👥✅',
        'expired': '⏳',
        'cancelled': '❌',  
        'on hold': '⏸️',
    };
 
    const statusMap = {
        'In Work': 'status-indicator status-blue',
        'In Work: Not Signed Yet': 'status-indicator status-green',
        'In Work: Not Signed Yet Sent To Chairman Sb. for Sign': 'status-indicator status-blue',
        'ready': 'status-indicator status-green',
        'despatched': 'status-indicator status-orange',
        'despatched through gpo': 'status-indicator status-orange',
        'despatched to lakki camp office': 'status-indicator status-red',
        'received byself': 'status-indicator status-purple',
        'received by: in c/o': 'status-indicator status-dark-red',
        'received by:': 'status-indicator status-cyan',
        'on hold': 'status-indicator status-yellow',
        'cancelled': 'status-indicator status-dark-red',
    };

          // Normalize the input status by trimming and converting to lowercase
    const normalizedStatus = status.trim().toLowerCase();

    // Function to find the best match
    const findBestMatch = (statusObj) => {
        // First, try exact match (case-insensitive)
        const exactMatch = Object.keys(statusObj).find(
            key => key.toLowerCase() === normalizedStatus
        );
        
        if (exactMatch) return exactMatch;

        // Then try partial match
        const partialMatch = Object.keys(statusObj).find(
            key => normalizedStatus.includes(key.toLowerCase())
        );
        
        return partialMatch;
    };

    // Find matching status
    const matchedIconStatus = findBestMatch(statusIcons);
    const matchedClassStatus = findBestMatch(statusMap);

    // Return object with class and icon
    return {
        class: matchedClassStatus ? statusMap[matchedClassStatus] : 'status-indicator status-gray',
        icon: matchedIconStatus ? statusIcons[matchedIconStatus] : 'ℹ️'
            };
    }

     
    /**
     * Perform search using input value
     */
    performSearch() {
        // Show loading
        this.loading.style.display = "block";

        setTimeout(() => {

            const searchTerm = this.searchInput.value.toLowerCase();
            if (searchTerm.length < this.config.searchTermMinLength) {
                console.log(`🔎 Search term "${searchTerm}" is too short (minimum length: ${this.config.searchTermMinLength}). Skipping search.`);
                this.resetTable();
                this.noResults.style.display = "block";
                this.noResults.innerHTML = "Enter Name or School Name min 3 char";
                this.emptyState.style.display = 'none';
                if (searchTerm.length === 0) {
                    this.resetTable();
                    this.noResults.style.display = "block";
                    this.noResults.innerHTML = "Enter Name or School Name to search";
                    this.emptyState.style.display = 'none'; 
                }
                this.loading.style.display = "none";
                return;
            }
    
            // Hide loading / Show results or no results message
            this.loading.style.display = "none";
            console.log(`🔎 Performing search for: "${searchTerm}"`);
            this.noResults.style.display = "none";

            this.state.lastSearchTerm = searchTerm;
            this.applyFilters();
            
        }, 900); // Simulate loading time     
    }

    /**
     * Apply all filters (search, category, status)
     */
    applyFilters() {
    console.group('🔍 Applying filters...');
    const searchTerm = this.state.lastSearchTerm;
    const narCategory = this.narFilter.value.toLowerCase();
    const statusFilter = this.statusFilter.value.toLowerCase();

    console.log(`🔍 Filter criteria: search="${searchTerm}", category="${narCategory}", status="${statusFilter}"`);

    // Reset pagination to the first page
    this.state.currentPage = 1;

    // Reset if no filters are applied
    if (!searchTerm && narCategory === 'all' && statusFilter === 'all') {
        console.log('🔄 No filters active, resetting table');
        return this.resetTable();
    }

    // Show table and hide empty state
    this.tableContainer.style.display = 'block';
    this.emptyState.style.display = 'none';
    this.resultContainer.style.display = 'block';
    this.filter2.style.display = 'flex'; // Unhide the div






    // Filter rows based on search term and filters
    const allRows = Array.from(this.tableBody.querySelectorAll('tr'));
    const filteredRows = allRows.filter(row => {
        const narValue = row.getAttribute('data-nar');
        const status = row.querySelector('td[data-field="DD"]').textContent.toLowerCase();
        const cells = Array.from(row.getElementsByTagName('td'));

        // Check category match
        const matchesCategory = narCategory === 'all' || narValue === narCategory;
        // Check status match
        const matchesStatus = statusFilter === 'all' || status.includes(statusFilter);
        // Check search term match
        const matchesSearch = !searchTerm || cells.some(cell => {
            const field = cell.getAttribute('data-field');
            if (!this.columns || !this.columns[field]) return false;
            const columnConfig = this.columns[field];
            return columnConfig?.searchable && cell.textContent.toLowerCase().includes(searchTerm);
        });

        return matchesCategory && matchesStatus && matchesSearch;
    });

    // Store filtered rows in state
    this.state.filteredRows = filteredRows;
    console.log(`🔍 Filter found ${filteredRows.length} matching rows`);

    // Update search results message
    let message = `Found ${filteredRows.length} results`;
    if (searchTerm) message += ` for "${searchTerm}" if the list is lengthy you could Select the filters below`;
    if (narCategory !== 'all') message += ` in category "${this.narFilter.options[this.narFilter.selectedIndex].text}"`;
    if (statusFilter !== 'all') message += ` with status "${statusFilter}"`;

    console.log(`📊 Search results: ${message}`);
    if (this.resultContainer) {
        this.resultContainer.textContent = filteredRows.length > 0 ? message : 'No results found.';
        this.resultContainer.style.display = 'block';
    }

    // Handle pagination display
    if (this.pagination) {
        if (filteredRows.length === 0) {
            this.pagination.style.display = 'none';
        } else {
            this.pagination.style.display = 'flex';
        }
    }

    this.updatePagination(); // Update pagination after filtering
    console.groupEnd();
}
    /**
     * Reset table to initial state
     */
    resetTable() {
    console.group('🔄 Resetting table to initial state');
    try {
        console.log('🔄 Resetting table to initial state');
        this.searchInput.value = '';
        this.narFilter.value = 'all';
        this.statusFilter.value = 'all';
        this.state.lastSearchTerm = '';
        this.state.currentPage = 1; // Reset to the first page
        this.state.filteredRows = null; // Clear filtered rows

        this.tableContainer.style.display = 'none';
        this.emptyState.style.display = 'block';
        this.resultContainer.style.display = 'none';

        this.tableBody.querySelectorAll('tr').forEach(row => row.style.display = '');
        this.updatePagination(); // Update pagination after reset
    } finally {
        console.groupEnd();
    }
}

    /**
     * Show error message to the user
     * @param {string} message - Error message to display
     */
    showError(message) {
        console.error('❌ Error:', message);
        this.resultContainer.innerHTML = `
            ${message}
        `;
        this.resultContainer.style.display = 'block';
    }

    /**
     * Sort table by column
     * @param {string} column - Column name to sort by
     */
    sortTable(column) {
        if (!this.columns[column]) {
            console.warn(`⚠️ Cannot sort by unknown column: ${column}`);
            return;
        }

        const direction = this.state.sortColumn === column && this.state.sortDirection === 'asc' ? 'desc' : 'asc';
        const type = this.columns[column].type;

        console.log(`🔃 Sorting by ${column} (${type}) in ${direction} order`);

        const rows = Array.from(this.tableBody.getElementsByTagName('tr'));
        rows.sort((a, b) => {
            const aValue = this.getCellValue(a, column, type);
            const bValue = this.getCellValue(b, column, type);

            return direction === 'asc' ?
                aValue > bValue ? 1 : -1 :
                aValue < bValue ? 1 : -1;
        });

        this.updateSortIndicators(column, direction);
        this.reorderRows(rows);

        this.state.sortColumn = column;
        this.state.sortDirection = direction;
        console.log('✅ Sorting complete');
    }

    /**
     * Get cell value for sorting
     * @param {HTMLTableRowElement} row - Table row
     * @param {string} column - Column name
     * @param {string} type - Data type
     * @returns {string|number} - Cell value
     */
    getCellValue(row, column, type) {
        const cell = row.querySelector(`td[data-field="${column}"]`);
        const value = cell.textContent.trim();

        if (type === 'number') {
            // Remove commas and convert to number
            return parseFloat(value.replace(/,/g, '')) || 0;
        }

        return value.toLowerCase();
    }

    /**
     * Update sort indicators in table headers
     * @param {string} column - Column being sorted
     * @param {string} direction - Sort direction
     */
    updateSortIndicators(column, direction) {
        document.querySelectorAll('th[data-column] .sort-icon').forEach(icon => {
            icon.textContent = '';
        });

        const currentHeader = document.querySelector(`th[data-column="${column}"]`);
        if (currentHeader) {
            const sortIcon = currentHeader.querySelector('.sort-icon');
            if (sortIcon) {
                sortIcon.textContent = direction === 'asc' ? ' ↑' : ' ↓';
            }
        }
    }

    /**
     * Reorder table rows after sorting
     * @param {Array<HTMLTableRowElement>} rows - Sorted rows
     */
    reorderRows(rows) {
        this.tableBody.innerHTML = '';
        rows.forEach(row => this.tableBody.appendChild(row));
        console.log(`🔄 Reordered ${rows.length} rows in table`);
    }
}

// Initialize handler when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌐 Document loaded, initializing XMLTableHandler...');
    try {
        window.tableHandler = new XMLTableHandler();
        console.log('✅ XMLTableHandler successfully initialized');
    } catch (error) {
        console.error('❌ Initialization failed:', error);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger mt-3';
        errorDiv.innerHTML = `Failed to initialize table handler: ${error.message}`;
        document.body.insertBefore(errorDiv, document.body.firstChild);
    }
});

// Register service worker for offline capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        console.log('🔄 Registering Service Worker...');
        navigator.serviceWorker.register('/accounts.office.cheque.inquiry/service-worker.js', { scope: '/accounts.office.cheque.inquiry/' })
            .then(registration => console.log('✅ ServiceWorker registered successfully, scope:', registration.scope))
            .catch(err => console.error('❌ ServiceWorker registration failed:', err));
    });
}
