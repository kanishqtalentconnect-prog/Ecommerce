import { useState, useEffect } from 'react';
import Flag from 'react-world-flags';
import { useCurrency } from '../context/CurrencyContext';

const GlobalCurrencySelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currency, setCurrency, loading, error } = useCurrency();

  // Expanded country list with regional currencies
  const currencies = [
    // Asian
    { code: 'IN', symbol: 'INR', name: 'Indian Rupee', region: 'Asia' },
    { code: 'CN', symbol: 'CNY', name: 'Chinese Yuan', region: 'Asia' },
    { code: 'JP', symbol: 'JPY', name: 'Japanese Yen', region: 'Asia' },
    { code: 'KR', symbol: 'KRW', name: 'South Korean Won', region: 'Asia' },
    { code: 'SG', symbol: 'SGD', name: 'Singapore Dollar', region: 'Asia' },
    
    // European
    { code: 'GB', symbol: 'GBP', name: 'British Pound', region: 'Europe' },
    { code: 'DE', symbol: 'EUR', name: 'Euro', region: 'Europe' },
    { code: 'CH', symbol: 'CHF', name: 'Swiss Franc', region: 'Europe' },
    
    // African
    { code: 'NG', symbol: 'NGN', name: 'Nigerian Naira', region: 'Africa' },
    { code: 'ZA', symbol: 'ZAR', name: 'South African Rand', region: 'Africa' },
    { code: 'EG', symbol: 'EGP', name: 'Egyptian Pound', region: 'Africa' },
    
    // Americas
    { code: 'US', symbol: 'USD', name: 'US Dollar', region: 'Americas' },
    { code: 'CA', symbol: 'CAD', name: 'Canadian Dollar', region: 'Americas' },
    { code: 'BR', symbol: 'BRL', name: 'Brazilian Real', region: 'Americas' },
    
    // Oceania
    { code: 'AU', symbol: 'AUD', name: 'Australian Dollar', region: 'Oceania' },
    { code: 'NZ', symbol: 'NZD', name: 'New Zealand Dollar', region: 'Oceania' }
  ];

  // Group currencies by region
  const groupedCurrencies = currencies.reduce((acc, curr) => {
    if (!acc[curr.region]) acc[curr.region] = [];
    acc[curr.region].push(curr);
    return acc;
  }, {});

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.currency-selector')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-50 currency-selector">
      <div className="relative">
        {/* Flag-only trigger */}
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="cursor-pointer hover:scale-110 transition-transform flex items-center bg-white rounded-full p-1 shadow-lg"
        >
          {loading ? (
            <div className="w-8 h-5 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <Flag 
              code={currencies.find(c => c.symbol === currency)?.code}
              className="w-8 h-5 rounded"
            />
          )}
          <span className="ml-2 mr-1 text-sm font-medium">{currency}</span>
          {loading && (
            <span className="ml-1 text-xs text-gray-500">Loading...</span>
          )}
        </div>

        {isOpen && (
          <div className="absolute bottom-full right-0 mb-4 w-64 bg-white rounded-lg shadow-2xl border max-h-[40vh] overflow-y-auto">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm border-b">
                {error}. Using estimated rates.
              </div>
            )}
            
            {Object.entries(groupedCurrencies).map(([region, regionCurrencies]) => (
              <div key={region}>
                <div className="px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500 sticky top-0">
                  {region}
                </div>
                {regionCurrencies.map((currencyItem) => (
                  <div
                    key={`${currencyItem.code}-${currencyItem.symbol}`}
                    onClick={() => {
                      if (!loading) {
                        setCurrency(currencyItem.symbol);
                        setIsOpen(false);
                      }
                    }}
                    className={`flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer border-t ${
                      loading ? 'opacity-50 cursor-wait' : ''
                    } ${currency === currencyItem.symbol ? 'bg-blue-50' : ''}`}
                  >
                    <Flag code={currencyItem.code} className="w-6 h-4 rounded" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{currencyItem.symbol}</div>
                      <div className="text-xs text-gray-500">{currencyItem.name}</div>
                    </div>
                    {currency === currencyItem.symbol && (
                      <div className="text-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalCurrencySelector;