import React, { createContext, useContext, useState, useEffect } from 'react';
import { STORE_CONFIG } from '../data/storeData';

export interface StoreConfigState {
  brand: string;
  brandUpper: string;
  storeName: string;
  tagline: string;
  description: string;
  serverIp: string;
  bedrockPort: string;
  serverName: string;
  website: string;
  discordUrl: string;
  upiId: string;
  upiPayeeName: string;
  customQrUrl: string;
  qrMode: 'dynamic' | 'custom';
  whatsappUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  telegramUrl: string;
  copyright: string;
  // Discord Bot & Webhook Settings
  discordWebhookUrl: string;
  discordWebhookEnabled: boolean;
  discordBotName: string;
  discordAvatarUrl: string;
  discordPingRole: string;
  discordNotifyOnPayment: boolean;
  discordNotifyOnTicket: boolean;
}

const CONFIG_STORAGE_KEY = 'wondermc_store_config_v2';

export const DEFAULT_STORE_CONFIG: StoreConfigState = {
  brand: STORE_CONFIG.brand || 'WonderMC',
  brandUpper: STORE_CONFIG.brandUpper || 'WONDERMC',
  storeName: STORE_CONFIG.storeName || 'WonderMC Store',
  tagline: STORE_CONFIG.tagline || 'Best Indian Minecraft Network',
  description: STORE_CONFIG.description || 'Buy ranks, perks, coins and crate keys for the WonderMC Minecraft server.',
  serverIp: STORE_CONFIG.serverIp || 'play.wondermc.fun',
  bedrockPort: '19132',
  serverName: STORE_CONFIG.serverName || 'Lifesteal',
  website: STORE_CONFIG.website || 'play.wondermc.fun',
  discordUrl: STORE_CONFIG.discordUrl || 'https://discord.gg/ThS4XSJ9bC',
  upiId: STORE_CONFIG.upiId || 'farhanastro@fam',
  upiPayeeName: 'WonderMC Network',
  customQrUrl: '',
  qrMode: 'dynamic',
  whatsappUrl: 'https://wa.me/919931700000',
  instagramUrl: STORE_CONFIG.instagramUrl || 'https://www.instagram.com/wondermc',
  youtubeUrl: STORE_CONFIG.youtubeUrl || 'https://www.youtube.com/@wondermc',
  telegramUrl: 'https://t.me/wondermc',
  copyright: STORE_CONFIG.copyright || '© 2026 WonderMC Network. All Rights Reserved.',
  discordWebhookUrl: '',
  discordWebhookEnabled: true,
  discordBotName: 'WonderMC Store Bot',
  discordAvatarUrl: 'https://mc-heads.net/avatar/MHF_Chest/128',
  discordPingRole: '@here',
  discordNotifyOnPayment: true,
  discordNotifyOnTicket: true,
};

interface StoreConfigContextType {
  config: StoreConfigState;
  updateConfig: (partial: Partial<StoreConfigState>) => void;
  resetConfig: () => void;
}

const StoreConfigContext = createContext<StoreConfigContextType | undefined>(undefined);

export const StoreConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<StoreConfigState>(() => {
    try {
      const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_STORE_CONFIG, ...parsed };
      }
    } catch {
      // fallback
    }
    return DEFAULT_STORE_CONFIG;
  });

  const [isLoaded, setIsLoaded] = useState(false);

  // Load config from persistent backend on load and keep live-synchronized
  const fetchConfig = () => {
    fetch('/api/state?t=' + Date.now())
      .then((res) => res.json())
      .then((data) => {
        if (data && data.config) {
          const mergedConfig = { ...DEFAULT_STORE_CONFIG, ...data.config };
          setConfig(mergedConfig);
          try {
            localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(mergedConfig));
          } catch {}
        }
        setIsLoaded(true);
      })
      .catch(() => {
        setIsLoaded(true);
      });
  };

  useEffect(() => {
    fetchConfig();

    const interval = setInterval(fetchConfig, 25000);

    const handleFocus = () => {
      if (!document.hidden) {
        fetchConfig();
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

  const updateConfig = (partial: Partial<StoreConfigState>) => {
    setConfig((prev) => {
      const next = { ...prev, ...partial };
      try {
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      
      // Post to server if loaded
      const token = sessionStorage.getItem('wondermc_admin_auth_token') || '';
      fetch('/api/state', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ config: next }),
      }).catch(() => {});

      return next;
    });
  };

  const resetConfig = () => {
    setConfig(DEFAULT_STORE_CONFIG);
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(DEFAULT_STORE_CONFIG));
    } catch {
      // ignore
    }

    // Post default to server
    const token = sessionStorage.getItem('wondermc_admin_auth_token') || '';
    fetch('/api/state', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ config: DEFAULT_STORE_CONFIG }),
    }).catch(() => {});
  };

  return (
    <StoreConfigContext.Provider value={{ config, updateConfig, resetConfig }}>
      {children}
    </StoreConfigContext.Provider>
  );
};

export const useStoreConfig = () => {
  const context = useContext(StoreConfigContext);
  if (!context) {
    throw new Error('useStoreConfig must be used within a StoreConfigProvider');
  }
  return context;
};
