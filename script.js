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

/*const xmlData = `<CHEQUE_LIST_DATEWISE>
<!-- Your XML data here -->
</CHEQUE_LIST_DATEWISE>`; */

//fetch n store xml data t/f file  
/* let xmlData = '';
async function fetchXMLData() {
  try {
    const response = await fetch('data.xml');
    const data = await response.text();
    xmlData = data;
    localStorage.setItem('xmlData', data); // Store XML data in localStorage
    parseXMLToTable();
  } catch (error) {
    console.error('Failed to fetch XML data:', error);
    // Load from localStorage if fetch fails
    xmlData = localStorage.getItem('xmlData') || '';
    if (xmlData) {
      parseXMLToTable();
    }
  }
} */


function resetTable() {
    document.getElementById('search').value = '';
    document.getElementById('tableContainer').style.display = 'none';
    document.getElementById('emptyState').style.display = 'block';
    document.getElementById('result').style.display = 'none';
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



// reg servic worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then((registration) => {
      console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
}
