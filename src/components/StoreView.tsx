import React, { useState } from 'react';
import { StoreCategory, StoreItem, TopBuyer, Coupon } from '../types';
import { useStoreConfig } from '../context/StoreConfigContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { ProductCard } from './ProductCard';
import { TopBuyers } from './TopBuyers';
import { Sparkles, Tag, Copy, Check, Percent, CreditCard, ArrowRight, Package } from 'lucide-react';
import { formatINR } from '../data/storeData';

interface StoreViewProps {
  categories: StoreCategory[];
  items: StoreItem[];
  leaderboard: TopBuyer[];
  couponsList?: Coupon[];
  selectedGamemode?: string;
  onOpenStaff?: () => void;
  isLoading?: boolean;
}

export const StoreView: React.FC<StoreViewProps> = ({
  categories,
  items,
  leaderboard,
  couponsList = [],
  isLoading = false,
}) => {
  const { config } = useStoreConfig();
  const { applyCoupon, setIsCartOpen } = useCart();
  const { success } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Exclude any survival and merch categories
  const validCategories = categories.filter(
    (c) =>
      c.game_mode?.toLowerCase() !== 'survival' &&
      !c.name?.toLowerCase().includes('survival') &&
      c.name?.toLowerCase() !== 'merch'
  );

  const [selectedCategoryName, setSelectedCategoryName] = useState<string>(() => {
    return validCategories[0]?.name || 'Ranks';
  });

  // Filter public (normal) active coupons only — PRIVATE coupons are NEVER shown anywhere on website
  const todayStr = new Date().toISOString().split('T')[0];
  const activePublicCoupons = couponsList.filter((c) => {
    if (c.enabled === false) return false;
    if (c.category === 'private') return false; // Private coupons remain secret
    if (c.expiryDate && c.expiryDate < todayStr) return false;
    if (typeof c.usageLimit === 'number' && c.usageLimit > 0 && (c.usedCount || 0) >= c.usageLimit) return false;
    return true;
  });

  // Keep selected category valid
  React.useEffect(() => {
    if (validCategories.length > 0 && !validCategories.some((c) => c.name === selectedCategoryName)) {
      setSelectedCategoryName(validCategories[0].name);
    }
  }, [validCategories, selectedCategoryName]);

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategoryName(categoryName);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    success(`Copied promo code "${code}" to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleApplyPublicCoupon = (code: string) => {
    const applied = applyCoupon(code);
    if (applied) {
      setIsCartOpen(true);
    }
  };

  // Filter items by category, excluding any survival and merch items
  const filteredItems = items.filter(
    (item) =>
      item.category.toLowerCase() === selectedCategoryName.toLowerCase() &&
      !item.category.toLowerCase().includes('survival') &&
      item.category.toLowerCase() !== 'merch' &&
      item.category !== 'Claim Blocks'
  );

  return (
    <main className="mx-auto max-w-[1100px] px-5 py-8 space-y-10">
      {/* PUBLIC ACTIVE COUPONS BANNER FOR JOINING PLAYERS */}
      {activePublicCoupons.length > 0 && (
        <section aria-label="Available Store Coupons" className="relative overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-r from-surface-deep via-surface to-accent/10 p-5 shadow-xl">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-accent/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground font-black shadow-md shrink-0">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black tracking-tight text-foreground font-display">
                    Active Server Promo Coupons
                  </h3>
                  <span className="rounded-full bg-accent/20 text-accent border border-accent/40 px-2.5 py-0.5 text-[10px] font-extrabold uppercase animate-pulse">
                    ⚡ {activePublicCoupons.length} Available
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use these official store coupon codes at checkout to get instant discounts!
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activePublicCoupons.map((coupon) => {
              const isFixed = coupon.discountType === 'fixed';
              const val = coupon.discountValue ?? (coupon.percent || 10);
              const discountText = isFixed ? `${formatINR(val)} OFF` : `${val}% OFF`;
              const isCopied = copiedCode === coupon.code;

              return (
                <div
                  key={coupon.id || coupon.code}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-surface-deep/90 p-3 hover:border-accent/60 transition-all shadow-sm group"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs text-gold tracking-wider uppercase px-2 py-0.5 rounded bg-surface border border-gold/30">
                        {coupon.code}
                      </span>
                      <span className="text-xs font-black text-accent font-display">
                        {discountText}
                      </span>
                    </div>
                    {coupon.expiryDate && (
                      <span className="text-[10px] text-muted-foreground block truncate">
                        Valid till: {coupon.expiryDate}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyCode(coupon.code)}
                      title="Copy promo code"
                      className="p-1.5 rounded-lg border border-border bg-surface text-muted-foreground hover:text-foreground hover:border-accent/40 transition-colors"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPublicCoupon(coupon.code)}
                      className="rounded-lg bg-accent/20 border border-accent/40 hover:bg-accent hover:text-accent-foreground text-accent text-[11px] font-black uppercase tracking-wider px-2.5 py-1.5 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>Apply</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Category Selection Grid with Custom Gradient Tiles */}
      <section aria-label="Store Categories" className="mb-12">
        <div className="flex items-center gap-2.5 mb-5">
          <Sparkles className="w-5 h-5 text-accent" />
          <h2 className="text-xl font-black tracking-tight text-foreground font-display">
            Select Category
          </h2>
          <span className="text-xs text-muted-foreground ml-auto font-medium">
            {validCategories.length} categories available
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {isLoading && validCategories.length === 0 ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={`cat-skeleton-${idx}`}
                className="flex flex-col items-center justify-center rounded-2xl p-4 text-center min-h-[140px] border border-border bg-surface-deep/40 animate-pulse"
              >
                <div className="relative mb-2.5 flex h-14 w-14 items-center justify-center rounded-full bg-border-strong/20" />
                <div className="h-4 w-16 bg-border-strong/30 rounded mb-2" />
                <div className="h-3 w-20 bg-border-strong/20 rounded" />
              </div>
            ))
          ) : (
            validCategories.map((category, index) => {
              const tileNumber = (index % 6) + 1;
              const isSelected = selectedCategoryName.toLowerCase() === category.name.toLowerCase();

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategoryClick(category.name)}
                  aria-pressed={isSelected}
                  className={`cat-tile cat-tile-${tileNumber} group relative flex flex-col items-center justify-center rounded-2xl p-4 text-center cursor-pointer min-h-[140px] border transition-all duration-300 ${
                    isSelected
                      ? 'ring-2 ring-white/90 scale-[1.03]'
                      : 'hover:scale-[1.02] opacity-90 hover:opacity-100'
                  }`}
                >
                  {/* Category Image Icon */}
                  <div className="relative mb-2.5 flex h-14 w-14 items-center justify-center">
                    <img
                      src={category.image_url || '/store/ranks.png'}
                      alt={category.name}
                      className="h-12 w-12 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-200"
                    />
                  </div>

                  {/* Category Title */}
                  <span className="text-sm font-black tracking-wide text-white drop-shadow-sm font-display mb-1">
                    {category.name}
                  </span>

                  {/* Category Subtitle / Description */}
                  <span className="cat-desc text-[11px] font-semibold line-clamp-1 opacity-90">
                    {category.description}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </section>

      {/* Packages Section */}
      <section aria-label={`${selectedCategoryName} Packages`}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-deep text-accent border border-border">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-foreground font-display">
                {selectedCategoryName.toUpperCase()} PACKAGES
              </h2>
              <p className="text-xs text-muted-foreground">
                Instant delivery on {config.serverIp} with live activation
              </p>
            </div>
          </div>

          <span className="rounded-full bg-surface-deep px-3.5 py-1 text-xs font-bold text-muted-foreground border border-border">
            {isLoading && filteredItems.length === 0 ? (
              <span className="inline-block w-8 h-3 bg-border rounded animate-pulse" />
            ) : (
              `${filteredItems.length} package${filteredItems.length === 1 ? '' : 's'}`
            )}
          </span>
        </div>

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div 
                key={`item-skeleton-${idx}`}
                className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-4 sm:p-5 shadow-panel animate-pulse"
              >
                <div>
                  <div className="relative mb-4 flex h-40 w-full items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-surface-deep/80">
                    <div className="h-28 w-28 rounded-full bg-border-strong/10" />
                  </div>
                  <div className="h-4.5 w-2/3 bg-border-strong/30 rounded mb-3" />
                  <div className="space-y-2">
                    <div className="h-3 w-5/6 bg-border-strong/20 rounded" />
                    <div className="h-3 w-1/2 bg-border-strong/20 rounded" />
                  </div>
                </div>
                <div className="pt-3 border-t border-border/70 mt-6">
                  <div className="flex items-baseline justify-between mb-4">
                    <div className="h-6 w-20 bg-border-strong/30 rounded" />
                    <div className="h-3.5 w-16 bg-border-strong/20 rounded" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-9 bg-surface-deep border border-border/60 rounded-xl" />
                    <div className="h-9 bg-border-strong/20 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-surface p-12 text-center shadow-panel">
            <Package className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
            <h3 className="text-base font-bold text-foreground mb-1">No items available</h3>
            <p className="text-xs text-muted-foreground">
              Check back soon or select another category from the menu above.
            </p>
          </div>
        )}
      </section>

      {/* Top Buyers Leaderboard */}
      <TopBuyers buyers={leaderboard} />
    </main>
  );
};
