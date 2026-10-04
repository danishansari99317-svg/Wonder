import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useSale } from '../context/SaleContext';
import { useStoreConfig } from '../context/StoreConfigContext';
import { useToast } from '../context/ToastContext';
import { RECENT_PURCHASES_TICKER } from '../data/storeData';
import {
  Copy,
  Check,
  ShoppingBag,
  Shield,
  HeartHandshake,
  Vote as VoteIcon,
  Layers,
  Radio,
  Compass,
  BookOpen,
} from 'lucide-react';

interface HeaderProps {
  currentView?: 'store' | 'staff' | 'updates' | 'join' | 'rules';
  onSelectView?: (view: 'store' | 'staff' | 'updates' | 'join' | 'rules') => void;
  onOpenVote: () => void;
  onOpenStaff: () => void;
  onOpenSupport: () => void;
  selectedGamemode?: string;
  onSelectGamemode?: (mode: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView = 'store',
  onSelectView,
  onOpenVote,
  onOpenStaff,
  onOpenSupport,
}) => {
  const { totalCount, username, setUsername, setIsCartOpen } = useCart();
  const { saleConfig } = useSale();
  const { config } = useStoreConfig();
  const { success, error } = useToast();

  const [copied, setCopied] = useState(false);
  const [cartBouncing, setCartBouncing] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [inputUsername, setInputUsername] = useState(username);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Server status ping state
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);
  const [playersOnline, setPlayersOnline] = useState<number>(18);

  const handleSwitchPage = (page: 'store' | 'staff' | 'updates' | 'join' | 'rules') => {
    if (onSelectView) {
      onSelectView(page);
    } else if (page === 'staff') {
      onOpenStaff();
    }
  };

  useEffect(() => {
    // Listen for cart-add event to trigger animation
    const onCartAdd = () => {
      setCartBouncing(false);
      requestAnimationFrame(() => {
        setCartBouncing(true);
        setTimeout(() => setCartBouncing(false), 450);
      });
    };

    window.addEventListener('wondermc:cart-add', onCartAdd);
    window.addEventListener('minetax:cart-add', onCartAdd);
    return () => {
      window.removeEventListener('wondermc:cart-add', onCartAdd);
      window.removeEventListener('minetax:cart-add', onCartAdd);
    };
  }, []);

  // Ping Minecraft server status
  useEffect(() => {
    let isMounted = true;
    const checkServer = async () => {
      try {
        const res = await fetch(`https://api.mcsrvstat.us/3/${config.serverIp}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setServerOnline(Boolean(data.online));
            if (data.players && typeof data.players.online === 'number') {
              setPlayersOnline(data.players.online);
            }
          }
        } else {
          if (isMounted) setServerOnline(true);
        }
      } catch {
        if (isMounted) setServerOnline(true);
      }
    };

    checkServer();
    const interval = setInterval(checkServer, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [config.serverIp]);

  const handleCopyIp = async () => {
    try {
      await navigator.clipboard.writeText(config.serverIp);
      setCopied(true);
      success(`Copied ${config.serverIp} to clipboard`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      error(`Server IP: ${config.serverIp}`);
    }
  };

  const handleSaveUsername = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputUsername.trim();
    setUsername(clean);
    setIsEditingUsername(false);
    if (clean) {
      success(`Signed in as ${clean}`);
    }
  };

  return (
    <header className="relative z-30">
      {/* Top Sale Bar */}
      {saleConfig.enabled && (
        <div className="flex flex-wrap items-center justify-center gap-3 border-b border-border bg-surface-deep px-5 py-2.5 text-[13px] font-semibold">
          <span className="rounded-full bg-success px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-success-foreground animate-pulse">
            {saleConfig.pill}
          </span>
          <span className="text-muted-foreground">
            <strong className="text-gold font-bold">{saleConfig.highlight}</strong>
            {' — '}
            {saleConfig.text}
          </span>
        </div>
      )}

      {/* Hero Banner with Logo & Badge */}
      <div 
        className="relative flex min-h-[220px] items-center justify-center overflow-hidden bg-transparent"
      >
        <div className="relative z-10 w-full px-5 py-9 text-center">
          <div
            className="inline-block cursor-pointer group"
            onClick={() => handleSwitchPage('store')}
            title="Click to go to Store Home"
          >
            <img
              src="/wondermc-logo.png"
              alt="Wonder MC Minecraft Server Logo"
              width={1349}
              height={362}
              className="mx-auto h-[clamp(85px,13vw,140px)] w-auto drop-shadow-[0_12px_20px_rgba(0,0,0,0.5)] group-hover:scale-[1.02] transition-transform duration-300"
            />
            <span className="mt-2 inline-block rounded bg-gradient-to-br from-accent to-accent-2 px-4 py-1 text-xs font-black uppercase tracking-[0.22em] text-accent-foreground shadow-md shadow-accent/25">
              {currentView === 'staff' 
                ? 'Staff Team' 
                : currentView === 'updates' 
                ? 'Server Updates' 
                : currentView === 'join' 
                ? 'Connection Guide' 
                : currentView === 'rules' 
                ? 'Server Rules' 
                : 'Store'}
            </span>
          </div>
        </div>
      </div>

      {/* Floating Interactive Navigation Bar (Expanded Card Layout) */}
      <nav className="relative z-20 mx-auto -mt-7 max-w-[1150px] rounded-2xl border border-border bg-surface p-4 sm:p-5 shadow-panel">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Left Column: Copy Server IP & Top Page Selector */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-col items-stretch sm:items-start gap-1.5">
              {/* Copy Server IP & Live Player Status */}
              <button
                type="button"
                onClick={handleCopyIp}
                title={`Click to copy ${config.serverIp}`}
                className={`group relative flex items-center gap-2.5 rounded-xl border border-border bg-surface-deep px-4 py-2.5 text-xs sm:text-sm font-extrabold uppercase tracking-wide text-foreground transition-all duration-200 hover:border-border-strong active:scale-95 ${
                  copied ? 'border-success text-success' : ''
                }`}
              >
                <span>{config.serverIp}</span>
                <span className="text-[11px] text-muted-foreground group-hover:text-foreground flex items-center gap-1 font-mono">
                  {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'copied' : 'copy'}
                </span>

                {/* Online Status Pill */}
                <span className="flex items-center gap-1.5 text-[11px] font-extrabold normal-case ml-1 border-l border-border pl-2 text-muted-foreground">
                  <span className="relative flex h-2 w-2">
                    {serverOnline !== false && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                    )}
                    <span
                      className={`relative inline-flex h-2 w-2 rounded-full ${
                        serverOnline === false ? 'bg-destructive' : 'bg-success'
                      }`}
                    />
                  </span>
                  <span>
                    {serverOnline === null
                      ? 'Checking…'
                      : serverOnline
                      ? `${playersOnline} Players Online`
                      : 'Offline'}
                  </span>
                </span>
              </button>

              {/* Dropdown Menu under PLAY.WONDERMC.FUN COPY */}
              <div className="relative w-full">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-between gap-1.5 w-full rounded-lg border border-border bg-surface-deep px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:border-border-strong transition-all cursor-pointer select-none"
                >
                  <span className="flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-sky-400" />
                    Server Connection &amp; Rules Guide
                  </span>
                  <span className="text-[9px] text-muted-foreground font-mono">▼</span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute left-0 mt-1 z-30 w-56 rounded-xl border border-border bg-surface-deep p-1.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
                    <button
                      type="button"
                      onClick={() => {
                        handleSwitchPage('join');
                        setIsDropdownOpen(false);
                      }}
                      className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-xs font-black uppercase text-left text-sky-300 hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <Compass className="w-4 h-4 text-sky-400" />
                      <span>Open Connection Guide</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleSwitchPage('rules');
                        setIsDropdownOpen(false);
                      }}
                      className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-xs font-black uppercase text-left text-rose-300 hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4 text-rose-400" />
                      <span>Open Server Rules</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 🌟 Top Page Selector Tabs & Switcher (Store vs Staff Page) */}
            <div className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-surface-deep p-1 shadow-inner">
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground pl-2 pr-1 select-none">
                <Layers className="w-3 h-3 text-accent" />
                Page:
              </span>

              {/* Store Tab Button */}
              <button
                type="button"
                onClick={() => handleSwitchPage('store')}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-black uppercase tracking-wide transition-all duration-200 cursor-pointer ${
                  currentView === 'store'
                    ? 'bg-gradient-to-r from-accent to-accent-2 text-accent-foreground shadow-md shadow-accent/25 scale-[1.02]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Store</span>
              </button>

              {/* Staff Team Tab Button */}
              <button
                type="button"
                onClick={() => handleSwitchPage('staff')}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-black uppercase tracking-wide transition-all duration-200 cursor-pointer ${
                  currentView === 'staff'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/25 scale-[1.02]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Staff Team</span>
              </button>

              {/* Updates Page Button */}
              <button
                type="button"
                onClick={() => handleSwitchPage('updates')}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-black uppercase tracking-wide transition-all duration-200 cursor-pointer ${
                  currentView === 'updates'
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25 scale-[1.02]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-sky-400" />
                <span>Updates</span>
              </button>
            </div>
          </div>

          {/* Right Column: Action Buttons Row + Support ke theek NICHE Login IGN */}
          <div className="flex flex-col items-start lg:items-end gap-2.5">
            {/* Action Buttons: Vote, Support, Cart */}
            <div className="flex flex-wrap items-center gap-2.5 justify-start lg:justify-end">
              <button
                type="button"
                onClick={onOpenVote}
                className="flex items-center gap-1.5 rounded-xl bg-rose px-4 py-2 text-[13px] font-extrabold uppercase tracking-wide text-rose-foreground transition-transform hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
              >
                <VoteIcon className="w-3.5 h-3.5" />
                Vote
              </button>

              <button
                type="button"
                onClick={onOpenSupport}
                className="flex items-center gap-1.5 rounded-xl border border-border bg-surface-deep px-4 py-2 text-[13px] font-extrabold uppercase tracking-wide text-foreground transition-transform hover:-translate-y-0.5 active:translate-y-0 hover:border-border-strong"
              >
                <HeartHandshake className="w-3.5 h-3.5 text-accent" />
                Support
              </button>

              {/* Cart [N] Button */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                aria-label={`Open Cart, ${totalCount} items`}
                className={`flex items-center gap-2 rounded-xl bg-sky px-4 py-2 text-[13px] font-extrabold uppercase tracking-wide text-sky-foreground transition-transform hover:-translate-y-0.5 active:translate-y-0 shadow-sm ${
                  cartBouncing ? 'cart-bounce ring-2 ring-sky' : ''
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Cart [{totalCount}]</span>
              </button>
            </div>

            {/* 👇 Support & Action Buttons ke theek NICHE: Login / Minecraft IGN */}
            <div className="flex items-center justify-start lg:justify-end w-full">
              {isEditingUsername ? (
                <form
                  onSubmit={handleSaveUsername}
                  className="flex items-center gap-2 rounded-xl border border-accent/40 bg-surface-deep px-3 py-1.5 shadow-sm"
                >
                  <span className="text-[11px] font-bold text-accent uppercase">IGN:</span>
                  <input
                    autoFocus
                    value={inputUsername}
                    onChange={(e) => setInputUsername(e.target.value)}
                    placeholder="Minecraft name"
                    className="w-36 sm:w-44 rounded-lg border border-border bg-surface px-2.5 py-1 text-xs text-foreground outline-none focus:border-accent font-medium"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-accent px-2.5 py-1 text-xs font-extrabold uppercase text-accent-foreground hover:opacity-90"
                  >
                    Set
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingUsername(false)}
                    className="text-xs text-muted-foreground hover:text-foreground px-1 font-semibold"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setInputUsername(username);
                    setIsEditingUsername(true);
                  }}
                  className="flex items-center gap-2.5 rounded-xl border border-border bg-surface-deep px-3 py-1.5 transition-all hover:bg-surface-deep/80 hover:border-accent/50 text-left shadow-xs cursor-pointer group"
                  title="Click to set or change your Minecraft username"
                >
                  <img
                    src={`https://mc-heads.net/avatar/${username || 'steve'}/64`}
                    alt={`${username || 'steve'}'s Minecraft head`}
                    className="h-7 w-7 rounded-md [image-rendering:pixelated] border border-border/60 group-hover:scale-105 transition-transform"
                  />
                  <div>
                    <span className="block text-xs font-extrabold leading-tight text-foreground">
                      {username || 'Login'}
                    </span>
                    <span className="block text-[10px] text-muted-foreground font-medium">
                      {username ? 'Logged in • Click to change' : 'Click to set username'}
                    </span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Live Sliding Server Announcement Bar */}
      <div className="recent-purchases-ticker mt-4 border-y border-amber-500/20 bg-surface-deep/90 backdrop-blur-md shadow-inner" aria-label="Server Announcement">
        <div className="recent-purchases-track py-2.5">
          {[...RECENT_PURCHASES_TICKER, ...RECENT_PURCHASES_TICKER, ...RECENT_PURCHASES_TICKER].map((msg, index) => (
            <span
              key={`${msg}-${index}`}
              className="flex shrink-0 items-center gap-2 px-8 text-xs sm:text-sm font-black tracking-wide text-amber-300 hover:text-amber-200 transition-colors cursor-default"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" aria-hidden="true" />
              <span>{msg}</span>
            </span>
          ))}
        </div>
      </div>
    </header>
  );
};
