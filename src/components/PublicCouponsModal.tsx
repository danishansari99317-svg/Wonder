import React, { useState, useEffect } from 'react';
import { Coupon } from '../types';
import { Tag, Copy, Check, Sparkles, X, ArrowRight, Gift } from 'lucide-react';
import { formatINR } from '../data/storeData';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

interface PublicCouponsModalProps {
  couponsList: Coupon[];
  isOpen: boolean;
  onClose: () => void;
}

export const PublicCouponsModal: React.FC<PublicCouponsModalProps> = ({
  couponsList,
  isOpen,
  onClose,
}) => {
  const { applyCoupon, setIsCartOpen } = useCart();
  const { success } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const activePublicCoupons = couponsList.filter((c) => {
    if (c.enabled === false) return false;
    if (c.category === 'private') return false; // Private coupons are secret
    if (c.expiryDate && c.expiryDate < todayStr) return false;
    if (typeof c.usageLimit === 'number' && c.usageLimit > 0 && (c.usedCount || 0) >= c.usageLimit) return false;
    return true;
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    success(`Copied promo code "${code}" to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleApply = (code: string) => {
    const applied = applyCoupon(code);
    if (applied) {
      onClose();
      setIsCartOpen(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-lg rounded-3xl border border-accent/40 bg-surface shadow-2xl overflow-hidden p-5 sm:p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-48 h-48 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl border border-border bg-surface-deep text-muted-foreground hover:text-foreground hover:border-accent/40 transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6 pr-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-gold text-accent-foreground font-black shadow-lg shadow-accent/20 shrink-0">
            <Gift className="w-5.5 h-5.5 animate-bounce" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-accent/20 text-accent border border-accent/40 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                ⚡ Welcome Reward
              </span>
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-foreground tracking-tight font-display mt-0.5 break-words">
              Active Store Promo Codes!
            </h2>
          </div>
        </div>

        <p className="text-xs md:text-sm text-muted-foreground mb-6 leading-relaxed">
          Copy these official server discount codes and save big on Ranks, Kits, and Crate Keys at checkout!
        </p>

        {/* Coupons List */}
        {activePublicCoupons.length === 0 ? (
          <div className="text-center py-8 rounded-2xl border border-border bg-surface-deep/50">
            <Tag className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground font-medium">No active public coupons right now. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {activePublicCoupons.map((coupon) => {
              const isFixed = coupon.discountType === 'fixed';
              const val = coupon.discountValue ?? (coupon.percent || 10);
              const discountText = isFixed ? `${formatINR(val)} OFF` : `${val}% OFF`;
              const isCopied = copiedCode === coupon.code;

              return (
                <div
                  key={coupon.id || coupon.code}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-border/80 bg-surface-deep/90 hover:border-accent/60 transition-all shadow-sm group"
                >
                  {/* Coupon Details Section */}
                  <div className="space-y-3 min-w-0 flex-1">
                    {/* Code & Discount Value Header */}
                    <div className="flex items-center justify-between sm:justify-start gap-3">
                      <span className="font-mono font-black text-sm text-gold tracking-widest uppercase px-3 py-1 rounded-lg bg-surface border border-gold/40 shadow-inner">
                        {coupon.code}
                      </span>
                      <span className="text-xs font-black text-accent bg-accent/10 border border-accent/30 px-2.5 py-1 rounded-md shrink-0">
                        {discountText}
                      </span>
                    </div>
                    
                    {/* Expiration Details */}
                    {coupon.expiryDate && (
                      <p className="text-[11px] text-muted-foreground pl-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold/60 shrink-0" />
                        <span>Expires:</span>
                        <span className="text-foreground font-semibold tracking-wide whitespace-nowrap">
                          {coupon.expiryDate}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Coupon Actions Section */}
                  <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto border-t border-border/40 sm:border-t-0 pt-3 sm:pt-0 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyCode(coupon.code)}
                      title="Copy promo code"
                      className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-border bg-surface text-muted-foreground hover:text-foreground hover:border-accent/40 transition-colors flex items-center justify-center gap-1.5 text-xs font-bold shadow-sm"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400 font-bold shrink-0" />
                          <span className="text-emerald-400 font-bold whitespace-nowrap">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 shrink-0" />
                          <span className="whitespace-nowrap">Copy</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleApply(coupon.code)}
                      className="w-full sm:w-auto rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground text-xs font-extrabold uppercase tracking-wider px-4 py-2.5 transition-all shadow-md shadow-accent/20 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span className="whitespace-nowrap">Apply</span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Action */}
        <div className="mt-6 pt-4 border-t border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-[11px] text-muted-foreground leading-relaxed">
            Have a secret private code? You can type it directly in the checkout cart.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto text-center rounded-xl bg-surface-deep px-4 py-2 text-xs font-extrabold text-foreground border border-border hover:border-border-strong transition-all shrink-0"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
