import React, { useState, useEffect } from 'react';
import { useCart, MinecraftEdition, formatIgnForEdition } from '../context/CartContext';
import { useSale } from '../context/SaleContext';
import { useStoreConfig } from '../context/StoreConfigContext';
import { useToast } from '../context/ToastContext';
import { RECENT_PURCHASES_TICKER } from '../data/storeData';
import { EditionSelector } from './EditionSelector';
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
  const { totalCount, username, setUsername, setIsCartOpen, edition, setEdition } = useCart();
  const { saleConfig } = useSale();
  const { config } = useStoreConfig();
  const { success, error } = useToast();

  const [copied, setCopied] = useState(false);
  const [cartBouncing, setCartBouncing] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [inputUsername, setInputUsername] = useState(username);
  const [tempEdition, setTempEdition] = useState<MinecraftEdition>(edition);
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

  const handleOpenEditUsername = () => {
    setInputUsername(username);
    setTempEdition(edition);
    setIsEditingUsername(true);
  };

  const handleToggleTempEdition = (newEd: MinecraftEdition) => {
    setTempEdition(newEd);
    if (newEd === 'bedrock') {
      setInputUsername((prev) => {
        const trimmed = prev.trim();
        if (!trimmed) return '.';
        return trimmed.startsWith('.') ? trimmed : `.${trimmed.replace(/^\.+/, '')}`;
      });
    } else {
      setInputUsername((prev) => prev.replace(/^\.+/, ''));
    }
  };

  const handleSaveUsername = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputUsername.trim();
    if (!clean || clean === '.') {
      setUsername('');
      setIsEditingUsername(false);
      return;
    }
    const formatted = formatIgnForEdition(clean, tempEdition);
    setEdition(tempEdition);
    setUsername(formatted);
    setIsEditingUsername(false);
    success(`Signed in as ${formatted} (${tempEdition === 'bedrock' ? 'Bedrock' : 'Java'})`);
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

      {/* Hero Banner with Exact WonderMC Netlify Logo & Spooky Taglines */}
      <div 
        className="relative flex min-h-[220px] items-center justify-center overflow-hidden bg-transparent pt-6 pb-2"
      >
        <div className="relative z-10 w-full max-w-[1020px] px-4 text-center">
          <div
            className="inline-block cursor-pointer group"
            onClick={() => handleSwitchPage('store')}
            title="Click to go to Store Home"
          >
            {/* The exact WONDER MC Halloween Logo / Banner from wondermc.netlify.app */}
            <img
              src="/img/banner.webp"
              alt="WONDER MC Halloween banner with jack-o-lantern letters, bats, a full moon and a pumpkin graveyard"
              width={1280}
              height={543}
              className="wondermc-banner max-h-[320px] sm:max-h-[380px] w-auto mx-auto object-contain transition-transform duration-300 group-hover:scale-[1.01]"
            />

            {/* Page Context Badge (Shown on sub-pages) */}
            {currentView !== 'store' && (
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <span className="rounded-full bg-orange-600/20 border border-orange-500/40 px-3.5 py-1 font-mono text-xs font-bold text-orange-300 uppercase tracking-wider shadow-sm">
                  {currentView === 'staff' 
                    ? '🎃 Staff Team' 
                    : currentView === 'updates' 
                    ? '🦇 Server Updates' 
                    : currentView === 'join' 
                    ? '👻 Connection Guide' 
                    : '📜 Server Rules'}
                </span>
              </div>
            )}

            {/* Server Tagline */}
            <p className="spooky-tagline text-xs sm:text-sm md:text-base lg:text-lg font-bold tracking-widest uppercase mt-3 sm:mt-3.5 mb-1 text-orange-400 drop-shadow-md">
              PLAY FAIR, STAY RESPECTFUL. ENJOY THE SERVER
            </p>
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
                    ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white shadow-md shadow-orange-500/25 scale-[1.02]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-orange-400" />
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

            {/* 👇 Support & Action Buttons ke theek NICHE: Login / Minecraft IGN + Java & Bedrock Edition Select */}
            <div className="flex items-center justify-start lg:justify-end w-full">
              {isEditingUsername ? (
                <div className="flex flex-col gap-2 rounded-2xl border border-accent/40 bg-surface-deep/95 backdrop-blur-md p-3 shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-150">
                  {/* Java / Bedrock Selection Header */}
                  <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
                    <span className="text-[11px] font-black uppercase text-accent tracking-wider font-display">
                      Select Edition:
                    </span>
                    <EditionSelector
                      size="sm"
                      edition={tempEdition}
                      onChange={handleToggleTempEdition}
                    />
                  </div>

                  {/* Input & Action Buttons */}
                  <form onSubmit={handleSaveUsername} className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        autoFocus
                        value={inputUsername}
                        onChange={(e) => {
                          let val = e.target.value;
                          if (tempEdition === 'bedrock' && val && !val.startsWith('.')) {
                            val = `.${val.replace(/^\.+/, '')}`;
                          }
                          setInputUsername(val);
                        }}
                        placeholder={tempEdition === 'bedrock' ? '.BedrockPlayer' : 'JavaPlayer'}
                        className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-foreground outline-none focus:border-accent font-mono font-semibold"
                      />
                    </div>
                    <button
                      type="submit"
                      className="rounded-xl bg-accent px-3 py-1.5 text-xs font-black uppercase text-accent-foreground hover:opacity-90 transition-all shadow-xs shrink-0 cursor-pointer"
                    >
                      Set IGN
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingUsername(false)}
                      className="rounded-xl border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold shrink-0 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </form>

                  {/* Helpful Dynamic Tip */}
                  <div className="text-[10.5px] leading-tight">
                    {tempEdition === 'bedrock' ? (
                      <p className="text-emerald-400 font-medium flex items-center gap-1">
                        <span>📱</span>
                        <span>Bedrock Edition: Prefix <strong>'.'</strong> automatically added for GeyserMC delivery.</span>
                      </p>
                    ) : (
                      <p className="text-muted-foreground font-medium flex items-center gap-1">
                        <span>☕</span>
                        <span>Java Edition: Standard PC Minecraft username (without '.' prefix).</span>
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Quick Java / Bedrock Toggle Directly on Header */}
                  <div className="hidden sm:inline-flex items-center p-0.5 rounded-xl bg-surface-deep border border-border/80 text-[10px] shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setEdition('java')}
                      title="Switch to Java Edition"
                      className={`px-2 py-1 rounded-lg font-black transition-all cursor-pointer flex items-center gap-1 ${
                        edition === 'java'
                          ? 'bg-accent text-accent-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span>☕</span>
                      <span>Java</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEdition('bedrock')}
                      title="Switch to Bedrock Edition (adds '.' prefix)"
                      className={`px-2 py-1 rounded-lg font-black transition-all cursor-pointer flex items-center gap-1 ${
                        edition === 'bedrock'
                          ? 'bg-emerald-500 text-white shadow-xs ring-1 ring-emerald-400/40'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span>📱</span>
                      <span>Bedrock/PE</span>
                    </button>
                  </div>

                  {/* Main IGN Badge */}
                  <button
                    type="button"
                    onClick={handleOpenEditUsername}
                    className="flex items-center gap-2.5 rounded-xl border border-border bg-surface-deep px-3 py-1.5 transition-all hover:bg-surface-deep/80 hover:border-accent/50 text-left shadow-xs cursor-pointer group"
                    title="Click to set or change your Minecraft username & edition"
                  >
                    <img
                      src={`https://mc-heads.net/avatar/${(username ? username.replace(/^\.+/, '') : 'steve')}/64`}
                      alt={`${username || 'steve'}'s Minecraft head`}
                      className="h-7 w-7 rounded-md [image-rendering:pixelated] border border-border/60 group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://mc-heads.net/avatar/steve/64';
                      }}
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="block text-xs font-black leading-tight text-foreground font-mono">
                          {username || 'Login / Set IGN'}
                        </span>
                        <span
                          className={`text-[9.5px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                            edition === 'bedrock'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-accent/20 text-accent border border-accent/30'
                          }`}
                        >
                          {edition === 'bedrock' ? '📱 Bedrock/PE' : '☕ Java'}
                        </span>
                      </div>
                      <span className="block text-[10px] text-muted-foreground font-medium">
                        {username ? 'Click to change IGN or Edition' : 'Click to set username & edition'}
                      </span>
                    </div>
                  </button>
                </div>
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
