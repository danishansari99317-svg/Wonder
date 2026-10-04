import React, { createContext, useContext, useState, useEffect } from 'react';
import { StoreSaleConfig, StoreItem } from '../types';
import { STORE_CONFIG } from '../data/storeData';

interface SaleContextType {
  saleConfig: StoreSaleConfig;
  updateSaleConfig: (config: StoreSaleConfig) => void;
  getItemPricing: (item: StoreItem) => {
    originalPrice: number;
    discountedPrice: number;
    hasDiscount: boolean;
    discountPercent: number;
    isCustomDiscount: boolean;
  };
}

const SALE_STORAGE_KEY = 'wondermc_sale_config_v1';

const SaleContext = createContext<SaleContextType | undefined>(undefined);

export const SaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [saleConfig, setSaleConfig] = useState<StoreSaleConfig>(() => {
    try {
      const saved = localStorage.getItem(SALE_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return STORE_CONFIG.sale;
  });

  // Fetch live sale configuration from persistent backend on load and keep live-synchronized
  const fetchSale = () => {
    fetch('/api/state?t=' + Date.now())
      .then((res) => res.json())
      .then((data) => {
        if (data && data.saleConfig) {
          setSaleConfig(data.saleConfig);
          try {
            localStorage.setItem(SALE_STORAGE_KEY, JSON.stringify(data.saleConfig));
          } catch {}
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchSale();

    const interval = setInterval(fetchSale, 25000);

    const handleFocus = () => {
      if (!document.hidden) {
        fetchSale();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, []);

  const updateSaleConfig = (newConfig: StoreSaleConfig) => {
    setSaleConfig(newConfig);
    try {
      localStorage.setItem(SALE_STORAGE_KEY, JSON.stringify(newConfig));
    } catch {
      // ignore
    }

    // Persist to server & Firestore for all users
    fetch('/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ saleConfig: newConfig }),
    }).catch(() => {});
  };

  const getItemPricing = (item: StoreItem) => {
    const originalPrice = item.price;
    
    // Check if item has specific custom discount
    if (typeof item.discount_percent === 'number' && item.discount_percent > 0) {
      const pct = Math.min(100, Math.max(0, item.discount_percent));
      const discountedPrice = Math.round(originalPrice * (1 - pct / 100));
      return {
        originalPrice,
        discountedPrice,
        hasDiscount: true,
        discountPercent: pct,
        isCustomDiscount: true,
      };
    }

    // Otherwise check global sale
    if (saleConfig.enabled && saleConfig.percent > 0) {
      const pct = Math.min(100, Math.max(0, saleConfig.percent));
      const discountedPrice = Math.round(originalPrice * (1 - pct / 100));
      return {
        originalPrice,
        discountedPrice,
        hasDiscount: true,
        discountPercent: pct,
        isCustomDiscount: false,
      };
    }

    return {
      originalPrice,
      discountedPrice: originalPrice,
      hasDiscount: false,
      discountPercent: 0,
      isCustomDiscount: false,
    };
  };

  return (
    <SaleContext.Provider
      value={{
        saleConfig,
        updateSaleConfig,
        getItemPricing,
      }}
    >
      {children}
    </SaleContext.Provider>
  );
};

export const useSale = () => {
  const context = useContext(SaleContext);
  if (!context) {
    throw new Error('useSale must be used within a SaleProvider');
  }
  return context;
};
