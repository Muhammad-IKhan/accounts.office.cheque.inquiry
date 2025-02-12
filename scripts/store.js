// store.js

import { PAGINATION_CONFIG } from './constants.js';

export const store = {
    xmlData: null,
    sortState: {
        currentColumn: null,
        direction: 'asc'
    },
    paginationState: {
        currentPage: 1,
        rowsPerPage: PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
        totalPages: 1
    }
};
