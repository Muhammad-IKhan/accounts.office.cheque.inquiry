document.addEventListener('DOMContentLoaded', function() {
  const statusFilter = document.getElementById('statusFilter');
  const filterIcon = document.getElementById('filterIcon');
  const statusLabel = document.getElementById('statusLabel');
  
  function handleFilterChange() {
    const selectedValue = statusFilter.value;
    if (selectedValue !== 'all') {
      filterIcon.classList.add('filter-active');
    } else {
      filterIcon.classList.remove('filter-active');
    }
    console.log('Filter selected:', selectedValue);
  }
  
  filterIcon.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    statusFilter.focus();
    statusFilter.click();
  });
  
  statusFilter.addEventListener('change', handleFilterChange);
});
