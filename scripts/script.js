 function parseXMLToTable() {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, "text/xml");
    const gPvnElements = xmlDoc.getElementsByTagName('G_PVN');
    const tableBody = document.getElementById('checksTable');
   // tableBody.innerHTML = '';
                

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


//fetch n store xml data f/t file  
let xmlData = `   <G_PVN>
                            <BNO>1</BNO>
                            <HEAD>2207</HEAD>
                            <PVN>1</PVN>
                            <NARRATION> RAHAM DARAZ DRIVER BISE BANNU</NARRATION>
                            <AMOUNT>28680</AMOUNT>
                            <ENT_DAT>01-FEB-25</ENT_DAT>
                            <CHEQ_NO>4498646</CHEQ_NO>
                            <CHEQ_DATE>03-FEB-25</CHEQ_DATE>
                            <SNO>1</SNO>
                            <DD> </DD>
                            <NAR> TA/DA GENERAL</NAR>
                            </G_PVN> `;
/* async function fetchXMLData() {
  try {
    const response = await fetch('/public/data/data.xml');
    const data = await response.text();
    xmlData = data;
    localStorage.setItem('xmlData', data); // Store XML data in localStorage
    parseXMLToTable();
  } catch (error) {
    console.error('Failed to fetch fresh data:', error);
    // Load from localStorage if fetch fails
    xmlData = localStorage.getItem('xmlData') || '';
    if (xmlData) {
      parseXMLToTable();
    }
  }
} */ async function fetchXMLData() {
  try {
    const response = await fetch('../public/data/data.xml'); // Adjusted path
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.text();
    localStorage.setItem('xmlData', data); // Store XML data
    console.log('Fetched XML:', data); // Debugging
    parseXMLToTable(data);
  } catch (error) {
    console.error('Error fetching XML:', error);
    const storedXML = localStorage.getItem('xmlData');
    if (storedXML) {
      console.log('Loading XML from localStorage');
      parseXMLToTable(storedXML);
    }
  }
}

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
  window.addEventListener('load', () => {
    // Updated path with your repository name
    const swPath = '/accounts.office.cheque.inquiry/scripts/service-worker.js';
    
    navigator.serviceWorker.register(swPath, {
      // Updated scope with your repository name
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
