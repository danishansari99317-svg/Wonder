import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { useStoreConfig } from '../context/StoreConfigContext';
import { StaffMember, TopBuyer, StoreItem, StoreCategory, ServerUpdate, SubAdminKey, Coupon, ActiveAdminSession, AdminTabPermission, ActivityLog, VoteLink, ConnectionGuide, RuleCategory } from '../types';
import { AdminPanelModal } from './AdminPanelModal';
import { X, Lock, KeyRound, Eye, EyeOff, ShieldCheck, Key } from 'lucide-react';

// Strictly configured single secret main owner admin password
const ADMIN_SECURITY_KEY = 'vQ7!mZ2#L9@xR4$kT8^pN6&yW3';

const ALL_PERMISSIONS: AdminTabPermission[] = [
  'staff',
  'supporters',
  'products',
  'discounts',
  'tickets',
  'updates',
  'vote',
  'payment',
  'passwords',
  'settings',
  'activity_log',
];

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: StaffMember[];
  onUpdateStaff: (staff: StaffMember[]) => void;
  onSaveStaffToBackend?: (staff?: StaffMember[]) => Promise<boolean>;
  leaderboard: TopBuyer[];
  onUpdateLeaderboard: (buyers: TopBuyer[]) => void;
  onSaveLeaderboardToBackend?: (buyers?: TopBuyer[]) => Promise<boolean>;
  items: StoreItem[];
  onUpdateItems: (items: StoreItem[]) => void;
  categories: StoreCategory[];
  onUpdateCategories?: (categories: StoreCategory[]) => void;
  onUpdateCategoriesAndItems?: (categories: StoreCategory[], items: StoreItem[]) => void;
  updatesList?: ServerUpdate[];
  onUpdateServerUpdates?: (updates: ServerUpdate[]) => void;
  subAdminKeys?: SubAdminKey[];
  onUpdateSubAdminKeys?: (keys: SubAdminKey[]) => void;
  couponsList?: Coupon[];
  onUpdateCoupons?: (coupons: Coupon[]) => void;
  activityLogs?: ActivityLog[];
  onUpdateActivityLogs?: (logs: ActivityLog[]) => void;
  voteLinks?: VoteLink[];
  onUpdateVoteLinks?: (voteLinks: VoteLink[]) => void;
  onLogActivity?: (action: string, details: string, type?: ActivityLog['type'], adminName?: string) => void;
  connectionGuide?: ConnectionGuide;
  onUpdateConnectionGuide?: (guide: ConnectionGuide) => void;
  rulesCategories?: RuleCategory[];
  onUpdateRulesCategories?: (categories: RuleCategory[]) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  staffList,
  onUpdateStaff,
  onSaveStaffToBackend,
  leaderboard,
  onUpdateLeaderboard,
  onSaveLeaderboardToBackend,
  items,
  onUpdateItems,
  categories,
  onUpdateCategories,
  onUpdateCategoriesAndItems,
  updatesList,
  onUpdateServerUpdates,
  subAdminKeys = [],
  onUpdateSubAdminKeys,
  couponsList = [],
  onUpdateCoupons,
  activityLogs = [],
  onUpdateActivityLogs,
  voteLinks = [],
  onUpdateVoteLinks,
  onLogActivity,
  connectionGuide,
  onUpdateConnectionGuide,
  rulesCategories,
  onUpdateRulesCategories,
}) => {
  const { config } = useStoreConfig();
  const { success, error } = useToast();
  const [passkey, setPasskey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [activeSession, setActiveSession] = useState<ActiveAdminSession | null>(null);

  // Automatically reset authentication whenever the modal closes or opens
  useEffect(() => {
    if (!isOpen) {
      setIsAdminAuth(false);
      setActiveSession(null);
      setPasskey('');
      setShowPassword(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPass = passkey.trim();

    // 1. Check Main Owner Password
    if (cleanPass === ADMIN_SECURITY_KEY) {
      sessionStorage.setItem('wondermc_admin_auth_token', cleanPass);
      const session: ActiveAdminSession = {
        isOwner: true,
        name: 'Main Server Owner',
        permissions: ALL_PERMISSIONS,
      };
      setActiveSession(session);
      setIsAdminAuth(true);
      success(`Authenticated as ${config.brand} Main Owner (Full Access to Coupons, Products, Staff & Settings)!`);
      return;
    }

    // 2. Check Sub-Admin Passwords
    const matchedKey = subAdminKeys.find((k) => k.password.trim() === cleanPass);
    if (matchedKey) {
      if (!matchedKey.permissions || matchedKey.permissions.length === 0) {
        error('Access Restricted: This sub-admin key has no tab permissions assigned.');
        return;
      }

      sessionStorage.setItem('wondermc_admin_auth_token', cleanPass);
      const session: ActiveAdminSession = {
        isOwner: false,
        name: matchedKey.name,
        permissions: matchedKey.permissions,
      };
      setActiveSession(session);
      setIsAdminAuth(true);
      success(`Authenticated as Sub-Admin: ${matchedKey.name}`);
      return;
    }

    // 3. Fallback invalid password
    error('Access Denied: Invalid password or unassigned key.');
  };

  const handleExitAndClose = () => {
    // Immediately terminate session on exit so re-entry requires password
    sessionStorage.removeItem('wondermc_admin_auth_token');
    setIsAdminAuth(false);
    setActiveSession(null);
    setPasskey('');
    setShowPassword(false);
    onClose();
  };

  const handleLogout = () => {
    sessionStorage.removeItem('wondermc_admin_auth_token');
    setIsAdminAuth(false);
    setActiveSession(null);
    setPasskey('');
    setShowPassword(false);
    success('Session ended. Password required to re-enter.');
    onClose();
  };

  if (isAdminAuth && activeSession) {
    return (
      <AdminPanelModal
        isOpen={isOpen}
        onClose={handleExitAndClose}
        staffList={staffList}
        onUpdateStaff={onUpdateStaff}
        onSaveStaffToBackend={onSaveStaffToBackend}
        leaderboard={leaderboard}
        onUpdateLeaderboard={onUpdateLeaderboard}
        onSaveLeaderboardToBackend={onSaveLeaderboardToBackend}
        items={items}
        onUpdateItems={onUpdateItems}
        categories={categories}
        onUpdateCategories={onUpdateCategories}
        onUpdateCategoriesAndItems={onUpdateCategoriesAndItems}
        updatesList={updatesList}
        onUpdateServerUpdates={onUpdateServerUpdates}
        subAdminKeys={subAdminKeys}
        onUpdateSubAdminKeys={onUpdateSubAdminKeys}
        couponsList={couponsList}
        onUpdateCoupons={onUpdateCoupons}
        activityLogs={activityLogs}
        onUpdateActivityLogs={onUpdateActivityLogs}
        voteLinks={voteLinks}
        onUpdateVoteLinks={onUpdateVoteLinks}
        onLogActivity={onLogActivity}
        activeSession={activeSession}
        onLogout={handleLogout}
        connectionGuide={connectionGuide}
        onUpdateConnectionGuide={onUpdateConnectionGuide}
        rulesCategories={rulesCategories}
        onUpdateRulesCategories={onUpdateRulesCategories}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl sm:p-7 my-8">
        <button
          onClick={handleExitAndClose}
          className="absolute top-4 right-4 rounded-xl border border-border bg-surface-deep p-2 text-muted-foreground hover:text-foreground hover:border-border-strong transition-colors"
          aria-label="Close admin modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-border pb-4 mb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-accent border border-accent/30">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-foreground font-display">
              {config.brand} Admin Portal
            </h2>
            <p className="text-xs text-muted-foreground">
              Enter Owner password or Sub-Admin password to login
            </p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5">
              Admin / Role Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder="Enter owner password or role key..."
                autoFocus
                className="w-full rounded-xl border border-border bg-surface-deep pl-9 pr-10 py-2.5 text-xs text-foreground outline-none focus:border-accent font-mono transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="mt-2.5 rounded-xl border border-border/60 bg-surface-deep/60 p-3 space-y-1 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                <span>Multi-Role Password Support Active</span>
              </div>
              <p className="leading-relaxed">
                Log in with Main Owner password for full panel control, or enter your assigned Sub-Admin password for role-specific tab access.
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-accent py-2.5 text-xs font-black uppercase tracking-wider text-accent-foreground hover:opacity-90 transition-opacity font-display cursor-pointer"
          >
            Authenticate &amp; Open Panel
          </button>
        </form>
      </div>
    </div>
  );
};
