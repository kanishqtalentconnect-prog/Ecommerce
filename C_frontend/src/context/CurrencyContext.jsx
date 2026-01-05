import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Create the context
export const CurrencyContext = createContext();
const API_KEY = import.meta.env.VITE_EXCHANGE_RATE_API_KEY;
// Currency symbols mapping
const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AUD: 'A$',
  CAD: 'C$',
  SGD: 'S$',
  CNY: '¥',
  JPY: '¥',
  KRW: '₩',
  CHF: 'CHF',
  NGN: '₦',
  ZAR: 'R',
  EGP: 'E£',
  BRL: 'R$',
  NZD: 'NZ$'
};

// Create the provider component
export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('INR');
  const [exchangeRates, setExchangeRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch exchange rates from API
  useEffect(() => {
    const fetchExchangeRates = async () => {
      setLoading(true);
      try {
        // Using ExchangeRate-API (free tier)
        // You would need to sign up for a free API key at https://www.exchangerate-api.com/
        // Replace YOUR_API_KEY with your actual API key
        const response = await axios.get(
          `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/INR`
        );
        
        if (response.data && response.data.conversion_rates) {
          setExchangeRates(response.data.conversion_rates);
        } else {
          setError('Invalid API response format');
        }
      } catch (err) {
        console.error('Failed to fetch exchange rates:', err);
        setError('Failed to fetch exchange rates');
        
        // Fallback to some default rates in case the API fails
        setExchangeRates({
          INR: 1,
          USD: 0.012,
          EUR: 0.011,
          GBP: 0.0095
          // Add more fallback rates as needed
        });
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRates();
    
    // Refresh rates every 24 hours (adjust as needed)
    const intervalId = setInterval(fetchExchangeRates, 24 * 60 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Load saved currency from localStorage if available
  useEffect(() => {
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }
  }, []);

  // Save currency to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('selectedCurrency', currency);
  }, [currency]);

  // Convert a price from INR to the selected currency
  const convertPrice = (priceInINR) => {
    if (!priceInINR || !exchangeRates[currency]) return 0;
    return (priceInINR * exchangeRates[currency]).toFixed(2);
  };

  // Format currency with appropriate symbol
  const formatCurrency = (amount, currencyCode) => {
    if (!amount) return `${CURRENCY_SYMBOLS[currencyCode] || ''}0.00`;
    
    const convertedAmount = convertPrice(amount);
    return `${CURRENCY_SYMBOLS[currencyCode] || ''}${convertedAmount}`;
  };

  return (
    <CurrencyContext.Provider 
      value={{ 
        currency, 
        setCurrency, 
        convertPrice, 
        formatCurrency, 
        exchangeRates,
        loading,
        error 
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

// Custom hook to use the currency context
export const useCurrency = () => useContext(CurrencyContext);