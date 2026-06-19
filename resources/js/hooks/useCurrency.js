import { usePage } from '@inertiajs/react';

const CURRENCY_SYMBOLS = {
    LKR: 'Rs ',
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    AUD: 'A$',
    CAD: 'C$',
    SGD: 'S$',
    AED: 'AED ',
    JPY: '¥'
};

export function useCurrency() {
    const { store } = usePage().props;
    const currencyCode = store?.currency || 'LKR';
    const symbol = CURRENCY_SYMBOLS[currencyCode] || 'Rs ';

    const formatCurrency = (amount) => {
        const num = Number(amount) || 0;
        return `${symbol}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return {
        currencyCode,
        symbol,
        formatCurrency
    };
}
