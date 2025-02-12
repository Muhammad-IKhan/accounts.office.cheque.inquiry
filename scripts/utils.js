//utils.js
export function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

export function formatAmount(value) {
    try {
        return parseFloat(value).toLocaleString('en-US');
    } catch {
        return '0';
    }
}
