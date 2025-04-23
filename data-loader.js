// Initialize database reference
const dbRef = firebase.database().ref('checkData');

// Function to update all elements with data from Firebase
function updatePageWithFirebaseData() {
  dbRef.once('value').then((snapshot) => {
    const data = snapshot.val();
    if (!data) return;
    
    // Update last data update information
    document.getElementById('last-update-date').textContent = checkData.lastUpdate.date;
    document.getElementById('last-update-time').textContent = checkData.lastUpdate.time;
    document.getElementById('next-update-time').textContent = checkData.lastUpdate.nextScheduled;
    
    // Update check status counts
    document.getElementById('ready-in-office').textContent = checkData.checkStatus.readyInOffice;
    document.getElementById('in-process').textContent = checkData.checkStatus.inProcess;
    document.getElementById('sent-to-chairman').textContent = checkData.checkStatus.sentToChairman;
    document.getElementById('sent-to-secretary').textContent = checkData.checkStatus.sentToSecretary;
    document.getElementById('received-today').textContent = checkData.checkStatus.receivedToday;
    document.getElementById('dispatched-weekend').textContent = checkData.checkStatus.dispatchedWeekend;
    document.getElementById('returned-to-office').textContent = checkData.checkStatus.returnedToOffice;
  });
}

// Load checkData when page loads
document.addEventListener('DOMContentLoaded', updatePageWithFirebaseData);

// Refresh data when it changes (real-time updates)
dbRef.on('value', (snapshot) => {
  updatePageWithFirebaseData();
});




// Add this to your data-loader.js
dbRef.once('value').then((snapshot) => {
  const data = snapshot.val();
  console.log("Firebase data received:", data);  // Check if data exists
  if (!data) {
    console.error("No data found in Firebase!");
    return;
  }
  
  // Try to update one element and log any errors
  try {
    const readyInOfficeElement = document.getElementById('ready-in-office');
    console.log("Element found:", readyInOfficeElement);  // Check if element exists
    if (readyInOfficeElement) {
      readyInOfficeElement.textContent = data.checkStatus.readyInOffice;
    } else {
      console.error("Element with ID 'ready-in-office' not found!");
    }
  } catch (error) {
    console.error("Error updating element:", error);
  }
  
  // Rest of your update code...
}).catch(error => {
  console.error("Error fetching data:", error);
});
