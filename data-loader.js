// Initialize database reference
const dbRef = firebase.database().ref('checkData');

// Function to update elements with data from Firebase
function updatePageWithFirebaseData(snapshot) {
  const data = snapshot.val();
  if (!data) {
    console.error("No data found in Firebase!");
    return;
  }

  try {
    // Update last data update information
    const lastUpdate = data.lastUpdate || {};
    document.getElementById('last-update-date').textContent = lastUpdate.date || 'N/A';
    document.getElementById('last-update-time').textContent = lastUpdate.time || 'N/A';
    document.getElementById('next-update-time').textContent = lastUpdate.nextScheduled || 'N/A';

    // Update check status counts
    const status = data.checkStatus || {};
    const ids = {
      'ready-in-office': status.readyInOffice,
      'in-process': status.inProcess,
      'sent-to-chairman': status.sentToChairman,
      'sent-to-secretary': status.sentToSecretary,
      'received-today': status.receivedToday,
      'dispatched-weekend': status.dispatchedWeekend,
      'returned-to-office': status.returnedToOffice
    };

    for (const [id, value] of Object.entries(ids)) {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value ?? '0';
      } else {
        console.warn(`Element with ID '${id}' not found!`);
      }
    }
  } catch (error) {
    console.error("Error updating elements:", error);
  }
}

// Load data when page loads
document.addEventListener('DOMContentLoaded', () => {
  dbRef.once('value')
    .then(updatePageWithFirebaseData)
    .catch(error => {
      console.error("Error fetching data on DOMContentLoaded:", error);
    });
});

// Real-time updates
dbRef.on('value', updatePageWithFirebaseData);
