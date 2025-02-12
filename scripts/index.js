// index.js (main entry point)
import { App } from './app.js';

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.initialize();
});
