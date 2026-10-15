import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import { StoreConfigProvider } from './context/StoreConfigContext';
import { SaleProvider } from './context/SaleContext';
import { CartProvider } from './context/CartContext';
import { TicketProvider } from './context/TicketContext';
import { GamingParticles } from './components/GamingParticles';
import { PumpkinClickEffect } from './components/PumpkinClickEffect';
import { Header } from './components/Header';
import { StoreView } from './components/StoreView';
import { CartDrawer } from './components/CartDrawer';
import { UpiPaymentModal } from './components/UpiPaymentModal';
import { VoteModal } from './components/VoteModal';
import { StaffModal } from './components/StaffModal';
import { StaffPage } from './components/StaffPage';
import { UpdatesPage } from './components/UpdatesPage';
import { HowToJoinPage } from './components/HowToJoinPage';
import { RulesPage } from './components/RulesPage';
import { SupportModal } from './components/SupportModal';
import { LegalModal, LegalDocType } from './components/LegalModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { PublicCouponsModal } from './components/PublicCouponsModal';
import { Footer } from './components/Footer';
import {
  INITIAL_CATEGORIES,
  INITIAL_ITEMS,
  INITIAL_LEADERBOARD,
  INITIAL_STAFF,
  INITIAL_UPDATES,
  INITIAL_SUB_ADMIN_KEYS,
  INITIAL_COUPONS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_VOTE_LINKS,
  INITIAL_CONNECTION_GUIDE,
  INITIAL_RULES_CATEGORIES,
} from './data/storeData';
import { StoreCategory, StoreItem, TopBuyer, StaffMember, ServerUpdate, SubAdminKey, Coupon, ActivityLog, VoteLink, ConnectionGuide, RuleCategory } from './types';
import { sortStaffByHierarchy } from './utils/staffHierarchy';

