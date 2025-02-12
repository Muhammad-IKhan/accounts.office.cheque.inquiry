// serviceWorker.js

export function setupServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/accounts.office.cheque.inquiry/service-worker.js', {
            scope: '/accounts.office.cheque.inquiry/'
        }).catch(error => console.error('SW registration failed:', error));
    }
}
