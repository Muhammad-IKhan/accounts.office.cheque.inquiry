// constants.js
export const PAGINATION_CONFIG = {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 25, 50]
};

export const TABLE_CONFIG = {
    columns: {
        SNO: { index: 0, type: 'number' },
        NARRATION: { index: 1, type: 'string' },
        AMOUNT: { index: 2, type: 'number' },
        CHEQ_NO: { index: 3, type: 'number' },
        NAR: { index: 4, type: 'string' },
        BNO: { index: 5, type: 'number' },
        PVN: { index: 6, type: 'number' },
        DD: { index: 7, type: 'string' }
    }
};
