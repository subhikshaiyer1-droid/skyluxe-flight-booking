// Currency Conversion Utilities for SkyLuxe
// Note: Exchange rates are explicitly labeled as illustrative sample rates for college project demonstration.

export const SAMPLE_EXCHANGE_RATES_BASE_INR = {
  INR: { rate: 1.0, symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  USD: { rate: 86.5, symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  EUR: { rate: 92.2, symbol: '€', name: 'Euro', flag: '🇪🇺' },
  GBP: { rate: 110.4, symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  AED: { rate: 23.55, symbol: 'AED', name: 'UAE Dirham', flag: '🇦🇪' },
  SGD: { rate: 64.8, symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬' },
  THB: { rate: 2.45, symbol: '฿', name: 'Thai Baht', flag: '🇹🇭' },
  JPY: { rate: 0.58, symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
  AUD: { rate: 55.6, symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
  CAD: { rate: 61.2, symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' }
};

export const SUPPORTED_CURRENCIES = Object.keys(SAMPLE_EXCHANGE_RATES_BASE_INR);

// Convert amount between any two supported currencies via base INR
export const convertCurrency = (amount, fromCurrency = 'INR', toCurrency = 'USD') => {
  const num = Number(amount) || 0;
  if (num <= 0) return 0;
  if (fromCurrency === toCurrency) return num;

  const fromInfo = SAMPLE_EXCHANGE_RATES_BASE_INR[fromCurrency] || SAMPLE_EXCHANGE_RATES_BASE_INR.INR;
  const toInfo = SAMPLE_EXCHANGE_RATES_BASE_INR[toCurrency] || SAMPLE_EXCHANGE_RATES_BASE_INR.USD;

  // Amount in INR
  const inrAmount = num * fromInfo.rate;
  // Converted to target currency
  const converted = inrAmount / toInfo.rate;

  return Math.round(converted * 100) / 100;
};

// Format amount with currency symbol
export const formatCurrency = (amount, currencyCode = 'INR') => {
  const info = SAMPLE_EXCHANGE_RATES_BASE_INR[currencyCode] || SAMPLE_EXCHANGE_RATES_BASE_INR.INR;
  const num = Number(amount) || 0;

  if (currencyCode === 'INR') {
    return `₹${Math.round(num).toLocaleString('en-IN')}`;
  } else if (currencyCode === 'JPY') {
    return `¥${Math.round(num).toLocaleString('en-US')}`;
  } else {
    return `${info.symbol} ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
};