function MainStoreContent() {
  const [currentView, setCurrentView] = useState<'store' | 'staff' | 'updates' | 'join' | 'rules'>('store');
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<StoreCategory[]>(() => {
    try {
      const saved = localStorage.getItem('wondermc_categories_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_CATEGORIES.filter(
      (c) =>
        c.name.toLowerCase() !== 'merch' &&
        c.game_mode?.toLowerCase() !== 'survival' &&
        !c.name.toLowerCase().includes('survival')
    );
  });

  const [items, setItems] = useState<StoreItem[]>(() => {
    try {
      const saved = localStorage.getItem('wondermc_items_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(
            (i: StoreItem) =>
              i.category.toLowerCase() !== 'merch' &&
              !i.category.toLowerCase().includes('survival') &&
              i.category !== 'Claim Blocks'
          );
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_ITEMS.filter((i) => i.category.toLowerCase() !== 'merch');
  });

  const [leaderboard, setLeaderboard] = useState<TopBuyer[]>(() => {
    try {
      const saved = localStorage.getItem('wondermc_leaderboard_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_LEADERBOARD;
  });

  const [staffList, setStaffList] = useState<StaffMember[]>(() => {
    try {
      const saved = localStorage.getItem('wondermc_staff_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return sortStaffByHierarchy(parsed);
        }
      }
    } catch {
      // fallback
    }
    return sortStaffByHierarchy(INITIAL_STAFF);
  });

  const [updatesList, setUpdatesList] = useState<ServerUpdate[]>(() => {
    try {
      const saved = localStorage.getItem('wondermc_updates_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_UPDATES;
  });

  const [subAdminKeys, setSubAdminKeys] = useState<SubAdminKey[]>(() => {
    try {
      const saved = localStorage.getItem('wondermc_subadmin_keys_v1');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_SUB_ADMIN_KEYS;
  });

  const [couponsList, setCouponsList] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem('wondermc_coupons_v1');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_COUPONS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem('wondermc_activity_logs_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_ACTIVITY_LOGS;
  });
 
  const [voteLinks, setVoteLinks] = useState<VoteLink[]>(() => {
    try {
      const saved = localStorage.getItem('wondermc_vote_links');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [connectionGuide, setConnectionGuide] = useState<ConnectionGuide>(() => {
    try {
      const saved = localStorage.getItem('wondermc_connection_guide_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return INITIAL_CONNECTION_GUIDE;
  });

  const [rulesCategories, setRulesCategories] = useState<RuleCategory[]>(() => {
    try {
      const saved = localStorage.getItem('wondermc_rules_categories_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_RULES_CATEGORIES;
  });

  const handleUpdateActivityLogs = (newLogs: ActivityLog[]) => {
    setActivityLogs(newLogs);
    try {
      localStorage.setItem('wondermc_activity_logs_v1', JSON.stringify(newLogs));
    } catch {
      // ignore
    }
  };

  const handleLogActivity = (action: string, details: string, type: ActivityLog['type'] = 'other', adminName = 'Server Admin') => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      action,
      adminName,
      details,
      timestamp: new Date().toISOString(),
      type,
    };
    setActivityLogs((prev) => {
      const next = [newLog, ...prev].slice(0, 200);
      try {
        localStorage.setItem('wondermc_activity_logs_v1', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Modals state
  const [isVoteOpen, setIsVoteOpen] = useState(false);
  const [isStaffOpen, setIsStaffOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [legalDoc, setLegalDoc] = useState<LegalDocType>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isPublicCouponsOpen, setIsPublicCouponsOpen] = useState(false);

  useEffect(() => {
    if (isLoading) return; // Wait until loaded from Firestore to prevent flashing default initial coupons
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const hasActivePublic = couponsList.some(
        (c) =>
          c.enabled !== false &&
          c.category !== 'private' &&
          (!c.expiryDate || c.expiryDate >= todayStr) &&
          (!c.usageLimit || (c.usedCount || 0) < c.usageLimit)
      );
      if (hasActivePublic) {
        setIsPublicCouponsOpen(true);
      }
    } catch {
      // ignore
    }
  }, [couponsList, isLoading]);

  // Load global state from server and keep it continuously synchronized in real time
  const fetchGlobalState = async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    try {
      const res = await fetch('/api/state?t=' + Date.now());
      if (!res.ok) return;
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return; // Guard against dev server HTML fallback during restarts
      }
      let data: any;
      try {
        data = await res.json();
      } catch {
        return;
      }
      if (!data || typeof data !== 'object') return;

      if (Array.isArray(data.subAdminKeys)) {
        setSubAdminKeys(data.subAdminKeys);
        try { localStorage.setItem('wondermc_subadmin_keys_v1', JSON.stringify(data.subAdminKeys)); } catch {}
      }
      if (Array.isArray(data.items)) {
        const filtered = data.items.filter(
          (i: StoreItem) =>
            i.category?.toLowerCase() !== 'merch' &&
            !i.category?.toLowerCase().includes('survival') &&
            i.category !== 'Claim Blocks'
        );
        setItems(filtered);
        try { localStorage.setItem('wondermc_items_v1', JSON.stringify(filtered)); } catch {}
      }
      if (Array.isArray(data.categories)) {
        const filteredCats = data.categories.filter(
          (c: StoreCategory) =>
            c.name?.toLowerCase() !== 'merch' &&
            c.game_mode?.toLowerCase() !== 'survival' &&
            !c.name?.toLowerCase().includes('survival')
        );
        setCategories(filteredCats);
        try { localStorage.setItem('wondermc_categories_v1', JSON.stringify(filteredCats)); } catch {}
      }
      if (Array.isArray(data.leaderboard)) {
        setLeaderboard(data.leaderboard);
        try { localStorage.setItem('wondermc_leaderboard_v1', JSON.stringify(data.leaderboard)); } catch {}
      }
      if (Array.isArray(data.staffList)) {
        const sorted = sortStaffByHierarchy(data.staffList);
        setStaffList(sorted);
        try { localStorage.setItem('wondermc_staff_v1', JSON.stringify(sorted)); } catch {}
      }
      if (Array.isArray(data.couponsList)) {
        setCouponsList(data.couponsList);
        try { localStorage.setItem('wondermc_coupons_v1', JSON.stringify(data.couponsList)); } catch {}
      }
      if (Array.isArray(data.activityLogs)) {
        setActivityLogs(data.activityLogs);
        try { localStorage.setItem('wondermc_activity_logs_v1', JSON.stringify(data.activityLogs)); } catch {}
      }
      if (Array.isArray(data.updatesList)) {
        setUpdatesList(data.updatesList);
        try { localStorage.setItem('wondermc_updates_v1', JSON.stringify(data.updatesList)); } catch {}
      }
      if (Array.isArray(data.voteLinks)) {
        setVoteLinks(data.voteLinks);
        try { localStorage.setItem('wondermc_vote_links', JSON.stringify(data.voteLinks)); } catch {}
      }
      if (data.connectionGuide) {
        setConnectionGuide(data.connectionGuide);
        try { localStorage.setItem('wondermc_connection_guide_v1', JSON.stringify(data.connectionGuide)); } catch {}
      }
      if (Array.isArray(data.rulesCategories)) {
        setRulesCategories(data.rulesCategories);
        try { localStorage.setItem('wondermc_rules_categories_v1', JSON.stringify(data.rulesCategories)); } catch {}
      }
    } catch {
      // Graceful fallback to cached state, avoid logging unhandled parsing errors
    } finally {
      if (isInitial) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    // 1. Initial immediate fetch from database
    fetchGlobalState(true);

    // 2. Poll every 15 seconds for live multi-user updates (any changes made by another person or admin appear live)
    const interval = setInterval(() => {
      fetchGlobalState(false);
    }, 15000);

    // 3. Immediately re-fetch whenever the user refocuses the browser window or tab
    const handleFocusOrVisible = () => {
      if (!document.hidden) {
        fetchGlobalState(false);
      }
    };
    window.addEventListener('focus', handleFocusOrVisible);
    document.addEventListener('visibilitychange', handleFocusOrVisible);

    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('update') || params.get('page') === 'updates') {
        setCurrentView('updates');
      }
    } catch {
      // ignore
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocusOrVisible);
      document.removeEventListener('visibilitychange', handleFocusOrVisible);
    };
  }, []);

  const syncBackend = async (partialState: Record<string, any>): Promise<boolean> => {
    try {
      const token = sessionStorage.getItem('wondermc_admin_auth_token') || '';
      const res = await fetch('/api/state', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(partialState),
      });
      if (!res.ok) return false;
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return false;
      const data = await res.json().catch(() => null);
      return !!(data && data.success);
    } catch {
      return false;
    }
  };

  // Handlers with persistence
  const handleUpdateStaff = (newStaff: StaffMember[]) => {
    const sorted = sortStaffByHierarchy(newStaff);
    setStaffList(sorted);
    try {
      localStorage.setItem('wondermc_staff_v1', JSON.stringify(sorted));
    } catch {
      // ignore
    }
    syncBackend({ staffList: sorted });
  };

  const handleSaveStaffToBackend = async (overrideStaff?: StaffMember[]): Promise<boolean> => {
    const target = overrideStaff || staffList;
    const sorted = sortStaffByHierarchy(target);
    setStaffList(sorted);
    try {
      localStorage.setItem('wondermc_staff_v1', JSON.stringify(sorted));
    } catch {}
    return await syncBackend({ staffList: sorted });
  };

  const handleUpdateServerUpdates = (newUpdates: ServerUpdate[]) => {
    setUpdatesList(newUpdates);
    syncBackend({ updatesList: newUpdates });
    try {
      localStorage.setItem('wondermc_updates_v1', JSON.stringify(newUpdates));
    } catch {
      // ignore
    }
  };

  const handleUpdateSubAdminKeys = (newKeys: SubAdminKey[]) => {
    setSubAdminKeys(newKeys);
    syncBackend({ subAdminKeys: newKeys });
    try {
      localStorage.setItem('wondermc_subadmin_keys_v1', JSON.stringify(newKeys));
    } catch {
      // ignore
    }
  };

  const handleUpdateCoupons = (newCoupons: Coupon[]) => {
    setCouponsList(newCoupons);
    syncBackend({ couponsList: newCoupons });
    try {
      localStorage.setItem('wondermc_coupons_v1', JSON.stringify(newCoupons));
    } catch {
      // ignore
    }
  };

  const handleUpdateCategories = (newCats: StoreCategory[]) => {
    setCategories(newCats);
    syncBackend({ categories: newCats });
    try {
      localStorage.setItem('wondermc_categories_v1', JSON.stringify(newCats));
    } catch {
      // ignore
    }
  };

  const handleUpdateLeaderboard = (newLead: TopBuyer[]) => {
    const sorted = [...newLead]
      .sort((a, b) => b.total_spent - a.total_spent)
      .map((item, idx) => ({
        ...item,
        rank: idx + 1,
      }));
    setLeaderboard(sorted);
    try {
      localStorage.setItem('wondermc_leaderboard_v1', JSON.stringify(sorted));
    } catch {
      // ignore
    }
    syncBackend({ leaderboard: sorted });
  };

  const handleSaveLeaderboardToBackend = async (overrideLead?: TopBuyer[]): Promise<boolean> => {
    const target = overrideLead || leaderboard;
    const sorted = [...target]
      .sort((a, b) => b.total_spent - a.total_spent)
      .map((item, idx) => ({
        ...item,
        rank: idx + 1,
      }));
    setLeaderboard(sorted);
    try {
      localStorage.setItem('wondermc_leaderboard_v1', JSON.stringify(sorted));
    } catch {}
    return await syncBackend({ leaderboard: sorted });
  };

  const handleUpdateVoteLinks = (newLinks: VoteLink[]) => {
    setVoteLinks(newLinks);
    syncBackend({ voteLinks: newLinks });
    try {
      localStorage.setItem('wondermc_vote_links', JSON.stringify(newLinks));
    } catch {
      // ignore
    }
  };

  const handleUpdateConnectionGuide = (newGuide: ConnectionGuide) => {
    setConnectionGuide(newGuide);
    syncBackend({ connectionGuide: newGuide });
    try {
      localStorage.setItem('wondermc_connection_guide_v1', JSON.stringify(newGuide));
    } catch {}
  };

  const handleUpdateRulesCategories = (newCategories: RuleCategory[]) => {
    setRulesCategories(newCategories);
    syncBackend({ rulesCategories: newCategories });
    try {
      localStorage.setItem('wondermc_rules_categories_v1', JSON.stringify(newCategories));
    } catch {}
  };

  const handleUpdateItems = (newItems: StoreItem[]) => {
    const filtered = newItems.filter(
      (i) =>
        i.category.toLowerCase() !== 'merch' &&
        !i.category.toLowerCase().includes('survival') &&
        i.category !== 'Claim Blocks'
    );
    setItems(filtered);
    syncBackend({ items: filtered });
    try {
      localStorage.setItem('wondermc_items_v1', JSON.stringify(filtered));
    } catch {
      // ignore
    }
  };

  const handleUpdateCategoriesAndItems = (newCats: StoreCategory[], newItems: StoreItem[]) => {
    const filteredCats = newCats.filter(
      (c) =>
        c.name.toLowerCase() !== 'merch' &&
        c.game_mode?.toLowerCase() !== 'survival' &&
        !c.name.toLowerCase().includes('survival')
    );
    const filteredItems = newItems.filter(
      (i) =>
        i.category.toLowerCase() !== 'merch' &&
        !i.category.toLowerCase().includes('survival') &&
        i.category !== 'Claim Blocks'
    );
    setCategories(filteredCats);
    setItems(filteredItems);
    syncBackend({ categories: filteredCats, items: filteredItems });
    try {
      localStorage.setItem('wondermc_categories_v1', JSON.stringify(filteredCats));
      localStorage.setItem('wondermc_items_v1', JSON.stringify(filteredItems));
    } catch {
      // ignore
    }
  };

  return (
    <div className="gaming-background min-h-screen text-foreground relative selection:bg-accent selection:text-accent-foreground font-sans">
      {/* Ambient Minecraft Floating Particles */}
      <GamingParticles />
      <PumpkinClickEffect />

      {/* Header */}
      <Header
        currentView={currentView}
        onSelectView={(view) => setCurrentView(view)}
        onOpenVote={() => setIsVoteOpen(true)}
        onOpenStaff={() => setCurrentView('staff')}
        onOpenSupport={() => setIsSupportOpen(true)}
      />

      {/* Active Page View */}
      <div className="relative z-10">
        {currentView === 'staff' ? (
          <StaffPage
            staffList={staffList}
            onBackToStore={() => setCurrentView('store')}
          />
        ) : currentView === 'updates' ? (
          <UpdatesPage
            updates={updatesList}
            onBackToStore={() => setCurrentView('store')}
          />
        ) : currentView === 'join' ? (
          <HowToJoinPage
            connectionGuide={connectionGuide}
            onBackToStore={() => setCurrentView('store')}
          />
        ) : currentView === 'rules' ? (
          <RulesPage
            rulesCategories={rulesCategories}
            onBackToStore={() => setCurrentView('store')}
          />
        ) : (
          <StoreView
            categories={categories}
            items={items}
            leaderboard={leaderboard}
            couponsList={couponsList}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Footer */}
      <Footer
        onOpenLegal={(type) => setLegalDoc(type)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Slide-out Cart Drawer */}
      <CartDrawer />

      {/* UPI QR Payment Modal */}
      <UpiPaymentModal />

      {/* Navigation Modals */}
      <VoteModal isOpen={isVoteOpen} onClose={() => setIsVoteOpen(false)} voteLinks={voteLinks} />
      <StaffModal
        isOpen={isStaffOpen}
        onClose={() => setIsStaffOpen(false)}
        staffList={staffList}
        onOpenFullPage={() => setCurrentView('staff')}
      />
      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
      <LegalModal type={legalDoc} onClose={() => setLegalDoc(null)} />
      <AdminLoginModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        staffList={staffList}
        onUpdateStaff={handleUpdateStaff}
        onSaveStaffToBackend={handleSaveStaffToBackend}
        leaderboard={leaderboard}
        onUpdateLeaderboard={handleUpdateLeaderboard}
        onSaveLeaderboardToBackend={handleSaveLeaderboardToBackend}
        items={items}
        onUpdateItems={handleUpdateItems}
        categories={categories}
        onUpdateCategories={handleUpdateCategories}
        onUpdateCategoriesAndItems={handleUpdateCategoriesAndItems}
        updatesList={updatesList}
        onUpdateServerUpdates={handleUpdateServerUpdates}
        subAdminKeys={subAdminKeys}
        onUpdateSubAdminKeys={handleUpdateSubAdminKeys}
        couponsList={couponsList}
        onUpdateCoupons={handleUpdateCoupons}
        activityLogs={activityLogs}
        onUpdateActivityLogs={handleUpdateActivityLogs}
        voteLinks={voteLinks}
        onUpdateVoteLinks={handleUpdateVoteLinks}
        onLogActivity={handleLogActivity}
        connectionGuide={connectionGuide}
        onUpdateConnectionGuide={handleUpdateConnectionGuide}
        rulesCategories={rulesCategories}
        onUpdateRulesCategories={handleUpdateRulesCategories}
      />
      <PublicCouponsModal
        isOpen={isPublicCouponsOpen}
        onClose={() => setIsPublicCouponsOpen(false)}
        couponsList={couponsList}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <StoreConfigProvider>
        <SaleProvider>
          <CartProvider>
            <TicketProvider>
              <MainStoreContent />
            </TicketProvider>
          </CartProvider>
        </SaleProvider>
      </StoreConfigProvider>
    </ToastProvider>
  );
}

