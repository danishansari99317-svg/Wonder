import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartLine, StoreItem, Coupon } from '../types';
import { STORE_CONFIG, VALID_COUPONS, INITIAL_COUPONS, formatINR } from '../data/storeData';
import { useSale } from './SaleContext';
import { useToast } from './ToastContext';

interface CartContextType {
  items: CartLine[];
  addItem: (item: StoreItem, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
  saleDiscount: number;
  couponDiscount: number;
  finalTotal: number;
  username: string;
  setUsername: (name: string) => void;
  couponCode: string;
  couponPercent: number;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isUpiModalOpen: boolean;
  setIsUpiModalOpen: (open: boolean) => void;
  directBuyItem: StoreItem | null;
  setDirectBuyItem: (item: StoreItem | null) => void;
  startDirectBuy: (item: StoreItem) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'wondermc_cart_v1';
const USERNAME_STORAGE_KEY = 'wondermc_username_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { success, error } = useToast();
  const { getItemPricing } = useSale();
  
  const [items, setItems] = useState<CartLine[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY) || localStorage.getItem('minetax_cart_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [username, setUsernameState] = useState<string>(() => {
    try {
      return localStorage.getItem(USERNAME_STORAGE_KEY) || localStorage.getItem('minetax_username_v1') || '';
    } catch {
      return '';
    }
  });

  const [couponCode, setCouponCode] = useState<string>('');
  const [couponPercent, setCouponPercent] = useState<number>(0);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isUpiModalOpen, setIsUpiModalOpen] = useState<boolean>(false);
  const [directBuyItem, setDirectBuyItem] = useState<StoreItem | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const setUsername = useCallback((name: string) => {
    const trimmed = name.trim();
    setUsernameState(trimmed);
    try {
      localStorage.setItem(USERNAME_STORAGE_KEY, trimmed);
    } catch {
      // ignore
    }
  }, []);

  const triggerCartBounce = () => {
    window.dispatchEvent(new CustomEvent('wondermc:cart-add'));
    window.dispatchEvent(new CustomEvent('minetax:cart-add'));
  };

  const addItem = useCallback(
    (item: StoreItem, qty: number = 1) => {
      const pricing = getItemPricing(item);
      setItems((prev) => {
        const existing = prev.find((i) => i.id === item.id);
        if (existing) {
          return prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  qty: i.qty + qty,
                  price: pricing.discountedPrice,
                  originalPrice: pricing.originalPrice,
                  discountPercent: pricing.discountPercent,
                }
              : i
          );
        }
        return [
          ...prev,
          {
            id: item.id,
            name: item.title,
            price: pricing.discountedPrice,
            originalPrice: pricing.originalPrice,
            discountPercent: pricing.discountPercent,
            image: item.image_url,
            qty: Math.max(1, qty),
          },
        ];
      });

      triggerCartBounce();
      success(`Added ${item.title} to cart`);
    },
    [getItemPricing, success]
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQty = useCallback((id: string, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    } else {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, qty } : i))
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const applyCoupon = useCallback((code: string): boolean => {
    const clean = code.trim().toUpperCase();
    if (!clean) return false;

    // Load active coupons list from localStorage
    let currentCoupons: Coupon[] = INITIAL_COUPONS;
    try {
      const saved = localStorage.getItem('wondermc_coupons_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          currentCoupons = parsed;
        }
      }
    } catch {
      // fallback
    }

    const found = currentCoupons.find((c) => c.code.toUpperCase() === clean);

    if (found) {
      // 1. Check enabled status
      if (found.enabled === false) {
        error(`Coupon code "${clean}" is currently disabled by Admin.`);
        return false;
      }

      // 2. Check expiry date if set
      if (found.expiryDate) {
        const todayStr = new Date().toISOString().split('T')[0];
        if (found.expiryDate < todayStr) {
          error(`Coupon "${clean}" expired on ${found.expiryDate}.`);
          return false;
        }
      }

      // 3. Check usage limit if set (> 0)
      if (typeof found.usageLimit === 'number' && found.usageLimit > 0) {
        const used = found.usedCount || 0;
        if (used >= found.usageLimit) {
          error(`Coupon "${clean}" limit reached (${used}/${found.usageLimit} used).`);
          return false;
        }
      }

      const discountType = found.discountType || 'percentage';
      const discountVal = found.discountValue ?? (found.percent || 10);

      setCouponCode(found.code);
      setAppliedCoupon(found);
      setCouponPercent(discountType === 'percentage' ? discountVal : 0);

      const desc = discountType === 'percentage' ? `${discountVal}% OFF` : `${formatINR(discountVal)} OFF`;
      success(`Coupon "${found.code}" applied successfully! (${desc})`);
      return true;
    } else {
      error(`Invalid coupon code: "${code}"`);
      return false;
    }
  }, [success, error]);

  const removeCoupon = useCallback(() => {
    setCouponCode('');
    setCouponPercent(0);
    setAppliedCoupon(null);
  }, []);

  const startDirectBuy = useCallback((item: StoreItem) => {
    setDirectBuyItem(item);
    setIsUpiModalOpen(true);
  }, []);

  const totalCount = items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = items.reduce((sum, i) => sum + (i.originalPrice || i.price) * i.qty, 0);
  const itemsDiscountedTotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const saleDiscount = Math.max(0, subtotal - itemsDiscountedTotal);
  const subtotalAfterSale = itemsDiscountedTotal;

  // Coupon discount logic: Percentage vs Fixed Amount
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'fixed') {
      const fixedVal = appliedCoupon.discountValue || 0;
      couponDiscount = Math.min(subtotalAfterSale, fixedVal);
    } else {
      const pctVal = appliedCoupon.discountValue ?? (appliedCoupon.percent || couponPercent);
      couponDiscount = Math.round(subtotalAfterSale * (pctVal / 100));
    }
  } else if (couponPercent > 0) {
    couponDiscount = Math.round(subtotalAfterSale * (couponPercent / 100));
  }

  const finalTotal = Math.max(0, subtotalAfterSale - couponDiscount);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        totalCount,
        subtotal,
        saleDiscount,
        couponDiscount,
        finalTotal,
        username,
        setUsername,
        couponCode,
        couponPercent,
        applyCoupon,
        removeCoupon,
        isCartOpen,
        setIsCartOpen,
        isUpiModalOpen,
        setIsUpiModalOpen,
        directBuyItem,
        setDirectBuyItem,
        startDirectBuy,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
