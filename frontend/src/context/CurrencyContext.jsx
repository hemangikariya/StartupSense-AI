import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from './AuthContext';

const CurrencyContext = createContext(undefined);

// Supported Currencies Metadata
export const SUPPORTED_CURRENCIES = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', locale: 'en-US' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳', locale: 'en-IN' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺', locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧', locale: 'en-GB' },
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪', locale: 'ar-AE' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦', locale: 'en-CA' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺', locale: 'en-AU' },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬', locale: 'en-SG' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵', locale: 'ja-JP' },
};

// Safe fallback rates against USD
const FALLBACK_RATES = {
  USD: 1.0,
  INR: 86.85,
  EUR: 0.93,
  GBP: 0.79,
  AED: 3.67,
  CAD: 1.38,
  AUD: 1.54,
  SGD: 1.34,
  JPY: 152.40,
};

export const CurrencyProvider = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    return localStorage.getItem('user_currency') || 'USD';
  });
  const [rates, setRates] = useState(FALLBACK_RATES);
  const [loadingRates, setLoadingRates] = useState(true);

  // Fetch exchange rates from backend
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await axios.get(`${API_URL}/currency/rates`);
        if (res.data && res.data.rates) {
          setRates(res.data.rates);
        }
      } catch (err) {
        console.warn('Could not fetch live exchange rates, using fallback rates:', err);
      } finally {
        setLoadingRates(false);
      }
    };
    fetchRates();
  }, []);

  const changeCurrency = (currCode) => {
    const code = currCode.toUpperCase();
    if (SUPPORTED_CURRENCIES[code]) {
      setSelectedCurrency(code);
      localStorage.setItem('user_currency', code);
    }
  };

  /**
   * Converts a canonical USD value to the currently selected currency.
   */
  const convert = (amountUSD) => {
    if (amountUSD === undefined || amountUSD === null || isNaN(Number(amountUSD))) {
      return 0;
    }
    const rate = rates[selectedCurrency] || FALLBACK_RATES[selectedCurrency] || 1.0;
    return Number(amountUSD) * rate;
  };

  /**
   * Formats a canonical USD number into a formatted currency string in the active currency.
   * Options:
   *  - compact: boolean (e.g. ₹1.25 Cr, $1.5M, €500k)
   *  - decimals: number of decimals (default 0 or 2)
   *  - showSymbol: boolean (default true)
   */
  const formatCurrency = (amountUSD, options = {}) => {
    if (amountUSD === undefined || amountUSD === null || isNaN(Number(amountUSD))) {
      return '-';
    }

    const { compact = false, decimals = null, showSymbol = true } = options;
    const num = convert(amountUSD);
    const currMeta = SUPPORTED_CURRENCIES[selectedCurrency] || SUPPORTED_CURRENCIES.USD;
    const sym = showSymbol ? currMeta.symbol : '';

    // Specialized Indian Number Formatting for INR (Lakhs & Crores)
    if (selectedCurrency === 'INR') {
      if (compact) {
        if (Math.abs(num) >= 10000000) {
          const val = (num / 10000000).toFixed(decimals !== null ? decimals : 2);
          return `${sym}${Number(val).toLocaleString('en-IN')} Cr`;
        }
        if (Math.abs(num) >= 100000) {
          const val = (num / 100000).toFixed(decimals !== null ? decimals : 2);
          return `${sym}${Number(val).toLocaleString('en-IN')} Lakh`;
        }
        if (Math.abs(num) >= 1000) {
          const val = (num / 1000).toFixed(decimals !== null ? decimals : 1);
          return `${sym}${Number(val).toLocaleString('en-IN')}k`;
        }
      }
      // Standard full Indian formatting (e.g. ₹1,25,00,000)
      const formatted = num.toLocaleString('en-IN', {
        maximumFractionDigits: decimals !== null ? decimals : (num % 1 === 0 ? 0 : 2),
        minimumFractionDigits: decimals !== null ? decimals : 0
      });
      return `${sym}${formatted}`;
    }

    // Standard International Formatting (USD, EUR, GBP, AED, etc.)
    if (compact) {
      if (Math.abs(num) >= 1000000000) {
        return `${sym}${(num / 1000000000).toFixed(decimals !== null ? decimals : 2)}B`;
      }
      if (Math.abs(num) >= 1000000) {
        return `${sym}${(num / 1000000).toFixed(decimals !== null ? decimals : 2)}M`;
      }
      if (Math.abs(num) >= 1000) {
        return `${sym}${(num / 1000).toFixed(decimals !== null ? decimals : 1)}k`;
      }
    }

    const formatted = num.toLocaleString(currMeta.locale || 'en-US', {
      maximumFractionDigits: decimals !== null ? decimals : (num % 1 === 0 ? 0 : 2),
      minimumFractionDigits: decimals !== null ? decimals : 0
    });
    return `${sym}${formatted}`;
  };

  const getSymbol = () => {
    return SUPPORTED_CURRENCIES[selectedCurrency]?.symbol || '$';
  };

  return (
    <CurrencyContext.Provider
      value={{
        selectedCurrency,
        setCurrency: changeCurrency,
        rates,
        loadingRates,
        convert,
        formatCurrency,
        getSymbol,
        supportedCurrencies: SUPPORTED_CURRENCIES,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
