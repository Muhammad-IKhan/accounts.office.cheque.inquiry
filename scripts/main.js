// main.js

import { initializeDOMElements } from './domElements.js';
import { initializeEventListeners } from './eventListeners.js';
import { fetchXMLData } from './xmlHandling.js';
import { initializePagination } from './pagination.js';
import { resetTable  } from './tableFunctions.js';

/**
 * Initializes the application
 */
function initializeApplication() {
    console.log('Initializing application...');
    
    initializeDOMElements();
    initializeEventListeners();

    // Wait for DOM before initializing event listeners
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initializeEventListeners();
            startApplication();
        });
    } else {
        initializeEventListeners();
        startApplication();
    }
}

function startApplication() {
    fetchXMLData().then(() => {
        console.log('Initial data fetch complete, resetting table to default state');
        window.resetTable();  //        resetTable();
        initializePagination();
    }).catch(error => {
        console.error('Error during application startup:', error);
    });
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
