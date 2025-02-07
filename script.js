//script.js
//registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then((registration) => {
      console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
}
// fetching and keeping the XML data data for use local storage instead IndexedDB
fetch('https://muhammad-ikhan.github.io/accounts.office.cheque.inquiry/data.xml')
  .then((response) => response.text())
  .then((data) => {
    // Save XML data to local storage
    localStorage.setItem('xmlData', data);
    console.log('XML data saved to local storage');
  })
  .catch((error) => {
    console.error('Error fetching XML data:', error);
  });

// Retrieve XML data from local storage
const xmlData = localStorage.getItem('xmlData');
if (xmlData) {
  console.log('XML data loaded from local storage:', xmlData);
}

const xmlData = `<CHEQUE_LIST_DATEWISE>
<!-- Your XML data here -->
</CHEQUE_LIST_DATEWISE>`;




async function fetchXMLData() {
    try {
        // Fetch both files concurrently
        const [response1, response2] = await Promise.all([
            fetch('data1.xml'),
            fetch('data2.xml')
        ]);

        if (!response1.ok || !response2.ok) {
            throw new Error('Failed to fetch one or more XML files.');
        }

        // Extract text content
        xmlData1 = await response1.text();
        xmlData2 = await response2.text();

        // Process the fetched data
        console.log('Fetched data1.xml:', xmlData1);
        console.log('Fetched data2.xml:', xmlData2);

        // Call the function to parse XML and update the table
        parseXMLToTable(xmlData1, xmlData2);
    }  catch (error) {
    console.error('Failed to fetch XML data:', error);
    // Load from localStorage if fetch fails
    xmlData = localStorage.getItem('xmlData') || '';
    if (xmlData) {
      parseXMLToTable();
    }
  }
}

function parseXMLToTable(data1, data2) {
    // Example: Combine or process the data
    const xmlData  = `${data1}\n${data2}`;
  localStorage.setItem('xmlData', data); // Store XML data in localStorage

    // Update the table with the combined data
    console.log('Combined XML Data:', xmlData );
    // Your logic to update the table goes here
}
document.addEventListener('DOMContentLoaded', () => {
    fetchXMLData();
    resetTable();
});




function parseXMLToTable() {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, "text/xml");
    const gPvnElements = xmlDoc.getElementsByTagName('G_PVN');
    const tableBody = document.getElementById('checksTable');
    tableBody.innerHTML = '';

    for (let i = 0; i < gPvnElements.length; i++) {
        const row = document.createElement('tr');
        const fields = ['SNO', 'NARRATION', 'AMOUNT', 'CHEQ_NO', 'NAR', 'BNO', 'PVN', 'DD'];
        
        fields.forEach(field => {
            const cell = document.createElement('td');
            let value = gPvnElements[i].getElementsByTagName(field)[0]?.textContent.trim() || '';
            
            if (field === 'AMOUNT') {
                value = parseFloat(value).toLocaleString('en-US');
            }
            
            cell.textContent = value;
            row.appendChild(cell);
        });

        tableBody.appendChild(row);
    }
}

function searchAndFilterXML() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    if (!searchTerm) {
        document.getElementById('tableContainer').style.display = 'none';
        document.getElementById('emptyState').style.display = 'block';
        document.getElementById('result').style.display = 'none';
        return;
    }

    document.getElementById('tableContainer').style.display = 'block';
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('result').style.display = 'block';

    const rows = document.querySelectorAll('#checksTable tr');
    let found = false;

    rows.forEach(row => {
        const cells = row.getElementsByTagName('td');
        const matchesSearch = Array.from(cells).some(cell => 
            cell.textContent.toLowerCase().includes(searchTerm)
        );

        row.style.display = matchesSearch ? '' : 'none';
        if (matchesSearch) found = true;
    });

    const resultContainer = document.getElementById('result');
    resultContainer.innerHTML = found 
        ? `<i class="fas fa-check-circle"></i> Found results for "${searchTerm}"` 
        : '<i class="fas fa-times-circle"></i> No results found.';
}

function resetTable() {
    document.getElementById('search').value = '';
    document.getElementById('tableContainer').style.display = 'none';
    document.getElementById('emptyState').style.display = 'block';
    document.getElementById('result').style.display = 'none';
}

function sortTable(columnName) {
    const table = document.getElementById('chequeTable');
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const columnIndex = {
        'SNO': 0, 'NARRATION': 1, 'AMOUNT': 2, 'CHEQ_NO': 3, 
        'NAR': 4, 'BNO': 5, 'PVN': 6, 'DD': 7
    }[columnName];

    const currentHeader = table.querySelector(`th:nth-child(${columnIndex + 1})`);
    const isAscending = !currentHeader.classList.contains('sort-asc');

    table.querySelectorAll('th').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
    });

    currentHeader.classList.add(isAscending ? 'sort-asc' : 'sort-desc');

    rows.sort((a, b) => {
        const aValue = a.getElementsByTagName('td')[columnIndex].textContent.trim();
        const bValue = b.getElementsByTagName('td')[columnIndex].textContent.trim();

        const isNumeric = ['AMOUNT', 'SNO', 'CHEQ_NO', 'PVN', 'BNO'].includes(columnName);

        if (isNumeric) {
            const aNum = parseFloat(aValue.replace(/,/g, ''));
            const bNum = parseFloat(bValue.replace(/,/g, ''));
            return isAscending ? aNum - bNum : bNum - aNum;
        }

        return isAscending
            ? aValue.localeCompare(bValue, undefined, { numeric: true })
            : bValue.localeCompare(aValue, undefined, { numeric: true });
    });

    rows.forEach(row => tbody.appendChild(row));
}

document.addEventListener('DOMContentLoaded', () => {
    parseXMLToTable();
    resetTable();
});

// Add keyboard support for search
document.getElementById('search').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchAndFilterXML();
    }
});


if (!cachedXMLData) {
    alert('No data available. Please check your internet connection and refresh the page.');
}
