
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
