import React, { useState } from 'react';
import { StoreItem } from '../types';
import { useCart } from '../context/CartContext';
import { useSale } from '../context/SaleContext';
import { STORE_CONFIG, formatINR } from '../data/storeData';
import { ShoppingCart, Zap, ChevronDown, ChevronUp, Terminal, Shield } from 'lucide-react';

interface ProductCardProps {
  item: StoreItem;
}

export const ProductCard: React.FC<ProductCardProps> = ({ item }) => {
  const { addItem, startDirectBuy } = useCart();
  const { getItemPricing } = useSale();
  const [showPerks, setShowPerks] = useState(false);

  // Compute sale pricing dynamically
  const { originalPrice, discountedPrice, hasDiscount, discountPercent } = getItemPricing(item);

  // Check if description has perks or HTML
  const isRankOrPerk = item.description.includes('Perks:') || item.description.includes('Commands:');

  // Extract commands if any
  const extractCommands = () => {
    const match = item.description.match(/\/([a-z0-9_]+)/gi);
    return match ? Array.from(new Set(match)) : [];
  };

  const commands = extractCommands();

  return (
    <div className="product-card flex flex-col justify-between rounded-2xl border border-border bg-surface p-4 sm:p-5 shadow-panel transition-all">
      {/* Product Image & Title */}
      <div>
        <div className="relative mb-4 flex h-40 w-full items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-surface-deep">
          {hasDiscount && (
            <span className="absolute top-2.5 right-2.5 rounded-full bg-rose px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-rose-foreground shadow-md animate-pulse">
              -{discountPercent}% OFF
            </span>
          )}

          <img
            src={item.image_url || '/store/ranks.png'}
            alt={item.title}
            className="product-image h-28 w-28 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)] transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/store/ranks.png';
            }}
            loading="lazy"
          />
        </div>

        <h3 className="text-base font-black text-foreground font-display tracking-wide mb-2 line-clamp-1">
          {item.title}
        </h3>

        {/* Description & Perks Toggle */}
        {isRankOrPerk ? (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowPerks(!showPerks)}
              className="flex w-full items-center justify-between rounded-lg border border-border/60 bg-surface-deep px-3 py-1.5 text-xs font-bold text-accent hover:border-border-strong hover:bg-white/5 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                {showPerks ? 'Hide Package Perks' : 'View Package Perks'}
              </span>
              {showPerks ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showPerks && (
              <div className="mt-2 rounded-xl border border-border bg-surface-deep/90 p-3 text-xs text-muted-foreground animate-in fade-in duration-200">
                <div
                  className="prose prose-invert prose-xs text-[11px] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: item.description }}
                />

                {commands.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-border/60">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-foreground flex items-center gap-1 mb-1.5">
                      <Terminal className="w-3 h-3 text-accent-2" />
                      Included Commands:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {commands.map((cmd) => (
                        <span
                          key={cmd}
                          className="rounded bg-black/40 border border-border/40 px-1.5 py-0.5 font-mono text-[10px] text-accent-2 font-bold"
                        >
                          {cmd}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div
            className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4"
            dangerouslySetInnerHTML={{ __html: item.description }}
          />
        )}
      </div>

      {/* Pricing and Action Buttons */}
      <div className="pt-3 border-t border-border/70 mt-auto">
        <div className="flex items-baseline justify-between mb-3.5">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-gold font-display">
              {formatINR(discountedPrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs font-semibold text-muted-foreground line-through">
                {formatINR(originalPrice)}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            One-time / Instant
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => addItem(item)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface-deep py-2.5 text-xs font-extrabold uppercase tracking-wider text-foreground hover:bg-white/5 hover:border-border-strong active:scale-[0.98] transition-all cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-accent" />
            <span>Add to Cart</span>
          </button>

          <button
            type="button"
            onClick={() => startDirectBuy(item)}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-lime py-2.5 text-xs font-black uppercase tracking-wider text-lime-foreground hover:brightness-110 active:scale-[0.98] transition-all shadow-md shadow-lime/10 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-lime-foreground" />
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
