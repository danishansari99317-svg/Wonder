import React, { useState, useEffect } from 'react';
import { useCart, MinecraftEdition, formatIgnForEdition } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { STORE_CONFIG, formatINR } from '../data/storeData';
import { X, Trash2, Plus, Minus, Tag, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { EditionSelector } from './EditionSelector';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeItem,
    updateQty,
    clearCart,
    subtotal,
    saleDiscount,
    couponDiscount,
    finalTotal,
    username,
    setUsername,
    edition,
    setEdition,
    couponCode,
    couponPercent,
    applyCoupon,
    removeCoupon,
    setIsUpiModalOpen,
    setDirectBuyItem,
  } = useCart();

  const { error } = useToast();
  const [couponInput, setCouponInput] = useState('');
  const [userIgn, setUserIgn] = useState(username);

  useEffect(() => {
    setUserIgn(username);
  }, [username]);

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (applyCoupon(couponInput)) {
      setCouponInput('');
    }
  };

  const handleEditionChange = (newEd: MinecraftEdition) => {
    setEdition(newEd);
    if (newEd === 'bedrock') {
      setUserIgn((prev) => {
        const trimmed = (prev || username || '').trim();
        if (!trimmed) return '.';
        return trimmed.startsWith('.') ? trimmed : `.${trimmed.replace(/^\.+/, '')}`;
      });
    } else {
      setUserIgn((prev) => (prev || username || '').replace(/^\.+/, ''));
    }
  };

  const handleProceedToUpi = () => {
    const raw = (userIgn || username).trim();
    if (!raw || raw === '.') {
      error('Please enter your Minecraft In-Game Name (IGN) before checking out!');
      return;
    }
    const cleanIgn = formatIgnForEdition(raw, edition);
    setUsername(cleanIgn);
    setDirectBuyItem(null); // Full cart checkout
    setIsCartOpen(false);
    setIsUpiModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-surface border-l border-border shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-5 border-b border-border bg-surface-deep">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-black tracking-tight text-foreground font-display">
                Your Cart ({items.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface border border-transparent hover:border-border transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-surface-deep flex items-center justify-center text-muted-foreground border border-border mb-4">
                  <ShoppingBag className="w-8 h-8 opacity-40" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-1">Your cart is empty</h3>
                <p className="text-xs text-muted-foreground mb-6">
                  Add ranks, coins, or crate keys to get started!
                </p>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="rounded-xl bg-accent px-5 py-2.5 text-xs font-black uppercase tracking-wider text-accent-foreground hover:opacity-90 transition-opacity"
                >
                  Browse Store
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3.5 p-3.5 rounded-xl border border-border bg-surface-deep/80 hover:border-border-strong transition-colors"
                  >
                    <div className="h-14 w-14 rounded-lg bg-surface border border-border/60 flex items-center justify-center overflow-hidden shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-10 w-10 object-contain [image-rendering:pixelated]"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-extrabold text-foreground truncate">
                        {item.name}
                      </h4>
                      <div className="text-xs font-bold text-gold mt-0.5">
                        {formatINR(item.price)} each
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center rounded-lg border border-border bg-surface">
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, item.qty - 1)}
                            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-bold font-mono">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, item.qty + 1)}
                            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Total & Remove */}
                    <div className="flex flex-col items-end justify-between self-stretch">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="text-xs font-black text-foreground font-mono">
                        {formatINR(item.price * item.qty)}
                      </div>
                    </div>
                  </div>
                ))}

                <div className="pt-2 text-right">
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-xs text-muted-foreground hover:text-destructive underline decoration-dotted transition-colors"
                  >
                    Clear all items
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Checkout Footer & Summary */}
          {items.length > 0 && (
            <div className="border-t border-border bg-surface-deep p-5 space-y-4">
              {/* Minecraft Edition & IGN Input */}
              <div className="space-y-2 p-3 rounded-2xl border border-border/80 bg-surface/50">
                <div className="flex items-center justify-between gap-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-foreground font-display">
                    Minecraft IGN <span className="text-destructive">*</span>
                  </label>
                  <EditionSelector
                    size="sm"
                    edition={edition}
                    onChange={handleEditionChange}
                  />
                </div>

                <div className="relative">
                  <input
                    type="text"
                    required
                    value={userIgn}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (edition === 'bedrock' && val && !val.startsWith('.')) {
                        val = `.${val.replace(/^\.+/, '')}`;
                      }
                      setUserIgn(val);
                      setUsername(val);
                    }}
                    placeholder={edition === 'bedrock' ? '.BedrockPlayerName' : 'JavaPlayerName'}
                    className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-xs text-foreground outline-none focus:border-accent font-mono font-semibold placeholder:text-muted-foreground"
                  />
                </div>

                <p className="text-[10.5px] leading-tight font-medium">
                  {edition === 'bedrock' ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span>📱</span>
                      <span>Bedrock Edition: Prefix <strong>'.'</strong> is automatically added to your IGN.</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground flex items-center gap-1">
                      <span>☕</span>
                      <span>Java Edition: Standard PC username (no '.' prefix needed).</span>
                    </span>
                  )}
                </p>
              </div>

              {/* Coupon Code Input */}
              {couponCode ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-success/40 bg-success/10 text-xs">
                  <div className="flex items-center gap-2 text-success font-bold">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Coupon "{couponCode}" applied ({couponPercent > 0 ? `${couponPercent}% OFF` : 'Discount Applied'})</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-muted-foreground hover:text-destructive text-xs underline ml-2"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Coupon code"
                      className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground outline-none focus:border-accent uppercase font-mono placeholder:normal-case placeholder:font-sans placeholder:text-muted-foreground"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-surface px-3.5 py-2 text-xs font-extrabold uppercase text-foreground border border-border hover:border-border-strong hover:bg-white/5 transition-all"
                    >
                      Apply
                    </button>
                  </form>

                  {/* Public Coupons Quick Selection Chips */}
                  {(() => {
                    try {
                      const saved = localStorage.getItem('wondermc_coupons_v1');
                      const list = saved ? JSON.parse(saved) : [];
                      const todayStr = new Date().toISOString().split('T')[0];
                      const publicOnly = list.filter((c: any) => 
                        c.enabled !== false &&
                        c.category !== 'private' &&
                        (!c.expiryDate || c.expiryDate >= todayStr) &&
                        (!c.usageLimit || (c.usedCount || 0) < c.usageLimit)
                      );
                      if (publicOnly.length === 0) return null;
                      return (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          <span className="text-[10px] text-muted-foreground font-medium">Public Codes:</span>
                          {publicOnly.map((c: any) => (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => applyCoupon(c.code)}
                              className="text-[10px] font-mono font-bold text-gold bg-surface border border-gold/30 hover:bg-gold/10 px-2 py-0.5 rounded-md transition-colors"
                            >
                              +{c.code}
                            </button>
                          ))}
                        </div>
                      );
                    } catch {
                      return null;
                    }
                  })()}
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 border-t border-border/60 pt-3 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal:</span>
                  <span className="font-mono">{formatINR(subtotal)}</span>
                </div>

                {STORE_CONFIG.sale.enabled && saleDiscount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>🎃 Halloween Sale ({STORE_CONFIG.sale.percent}% OFF):</span>
                    <span className="font-mono">-{formatINR(saleDiscount)}</span>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Coupon ({couponPercent}% OFF):</span>
                    <span className="font-mono">-{formatINR(couponDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-black text-foreground pt-2 border-t border-border">
                  <span>Total Payable:</span>
                  <span className="text-base text-gold font-display">{formatINR(finalTotal)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <button
                type="button"
                onClick={handleProceedToUpi}
                className="w-full rounded-xl bg-lime py-3 text-xs font-black uppercase tracking-wider text-lime-foreground transition-all duration-200 hover:brightness-110 active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg shadow-lime/20 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Pay with UPI ({formatINR(finalTotal)})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
