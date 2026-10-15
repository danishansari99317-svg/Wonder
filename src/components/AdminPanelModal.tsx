import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  StaffMember,
  TopBuyer,
  StoreItem,
  StoreCategory,
  SupportTicket,
  ServerUpdate,
  UpdateTag,
  SubAdminKey,
  Coupon,
  ActiveAdminSession,
  AdminTabPermission,
  ActivityLog,
  VoteLink,
  ConnectionGuide,
  RuleCategory,
  RuleItem,
} from '../types';
import { STORE_CONFIG, formatINR, INITIAL_STAFF, INITIAL_LEADERBOARD, INITIAL_ITEMS, INITIAL_COUPONS } from '../data/storeData';
import { useToast } from '../context/ToastContext';
import { useSale } from '../context/SaleContext';
import { useStoreConfig } from '../context/StoreConfigContext';
import { useTickets } from '../context/TicketContext';
import { MinecraftSkinImage } from './MinecraftSkinImage';
import { formatISTDateTime, formatISTRelative } from '../utils/dateUtils';
import {
  sortStaffByHierarchy,
  moveStaffUp,
  moveStaffDown,
  canMoveUpInTier,
  canMoveDownInTier,
} from '../utils/staffHierarchy';
import {
  sendTestDiscordNotification,
  sendOrderApprovedDiscordNotification,
} from '../utils/discordWebhook';
import { optimizeImage } from '../utils/imageOptimizer';
import {
  X,
  Shield,
  Crown,
  UserCheck,
  UserPlus,
  Users,
  Trophy,
  Medal,
  Package,
  Plus,
  FolderPlus,
  Trash2,
  Edit3,
  Check,
  RefreshCw,
  Loader2,
  Search,
  Sliders,
  LogOut,
  Code,
  Pin,
  HeartHandshake,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  Percent,
  Tag,
  Flame,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Image as ImageIcon,
  Link as LinkIcon,
  MessageCircle,
  MessageSquare,
  Send,
  Globe,
  Upload,
  AlertTriangle,
  Smartphone,
  Server,
  Save,
  LifeBuoy,
  ChevronUp,
  ChevronDown,
  ArrowUpToLine,
  ArrowDownToLine,
  ArrowUp,
  ArrowDown,
  MoveUp,
  MoveDown,
  Clock,
  Inbox,
  Filter,
  CheckCheck,
  Bot,
  Bell,
  Radio,
  Zap,
  Key,
  KeyRound,
  Copy,
  Eye,
  EyeOff,
  CreditCard,
  ClipboardList,
  Compass,
  BookOpen,
} from 'lucide-react';

interface AdminPanelModalProps {
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
  activeSession?: ActiveAdminSession;
  onLogout: () => void;
  connectionGuide?: ConnectionGuide;
  onUpdateConnectionGuide?: (guide: ConnectionGuide) => void;
  rulesCategories?: RuleCategory[];
  onUpdateRulesCategories?: (categories: RuleCategory[]) => void;
}

type TabType =
  | 'staff'
  | 'supporters'
  | 'products'
  | 'discounts'
  | 'tickets'
  | 'updates'
  | 'vote'
  | 'payment'
  | 'passwords'
  | 'settings'
  | 'activity_log'
  | 'guide'
  | 'rules';

const ALL_TAB_PERMISSIONS_INFO: { id: TabType; label: string; icon: string; desc: string }[] = [
  { id: 'staff', label: 'Staff Team', icon: '👥', desc: 'Add/edit staff members and rank hierarchy' },
  { id: 'supporters', label: 'Top Supporters', icon: '🏆', desc: 'Manage buyer leaderboard and Minecraft skins' },
  { id: 'products', label: 'Products & Catalog', icon: '📦', desc: 'Manage store packages, prices, and categories' },
  { id: 'discounts', label: 'Coupons & Discounts', icon: '🎟️', desc: 'Create promo codes, discount coupons, and storewide sales' },
  { id: 'tickets', label: 'Support Tickets', icon: '💬', desc: 'View player tickets, reply, and update ticket status' },
  { id: 'updates', label: 'Updates & News', icon: '📢', desc: 'Post server news, patch notes, and announcements' },
  { id: 'vote', label: 'Vote Sites', icon: '🗳️', desc: 'Manage server vote sites, voting directories, and hostname redirects' },
  { id: 'payment', label: 'UPI & Payments', icon: '💳', desc: 'Configure UPI ID, QR Code, and payment instructions' },
  { id: 'passwords', label: 'Sub-Admin Passwords', icon: '🔑', desc: 'Create sub-admin access passwords & tab permissions' },
  { id: 'settings', label: 'Server & Webhooks', icon: '⚙️', desc: 'Configure Server IP, branding, Discord webhooks' },
  { id: 'activity_log', label: 'Activity Audit Log', icon: '📋', desc: 'View admin actions, changes, and audit trail' },
  { id: 'guide', label: 'Connection Guide', icon: '🧭', desc: 'Edit PC/Laptop & mobile connection guide steps' },
  { id: 'rules', label: 'Server Rules', icon: '⚖️', desc: 'Add, edit, or remove rules categories & custom rules' },
];


export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
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
  updatesList: propUpdatesList = [],
  onUpdateServerUpdates,
  subAdminKeys: propSubAdminKeys = [],
  onUpdateSubAdminKeys,
  couponsList: propCouponsList = [],
  onUpdateCoupons,
  activityLogs = [],
  onUpdateActivityLogs,
  voteLinks = [],
  onUpdateVoteLinks,
  onLogActivity,
  activeSession,
  onLogout,
  connectionGuide,
  onUpdateConnectionGuide,
  rulesCategories,
  onUpdateRulesCategories,
}) => {
  const { success, error } = useToast();
  const { config, updateConfig, resetConfig } = useStoreConfig();
  const [activeTab, setActiveTab] = useState<TabType>('staff');
  const [activitySearch, setActivitySearch] = useState('');
  const [activityFilterType, setActivityFilterType] = useState<string>('all');

  const ALL_OWNER_TABS: TabType[] = [
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
    'guide',
    'rules',
  ];

  // Allowed tabs based on active user session (Main Owner gets all 9 tabs)
  const allowedTabs: TabType[] = activeSession?.isOwner
    ? ALL_OWNER_TABS
    : activeSession?.permissions && activeSession.permissions.length > 0
    ? ([
        ...activeSession.permissions,
        ...(activeSession.permissions.includes('settings') ? ['guide', 'rules'] as TabType[] : [])
      ] as TabType[])
    : ALL_OWNER_TABS;

  // Auto switch tab if currently active tab is not permitted
  useEffect(() => {
    if (allowedTabs.length > 0 && !allowedTabs.includes(activeTab)) {
      setActiveTab(allowedTabs[0]);
    }
  }, [allowedTabs, activeTab]);

  // --- SUB-ADMIN KEYS MANAGEMENT STATE ---
  const [subAdminKeysList, setSubAdminKeysList] = useState<SubAdminKey[]>(propSubAdminKeys);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<SubAdminKey | null>(null);
  const [keyName, setKeyName] = useState('');
  const [keyPassword, setKeyPassword] = useState('');
  const [keyPermissions, setKeyPermissions] = useState<AdminTabPermission[]>(['tickets', 'updates']);
  const [showKeyPasswords, setShowKeyPasswords] = useState<Record<string, boolean>>({});

  // --- STORE CATEGORIES MANAGEMENT STATE ---
  const [showCategoryManager, setShowCategoryManager] = useState(true);
  const [isStoreCategoryModalOpen, setIsStoreCategoryModalOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [storeCatNameInput, setStoreCatNameInput] = useState('');
  const [storeCatDescInput, setStoreCatDescInput] = useState('');
  const [storeCatImageInput, setStoreCatImageInput] = useState('/store/ranks.png');
  const [tempCatImage, setTempCatImage] = useState('');

  // --- CONNECTION GUIDE MANAGER STATE ---
  const [guideJavaTitle, setGuideJavaTitle] = useState(connectionGuide?.javaTitle || 'Java Edition');
  const [guideJavaDesc, setGuideJavaDescription] = useState(connectionGuide?.javaDescription || 'For PC and Laptop players');
  const [guideJavaSteps, setGuideJavaSteps] = useState<string[]>(connectionGuide?.javaSteps || []);
  const [guideBedrockTitle, setGuideBedrockTitle] = useState(connectionGuide?.bedrockTitle || 'Bedrock Edition');
  const [guideBedrockDesc, setGuideBedrockDescription] = useState(connectionGuide?.bedrockDescription || 'For MCPE, Mobile, Console & Win 10');
  const [guideBedrockSteps, setGuideBedrockSteps] = useState<string[]>(connectionGuide?.bedrockSteps || []);

  const [newJavaStep, setNewJavaStep] = useState('');
  const [newBedrockStep, setNewBedrockStep] = useState('');

  // --- SERVER RULES MANAGER STATE ---
  const [rulesCats, setRulesCategoriesState] = useState<RuleCategory[]>(rulesCategories || []);
  const [editingCategory, setEditingCategory] = useState<RuleCategory | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [catNameInput, setCatNameInput] = useState('');
  const [catIconInput, setCatIconInput] = useState<'shield' | 'zap' | 'chat' | 'alert'>('shield');

  const [editingRule, setEditingRule] = useState<RuleItem | null>(null);
  const [targetCatIdForRule, setTargetCatIdForRule] = useState<string>('');
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [ruleTitleInput, setRuleTitleInput] = useState('');
  const [ruleDescInput, setRuleDescriptionInput] = useState('');

  // Sync state if props change
  useEffect(() => {
    if (connectionGuide) {
      setGuideJavaTitle(connectionGuide.javaTitle);
      setGuideJavaDescription(connectionGuide.javaDescription);
      setGuideJavaSteps(connectionGuide.javaSteps);
      setGuideBedrockTitle(connectionGuide.bedrockTitle);
      setGuideBedrockDescription(connectionGuide.bedrockDescription);
      setGuideBedrockSteps(connectionGuide.bedrockSteps);
    }
  }, [connectionGuide]);

  useEffect(() => {
    if (rulesCategories) {
      setRulesCategoriesState(rulesCategories);
    }
  }, [rulesCategories]);

  // --- CONNECTION GUIDE HELPERS ---
  const handleSaveConnectionGuide = () => {
    if (!onUpdateConnectionGuide) return;
    onUpdateConnectionGuide({
      javaTitle: guideJavaTitle,
      javaDescription: guideJavaDesc,
      javaSteps: guideJavaSteps,
      bedrockTitle: guideBedrockTitle,
      bedrockDescription: guideBedrockDesc,
      bedrockSteps: guideBedrockSteps,
    });
    onLogActivity?.('Connection Guide Updated', 'Updated server connection instructions for Java & Bedrock', 'settings', activeSession?.name);
    success('Connection guide saved successfully!');
  };

  const handleAddJavaStep = () => {
    const step = newJavaStep.trim();
    if (!step) return;
    setGuideJavaSteps([...guideJavaSteps, step]);
    setNewJavaStep('');
  };

  const handleRemoveJavaStep = (idx: number) => {
    setGuideJavaSteps(guideJavaSteps.filter((_, i) => i !== idx));
  };

  const handleAddBedrockStep = () => {
    const step = newBedrockStep.trim();
    if (!step) return;
    setGuideBedrockSteps([...guideBedrockSteps, step]);
    setNewBedrockStep('');
  };

  const handleRemoveBedrockStep = (idx: number) => {
    setGuideBedrockSteps(guideBedrockSteps.filter((_, i) => i !== idx));
  };

  // --- SERVER RULES HELPERS ---
  const handleSaveRulesCategories = (newCats: RuleCategory[]) => {
    if (!onUpdateRulesCategories) return;
    onUpdateRulesCategories(newCats);
  };

  // Categories CRUD
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCatNameInput('');
    setCatIconInput('shield');
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: RuleCategory) => {
    setEditingCategory(cat);
    setCatNameInput(cat.name);
    setCatIconInput(cat.icon);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const name = catNameInput.trim();
    if (!name) return;

    let updatedList: RuleCategory[] = [];
    if (editingCategory) {
      // Edit
      updatedList = rulesCats.map((c) =>
        c.id === editingCategory.id ? { ...c, name, icon: catIconInput } : c
      );
      onLogActivity?.('Rules Category Edited', `Edited rules category "${name}"`, 'settings', activeSession?.name);
      success(`Category "${name}" updated successfully!`);
    } else {
      // Create
      const newCat: RuleCategory = {
        id: `rules-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name,
        icon: catIconInput,
        rules: [],
      };
      updatedList = [...rulesCats, newCat];
      onLogActivity?.('Rules Category Added', `Added new rules category "${name}"`, 'settings', activeSession?.name);
      success(`Category "${name}" created successfully!`);
    }

    setRulesCategoriesState(updatedList);
    handleSaveRulesCategories(updatedList);
    setIsCategoryModalOpen(false);
  };

  const handleDeleteCategory = (catId: string, catName: string) => {
    if (!confirm(`Are you sure you want to delete the category "${catName}" and all of its rules? This cannot be undone.`)) {
      return;
    }
    const updatedList = rulesCats.filter((c) => c.id !== catId);
    setRulesCategoriesState(updatedList);
    handleSaveRulesCategories(updatedList);
    onLogActivity?.('Rules Category Deleted', `Deleted rules category "${catName}"`, 'settings', activeSession?.name);
    success(`Category "${catName}" deleted successfully.`);
  };

  // Rules CRUD
  const handleOpenAddRule = (catId: string) => {
    setEditingRule(null);
    setTargetCatIdForRule(catId);
    setRuleTitleInput('');
    setRuleDescriptionInput('');
    setIsRuleModalOpen(true);
  };

  const handleOpenEditRule = (catId: string, rule: RuleItem) => {
    setEditingRule(rule);
    setTargetCatIdForRule(catId);
    setRuleTitleInput(rule.title);
    setRuleDescriptionInput(rule.description);
    setIsRuleModalOpen(true);
  };

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    const title = ruleTitleInput.trim();
    const desc = ruleDescInput.trim();
    if (!title || !desc) return;

    const updatedList = rulesCats.map((c) => {
      if (c.id === targetCatIdForRule) {
        let updatedRules: RuleItem[] = [];
        if (editingRule) {
          // Edit rule
          updatedRules = c.rules.map((r) =>
            r.id === editingRule.id ? { ...r, title, description: desc } : r
          );
          onLogActivity?.('Server Rule Edited', `Edited rule "${title}" under "${c.name}"`, 'settings', activeSession?.name);
          success(`Rule updated successfully!`);
        } else {
          // Add rule
          const newRule: RuleItem = {
            id: `rule-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            title,
            description: desc,
          };
          updatedRules = [...c.rules, newRule];
          onLogActivity?.('Server Rule Added', `Added rule "${title}" under "${c.name}"`, 'settings', activeSession?.name);
          success(`Rule added successfully!`);
        }
        return { ...c, rules: updatedRules };
      }
      return c;
    });

    setRulesCategoriesState(updatedList);
    handleSaveRulesCategories(updatedList);
    setIsRuleModalOpen(false);
  };

  const handleDeleteRule = (catId: string, ruleId: string, ruleTitle: string) => {
    if (!confirm(`Are you sure you want to delete the rule "${ruleTitle}"?`)) {
      return;
    }
    const updatedList = rulesCats.map((c) => {
      if (c.id === catId) {
        return { ...c, rules: c.rules.filter((r) => r.id !== ruleId) };
      }
      return c;
    });
    setRulesCategoriesState(updatedList);
    handleSaveRulesCategories(updatedList);
    onLogActivity?.('Server Rule Deleted', `Deleted rule "${ruleTitle}"`, 'settings', activeSession?.name);
    success(`Rule deleted successfully.`);
  };

  const isMatchingCategory = (itemCategory?: string, catName?: string) => {
    if (!itemCategory || !catName) return false;
    const a = itemCategory.trim().toLowerCase();
    const b = catName.trim().toLowerCase();
    if (a === b) return true;
    if ((a === 'crate keys' || a === 'keys') && (b === 'crate keys' || b === 'keys')) return true;
    return a.includes(b) || b.includes(a);
  };

  const handleSaveCategoryImg = (cat: StoreCategory) => {
    const updatedCats = categories.map((c) => (c.id === cat.id ? { ...c, image_url: tempCatImage } : c));

    // Also sync all products in this category
    const updatedItems = items.map((item) => {
      if (isMatchingCategory(item.category, cat.name)) {
        return { ...item, image_url: tempCatImage };
      }
      return item;
    });

    if (onUpdateCategoriesAndItems) {
      onUpdateCategoriesAndItems(updatedCats, updatedItems);
    } else {
      onUpdateCategories?.(updatedCats);
      onUpdateItems?.(updatedItems);
    }

    onLogActivity?.(
      'Category Image Updated',
      `Updated image for category "${cat.name}" and synced products`,
      'product',
      activeSession?.name
    );
    success(`Updated category tile & product images for "${cat.name}" successfully!`);
    setEditingCatId(null);
  };

  const handleOpenAddStoreCategory = () => {
    setEditingCatId(null);
    setStoreCatNameInput('');
    setStoreCatDescInput('');
    setStoreCatImageInput('/store/ranks.png');
    setIsStoreCategoryModalOpen(true);
  };

  const handleOpenEditStoreCategory = (cat: StoreCategory) => {
    setEditingCatId(cat.id);
    setStoreCatNameInput(cat.name);
    setStoreCatDescInput(cat.description || '');
    setStoreCatImageInput(cat.image_url || '/store/ranks.png');
    setIsStoreCategoryModalOpen(true);
  };

  const handleSaveStoreCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = storeCatNameInput.trim();
    if (!trimmedName) {
      error('Please enter category name');
      return;
    }

    let updatedCats: StoreCategory[];
    let updatedItems = [...items];

    if (editingCatId) {
      // Edit existing category
      const targetCat = categories.find((c) => c.id === editingCatId);
      const oldName = targetCat ? targetCat.name : '';

      updatedCats = categories.map((c) =>
        c.id === editingCatId
          ? {
              ...c,
              name: trimmedName,
              description: storeCatDescInput.trim(),
              image_url: storeCatImageInput,
            }
          : c
      );

      // If category name or image changed, sync all products in this category
      updatedItems = items.map((it) => {
        if (isMatchingCategory(it.category, oldName) || isMatchingCategory(it.category, trimmedName)) {
          return {
            ...it,
            category: trimmedName,
            image_url: storeCatImageInput || it.image_url,
          };
        }
        return it;
      });

      onLogActivity?.(
        'Category Updated',
        `Updated category "${trimmedName}" and synced products`,
        'product',
        activeSession?.name
      );
      success(`Category "${trimmedName}" saved successfully!`);
    } else {
      // Add new category
      const newCat: StoreCategory = {
        id: `cat-${Date.now()}`,
        name: trimmedName,
        game_mode: 'Lifesteal',
        description: storeCatDescInput.trim(),
        image_url: storeCatImageInput || '/store/ranks.png',
        display_order: categories.length,
      };
      updatedCats = [...categories, newCat];
      onLogActivity?.(
        'Category Added',
        `Added new category "${trimmedName}"`,
        'product',
        activeSession?.name
      );
      success(`Category "${trimmedName}" created and saved successfully!`);
    }

    if (onUpdateCategoriesAndItems) {
      onUpdateCategoriesAndItems(updatedCats, updatedItems);
    } else {
      onUpdateCategories?.(updatedCats);
      onUpdateItems?.(updatedItems);
    }

    setIsStoreCategoryModalOpen(false);
    setEditingCatId(null);
    setStoreCatNameInput('');
    setStoreCatDescInput('');
    setStoreCatImageInput('/store/ranks.png');
  };

  const handleDeleteStoreCategory = (cat: StoreCategory) => {
    setDeleteConfirm({
      title: `Delete Category "${cat.name}"?`,
      message: `Are you sure you want to delete the category "${cat.name}"? Products in this category will remain, but the category tile will be removed from the homepage.`,
      actionName: 'Delete Category',
      onConfirm: () => {
        const updatedCats = categories.filter((c) => c.id !== cat.id);
        onUpdateCategories?.(updatedCats);
        onLogActivity?.(
          'Category Deleted',
          `Deleted category "${cat.name}"`,
          'product',
          activeSession?.name
        );
        success(`Deleted category "${cat.name}"`);
      },
    });
  };

  useEffect(() => {
    if (propSubAdminKeys) {
      setSubAdminKeysList(propSubAdminKeys);
    }
  }, [propSubAdminKeys]);

  const handleOpenAddKey = () => {
    setEditingKey(null);
    setKeyName('');
    setKeyPassword('');
    setKeyPermissions(['tickets', 'updates']);
    setIsKeyModalOpen(true);
  };

  const handleOpenEditKey = (keyItem: SubAdminKey) => {
    setEditingKey(keyItem);
    setKeyName(keyItem.name);
    setKeyPassword(keyItem.password);
    setKeyPermissions(keyItem.permissions || []);
    setIsKeyModalOpen(true);
  };

  const handleTogglePermission = (perm: AdminTabPermission) => {
    setKeyPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSaveSubAdminKeysListExplicitly = () => {
    try {
      localStorage.setItem('wondermc_subadmin_keys_v1', JSON.stringify(subAdminKeysList));
      if (onUpdateSubAdminKeys) {
        onUpdateSubAdminKeys(subAdminKeysList);
      }
      success('Sub-admin passwords & category access permissions saved successfully!');
    } catch {
      error('Failed to save sub-admin passwords');
    }
  };

  const handleSaveSubAdminKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) {
      error('Please enter a role or key name');
      return;
    }
    if (!keyPassword.trim()) {
      error('Please enter a password for this sub-admin role');
      return;
    }
    if (keyPermissions.length === 0) {
      error('Please select at least 1 allowed category tab permission');
      return;
    }

    let newList: SubAdminKey[];
    if (editingKey) {
      newList = subAdminKeysList.map((k) =>
        k.id === editingKey.id
          ? {
              ...k,
              name: keyName.trim(),
              password: keyPassword.trim(),
              permissions: keyPermissions,
            }
          : k
      );
      onLogActivity?.('Sub-Admin Key Updated', `Updated sub-admin password key for "${keyName.trim()}" (${keyPermissions.length} tabs allowed)`, 'settings', activeSession?.name);
      success(`Updated permissions for Sub-Admin key "${keyName.trim()}"`);
    } else {
      const newKey: SubAdminKey = {
        id: `key-${Date.now()}`,
        name: keyName.trim(),
        password: keyPassword.trim(),
        permissions: keyPermissions,
        createdAt: new Date().toISOString(),
      };
      newList = [...subAdminKeysList, newKey];
      onLogActivity?.('Sub-Admin Key Created', `Created sub-admin password key for "${keyName.trim()}"`, 'settings', activeSession?.name);
      success(`Created new Sub-Admin password for "${keyName.trim()}"`);
    }

    setSubAdminKeysList(newList);
    try {
      localStorage.setItem('wondermc_subadmin_keys_v1', JSON.stringify(newList));
    } catch {
      // ignore
    }
    if (onUpdateSubAdminKeys) {
      onUpdateSubAdminKeys(newList);
    }
    setIsKeyModalOpen(false);
  };

  const handleDeleteSubAdminKey = (id: string, name: string) => {
    setDeleteConfirm({
      title: 'Delete Sub-Admin Password',
      message: `Are you sure you want to remove sub-admin password "${name}"? Anyone logging in with this password will lose access.`,
      actionName: 'Delete Sub-Admin Key',
      onConfirm: () => {
        const newList = subAdminKeysList.filter((k) => k.id !== id);
        setSubAdminKeysList(newList);
        try {
          localStorage.setItem('wondermc_subadmin_keys_v1', JSON.stringify(newList));
        } catch {
          // ignore
        }
        if (onUpdateSubAdminKeys) {
          onUpdateSubAdminKeys(newList);
        }
        onLogActivity?.('Sub-Admin Key Deleted', `Deleted sub-admin password key "${name}"`, 'settings', activeSession?.name);
        success(`Sub-Admin password "${name}" deleted permanently.`);
      },
    });
  };

  const handleCopyPassword = (pass: string) => {
    navigator.clipboard.writeText(pass);
    success('Password copied to clipboard!');
  };

  // --- COUPONS MANAGEMENT STATE ---
  const [couponsList, setCouponsList] = useState<Coupon[]>(() => {
    if (propCouponsList && propCouponsList.length > 0) return propCouponsList;
    try {
      const saved = localStorage.getItem('wondermc_coupons_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_COUPONS;
  });

  useEffect(() => {
    if (propCouponsList) {
      setCouponsList(propCouponsList);
    }
  }, [propCouponsList]);

  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponCategoryInput, setCouponCategoryInput] = useState<'normal' | 'private'>('normal');
  const [couponTypeInput, setCouponTypeInput] = useState<'percentage' | 'fixed'>('percentage');
  const [couponValueInput, setCouponValueInput] = useState<string>('20');
  const [couponExpiryInput, setCouponExpiryInput] = useState<string>('');
  const [couponLimitInput, setCouponLimitInput] = useState<string>('100');
  const [couponEnabledInput, setCouponEnabledInput] = useState<boolean>(true);
  const [couponSearchInput, setCouponSearchInput] = useState<string>('');

  const handleOpenAddCoupon = () => {
    setEditingCoupon(null);
    setCouponCodeInput('');
    setCouponCategoryInput('normal');
    setCouponTypeInput('percentage');
    setCouponValueInput('20');
    setCouponExpiryInput('');
    setCouponLimitInput('100');
    setCouponEnabledInput(true);
    setIsCouponModalOpen(true);
  };

  const handleOpenEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCouponCodeInput(coupon.code);
    setCouponCategoryInput(coupon.category || 'normal');
    setCouponTypeInput(coupon.discountType || 'percentage');
    setCouponValueInput(String(coupon.discountValue ?? coupon.percent ?? 10));
    setCouponExpiryInput(coupon.expiryDate || '');
    setCouponLimitInput(coupon.usageLimit ? String(coupon.usageLimit) : '');
    setCouponEnabledInput(coupon.enabled !== false);
    setIsCouponModalOpen(true);
  };

  const handleToggleCouponEnabled = (couponId: string) => {
    const newList = couponsList.map((c) => {
      const match = (c.id && c.id === couponId) || c.code === couponId;
      if (match) {
        const nextState = !(c.enabled !== false);
        success(`Coupon "${c.code}" is now ${nextState ? 'ENABLED ✅' : 'DISABLED ❌'}`);
        return { ...c, enabled: nextState };
      }
      return c;
    });
    setCouponsList(newList);
    try {
      localStorage.setItem('wondermc_coupons_v1', JSON.stringify(newList));
    } catch {}
    if (onUpdateCoupons) {
      onUpdateCoupons(newList);
    }
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = couponCodeInput.trim().toUpperCase();
    if (!cleanCode) {
      error('Please enter a valid coupon promo code (e.g. SUMMER50)');
      return;
    }
    const numVal = Number(couponValueInput);
    if (isNaN(numVal) || numVal <= 0) {
      error('Please enter a valid discount value greater than 0');
      return;
    }

    const limitVal = couponLimitInput.trim() ? Math.max(0, parseInt(couponLimitInput, 10)) : 0;

    let newList: Coupon[];
    if (editingCoupon) {
      newList = couponsList.map((c) =>
        (c.id && c.id === editingCoupon.id) || c.code === editingCoupon.code
          ? {
              ...c,
              code: cleanCode,
              category: couponCategoryInput,
              discountType: couponTypeInput,
              discountValue: numVal,
              expiryDate: couponExpiryInput.trim() || undefined,
              usageLimit: limitVal > 0 ? limitVal : undefined,
              enabled: couponEnabledInput,
            }
          : c
      );
      onLogActivity?.('Coupon Updated', `Updated coupon "${cleanCode}" (${numVal}${couponTypeInput === 'percentage' ? '%' : '₹'} off)`, 'coupon', activeSession?.name);
      success(`Updated coupon code "${cleanCode}" successfully!`);
    } else {
      if (couponsList.some((c) => c.code.toUpperCase() === cleanCode)) {
        error(`Coupon code "${cleanCode}" already exists!`);
        return;
      }
      const newCoupon: Coupon = {
        id: `coup-${Date.now()}`,
        code: cleanCode,
        category: couponCategoryInput,
        discountType: couponTypeInput,
        discountValue: numVal,
        expiryDate: couponExpiryInput.trim() || undefined,
        usageLimit: limitVal > 0 ? limitVal : undefined,
        usedCount: 0,
        enabled: couponEnabledInput,
        createdAt: new Date().toISOString(),
      };
      newList = [...couponsList, newCoupon];
      onLogActivity?.('Coupon Created', `Created coupon "${cleanCode}" (${numVal}${couponTypeInput === 'percentage' ? '%' : '₹'} off)`, 'coupon', activeSession?.name);
      success(`Created new coupon "${cleanCode}" successfully!`);
    }

    setCouponsList(newList);
    try {
      localStorage.setItem('wondermc_coupons_v1', JSON.stringify(newList));
    } catch {}
    if (onUpdateCoupons) {
      onUpdateCoupons(newList);
    }
    setIsCouponModalOpen(false);
  };

  const handleDeleteCoupon = (coupon: Coupon) => {
    setDeleteConfirm({
      title: 'Delete Coupon Code',
      message: `Are you sure you want to delete coupon code "${coupon.code}"? Players will no longer be able to use it at store checkout.`,
      actionName: 'Delete Coupon',
      onConfirm: () => {
        const newList = couponsList.filter((c) => (c.id && c.id !== coupon.id) || c.code !== coupon.code);
        setCouponsList(newList);
        try {
          localStorage.setItem('wondermc_coupons_v1', JSON.stringify(newList));
        } catch {}
        if (onUpdateCoupons) {
          onUpdateCoupons(newList);
        }
        onLogActivity?.('Coupon Deleted', `Deleted coupon "${coupon.code}"`, 'coupon', activeSession?.name);
        success(`Coupon "${coupon.code}" deleted permanently.`);
      },
    });
  };

  const handleSaveCouponsExplicitly = () => {
    try {
      localStorage.setItem('wondermc_coupons_v1', JSON.stringify(couponsList));
      if (onUpdateCoupons) {
        onUpdateCoupons(couponsList);
      }
      success('All Coupons & Promo Codes saved successfully!');
    } catch {
      error('Failed to save coupons list.');
    }
  };

  // --- UPDATES STATE ---
  const [updatesList, setUpdatesList] = useState<ServerUpdate[]>(propUpdatesList);
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<ServerUpdate | null>(null);

  // Update Form fields
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateTag, setUpdateTag] = useState<UpdateTag>('Announcement');
  const [updateAuthor, setUpdateAuthor] = useState('WonderMC Admin');
  const [updateContent, setUpdateContent] = useState('');
  const [updateImageUrls, setUpdateImageUrls] = useState<string[]>(['']);
  const [updatePinned, setUpdatePinned] = useState(false);
  const [updateSearch, setUpdateSearch] = useState('');

  useEffect(() => {
    if (propUpdatesList) {
      setUpdatesList(propUpdatesList);
    }
  }, [propUpdatesList]);

  const handleOpenAddUpdate = () => {
    setEditingUpdate(null);
    setUpdateTitle('');
    setUpdateTag('Announcement');
    setUpdateAuthor('WonderMC Admin');
    setUpdateContent('');
    setUpdateImageUrls(['']);
    setUpdatePinned(false);
    setIsUpdateFormOpen(true);
  };

  const handleOpenEditUpdate = (upd: ServerUpdate) => {
    setEditingUpdate(upd);
    setUpdateTitle(upd.title);
    setUpdateTag(upd.tag);
    setUpdateAuthor(upd.author || 'WonderMC Admin');
    setUpdateContent(upd.content);

    let initialImgs: string[] = [];
    if (upd.imageUrls && Array.isArray(upd.imageUrls) && upd.imageUrls.length > 0) {
      initialImgs = [...upd.imageUrls];
    } else if (upd.imageUrl) {
      initialImgs = [upd.imageUrl];
    }
    if (initialImgs.length === 0) initialImgs = [''];
    setUpdateImageUrls(initialImgs);
    setUpdatePinned(!!upd.pinned);
    setIsUpdateFormOpen(true);
  };

  const handleAddImageSlot = () => {
    setUpdateImageUrls((prev) => [...prev, '']);
  };

  const handleUpdateImageSlot = (index: number, val: string) => {
    setUpdateImageUrls((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleRemoveImageSlot = (index: number) => {
    setUpdateImageUrls((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length === 0 ? [''] : next;
    });
  };

  const handleSlotGalleryUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      error('File size exceeds 8MB limit!');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      handleUpdateImageSlot(index, reader.result as string);
      success(`Image #${index + 1} uploaded!`);
    };
    reader.onerror = () => {
      error('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateTitle.trim()) {
      error('Please enter update title');
      return;
    }
    if (!updateContent.trim()) {
      error('Please enter update message / content');
      return;
    }

    const validImages = updateImageUrls.map((u) => u.trim()).filter((u) => u.length > 0);

    let newList: ServerUpdate[];
    if (editingUpdate) {
      newList = updatesList.map((u) =>
        u.id === editingUpdate.id
          ? {
              ...u,
              title: updateTitle.trim(),
              tag: updateTag,
              author: updateAuthor.trim() || 'WonderMC Admin',
              content: updateContent.trim(),
              imageUrl: validImages[0] || undefined,
              imageUrls: validImages.length > 0 ? validImages : undefined,
              pinned: updatePinned,
            }
          : u
      );
      success('Server update modified!');
    } else {
      const newUpdate: ServerUpdate = {
        id: `upd-${Date.now()}`,
        title: updateTitle.trim(),
        tag: updateTag,
        author: updateAuthor.trim() || 'WonderMC Admin',
        content: updateContent.trim(),
        imageUrl: validImages[0] || undefined,
        imageUrls: validImages.length > 0 ? validImages : undefined,
        pinned: updatePinned,
        createdAt: new Date().toISOString(),
      };
      newList = [newUpdate, ...updatesList];
      success('New update published! IST timestamp logged.');
    }

    setUpdatesList(newList);
    if (onUpdateServerUpdates) {
      onUpdateServerUpdates(newList);
    }
    setIsUpdateFormOpen(false);
  };

  const handleDeleteUpdate = (id: string, title: string) => {
    setDeleteConfirm({
      title: 'Delete Server Update',
      message: `Are you sure you want to delete update "${title}"? This cannot be undone.`,
      actionName: 'Delete Update',
      onConfirm: () => {
        const newList = updatesList.filter((u) => u.id !== id);
        setUpdatesList(newList);
        if (onUpdateServerUpdates) {
          onUpdateServerUpdates(newList);
        }
        success('Server update deleted.');
      },
    });
  };

  const handleTogglePinUpdate = (id: string) => {
    const newList = updatesList.map((u) =>
      u.id === id ? { ...u, pinned: !u.pinned } : u
    );
    setUpdatesList(newList);
    if (onUpdateServerUpdates) {
      onUpdateServerUpdates(newList);
    }
    success('Update pin status toggled.');
  };

  // --- DELETE CONFIRMATION MODAL STATE ---
  const [deleteConfirm, setDeleteConfirm] = useState<{
    title: string;
    message: string;
    actionName: string;
    onConfirm: () => void;
  } | null>(null);

  // --- SETTINGS & UPI FORM STATE ---
  const [formUpiId, setFormUpiId] = useState(config.upiId);
  const [formPayeeName, setFormPayeeName] = useState(config.upiPayeeName);
  const [formQrMode, setFormQrMode] = useState<'dynamic' | 'custom'>(config.qrMode);
  const [formCustomQrUrl, setFormCustomQrUrl] = useState(config.customQrUrl);
  const [formDiscordUrl, setFormDiscordUrl] = useState(config.discordUrl);
  const [formWhatsappUrl, setFormWhatsappUrl] = useState(config.whatsappUrl || '');
  const [formInstagramUrl, setFormInstagramUrl] = useState(config.instagramUrl || '');
  const [formYoutubeUrl, setFormYoutubeUrl] = useState(config.youtubeUrl || '');
  const [formTelegramUrl, setFormTelegramUrl] = useState(config.telegramUrl || '');
  const [formServerIp, setFormServerIp] = useState(config.serverIp);
  const [formBedrockPort, setFormBedrockPort] = useState(config.bedrockPort);
  const [formBrand, setFormBrand] = useState(config.brand);
  const [formTagline, setFormTagline] = useState(config.tagline);

  // Discord Bot & Webhook Settings
  const [formDiscordWebhookUrl, setFormDiscordWebhookUrl] = useState(config.discordWebhookUrl || '');
  const [formDiscordWebhookEnabled, setFormDiscordWebhookEnabled] = useState(config.discordWebhookEnabled ?? true);
  const [formDiscordBotName, setFormDiscordBotName] = useState(config.discordBotName || `${config.brand} Store Bot`);
  const [formDiscordAvatarUrl, setFormDiscordAvatarUrl] = useState(config.discordAvatarUrl || 'https://mc-heads.net/avatar/MHF_Chest/128');
  const [formDiscordPingRole, setFormDiscordPingRole] = useState(config.discordPingRole || '@here');
  const [formDiscordNotifyOnPayment, setFormDiscordNotifyOnPayment] = useState(config.discordNotifyOnPayment ?? true);
  const [formDiscordNotifyOnTicket, setFormDiscordNotifyOnTicket] = useState(config.discordNotifyOnTicket ?? true);
  const [isTestingDiscordWebhook, setIsTestingDiscordWebhook] = useState(false);

  // Vote Links Management States
  const [editingVoteId, setEditingVoteId] = useState<string | null>(null);
  const [editingVoteName, setEditingVoteName] = useState('');
  const [editingVoteHost, setEditingVoteHost] = useState('');
  const [editingVoteUrl, setEditingVoteUrl] = useState('');

  const [newVoteName, setNewVoteName] = useState('');
  const [newVoteHost, setNewVoteHost] = useState('');
  const [newVoteUrl, setNewVoteUrl] = useState('');

  // Sync settings when config changes
  useEffect(() => {
    setFormUpiId(config.upiId);
    setFormPayeeName(config.upiPayeeName);
    setFormQrMode(config.qrMode);
    setFormCustomQrUrl(config.customQrUrl);
    setFormDiscordUrl(config.discordUrl);
    setFormWhatsappUrl(config.whatsappUrl || '');
    setFormInstagramUrl(config.instagramUrl || '');
    setFormYoutubeUrl(config.youtubeUrl || '');
    setFormTelegramUrl(config.telegramUrl || '');
    setFormServerIp(config.serverIp);
    setFormBedrockPort(config.bedrockPort);
    setFormBrand(config.brand);
    setFormTagline(config.tagline);

    // Discord sync
    setFormDiscordWebhookUrl(config.discordWebhookUrl || '');
    setFormDiscordWebhookEnabled(config.discordWebhookEnabled ?? true);
    setFormDiscordBotName(config.discordBotName || `${config.brand} Store Bot`);
    setFormDiscordAvatarUrl(config.discordAvatarUrl || 'https://mc-heads.net/avatar/MHF_Chest/128');
    setFormDiscordPingRole(config.discordPingRole || '@here');
    setFormDiscordNotifyOnPayment(config.discordNotifyOnPayment ?? true);
    setFormDiscordNotifyOnTicket(config.discordNotifyOnTicket ?? true);
  }, [config]);

  // Live QR Code Preview Generator
  const [previewQrDataUrl, setPreviewQrDataUrl] = useState('');
  useEffect(() => {
    let isMounted = true;
    if (formQrMode === 'dynamic') {
      const upiUri = `upi://pay?pa=${encodeURIComponent(formUpiId.trim() || 'demo@upi')}&pn=${encodeURIComponent(formPayeeName.trim() || 'Store')}&cu=INR`;
      QRCode.toDataURL(upiUri, {
        width: 250,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' },
      })
        .then((url) => {
          if (isMounted) setPreviewQrDataUrl(url);
        })
        .catch(() => {});
    } else {
      setPreviewQrDataUrl(formCustomQrUrl);
    }
    return () => {
      isMounted = false;
    };
  }, [formQrMode, formUpiId, formPayeeName, formCustomQrUrl]);

  const handleSavePaymentSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUpiId.trim()) {
      error('Please enter a valid UPI ID (e.g. farhanastro@fam)');
      return;
    }
    updateConfig({
      upiId: formUpiId.trim(),
      upiPayeeName: formPayeeName.trim() || 'WonderMC Store',
      qrMode: formQrMode,
      customQrUrl: formCustomQrUrl.trim(),
    });
    onLogActivity?.('Payment Settings Updated', `Updated UPI ID (${formUpiId.trim()}) and payment gateway preferences`, 'settings', activeSession?.name);
    success('UPI ID & Payment Gateway settings saved successfully!');
  };

  // --- STAFF STATE ---
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState<StaffMember['role']>('Moderator');
  const [staffDesc, setStaffDesc] = useState('');
  const [staffAvatarUrl, setStaffAvatarUrl] = useState('');
  const [staffDiscordId, setStaffDiscordId] = useState('');
  const [staffDiscordUsername, setStaffDiscordUsername] = useState('');
  const [showDiscordMobileGuide, setShowDiscordMobileGuide] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [isSavingStaff, setIsSavingStaff] = useState(false);
  const [staffSavedSuccess, setStaffSavedSuccess] = useState(false);

  // --- SUPPORTER STATE ---
  const [supporterUsername, setSupporterUsername] = useState('');
  const [supporterAmount, setSupporterAmount] = useState('');
  const [editingSupporterId, setEditingSupporterId] = useState<string | null>(null);
  const [isSavingSupporters, setIsSavingSupporters] = useState(false);
  const [supporterSavedSuccess, setSupporterSavedSuccess] = useState(false);

  // --- PRODUCT STATE ---
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productTitle, setProductTitle] = useState('');
  const [productCategory, setProductCategory] = useState('Ranks');
  const [productPrice, setProductPrice] = useState('');
  const [productImage, setProductImage] = useState('/store/ranks.png');
  const [productDesc, setProductDesc] = useState('');
  const [syncProductImageToCategory, setSyncProductImageToCategory] = useState(false);

  // --- SALE & DISCOUNT STATE ---
  const { saleConfig, updateSaleConfig } = useSale();
  const [globalSaleEnabled, setGlobalSaleEnabled] = useState(saleConfig.enabled);
  const [globalSalePill, setGlobalSalePill] = useState(saleConfig.pill);
  const [globalSaleHighlight, setGlobalSaleHighlight] = useState(saleConfig.highlight);
  const [globalSaleText, setGlobalSaleText] = useState(saleConfig.text);
  const [globalSalePercent, setGlobalSalePercent] = useState<number>(saleConfig.percent);

  useEffect(() => {
    setGlobalSaleEnabled(saleConfig.enabled);
    setGlobalSalePill(saleConfig.pill);
    setGlobalSaleHighlight(saleConfig.highlight);
    setGlobalSaleText(saleConfig.text);
    setGlobalSalePercent(saleConfig.percent);
  }, [saleConfig]);

  const [discountSearch, setDiscountSearch] = useState('');
  const [discountCategoryFilter, setDiscountCategoryFilter] = useState('All');
  const [itemDiscountInputs, setItemDiscountInputs] = useState<Record<string, string>>({});
  const [batchDiscountInput, setBatchDiscountInput] = useState('20');

  // --- SUPPORT TICKETS STATE ---
  const {
    tickets,
    updateTicketStatus,
    updateTicketNote,
    updateTicketPriority,
    deleteTicket,
    clearResolvedTickets,
    resetTicketsToDefault,
    openTicketsCount,
  } = useTickets();

  const [ticketStatusFilter, setTicketStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all');
  const [ticketCategoryFilter, setTicketCategoryFilter] = useState<string>('All');
  const [ticketSearch, setTicketSearch] = useState<string>('');
  const [ticketNotesInput, setTicketNotesInput] = useState<Record<string, string>>({});

  if (!isOpen) return null;


  // Available categories (excluding merch and survival)
  const availableCategories = categories.filter(
    (c) =>
      c.name.toLowerCase() !== 'merch' &&
      c.game_mode?.toLowerCase() !== 'survival' &&
      !c.name.toLowerCase().includes('survival')
  );

  // ==================== STAFF HANDLERS & PERSISTENCE ====================
  const handleSaveStaffTeamToWebsite = async (overrideList?: StaffMember[], customSuccessMsg?: string) => {
    setIsSavingStaff(true);
    const target = overrideList || staffList;
    const sorted = sortStaffByHierarchy(target);
    try {
      if (onSaveStaffToBackend) {
        await onSaveStaffToBackend(sorted);
      } else {
        onUpdateStaff(sorted);
        await fetch('/api/state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ staffList: sorted }),
        });
      }
      setStaffSavedSuccess(true);
      setTimeout(() => setStaffSavedSuccess(false), 3000);
      success(customSuccessMsg || '💾 Staff Team successfully saved to website! Changes are live across all visitors.');
      return true;
    } catch (err) {
      console.error('Error saving staff to website:', err);
      error('Failed to save staff team to website. Please check network.');
      return false;
    } finally {
      setIsSavingStaff(false);
    }
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = staffName.trim();
    if (!trimmedName) {
      error('Please enter a Minecraft username');
      return;
    }

    const cleanAvatarUrl = staffAvatarUrl.trim() || undefined;
    let cleanDiscordId = staffDiscordId.trim() || undefined;
    let cleanDiscordUrl: string | undefined = undefined;

    if (cleanDiscordId) {
      const match = cleanDiscordId.match(/\b\d{17,20}\b/);
      if (match) {
        cleanDiscordId = match[0];
        cleanDiscordUrl = `https://discord.com/users/${match[0]}`;
      } else if (cleanDiscordId.startsWith('http://') || cleanDiscordId.startsWith('https://')) {
        cleanDiscordUrl = cleanDiscordId;
      } else if (cleanDiscordId.startsWith('discord.com/users/')) {
        cleanDiscordUrl = `https://${cleanDiscordId}`;
      }
    }
    const cleanDiscordUsername = staffDiscordUsername.trim() || undefined;

    let nextList: StaffMember[];
    if (editingStaffId) {
      // Edit
      const updated = staffList.map((st) =>
        st.id === editingStaffId
          ? {
              ...st,
              name: trimmedName,
              role: staffRole,
              avatar_url: cleanAvatarUrl,
              description: staffDesc.trim() || `${staffRole} on ${config.brand}`,
              discord_id: cleanDiscordId,
              discord_username: cleanDiscordUsername,
              discord_url: cleanDiscordUrl,
            }
          : st
      );
      nextList = sortStaffByHierarchy(updated);
      onUpdateStaff(nextList);
      onLogActivity?.('Staff Updated', `Updated staff member "${trimmedName}" (${staffRole})`, 'staff', activeSession?.name);
      await handleSaveStaffTeamToWebsite(nextList, `💾 Saved "${trimmedName}" (${staffRole}) to website!`);
      setEditingStaffId(null);
    } else {
      // New
      const newStaff: StaffMember = {
        id: `staff-${Date.now()}`,
        name: trimmedName,
        role: staffRole,
        avatar_url: cleanAvatarUrl,
        description: staffDesc.trim() || `${staffRole} on ${config.brand}`,
        discord_id: cleanDiscordId,
        discord_username: cleanDiscordUsername,
        discord_url: cleanDiscordUrl,
      };
      nextList = sortStaffByHierarchy([newStaff, ...staffList]);
      onUpdateStaff(nextList);
      onLogActivity?.('Staff Added', `Added "${trimmedName}" as ${staffRole}`, 'staff', activeSession?.name);
      await handleSaveStaffTeamToWebsite(nextList, `💾 Added & Saved "${trimmedName}" as ${staffRole} to website!`);
    }

    setStaffName('');
    setStaffDesc('');
    setStaffAvatarUrl('');
    setStaffDiscordId('');
    setStaffDiscordUsername('');
    setStaffRole('Moderator');
  };

  const handleMoveStaffUp = async (st: StaffMember) => {
    const updated = moveStaffUp(staffList, st.id);
    onUpdateStaff(updated);
    onLogActivity?.('Staff Hierarchy Updated', `Moved ${st.name} up in ${st.role} rank`, 'staff', activeSession?.name);
    await handleSaveStaffTeamToWebsite(updated, `💾 Moved ${st.name} up & saved to website!`);
  };

  const handleMoveStaffDown = async (st: StaffMember) => {
    const updated = moveStaffDown(staffList, st.id);
    onUpdateStaff(updated);
    onLogActivity?.('Staff Hierarchy Updated', `Moved ${st.name} down in ${st.role} rank`, 'staff', activeSession?.name);
    await handleSaveStaffTeamToWebsite(updated, `💾 Moved ${st.name} down & saved to website!`);
  };

  const handleEditStaff = (st: StaffMember) => {
    setEditingStaffId(st.id);
    setStaffName(st.name);
    setStaffRole(st.role);
    setStaffDesc(st.description || '');
    setStaffAvatarUrl(st.avatar_url || '');
    setStaffDiscordId(st.discord_id || st.discord_url || '');
    setStaffDiscordUsername(st.discord_username || '');
  };

  const handleDeleteStaff = (st: StaffMember) => {
    setDeleteConfirm({
      title: `Remove "${st.name}"?`,
      message: `Are you sure you want to remove ${st.name} (${st.role}) from the staff team? This will automatically save and update the website.`,
      actionName: 'Delete Staff',
      onConfirm: async () => {
        const updated = staffList.filter((s) => s.id !== st.id);
        const sorted = sortStaffByHierarchy(updated);
        onUpdateStaff(sorted);
        onLogActivity?.('Staff Removed', `Removed ${st.name} (${st.role}) from staff team`, 'staff', activeSession?.name);
        await handleSaveStaffTeamToWebsite(sorted, `💾 Removed "${st.name}" & saved to website!`);
        if (editingStaffId === st.id) {
          setEditingStaffId(null);
          setStaffName('');
          setStaffDesc('');
          setStaffAvatarUrl('');
          setStaffDiscordId('');
          setStaffDiscordUsername('');
          setStaffRole('Moderator');
        }
      },
    });
  };

  // ==================== SUPPORTER HANDLERS & PERSISTENCE ====================
  const handleSaveSupportersToWebsite = async (overrideList?: TopBuyer[], customSuccessMsg?: string) => {
    setIsSavingSupporters(true);
    const target = overrideList || leaderboard;
    const sorted = [...target]
      .sort((a, b) => b.total_spent - a.total_spent)
      .map((item, idx) => ({ ...item, rank: idx + 1 }));
    try {
      if (onSaveLeaderboardToBackend) {
        await onSaveLeaderboardToBackend(sorted);
      } else {
        onUpdateLeaderboard(sorted);
        await fetch('/api/state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leaderboard: sorted }),
        });
      }
      setSupporterSavedSuccess(true);
      setTimeout(() => setSupporterSavedSuccess(false), 3000);
      success(customSuccessMsg || '💾 Supporters Leaderboard successfully saved to website! Publicly updated.');
      return true;
    } catch (err) {
      console.error('Error saving supporters to website:', err);
      error('Failed to save supporters leaderboard to website. Please check network.');
      return false;
    } finally {
      setIsSavingSupporters(false);
    }
  };

  const handleSaveSupporter = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = supporterUsername.trim();
    const numAmount = parseFloat(supporterAmount);

    if (!trimmedName) {
      error('Please enter a Minecraft username');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      error('Please enter a valid amount greater than 0');
      return;
    }

    let updatedList: TopBuyer[];
    if (editingSupporterId) {
      updatedList = leaderboard.map((b) =>
        b.id === editingSupporterId
          ? { ...b, username: trimmedName, total_spent: numAmount }
          : b
      );
      onLogActivity?.('Supporter Updated', `Updated supporter "${trimmedName}" (₹${numAmount})`, 'product', activeSession?.name);
      setEditingSupporterId(null);
    } else {
      const newBuyer: TopBuyer = {
        id: `lead-${Date.now()}`,
        username: trimmedName,
        total_spent: numAmount,
      };
      updatedList = [...leaderboard, newBuyer];
      onLogActivity?.('Supporter Added', `Added supporter "${trimmedName}" with ₹${numAmount}`, 'product', activeSession?.name);
    }

    // Auto sort descending and update rank numbers
    const sorted = [...updatedList]
      .sort((a, b) => b.total_spent - a.total_spent)
      .map((b, idx) => ({ ...b, rank: idx + 1 }));

    onUpdateLeaderboard(sorted);
    await handleSaveSupportersToWebsite(sorted, `💾 Saved supporter "${trimmedName}" (₹${numAmount}) to website!`);
    setSupporterUsername('');
    setSupporterAmount('');
  };

  const handleEditSupporter = (b: TopBuyer) => {
    setEditingSupporterId(b.id);
    setSupporterUsername(b.username);
    setSupporterAmount(b.total_spent.toString());
  };

  const handleDeleteSupporter = (b: TopBuyer) => {
    setDeleteConfirm({
      title: `Remove "${b.username}"?`,
      message: `Are you sure you want to remove ${b.username} from the top supporters leaderboard? This will automatically save and update the website.`,
      actionName: 'Delete Supporter',
      onConfirm: async () => {
        const filtered = leaderboard.filter((item) => item.id !== b.id);
        const reRanked = filtered
          .sort((a, b) => b.total_spent - a.total_spent)
          .map((item, idx) => ({ ...item, rank: idx + 1 }));
        onUpdateLeaderboard(reRanked);
        onLogActivity?.('Supporter Removed', `Removed "${b.username}" from leaderboard`, 'product', activeSession?.name);
        await handleSaveSupportersToWebsite(reRanked, `💾 Removed "${b.username}" & saved leaderboard to website!`);
        if (editingSupporterId === b.id) {
          setEditingSupporterId(null);
          setSupporterUsername('');
          setSupporterAmount('');
        }
      },
    });
  };

  // ==================== PRODUCT HANDLERS ====================
  const handleProductGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      error('Please select a valid image file (PNG, JPG, WEBP)');
      return;
    }
    try {
      const optimized = await optimizeImage(file, 480, 480, 0.88);
      if (optimized) {
        setProductImage(optimized);
        success('Uploaded custom product PNG successfully!');
      } else {
        error('Failed to process image');
      }
    } catch {
      error('Failed to process image');
    }
  };

  const handleOpenNewProduct = () => {
    setEditingProductId(null);
    setProductTitle('');
    setProductCategory(categories[0]?.name || 'Ranks');
    setProductPrice('199');
    setProductImage(categories[0]?.image_url || '/store/ranks.png');
    setProductDesc('<p><strong>Perks:</strong><br/>Commands &amp; Perks included.</p>');
    setSyncProductImageToCategory(false);
    setIsProductFormOpen(true);
  };

  const handleOpenEditProduct = (item: StoreItem) => {
    setEditingProductId(item.id);
    setProductTitle(item.title);
    setProductCategory(item.category);
    setProductPrice(item.price.toString());
    setProductImage(item.image_url || '/store/ranks.png');
    setProductDesc(item.description);
    setSyncProductImageToCategory(false);
    setIsProductFormOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = productTitle.trim();
    const numPrice = parseFloat(productPrice);

    if (!trimmedTitle) {
      error('Please enter product title');
      return;
    }
    if (isNaN(numPrice) || numPrice < 0) {
      error('Please enter a valid price');
      return;
    }

    let updated: StoreItem[];
    if (editingProductId) {
      updated = items.map((it) =>
        it.id === editingProductId
          ? {
              ...it,
              title: trimmedTitle,
              category: productCategory,
              price: numPrice,
              image_url: productImage,
              description: productDesc,
            }
          : it
      );
    } else {
      const newItem: StoreItem = {
        id: `item-${Date.now()}`,
        title: trimmedTitle,
        category: productCategory,
        price: numPrice,
        image_url: productImage,
        description: productDesc,
        display_order: items.length,
      };
      updated = [newItem, ...items];
    }

    if (syncProductImageToCategory) {
      // Sync the category tile on the homepage as well as all products in this category
      const updatedCats = categories.map((c) =>
        isMatchingCategory(c.name, productCategory) ? { ...c, image_url: productImage } : c
      );
      const allSyncedItems = updated.map((it) =>
        isMatchingCategory(it.category, productCategory) ? { ...it, image_url: productImage } : it
      );

      if (onUpdateCategoriesAndItems) {
        onUpdateCategoriesAndItems(updatedCats, allSyncedItems);
      } else {
        onUpdateCategories?.(updatedCats);
        onUpdateItems(allSyncedItems);
      }
      onLogActivity?.(
        'Product & Category Synced',
        `Saved product "${trimmedTitle}" and synced homepage category tile and all products for "${productCategory}"`,
        'product',
        activeSession?.name
      );
      success(`Saved product "${trimmedTitle}" and synced "${productCategory}" category PNG!`);
    } else {
      onUpdateItems(updated);
      onLogActivity?.(
        editingProductId ? 'Product Updated' : 'Product Created',
        `${editingProductId ? 'Updated' : 'Created'} product "${trimmedTitle}" in category ${productCategory}`,
        'product',
        activeSession?.name
      );
      success(editingProductId ? `Updated product "${trimmedTitle}"` : `Created new product "${trimmedTitle}"`);
    }

    setIsProductFormOpen(false);
    setEditingProductId(null);
    setSyncProductImageToCategory(false);
  };

  const handleDeleteProduct = (item: StoreItem) => {
    setDeleteConfirm({
      title: `Delete "${item.title}"?`,
      message: `Are you sure you want to permanently delete "${item.title}" from the store catalog?`,
      actionName: 'Delete Product',
      onConfirm: () => {
        const updated = items.filter((it) => it.id !== item.id);
        onUpdateItems(updated);
        onLogActivity?.('Product Deleted', `Deleted product "${item.title}"`, 'product', activeSession?.name);
        success(`Deleted "${item.title}"`);
      },
    });
  };

  // ==================== PRODUCT REORDER / MOVE HANDLERS ====================
  const handleMoveProductUp = (item: StoreItem) => {
    const currentIndex = items.findIndex((it) => it.id === item.id);
    if (currentIndex <= 0) return;

    const newItems = [...items];
    const prevItem = newItems[currentIndex - 1];
    newItems[currentIndex - 1] = newItems[currentIndex];
    newItems[currentIndex] = prevItem;

    onUpdateItems(newItems);
    onLogActivity?.('Product Reordered', `Moved product "${item.title}" UP in store catalog`, 'product', activeSession?.name);
    success(`Moved "${item.title}" UP (position #${currentIndex})`);
  };

  const handleMoveProductDown = (item: StoreItem) => {
    const currentIndex = items.findIndex((it) => it.id === item.id);
    if (currentIndex < 0 || currentIndex >= items.length - 1) return;

    const newItems = [...items];
    const nextItem = newItems[currentIndex + 1];
    newItems[currentIndex + 1] = newItems[currentIndex];
    newItems[currentIndex] = nextItem;

    onUpdateItems(newItems);
    onLogActivity?.('Product Reordered', `Moved product "${item.title}" DOWN in store catalog`, 'product', activeSession?.name);
    success(`Moved "${item.title}" DOWN (position #${currentIndex + 2})`);
  };

  const handleMoveProductToTop = (item: StoreItem) => {
    const currentIndex = items.findIndex((it) => it.id === item.id);
    if (currentIndex <= 0) return;

    const remaining = items.filter((it) => it.id !== item.id);
    const newItems = [item, ...remaining];

    onUpdateItems(newItems);
    onLogActivity?.('Product Reordered', `Moved product "${item.title}" to TOP of store catalog (#1)`, 'product', activeSession?.name);
    success(`Moved "${item.title}" to TOP of store (#1)`);
  };

  const handleMoveProductToBottom = (item: StoreItem) => {
    const currentIndex = items.findIndex((it) => it.id === item.id);
    if (currentIndex < 0 || currentIndex >= items.length - 1) return;

    const remaining = items.filter((it) => it.id !== item.id);
    const newItems = [...remaining, item];

    onUpdateItems(newItems);
    onLogActivity?.('Product Reordered', `Moved product "${item.title}" to BOTTOM of store catalog`, 'product', activeSession?.name);
    success(`Moved "${item.title}" to BOTTOM of store`);
  };

  // ==================== SUPPORT TICKET HANDLERS ====================
  const handleSaveTicketNote = (ticketId: string) => {
    const note = (ticketNotesInput[ticketId] ?? '').trim();
    updateTicketNote(ticketId, note);
    onLogActivity?.('Ticket Note Saved', 'Saved staff reply note on support ticket', 'ticket', activeSession?.name);
    success('Staff reply note saved successfully!');
  };

  const handleDeleteTicket = (ticket: SupportTicket) => {
    setDeleteConfirm({
      title: `Delete Ticket #${ticket.ticketNumber}?`,
      message: `Are you sure you want to permanently delete support ticket #${ticket.ticketNumber} from ${ticket.ign}?`,
      actionName: 'Delete Ticket',
      onConfirm: () => {
        deleteTicket(ticket.id);
        onLogActivity?.('Ticket Deleted', `Deleted support ticket #${ticket.ticketNumber} (${ticket.ign})`, 'ticket', activeSession?.name);
        success(`Ticket #${ticket.ticketNumber} removed`);
      },
    });
  };

  const handleClearResolvedTickets = () => {
    setDeleteConfirm({
      title: 'Clear Resolved Tickets?',
      message: 'This will permanently remove all resolved and closed support tickets.',
      actionName: 'Clear Resolved',
      onConfirm: () => {
        clearResolvedTickets();
        onLogActivity?.('Tickets Cleared', 'Cleared all resolved and closed support tickets', 'ticket', activeSession?.name);
        success('Resolved tickets cleared successfully!');
      },
    });
  };


  const handleResetDefaults = () => {
    setDeleteConfirm({
      title: 'Reset Store to Defaults?',
      message: 'This will reset Staff, Supporters, Product Catalog, and Store Configuration back to official default values.',
      actionName: 'Reset Everything',
      onConfirm: () => {
        onUpdateStaff(INITIAL_STAFF);
        onUpdateLeaderboard(INITIAL_LEADERBOARD);
        onUpdateItems(INITIAL_ITEMS.filter((i) => i.category.toLowerCase() !== 'merch'));
        resetConfig();
        onLogActivity?.('Store Reset', 'Reset store catalog, staff, supporters, and settings to official defaults', 'settings', activeSession?.name);
        success('Store catalog, staff, supporters, and settings reset to defaults!');
      },
    });
  };

  // ==================== VOTE LINKS HANDLERS ====================
  const handleAddVoteLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVoteName.trim() || !newVoteHost.trim() || !newVoteUrl.trim()) {
      error('Please fill in all fields to add a vote link.');
      return;
    }
    const newLink = {
      id: `vote-${Date.now()}`,
      name: newVoteName.trim(),
      host: newVoteHost.trim(),
      url: newVoteUrl.trim(),
    };
    const updated = [...(voteLinks || []), newLink];
    onUpdateVoteLinks?.(updated);
    setNewVoteName('');
    setNewVoteHost('');
    setNewVoteUrl('');
    success('Vote link added successfully!');
    onLogActivity?.('Vote Link Added', `Added vote link: "${newLink.name}" (${newLink.host})`, 'settings', activeSession?.name);
  };

  const handleStartEditVoteLink = (link: any) => {
    setEditingVoteId(link.id);
    setEditingVoteName(link.name);
    setEditingVoteHost(link.host);
    setEditingVoteUrl(link.url);
  };

  const handleSaveEditVoteLink = (id: string) => {
    if (!editingVoteName.trim() || !editingVoteHost.trim() || !editingVoteUrl.trim()) {
      error('Please fill in all fields to save the vote link.');
      return;
    }
    const updated = (voteLinks || []).map((link) => {
      if (link.id === id) {
        return {
          ...link,
          name: editingVoteName.trim(),
          host: editingVoteHost.trim(),
          url: editingVoteUrl.trim(),
        };
      }
      return link;
    });
    onUpdateVoteLinks?.(updated);
    setEditingVoteId(null);
    success('Vote link updated successfully!');
    onLogActivity?.('Vote Link Updated', `Updated vote link: "${editingVoteName.trim()}"`, 'settings', activeSession?.name);
  };

  const handleDeleteVoteLink = (id: string, name: string) => {
    const updated = (voteLinks || []).filter((link) => link.id !== id);
    onUpdateVoteLinks?.(updated);
    success('Vote link deleted successfully!');
    onLogActivity?.('Vote Link Deleted', `Deleted vote link: "${name}"`, 'settings', activeSession?.name);
  };

  // ==================== STORE CONFIG & UPI SETTINGS HANDLERS ====================
  const handleSaveStoreSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUpiId.trim()) {
      error('Please enter a valid UPI ID (e.g. yourname@okaxis)');
      return;
    }
    updateConfig({
      upiId: formUpiId.trim(),
      upiPayeeName: formPayeeName.trim() || 'WonderMC Store',
      qrMode: formQrMode,
      customQrUrl: formCustomQrUrl.trim(),
      discordUrl: formDiscordUrl.trim() || 'https://discord.gg/wondermc',
      whatsappUrl: formWhatsappUrl.trim(),
      instagramUrl: formInstagramUrl.trim(),
      youtubeUrl: formYoutubeUrl.trim(),
      telegramUrl: formTelegramUrl.trim(),
      serverIp: formServerIp.trim() || 'play.wondermc.fun',
      bedrockPort: formBedrockPort.trim() || '19132',
      brand: formBrand.trim() || 'WonderMC',
      tagline: formTagline.trim() || 'Official Minecraft Store',
      // Discord Bot Settings
      discordWebhookUrl: formDiscordWebhookUrl.trim(),
      discordWebhookEnabled: formDiscordWebhookEnabled,
      discordBotName: formDiscordBotName.trim() || `${formBrand.trim() || 'WonderMC'} Store Bot`,
      discordAvatarUrl: formDiscordAvatarUrl.trim() || 'https://mc-heads.net/avatar/MHF_Chest/128',
      discordPingRole: formDiscordPingRole.trim(),
      discordNotifyOnPayment: formDiscordNotifyOnPayment,
      discordNotifyOnTicket: formDiscordNotifyOnTicket,
    });
    onLogActivity?.('Store Settings Updated', 'Updated store configuration, server IP & Discord bot settings', 'settings', activeSession?.name);
    success('Store settings, UPI ID & Discord bot configuration saved successfully!');
  };

  const handleTestDiscordWebhook = async () => {
    const cleanUrl = formDiscordWebhookUrl.trim();
    if (!cleanUrl) {
      error('Please paste a valid Discord Webhook URL first');
      return;
    }

    setIsTestingDiscordWebhook(true);
    try {
      const result = await sendTestDiscordNotification({
        ...config,
        discordWebhookUrl: cleanUrl,
        discordBotName: formDiscordBotName.trim() || 'WonderMC Store Bot',
        discordAvatarUrl: formDiscordAvatarUrl.trim() || 'https://mc-heads.net/avatar/MHF_Chest/128',
        discordPingRole: formDiscordPingRole.trim(),
        discordNotifyOnPayment: formDiscordNotifyOnPayment,
        discordNotifyOnTicket: formDiscordNotifyOnTicket,
      });

      if (result.success) {
        success('🎉 Test alert sent! Check your Discord channel to verify the bot embed.');
      } else {
        error(result.error || 'Failed to send Discord webhook alert.');
      }
    } catch (err: any) {
      error(err?.message || 'Error communicating with Discord Webhook');
    } finally {
      setIsTestingDiscordWebhook(false);
    }
  };

  const handleApproveOrderTicket = (ticket: SupportTicket) => {
    updateTicketStatus(ticket.id, 'resolved');
    updateTicketNote(ticket.id, 'Payment verified & items granted in-game by Admin.');

    // Send Discord notification for order approval
    sendOrderApprovedDiscordNotification(
      {
        ign: ticket.ign,
        amount: 0,
        itemsDescription: ticket.subject,
        approvedBy: 'Admin Staff',
        ticketNumber: ticket.ticketNumber,
      },
      config
    ).catch(() => {});

    success(`Order for ${ticket.ign} marked resolved & delivery logged!`);
  };

  const handleQrFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      error('Please upload a valid image file (PNG, JPG, WebP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormCustomQrUrl(reader.result);
        setFormQrMode('custom');
        onLogActivity?.('QR Code Uploaded', 'Uploaded custom payment QR code image', 'settings', activeSession?.name);
        success('QR Code image uploaded successfully!');
      }
    };
    reader.readAsDataURL(file);
  };

  // ==================== DISCOUNT HANDLERS ====================
  const handleSaveGlobalSale = (e: React.FormEvent) => {
    e.preventDefault();
    const pct = Math.min(99, Math.max(1, Number(globalSalePercent) || 30));
    updateSaleConfig({
      pill: globalSalePill.trim() || 'SUMMER SALE',
      highlight: globalSaleHighlight.trim() || `${pct}% OFF`,
      text: globalSaleText.trim() || `${pct}% off on every product!`,
      percent: pct,
      enabled: globalSaleEnabled,
    });
    success('Global storewide sale settings updated successfully!');
  };

  const handleDisableGlobalSale = () => {
    setGlobalSaleEnabled(false);
    updateSaleConfig({
      ...saleConfig,
      enabled: false,
    });
    success('Global sale has been disabled and removed from the store.');
  };

  const handleQuickPresetSale = (name: string, pct: number, highlight: string, text: string) => {
    setGlobalSaleEnabled(true);
    setGlobalSalePill(name);
    setGlobalSalePercent(pct);
    setGlobalSaleHighlight(highlight);
    setGlobalSaleText(text);
    updateSaleConfig({
      pill: name,
      percent: pct,
      highlight,
      text,
      enabled: true,
    });
    success(`Activated ${name} (${pct}% OFF) across the store!`);
  };

  const handleSetProductDiscount = (itemId: string, percent: number) => {
    if (percent <= 0) {
      handleRemoveProductDiscount(itemId);
      return;
    }
    const cleanPct = Math.min(99, Math.max(1, Math.round(percent)));
    const updated = items.map((it) =>
      it.id === itemId ? { ...it, discount_percent: cleanPct } : it
    );
    onUpdateItems(updated);
    setItemDiscountInputs((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
    onLogActivity?.('Product Discount Set', `Applied ${cleanPct}% discount to product ID ${itemId}`, 'coupon', activeSession?.name);
    success(`Applied ${cleanPct}% discount to product!`);
  };

  const handleRemoveProductDiscount = (itemId: string) => {
    const updated = items.map((it) => {
      if (it.id === itemId) {
        const { discount_percent, ...rest } = it;
        return rest;
      }
      return it;
    });
    onUpdateItems(updated);
    setItemDiscountInputs((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
    onLogActivity?.('Product Discount Removed', `Removed discount from product ID ${itemId}`, 'coupon', activeSession?.name);
    success('Product discount removed. Original price restored.');
  };

  const handleApplyBatchDiscount = (pct: number) => {
    const cleanPct = Math.min(99, Math.max(1, Math.round(pct)));
    const updated = items.map((it) => ({
      ...it,
      discount_percent: cleanPct,
    }));
    onUpdateItems(updated);
    onLogActivity?.('Batch Discount Applied', `Applied ${cleanPct}% storewide discount to all ${items.length} products`, 'coupon', activeSession?.name);
    success(`Applied ${cleanPct}% discount to all ${items.length} products!`);
  };

  const handleClearAllCustomDiscounts = () => {
    const updated = items.map((it) => {
      const { discount_percent, ...rest } = it;
      return rest;
    });
    onUpdateItems(updated);
    setItemDiscountInputs({});
    onLogActivity?.('Batch Discount Cleared', 'Removed custom discounts from all products storewide', 'coupon', activeSession?.name);
    success('Removed custom discounts from all products.');
  };

  // Filtered product items for discount tab
  const displayedDiscountProducts = items.filter((it) => {
    const matchesSearch =
      it.title.toLowerCase().includes(discountSearch.toLowerCase()) ||
      it.category.toLowerCase().includes(discountSearch.toLowerCase());
    const matchesCategory =
      discountCategoryFilter === 'All' ||
      it.category.toLowerCase() === discountCategoryFilter.toLowerCase();
    return matchesSearch && matchesCategory && it.category.toLowerCase() !== 'merch';
  });

  // Filtered product items for display
  const displayedProducts = items.filter((it) => {
    const matchesSearch =
      it.title.toLowerCase().includes(productSearch.toLowerCase()) ||
      it.category.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory =
      productCategoryFilter === 'All' ||
      it.category.toLowerCase() === productCategoryFilter.toLowerCase();
    const notMerch = it.category.toLowerCase() !== 'merch';
    return matchesSearch && matchesCategory && notMerch;
  });

  // Filtered support tickets for tickets tab
  const displayedTickets = tickets.filter((tkt) => {
    const matchesStatus = ticketStatusFilter === 'all' || tkt.status === ticketStatusFilter;
    const matchesCategory = ticketCategoryFilter === 'All' || tkt.category === ticketCategoryFilter;
    const q = ticketSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      tkt.ign.toLowerCase().includes(q) ||
      tkt.subject.toLowerCase().includes(q) ||
      tkt.message.toLowerCase().includes(q) ||
      tkt.ticketNumber.toLowerCase().includes(q) ||
      (tkt.discordContact && tkt.discordContact.toLowerCase().includes(q)) ||
      (tkt.staffNotes && tkt.staffNotes.toLowerCase().includes(q));
    return matchesStatus && matchesCategory && matchesSearch;
  });


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl rounded-none sm:rounded-2xl border-0 sm:border border-border bg-surface shadow-2xl my-0 sm:my-6 flex flex-col h-full sm:h-auto max-h-[100dvh] sm:max-h-[92vh] overflow-hidden">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between gap-3 border-b border-border bg-surface-deep px-3.5 py-3 sm:px-5 sm:py-4 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-sm">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm sm:text-lg font-black tracking-tight text-foreground font-display truncate">
                  {config.brand} Admin Panel
                </h2>
                {activeSession?.isOwner ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-lime/20 text-lime px-2 py-0.5 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wide border border-lime/30 shrink-0">
                    <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    Main Owner
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 text-amber-300 px-2 py-0.5 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wide border border-amber-500/30 shrink-0" title={`Logged in as ${activeSession?.name}`}>
                    <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    Role: {activeSession?.name}
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate hidden sm:block">
                {activeSession?.isOwner
                  ? 'Manage staff team, top supporters, store catalog, and sub-admin permissions'
                  : `Sub-Admin Portal (${allowedTabs.length} tabs permitted)`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-surface-deep transition-colors"
              title="Logout from Admin"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span className="hidden sm:inline">Logout</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-xl border border-border bg-surface p-1.5 sm:p-2 text-muted-foreground hover:text-foreground hover:border-border-strong transition-colors"
              aria-label="Close admin panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Quick Dropdown Switcher (visible on mobile < sm) */}
        <div className="block sm:hidden px-4 py-3 bg-gradient-to-r from-surface-deep via-surface to-surface-deep border-b border-border shadow-md shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-accent flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              <span>Select Admin Section</span>
            </span>
            <span className="text-[10px] font-bold text-muted-foreground">
              {allowedTabs.length} Tabs Available
            </span>
          </div>
          <div className="relative">
            <label htmlFor="admin-mobile-tab-select" className="sr-only">Select Tab</label>
            <select
              id="admin-mobile-tab-select"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as TabType)}
              className="w-full rounded-xl border-2 border-accent/40 bg-surface-deep px-3.5 py-3 text-xs font-black uppercase text-foreground outline-none focus:border-accent shadow-lg tracking-wider cursor-pointer"
            >
              {allowedTabs.includes('staff') && <option value="staff">👥 Staff Team ({staffList.length})</option>}
              {allowedTabs.includes('supporters') && <option value="supporters">🏆 Top Supporters ({leaderboard.length})</option>}
              {allowedTabs.includes('products') && <option value="products">📦 Products &amp; Catalog ({items.length})</option>}
              {allowedTabs.includes('discounts') && <option value="discounts">🎟️ Coupons &amp; Discounts {saleConfig.enabled ? '⚡' : ''}</option>}
              {allowedTabs.includes('tickets') && <option value="tickets">💬 Support Tickets ({tickets.length}) {openTicketsCount > 0 ? `(${openTicketsCount} Open)` : ''}</option>}
              {allowedTabs.includes('updates') && <option value="updates">📢 Updates &amp; News ({updatesList.length})</option>}
              {allowedTabs.includes('vote') && <option value="vote">🗳️ Vote Sites ({voteLinks.length})</option>}
              {allowedTabs.includes('payment') && <option value="payment">💳 UPI &amp; Payments</option>}
              {allowedTabs.includes('passwords') && <option value="passwords">🔑 Sub-Admin Passwords ({subAdminKeysList.length})</option>}
              {allowedTabs.includes('settings') && <option value="settings">⚙️ Server &amp; Webhooks</option>}
              {allowedTabs.includes('guide') && <option value="guide">🧭 Connection Guide</option>}
              {allowedTabs.includes('rules') && <option value="rules">⚖️ Server Rules</option>}
              {allowedTabs.includes('activity_log') && <option value="activity_log">📋 Activity Audit Log</option>}
            </select>
          </div>
        </div>

        {/* Navigation Tabs Bar (Horizontal Scrollable on all viewports) */}
        <div className="flex flex-nowrap items-center gap-2 border-b border-border bg-surface px-3 sm:px-5 py-2 sm:py-2.5 shrink-0 overflow-x-auto no-scrollbar">
          {allowedTabs.includes('staff') && (
            <button
              type="button"
              onClick={() => setActiveTab('staff')}
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 sm:px-3.5 sm:py-2 text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'staff'
                  ? 'bg-accent text-accent-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface-deep'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>Staff ({staffList.length})</span>
            </button>
          )}

          {allowedTabs.includes('supporters') && (
            <button
              type="button"
              onClick={() => setActiveTab('supporters')}
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 sm:px-3.5 sm:py-2 text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'supporters'
                  ? 'bg-gold text-lime-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface-deep'
              }`}
            >
              <Trophy className="w-4 h-4 shrink-0" />
              <span>Supporters ({leaderboard.length})</span>
            </button>
          )}

          {allowedTabs.includes('products') && (
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 sm:px-3.5 sm:py-2 text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'products'
                  ? 'bg-accent-2 text-accent-2-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface-deep'
              }`}
            >
              <Package className="w-4 h-4 shrink-0" />
              <span>Products ({items.length})</span>
            </button>
          )}

          {allowedTabs.includes('discounts') && (
            <button
              type="button"
              onClick={() => setActiveTab('discounts')}
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 sm:px-3.5 sm:py-2 text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'discounts'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface-deep'
              }`}
            >
              <Tag className="w-4 h-4 shrink-0" />
              <span>Coupons &amp; Discounts {saleConfig.enabled ? '⚡' : ''}</span>
            </button>
          )}

          {allowedTabs.includes('tickets') && (
            <button
              type="button"
              onClick={() => setActiveTab('tickets')}
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 sm:px-3.5 sm:py-2 text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 relative ${
                activeTab === 'tickets'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface-deep'
              }`}
            >
              <LifeBuoy className="w-4 h-4 shrink-0" />
              <span>Tickets ({tickets.length})</span>
              {openTicketsCount > 0 && (
                <span className="rounded-full bg-red-600 px-1.5 py-0.2 text-[10px] font-black text-white animate-pulse">
                  {openTicketsCount}
                </span>
              )}
            </button>
          )}

          {allowedTabs.includes('updates') && (
            <button
              type="button"
              onClick={() => setActiveTab('updates')}
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 sm:px-3.5 sm:py-2 text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 relative ${
                activeTab === 'updates'
                  ? 'bg-sky-500 text-slate-950 shadow-sm font-extrabold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface-deep'
              }`}
            >
              <Radio className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Updates ({updatesList.length})</span>
            </button>
          )}

          {allowedTabs.includes('vote') && (
            <button
              type="button"
              onClick={() => setActiveTab('vote')}
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 sm:px-3.5 sm:py-2 text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 relative ${
                activeTab === 'vote'
                  ? 'bg-fuchsia-600 text-white shadow-sm font-extrabold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface-deep'
              }`}
            >
              <Globe className="w-4 h-4 text-fuchsia-400 shrink-0" />
              <span>Vote ({voteLinks.length})</span>
            </button>
          )}

          {allowedTabs.includes('payment') && (
            <button
              type="button"
              onClick={() => setActiveTab('payment')}
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 sm:px-3.5 sm:py-2 text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'payment'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm font-extrabold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface-deep'
              }`}
            >
              <CreditCard className="w-4 h-4 shrink-0" />
              <span>Payment</span>
            </button>
          )}

          {allowedTabs.includes('passwords') && (
            <button
              type="button"
              onClick={() => setActiveTab('passwords')}
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 sm:px-3.5 sm:py-2 text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'passwords'
                  ? 'bg-indigo-600 text-white shadow-sm font-extrabold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface-deep'
              }`}
            >
              <Key className="w-4 h-4 shrink-0" />
              <span>Password ({subAdminKeysList.length})</span>
            </button>
          )}

          {allowedTabs.includes('settings') && (
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 sm:px-3.5 sm:py-2 text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'settings'
                  ? 'bg-surface-deep text-foreground border border-border shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface-deep'
              }`}
            >
              <Sliders className="w-4 h-4 shrink-0" />
              <span>Settings</span>
            </button>
          )}

          {allowedTabs.includes('guide') && (
            <button
              type="button"
              onClick={() => setActiveTab('guide')}
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 sm:px-3.5 sm:py-2 text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 relative ${
                activeTab === 'guide'
                  ? 'bg-sky-500 text-slate-950 shadow-sm font-extrabold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface-deep'
              }`}
            >
              <Compass className="w-4 h-4 shrink-0 text-sky-500 group-hover:text-slate-950" />
              <span>Connection Guide</span>
            </button>
          )}

          {allowedTabs.includes('rules') && (
            <button
              type="button"
              onClick={() => setActiveTab('rules')}
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 sm:px-3.5 sm:py-2 text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 relative ${
                activeTab === 'rules'
                  ? 'bg-rose-500 text-white shadow-sm font-extrabold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface-deep'
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0 text-rose-500" />
              <span>Server Rules</span>
            </button>
          )}

          {allowedTabs.includes('activity_log') && (
            <button
              type="button"
              onClick={() => setActiveTab('activity_log')}
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 sm:px-3.5 sm:py-2 text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 relative ${
                activeTab === 'activity_log'
                  ? 'bg-purple-600 text-white shadow-sm font-extrabold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface-deep'
              }`}
            >
              <ClipboardList className="w-4 h-4 shrink-0" />
              <span>Activity Log ({activityLogs.length})</span>
            </button>
          )}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 md:p-6 bg-surface">
          {/* ==================================================== */}
          {/* TAB 1: STAFF MANAGEMENT                              */}
          {/* ==================================================== */}
          {activeTab === 'staff' && (
            <div className="space-y-5">
              {/* Header Save Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border border-accent/30 bg-accent/5 backdrop-blur-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black uppercase tracking-wider text-foreground font-display">
                        Staff Team Management
                      </h3>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30">
                        {staffList.length} Members
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Add, edit, re-order, or remove server staff. All edits automatically save & persist to website.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-border text-[11px] font-bold text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
                    <span>Auto-Sync Active</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSaveStaffTeamToWebsite()}
                    disabled={isSavingStaff}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-accent-foreground font-black text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isSavingStaff ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving to Website...</span>
                      </>
                    ) : staffSavedSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-lime" />
                        <span>✅ Saved to Website!</span>
                      </>
                    ) : (
                      <>
                        <span>💾 Save Staff Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Form to Add/Edit Staff */}
              <div className="lg:col-span-5 rounded-2xl border border-border bg-surface-deep p-4 sm:p-5">
                <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-accent" />
                    <h3 className="text-sm font-black uppercase tracking-wider text-foreground font-display">
                      {editingStaffId ? 'Edit Staff Member' : 'Add Staff Member'}
                    </h3>
                  </div>
                  {editingStaffId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingStaffId(null);
                        setStaffName('');
                        setStaffDesc('');
                        setStaffAvatarUrl('');
                        setStaffDiscordId('');
                        setStaffDiscordUsername('');
                        setStaffRole('Moderator');
                      }}
                      className="text-[11px] font-bold text-muted-foreground hover:text-foreground"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveStaff} className="space-y-4">
                  {/* Live Minecraft Full Body Skin Preview Box */}
                  <div className="flex items-center gap-3.5 p-3 rounded-xl border border-border bg-surface">
                    <div className="relative h-20 w-14 shrink-0 rounded-xl border border-border/80 bg-surface-deep flex items-center justify-center overflow-hidden">
                      <MinecraftSkinImage
                        name={staffName.trim() || 'Steve'}
                        type="body"
                        customUrl={staffAvatarUrl.trim() || undefined}
                        className="h-18 object-contain"
                        alt="Minecraft full body skin preview"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                        Full Body 3D Skin Live Sync
                      </span>
                      <span className="text-xs font-bold text-foreground truncate block font-mono">
                        {staffName.trim() || 'Type IGN below...'}
                      </span>
                      {staffAvatarUrl.trim() ? (
                        <span className="text-[10px] text-amber-400 font-bold block truncate">
                          ★ Custom Skin URL Active
                        </span>
                      ) : (
                        <span className="text-[10px] text-lime font-medium block">
                          Live 3D body skin auto-fetched
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">
                      Minecraft Username (IGN) *
                    </label>
                    <input
                      type="text"
                      required
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      placeholder="e.g. SpearXDD, FarhanAstro"
                      className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-accent font-mono"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-muted-foreground">
                        Custom Skin / Avatar URL (Optional)
                      </label>
                      {staffAvatarUrl && (
                        <button
                          type="button"
                          onClick={() => setStaffAvatarUrl('')}
                          className="text-[10px] text-red-400 hover:underline font-bold"
                        >
                          Clear Custom Skin
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={staffAvatarUrl}
                      onChange={(e) => setStaffAvatarUrl(e.target.value)}
                      placeholder="https://... direct image URL or leave empty for auto Minecraft IGN"
                      className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-accent font-mono"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                      💡 Minecraft IGN se automatic skin na aane par direct skin image URL (Imgur, Discord image, Crafatar etc.) enter karein.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">
                      Staff Role *
                    </label>
                    <select
                      value={staffRole}
                      onChange={(e) => setStaffRole(e.target.value as StaffMember['role'])}
                      className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-accent font-bold"
                    >
                      <option value="Owner">👑 Owner</option>
                      <option value="Co-Owner">🔱 Co-Owner</option>
                      <option value="Manager">💼 Manager</option>
                      <option value="Senior Admin">💎 Senior Admin</option>
                      <option value="Admin">🛡️ Admin</option>
                      <option value="Junior Admin">🔰 Junior Admin</option>
                      <option value="Developer">💻 Developer</option>
                      <option value="Senior Moderator">⚔️ Senior Moderator</option>
                      <option value="Moderator">🔨 Moderator</option>
                      <option value="Junior Moderator">🗡️ Junior Moderator</option>
                      <option value="Helper">🤝 Helper</option>
                      <option value="Staff">✨ General Staff</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">
                      Role Description / Responsibility
                    </label>
                    <input
                      type="text"
                      value={staffDesc}
                      onChange={(e) => setStaffDesc(e.target.value)}
                      placeholder="e.g. Server Founder, Store Lead, Anti-cheat"
                      className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-muted-foreground">
                        Discord Profile ID or URL (Opens their profile directly)
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowDiscordMobileGuide(!showDiscordMobileGuide)}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold underline flex items-center gap-1"
                      >
                        <span>📱 {showDiscordMobileGuide ? 'Hide Mobile Guide' : 'Mobile Guide (How to copy)'}</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={staffDiscordId}
                      onChange={(e) => setStaffDiscordId(e.target.value)}
                      placeholder="e.g. 109054142759123456 or https://discord.com/users/..."
                      className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-accent font-mono"
                    />
                    <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>💡 Paste either Discord 18-digit User ID or https://discord.com/users/...</span>
                    </div>

                    {showDiscordMobileGuide && (
                      <div className="mt-2 p-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-200 text-xs space-y-2">
                        <div className="font-bold flex items-center gap-1.5 text-indigo-300">
                          <span>📱 Mobile me Discord Profile Link / User ID copy karne ka tarika:</span>
                        </div>
                        <ol className="list-decimal pl-4 space-y-1 text-[11px] leading-relaxed text-indigo-200/90">
                          <li>
                            <strong>Discord App</strong> open karein (Android ya iPhone).
                          </li>
                          <li>
                            Niche right corner me apni <strong>Profile</strong> tap karein &gt; <strong>Settings (Gear icon)</strong> &gt; Scroll karke <strong>Advanced</strong> me jayein &gt; <strong>Developer Mode ko ON</strong> karein.
                          </li>
                          <li>
                            Ab jis Staff bande ki profile chahiye, unke avatar/naam par tap karein.
                          </li>
                          <li>
                            Profile ke top-right corner me <strong>3 dots (...)</strong> par tap karein.
                          </li>
                          <li>
                            <strong>&quot;Copy User ID&quot;</strong> tap karein (ya <strong>&quot;Share Profile&quot; &gt; &quot;Copy Link&quot;</strong> karein).
                          </li>
                          <li>
                            Copied text ko upar box me paste kar dein! Website apne aap unka direct profile open karegi.
                          </li>
                        </ol>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">
                      Discord Username / Tag (Optional)
                    </label>
                    <input
                      type="text"
                      value={staffDiscordUsername}
                      onChange={(e) => setStaffDiscordUsername(e.target.value)}
                      placeholder="e.g. spearxdd or @spearxdd"
                      className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-accent font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingStaff}
                    className="w-full rounded-xl bg-accent py-2.5 text-xs font-black uppercase tracking-wider text-accent-foreground hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isSavingStaff ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving Staff Member...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>💾 {editingStaffId ? 'Save Staff Changes' : 'Save & Add Staff Member'}</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Right Column: Existing Staff List */}
              <div className="lg:col-span-7">
                <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-foreground font-display">
                      Current Staff ({staffList.length})
                    </h3>
                    <span className="text-[10px] text-muted-foreground">
                      Publicly visible in Staff Modal & Team Page
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSaveStaffTeamToWebsite()}
                    disabled={isSavingStaff}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/15 border border-accent/30 text-accent font-extrabold text-[11px] hover:bg-accent/25 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span>💾 Save Staff List</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                  {sortStaffByHierarchy(staffList).map((st) => {
                    const canUp = canMoveUpInTier(staffList, st.id);
                    const canDown = canMoveDownInTier(staffList, st.id);

                    return (
                      <div
                        key={st.id}
                        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-surface-deep/80 hover:border-border-strong transition-all"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="h-12 w-8 shrink-0 flex items-center justify-center">
                            <MinecraftSkinImage
                              name={st.name}
                              type="body"
                              customUrl={st.avatar_url}
                              className="h-12 object-contain"
                              alt={`${st.name}'s skin`}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="font-extrabold text-sm text-foreground truncate">
                                {st.name}
                              </span>
                              <span
                                className={`rounded px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                                  st.role === 'Owner'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : st.role === 'Co-Owner'
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                    : st.role === 'Manager'
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    : st.role === 'Admin' || st.role === 'Senior Admin' || st.role === 'Junior Admin'
                                    ? 'bg-accent/20 text-accent border border-accent/30'
                                    : st.role === 'Developer'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-surface text-muted-foreground border border-border'
                                }`}
                              >
                                {st.role}
                              </span>
                              {st.avatar_url && (
                                <span className="rounded px-1.5 py-0.5 text-[9px] font-extrabold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                  Custom Skin
                                </span>
                              )}
                              {(st.discord_id || st.discord_url) ? (
                                <span className="rounded px-1.5 py-0.5 text-[9px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                                  <MessageSquare className="w-2.5 h-2.5" />
                                  Profile Linked
                                </span>
                              ) : st.discord_username ? (
                                <span className="rounded px-1.5 py-0.5 text-[9px] font-extrabold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 font-mono">
                                  <MessageSquare className="w-2.5 h-2.5" />
                                  @{st.discord_username.replace(/^@/, '')}
                                </span>
                              ) : null}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {st.description || `${st.role} on ${config.brand}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-border/60">
                          {/* Reordering within same Role Tier */}
                          <button
                            type="button"
                            onClick={() => handleMoveStaffUp(st)}
                            disabled={!canUp}
                            className="p-2 rounded-lg border border-border bg-surface text-muted-foreground hover:text-amber-300 hover:border-amber-400/50 disabled:opacity-20 disabled:hover:text-muted-foreground disabled:hover:border-border transition-colors cursor-pointer disabled:cursor-not-allowed"
                            title={
                              canUp
                                ? `Move ${st.name} UP within ${st.role} rank`
                                : `Cannot move above ${st.role} rank tier`
                            }
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleMoveStaffDown(st)}
                            disabled={!canDown}
                            className="p-2 rounded-lg border border-border bg-surface text-muted-foreground hover:text-amber-300 hover:border-amber-400/50 disabled:opacity-20 disabled:hover:text-muted-foreground disabled:hover:border-border transition-colors cursor-pointer disabled:cursor-not-allowed"
                            title={
                              canDown
                                ? `Move ${st.name} DOWN within ${st.role} rank`
                                : `Cannot move below ${st.role} rank tier`
                            }
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>

                          <div className="h-4 w-px bg-border mx-1" />

                          <button
                            type="button"
                            onClick={() => {
                              handleSaveStaffTeamToWebsite();
                              success(`Staff member "${st.name}" verified and saved on website!`);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-accent/15 border border-accent/30 text-xs font-extrabold text-accent hover:bg-accent/25 transition-colors flex items-center gap-1 cursor-pointer"
                            title="Save staff member to website"
                          >
                            <span>💾 Save</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEditStaff(st)}
                            className="p-2 rounded-lg border border-border bg-surface text-muted-foreground hover:text-accent hover:border-accent transition-colors cursor-pointer"
                            title="Edit staff member"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteStaff(st)}
                            className="p-2 rounded-lg border border-border bg-surface text-muted-foreground hover:text-red-400 hover:border-red-400 transition-colors cursor-pointer"
                            title="Delete staff member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: TOP SUPPORTERS MANAGEMENT                    */}
          {/* ==================================================== */}
          {activeTab === 'supporters' && (
            <div className="space-y-5">
              {/* Header Save Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border border-gold/30 bg-gold/5 backdrop-blur-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center shrink-0">
                    <Trophy className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black uppercase tracking-wider text-foreground font-display">
                        Top Supporters & Donators Leaderboard
                      </h3>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/30">
                        {leaderboard.length} Donators
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Manage top buyer rankings and donated amounts. All edits automatically save & persist to website.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-border text-[11px] font-bold text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
                    <span>Auto-Sync Active</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSaveSupportersToWebsite()}
                    disabled={isSavingSupporters}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold text-lime-foreground font-black text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isSavingSupporters ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving to Website...</span>
                      </>
                    ) : supporterSavedSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-lime-foreground" />
                        <span>✅ Saved to Website!</span>
                      </>
                    ) : (
                      <>
                        <span>💾 Save Supporters</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Form to Add/Edit Supporter */}
                <div className="lg:col-span-5 rounded-2xl border border-border bg-surface-deep p-4 sm:p-5">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-gold" />
                      <h3 className="text-sm font-black uppercase tracking-wider text-foreground font-display">
                        {editingSupporterId ? 'Edit Supporter' : 'Add Top Supporter'}
                      </h3>
                    </div>
                    {editingSupporterId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSupporterId(null);
                          setSupporterUsername('');
                          setSupporterAmount('');
                        }}
                        className="text-[11px] font-bold text-muted-foreground hover:text-foreground"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleSaveSupporter} className="space-y-4">
                    {/* Realtime Minecraft Skin Avatar Box */}
                    <div className="flex items-center gap-3.5 p-3 rounded-xl border border-border bg-surface">
                      <div className="relative h-14 w-14 shrink-0 rounded-xl border border-border/80 bg-surface-deep flex items-center justify-center overflow-hidden">
                        <img
                          src={`https://mc-heads.net/avatar/${encodeURIComponent(supporterUsername.trim() || 'Steve')}/64`}
                          alt="Minecraft skin preview"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://mc-heads.net/avatar/Steve/64';
                          }}
                          className="h-12 w-12 rounded-lg [image-rendering:pixelated]"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                          Skin Auto-Preview
                        </span>
                        <span className="text-xs font-bold text-foreground truncate block font-mono">
                          {supporterUsername.trim() || 'Type IGN below...'}
                        </span>
                        <span className="text-[10px] text-gold font-medium">
                          Instant skin generation on type
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">
                        Minecraft Username (IGN) *
                      </label>
                      <input
                        type="text"
                        required
                        value={supporterUsername}
                        onChange={(e) => setSupporterUsername(e.target.value)}
                        placeholder="e.g. A4DV, DarkSniper"
                        className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-gold font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">
                        Total Donated / Spent Amount (₹) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        required
                        value={supporterAmount}
                        onChange={(e) => setSupporterAmount(e.target.value)}
                        placeholder="e.g. 3500, 1499"
                        className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-gold font-mono font-bold"
                      />
                      <span className="text-[10px] text-muted-foreground mt-1 block">
                        Leaderboard automatically re-orders based on highest donated amount.
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingSupporters}
                      className="w-full rounded-xl bg-gold py-2.5 text-xs font-black uppercase tracking-wider text-lime-foreground hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      {isSavingSupporters ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving Supporter...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>💾 {editingSupporterId ? 'Save Supporter Changes' : 'Save & Add Top Supporter'}</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Right Column: Supporters Leaderboard List */}
                <div className="lg:col-span-7">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-foreground font-display">
                        Supporters Leaderboard ({leaderboard.length})
                      </h3>
                      <span className="text-[10px] text-muted-foreground">
                        Publicly visible on Homepage Leaderboard
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSaveSupportersToWebsite()}
                      disabled={isSavingSupporters}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/15 border border-gold/30 text-gold font-extrabold text-[11px] hover:bg-gold/25 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <span>💾 Save Leaderboard</span>
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                    {leaderboard.map((b, index) => {
                      const rank = b.rank || index + 1;
                      const isFirst = rank === 1;

                      return (
                        <div
                          key={b.id}
                          className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl border transition-all ${
                            isFirst
                              ? 'border-gold/50 bg-gold/5 shadow-sm'
                              : 'border-border bg-surface-deep/80'
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            {/* Rank indicator */}
                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-black text-xs font-display ${
                                rank === 1
                                  ? 'bg-gold text-lime-foreground'
                                  : rank === 2
                                  ? 'bg-silver text-slate-900'
                                  : rank === 3
                                  ? 'bg-bronze text-white'
                                  : 'bg-surface text-muted-foreground border border-border'
                              }`}
                            >
                              {rank === 1 ? <Medal className="w-4 h-4" /> : `#${rank}`}
                            </div>

                            {/* Avatar */}
                            <img
                              src={`https://mc-heads.net/avatar/${encodeURIComponent(b.username)}/64`}
                              alt={`${b.username}'s skin`}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://mc-heads.net/avatar/Steve/64';
                              }}
                              className="h-10 w-10 rounded-lg [image-rendering:pixelated] border border-border shrink-0"
                            />

                            <div className="min-w-0">
                              <span className="font-extrabold text-sm text-foreground truncate block">
                                {b.username}
                              </span>
                              <span className="text-[11px] font-bold text-muted-foreground">
                                Rank #{rank} Donator
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-border/60">
                            <span
                              className={`text-sm font-black font-display ${
                                rank === 1 ? 'text-gold' : 'text-foreground'
                              }`}
                            >
                              {formatINR(b.total_spent)}
                            </span>

                            <div className="flex items-center gap-2 flex-wrap shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  handleSaveSupportersToWebsite();
                                  success(`Supporter "${b.username}" verified and saved on website!`);
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-gold/15 border border-gold/30 text-xs font-extrabold text-gold hover:bg-gold/25 transition-colors flex items-center gap-1 cursor-pointer"
                                title="Save supporter to website"
                              >
                                <span>💾 Save</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleEditSupporter(b)}
                                className="p-2 rounded-lg border border-border bg-surface text-muted-foreground hover:text-gold hover:border-gold transition-colors cursor-pointer"
                                title="Edit supporter"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSupporter(b)}
                                className="p-2 rounded-lg border border-border bg-surface text-muted-foreground hover:text-red-400 hover:border-red-400 transition-colors cursor-pointer"
                                title="Delete supporter"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: PRODUCTS MANAGEMENT                           */}
          {/* ==================================================== */}
          {activeTab === 'products' && (
            <div>
              {/* Homepage Category Icons & Category CRUD Manager */}
              <div className="mb-6 rounded-2xl border border-border bg-surface-deep/90 p-4 sm:p-5 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent border border-accent/30">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-foreground font-display flex items-center gap-2">
                        <span>Homepage Categories &amp; Store Icons Manager</span>
                        <span className="rounded bg-accent/20 px-2 py-0.5 text-[9px] font-extrabold text-accent">
                          {categories.length} Categories
                        </span>
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        Create, edit, change PNG, and save store categories shown on homepage tiles and products view.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleOpenAddStoreCategory}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-3 py-1.5 text-xs font-black uppercase tracking-wide text-accent-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Category</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCategoryManager(!showCategoryManager)}
                      className="text-xs font-bold text-accent hover:underline flex items-center gap-1 px-2 py-1"
                    >
                      {showCategoryManager ? 'Hide Manager' : 'Manage Categories ⚙️'}
                    </button>
                  </div>
                </div>

                {/* Add / Edit Category Form */}
                {isStoreCategoryModalOpen && (
                  <form onSubmit={handleSaveStoreCategory} className="p-4 rounded-xl border border-accent/40 bg-surface/80 space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-border pb-2.5">
                      <div className="flex items-center gap-2">
                        <FolderPlus className="w-4 h-4 text-accent" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-foreground font-display">
                          {editingCatId ? 'Edit & Save Category' : 'Create & Save New Category'}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsStoreCategoryModalOpen(false);
                          setEditingCatId(null);
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground font-bold"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground mb-1">
                          Category Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={storeCatNameInput}
                          onChange={(e) => setStoreCatNameInput(e.target.value)}
                          placeholder="e.g. Ranks, Coins, Keys, Kits, Others"
                          className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-xs text-foreground outline-none focus:border-accent font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-muted-foreground mb-1">
                          Category Tagline / Description
                        </label>
                        <input
                          type="text"
                          value={storeCatDescInput}
                          onChange={(e) => setStoreCatDescInput(e.target.value)}
                          placeholder="e.g. Exclusive perks, commands, and abilities"
                          className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-xs text-foreground outline-none focus:border-accent"
                        />
                      </div>
                    </div>

                    {/* Category PNG / Icon Upload */}
                    <div className="rounded-xl border border-border bg-surface-deep/80 p-3.5 space-y-3">
                      <label className="block text-xs font-bold text-foreground flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-accent" />
                        <span>Category Icon / PNG (Shows on Homepage Tile &amp; Products)</span>
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        <div className="sm:col-span-3 flex flex-col items-center justify-center p-2 rounded-xl border border-border bg-surface h-24">
                          <img
                            src={storeCatImageInput || '/store/ranks.png'}
                            alt="Category Preview"
                            className="h-16 w-16 object-contain drop-shadow"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/store/ranks.png';
                            }}
                          />
                        </div>

                        <div className="sm:col-span-9 space-y-2">
                          <div className="flex items-center gap-2">
                            <label className="flex-1 cursor-pointer rounded-xl border border-accent/40 bg-accent/10 hover:bg-accent/20 px-3 py-2 text-xs font-bold text-accent transition-colors flex items-center justify-center gap-2">
                              <Upload className="w-4 h-4 text-accent" />
                              <span>Upload Category PNG from Device</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const opt = await optimizeImage(file, 480, 480, 0.88);
                                    if (opt) setStoreCatImageInput(opt);
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mr-1">
                              Presets:
                            </span>
                            {[
                              { label: '👑 Ranks', url: '/store/ranks.png' },
                              { label: '🪙 Coins', url: '/store/coins.png' },
                              { label: '🔑 Keys', url: '/store/keys.png' },
                              { label: '⚔️ Kits', url: '/store/kits.png' },
                              { label: '🎁 Others', url: '/store/others.png' },
                            ].map((preset) => (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() => setStoreCatImageInput(preset.url)}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                                  storeCatImageInput === preset.url
                                    ? 'border-accent bg-accent text-accent-foreground'
                                    : 'border-border bg-surface text-muted-foreground hover:text-foreground'
                                }`}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>

                          <input
                            type="text"
                            value={storeCatImageInput}
                            onChange={(e) => setStoreCatImageInput(e.target.value)}
                            placeholder="Or enter direct image URL (https://...)"
                            className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-[11px] text-foreground outline-none focus:border-accent font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsStoreCategoryModalOpen(false);
                          setEditingCatId(null);
                        }}
                        className="rounded-xl border border-border bg-surface px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-xl bg-accent px-5 py-2 text-xs font-black uppercase tracking-wider text-accent-foreground hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm"
                      >
                        <Check className="w-4 h-4" />
                        <span>💾 Save Category</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Categories Grid Display */}
                {showCategoryManager && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 pt-2 animate-fadeIn">
                    {categories.map((cat) => {
                      const isEditingThis = editingCatId === cat.id && !isStoreCategoryModalOpen;
                      const itemCount = items.filter((it) => isMatchingCategory(it.category, cat.name)).length;

                      return (
                        <div key={cat.id} className="rounded-xl border border-border bg-surface p-3 space-y-2.5 flex flex-col justify-between hover:border-accent/40 transition-colors">
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={isEditingThis ? tempCatImage : (cat.image_url || '/store/ranks.png')}
                                  alt={cat.name}
                                  className="h-10 w-10 object-contain drop-shadow"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/store/ranks.png';
                                  }}
                                />
                                <div className="min-w-0">
                                  <span className="font-extrabold text-xs text-foreground block truncate">{cat.name}</span>
                                  <span className="text-[10px] text-accent font-bold block">{itemCount} product{itemCount === 1 ? '' : 's'}</span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleOpenEditStoreCategory(cat)}
                                className="p-1 rounded-md border border-border bg-surface-deep text-muted-foreground hover:text-accent hover:border-accent"
                                title="Edit Category Details & Save"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            </div>

                            <p className="text-[10px] text-muted-foreground line-clamp-1">
                              {cat.description || 'Homepage store category tile'}
                            </p>
                          </div>

                          {isEditingThis ? (
                            <div className="space-y-2 pt-2 border-t border-border">
                              <input
                                type="text"
                                value={tempCatImage}
                                onChange={(e) => setTempCatImage(e.target.value)}
                                placeholder="Image URL (e.g. /store/ranks.png)"
                                className="w-full rounded-lg border border-border bg-surface-deep px-2.5 py-1 text-[11px] text-foreground font-mono outline-none"
                              />
                              <div className="flex items-center gap-1 flex-wrap">
                                {[
                                  { label: '👑 Ranks', url: '/store/ranks.png' },
                                  { label: '🪙 Coins', url: '/store/coins.png' },
                                  { label: '🔑 Keys', url: '/store/keys.png' },
                                  { label: '⚔️ Kits', url: '/store/kits.png' },
                                  { label: '🎁 Others', url: '/store/others.png' },
                                ].map((p) => (
                                  <button
                                    key={p.label}
                                    type="button"
                                    onClick={() => setTempCatImage(p.url)}
                                    className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-surface-deep border border-border text-muted-foreground hover:text-foreground"
                                  >
                                    {p.label}
                                  </button>
                                ))}
                              </div>
                              <label className="cursor-pointer block rounded-lg border border-accent/40 bg-accent/10 hover:bg-accent/20 px-2.5 py-1 text-[10px] font-bold text-accent text-center transition-colors">
                                Upload Photo
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const opt = await optimizeImage(file, 480, 480, 0.88);
                                      if (opt) setTempCatImage(opt);
                                    }
                                  }}
                                  className="hidden"
                                />
                              </label>
                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleSaveCategoryImg(cat)}
                                  className="flex-1 rounded-lg bg-accent text-accent-foreground text-[10px] font-extrabold py-1 uppercase flex items-center justify-center gap-1 shadow-sm"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>💾 Save Category</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingCatId(null)}
                                  className="rounded-lg bg-surface-deep text-muted-foreground text-[10px] font-bold px-2 py-1"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 pt-1 border-t border-border/60">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCatId(cat.id);
                                  setTempCatImage(cat.image_url || '/store/ranks.png');
                                }}
                                className="flex-1 rounded-lg bg-surface-deep border border-border hover:border-accent/40 text-[11px] font-bold text-foreground py-1 transition-colors flex items-center justify-center gap-1"
                              >
                                <ImageIcon className="w-3 h-3 text-accent" />
                                <span>Change PNG</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEditStoreCategory(cat)}
                                className="px-2 py-1 rounded-lg bg-accent/15 border border-accent/30 text-[10px] font-extrabold text-accent hover:bg-accent/25 transition-colors"
                                title="Edit Category Details"
                              >
                                💾 Save Category
                              </button>
                              {categories.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteStoreCategory(cat)}
                                  className="p-1 rounded-lg text-muted-foreground hover:text-red-400 transition-colors"
                                  title="Delete Category"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Top controls: Add button, category filter, search */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4 mb-5">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenNewProduct}
                    className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-xs font-black uppercase tracking-wider text-accent-foreground hover:opacity-90 transition-opacity shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Product
                  </button>

                  {/* Category Filter */}
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="rounded-xl border border-border bg-surface-deep px-3 py-2 text-xs font-bold text-foreground outline-none"
                  >
                    <option value="All">All Categories</option>
                    {availableCategories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search */}
                <div className="relative min-w-[200px]">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full rounded-xl border border-border bg-surface-deep pl-8 pr-3 py-1.5 text-xs text-foreground outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* Product Modal/Form when isProductFormOpen is true */}
              {isProductFormOpen && (
                <div className="mb-6 rounded-2xl border-2 border-accent/40 bg-surface-deep p-5 shadow-lg">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h3 className="text-sm font-black uppercase tracking-wider text-foreground font-display flex items-center gap-2">
                      <Package className="w-4 h-4 text-accent" />
                      {editingProductId ? 'Edit Product' : 'Create New Product'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsProductFormOpen(false)}
                      className="text-xs font-bold text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">
                        Product Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={productTitle}
                        onChange={(e) => setProductTitle(e.target.value)}
                        placeholder="e.g. Titan Rank, 5000 Coins, Netherite Kit"
                        className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-xs text-foreground outline-none focus:border-accent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">
                        Category * (Merch removed)
                      </label>
                      <select
                        value={productCategory}
                        onChange={(e) => setProductCategory(e.target.value)}
                        className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-xs text-foreground outline-none focus:border-accent font-bold"
                      >
                        {availableCategories.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">
                        Price in INR (₹) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        required
                        value={productPrice}
                        onChange={(e) => setProductPrice(e.target.value)}
                        placeholder="e.g. 199, 499"
                        className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-xs text-foreground outline-none focus:border-accent font-mono font-bold"
                      />
                    </div>

                    <div className="md:col-span-2 rounded-xl border border-border bg-surface/50 p-3.5 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-foreground flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-accent" />
                          <span>Product Image / Gallery Upload</span>
                        </label>
                        {productImage.startsWith('data:image/') || (!['/store/ranks.png', '/store/coins.png', '/store/keys.png', '/store/kits.png', '/store/others.png'].includes(productImage)) ? (
                          <button
                            type="button"
                            onClick={() => {
                              const defaultMap: Record<string, string> = {
                                Coins: '/store/coins.png',
                                Keys: '/store/keys.png',
                                Kits: '/store/kits.png',
                                Ranks: '/store/ranks.png',
                              };
                              setProductImage(defaultMap[productCategory] || '/store/ranks.png');
                              success('Reset to default preset image');
                            }}
                            className="text-[10px] text-amber-400 hover:underline font-bold"
                          >
                            Reset to Default Image
                          </button>
                        ) : null}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        {/* Live Image Preview Card */}
                        <div className="sm:col-span-3 flex flex-col items-center justify-center p-2 rounded-xl border border-border bg-surface-deep h-24">
                          <img
                            src={productImage || '/store/ranks.png'}
                            alt="Product preview"
                            className="h-16 w-16 object-contain drop-shadow"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/store/ranks.png';
                            }}
                          />
                        </div>

                        {/* Image Upload & Default Presets Controls */}
                        <div className="sm:col-span-9 space-y-2.5">
                          {/* Upload from Gallery Button */}
                          <div className="flex items-center gap-2">
                            <label className="flex-1 cursor-pointer rounded-xl border border-accent/40 bg-accent/10 hover:bg-accent/20 px-3 py-2 text-xs font-bold text-accent transition-colors flex items-center justify-center gap-2">
                              <Upload className="w-4 h-4 text-accent" />
                              <span>Upload Photo from Gallery / Device</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleProductGalleryUpload}
                                className="hidden"
                              />
                            </label>
                          </div>

                          {/* Default Category Presets */}
                          <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block mb-1">
                              Or Choose Default Store Preset:
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {[
                                { label: '👑 Ranks', url: '/store/ranks.png' },
                                { label: '🪙 Coins', url: '/store/coins.png' },
                                { label: '🔑 Keys', url: '/store/keys.png' },
                                { label: '⚔️ Kits', url: '/store/kits.png' },
                                { label: '🎁 Others', url: '/store/others.png' },
                              ].map((preset) => (
                                <button
                                  key={preset.label}
                                  type="button"
                                  onClick={() => setProductImage(preset.url)}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                                    productImage === preset.url
                                      ? 'border-accent bg-accent text-accent-foreground shadow-sm'
                                      : 'border-border bg-surface text-muted-foreground hover:text-foreground'
                                  }`}
                                >
                                  {preset.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Image URL text input for manual links */}
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={productImage}
                              onChange={(e) => setProductImage(e.target.value)}
                              placeholder="Or paste direct image URL (https://...)"
                              className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-[11px] text-foreground outline-none focus:border-accent font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-muted-foreground mb-1">
                        Description / Perks (HTML or plain text)
                      </label>
                      <textarea
                        rows={4}
                        value={productDesc}
                        onChange={(e) => setProductDesc(e.target.value)}
                        placeholder="<p><strong>Perks:</strong><br/>Add description and in-game commands here</p>"
                        className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-xs text-foreground outline-none focus:border-accent font-mono"
                      />
                    </div>

                    <div className="md:col-span-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="syncCatIconCheck"
                          checked={syncProductImageToCategory}
                          onChange={(e) => setSyncProductImageToCategory(e.target.checked)}
                          className="h-4 w-4 rounded accent-accent cursor-pointer"
                        />
                        <label htmlFor="syncCatIconCheck" className="text-xs font-bold text-foreground cursor-pointer select-none">
                          Homepage Category Tile aur category ke saare products ka PNG bhi yehi set karein?
                        </label>
                      </div>
                      <span className="text-[10px] text-indigo-300 font-semibold">
                        (Syncs with &quot;{productCategory}&quot; category tile)
                      </span>
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsProductFormOpen(false)}
                        className="rounded-xl border border-border bg-surface px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-xl bg-accent px-5 py-2 text-xs font-black uppercase tracking-wider text-accent-foreground hover:opacity-90 transition-opacity flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        {editingProductId ? 'Save Changes' : 'Create Product'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Products Table/Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {displayedProducts.map((item) => {
                  const masterIndex = items.findIndex((it) => it.id === item.id);
                  const isFirst = masterIndex === 0;
                  const isLast = masterIndex === items.length - 1;

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col justify-between rounded-xl border border-border bg-surface-deep/80 p-3.5 hover:border-border-strong transition-all relative group"
                    >
                      <div>
                        {/* Top bar with Position Badge and Move Quick Actions */}
                        <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-border/50">
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center rounded-md bg-surface px-2 py-0.5 text-[10px] font-black font-mono text-accent border border-border">
                              #{masterIndex + 1}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                              Display Pos
                            </span>
                          </div>

                          {/* Reorder Buttons (Move Up / Down / Top / Bottom) */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              disabled={isFirst}
                              onClick={() => handleMoveProductToTop(item)}
                              className="p-1 rounded-md bg-surface border border-border text-muted-foreground hover:text-accent hover:border-accent disabled:opacity-30 disabled:pointer-events-none transition-colors"
                              title="Move to Top (#1 position)"
                            >
                              <ArrowUpToLine className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={isFirst}
                              onClick={() => handleMoveProductUp(item)}
                              className="inline-flex items-center gap-0.5 px-1.5 py-1 rounded-md bg-surface border border-border text-[11px] font-bold text-muted-foreground hover:text-accent hover:border-accent disabled:opacity-30 disabled:pointer-events-none transition-colors"
                              title="Move Up 1 position"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                              <span className="text-[10px]">Up</span>
                            </button>
                            <button
                              type="button"
                              disabled={isLast}
                              onClick={() => handleMoveProductDown(item)}
                              className="inline-flex items-center gap-0.5 px-1.5 py-1 rounded-md bg-surface border border-border text-[11px] font-bold text-muted-foreground hover:text-accent hover:border-accent disabled:opacity-30 disabled:pointer-events-none transition-colors"
                              title="Move Down 1 position"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                              <span className="text-[10px]">Down</span>
                            </button>
                            <button
                              type="button"
                              disabled={isLast}
                              onClick={() => handleMoveProductToBottom(item)}
                              className="p-1 rounded-md bg-surface border border-border text-muted-foreground hover:text-accent hover:border-accent disabled:opacity-30 disabled:pointer-events-none transition-colors"
                              title="Move to Bottom (last position)"
                            >
                              <ArrowDownToLine className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={item.image_url || '/store/ranks.png'}
                              alt={item.title}
                              className="h-10 w-10 rounded-lg object-contain bg-surface border border-border p-1"
                            />
                            <div>
                              <span className="font-extrabold text-sm text-foreground block line-clamp-1">
                                {item.title}
                              </span>
                              <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground border border-border">
                                {item.category}
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-sm font-black font-display text-accent block">
                              {formatINR(item.price)}
                            </span>
                          </div>
                        </div>

                        <div
                          className="text-[11px] text-muted-foreground line-clamp-2 mb-3 bg-surface/60 rounded-lg p-2 border border-border/40"
                          dangerouslySetInnerHTML={{
                            __html: item.description?.replace(/<[^>]+>/g, ' ') || '',
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between border-t border-border/60 pt-2.5">
                        <span className="text-[10px] text-muted-foreground font-mono">
                          ID: {item.id.slice(0, 10)}
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleOpenEditProduct(item)}
                            className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-bold text-muted-foreground hover:text-accent hover:border-accent transition-colors"
                          >
                            <Edit3 className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(item)}
                            className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-bold text-muted-foreground hover:text-red-400 hover:border-red-400 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>


              {displayedProducts.length === 0 && (
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
                  No products found matching your search.
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 4: DISCOUNTS & SALES MANAGEMENT                   */}
          {/* ==================================================== */}
          {activeTab === 'discounts' && (
            <div className="space-y-8">
              {/* ==================================================== */}
              {/* SECTION 1: COUPONS & PROMO CODES MANAGEMENT          */}
              {/* ==================================================== */}
              <div className="rounded-2xl border border-accent/40 bg-surface-deep p-4 sm:p-5 space-y-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent border border-accent/40">
                      <Tag className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-foreground font-display flex items-center gap-2">
                        <span>Coupons &amp; Promo Codes</span>
                        <span className="rounded-full bg-accent/20 text-accent border border-accent/40 px-2 py-0.5 text-[10px] font-bold">
                          {couponsList.length} Active
                        </span>
                        {activeSession?.isOwner && (
                          <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-extrabold uppercase">
                            ✓ Main Owner Access
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Create promo codes with Percentage (%) or Fixed Amount (₹) discounts, expiry dates, and usage limits.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={handleOpenAddCoupon}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-black uppercase tracking-wider text-accent-foreground hover:bg-accent-hover transition-colors shadow-md cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Create Coupon</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveCouponsExplicitly}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Coupons</span>
                    </button>
                  </div>
                </div>

                {/* Filter / Search Bar */}
                {couponsList.length > 0 && (
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      value={couponSearchInput}
                      onChange={(e) => setCouponSearchInput(e.target.value)}
                      placeholder="Search coupons by code..."
                      className="w-full rounded-xl border border-border bg-surface pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-accent"
                    />
                  </div>
                )}

                {/* Coupons Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3.5">
                  {couponsList
                    .filter((c) =>
                      couponSearchInput
                        ? c.code.toLowerCase().includes(couponSearchInput.toLowerCase())
                        : true
                    )
                    .map((coupon) => {
                      const isExpired = coupon.expiryDate
                        ? coupon.expiryDate < new Date().toISOString().split('T')[0]
                        : false;
                      const isLimitReached =
                        typeof coupon.usageLimit === 'number' &&
                        coupon.usageLimit > 0 &&
                        (coupon.usedCount || 0) >= coupon.usageLimit;
                      const isEnabled = coupon.enabled !== false;

                      const discountLabel =
                        coupon.discountType === 'fixed'
                          ? `₹${coupon.discountValue || 0} OFF`
                          : `${coupon.discountValue ?? coupon.percent ?? 10}% OFF`;

                      return (
                        <div
                          key={coupon.id || coupon.code}
                          className={`relative rounded-xl border p-4 flex flex-col justify-between gap-3 transition-all ${
                            !isEnabled
                              ? 'border-border/60 bg-surface/50 opacity-60'
                              : isExpired || isLimitReached
                              ? 'border-amber-500/40 bg-amber-500/[0.03]'
                              : 'border-border bg-surface hover:border-accent/50'
                          }`}
                        >
                          {/* Header Code & Badge */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="rounded-lg bg-surface-deep border border-border px-2.5 py-1 text-xs font-mono font-black tracking-widest text-gold uppercase shadow-inner flex items-center gap-1.5">
                                <Tag className="w-3.5 h-3.5 text-accent" />
                                {coupon.code}
                              </span>
                              {coupon.category === 'private' ? (
                                <span className="rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 text-[10px] font-extrabold uppercase flex items-center gap-1">
                                  🔒 PRIVATE (SECRET)
                                </span>
                              ) : (
                                <span className="rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-extrabold uppercase flex items-center gap-1">
                                  🌐 NORMAL (PUBLIC)
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(coupon.code);
                                  success(`Copied code "${coupon.code}"`);
                                }}
                                title="Copy code"
                                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-surface-deep"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Enable / Disable Toggle Switch */}
                            <button
                              type="button"
                              onClick={() => handleToggleCouponEnabled(coupon.id || coupon.code)}
                              title={isEnabled ? 'Click to disable coupon' : 'Click to enable coupon'}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase transition-all ${
                                isEnabled
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                                  : 'bg-zinc-500/20 text-zinc-400 border border-zinc-500/40 hover:bg-zinc-500/30'
                              }`}
                            >
                              <span className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
                              {isEnabled ? 'ENABLED' : 'DISABLED'}
                            </button>
                          </div>

                          {/* Discount Value Details */}
                          <div className="space-y-1">
                            <div className="text-lg font-black font-display text-accent flex items-baseline gap-2">
                              <span>{discountLabel}</span>
                              <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground">
                                ({coupon.discountType === 'fixed' ? 'Fixed ₹ Off' : 'Percentage %'})
                              </span>
                            </div>

                            {/* Badges Info */}
                            <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px]">
                              {/* Expiry Badge */}
                              {coupon.expiryDate ? (
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                    isExpired
                                      ? 'bg-red-500/20 text-red-300 border-red-500/40'
                                      : 'bg-surface-deep text-muted-foreground border-border'
                                  }`}
                                >
                                  <Clock className="w-3 h-3" />
                                  {isExpired ? `Expired: ${coupon.expiryDate}` : `Expires: ${coupon.expiryDate}`}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-surface-deep text-muted-foreground border border-border">
                                  <Clock className="w-3 h-3 text-emerald-400" />
                                  No Expiry Date
                                </span>
                              )}

                              {/* Usage Limit Tracker */}
                              {typeof coupon.usageLimit === 'number' && coupon.usageLimit > 0 ? (
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                    isLimitReached
                                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                      : 'bg-surface-deep text-muted-foreground border-border'
                                  }`}
                                >
                                  <Users className="w-3 h-3" />
                                  {coupon.usedCount || 0} / {coupon.usageLimit} used
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-surface-deep text-muted-foreground border border-border">
                                  <Users className="w-3 h-3 text-sky-400" />
                                  Unlimited Uses ({coupon.usedCount || 0} used)
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action Controls */}
                          <div className="pt-2.5 border-t border-border/60 flex items-center justify-between gap-2">
                            <span className="text-[10px] text-muted-foreground">
                              Created: {coupon.createdAt ? new Date(coupon.createdAt).toLocaleDateString('en-IN') : 'Default'}
                            </span>
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                type="button"
                                onClick={() => handleOpenEditCoupon(coupon)}
                                className="px-2.5 py-1 rounded-lg border border-border bg-surface-deep text-xs font-bold text-foreground hover:border-accent hover:text-accent transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCoupon(coupon)}
                                className="p-1 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {couponsList.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
                    No coupons created yet. Click <strong>"+ Create Coupon"</strong> to add your first promo code!
                  </div>
                )}
              </div>

              {/* SECTION 2: GLOBAL STOREWIDE SALE */}
              <div className="rounded-2xl border border-border bg-surface-deep/80 p-5 space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-rose-500" />
                      <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                        Global Storewide Sale (All Products)
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Configure a site-wide discount banner (like Summer Sale). All items without a custom override will receive this discount.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {globalSaleEnabled ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        Global Sale ACTIVE ({globalSalePercent}% OFF)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-surface border border-border px-3 py-1 text-xs font-bold text-muted-foreground">
                        <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                        Global Sale Inactive
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Preset Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/60">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mr-1">
                    Quick Presets:
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickPresetSale(
                        'SUMMER SALE',
                        30,
                        '30% OFF',
                        '30% off on every product! Limited time summer special.'
                      )
                    }
                    className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-all flex items-center gap-1.5"
                  >
                    ☀️ Summer Sale (30% OFF)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickPresetSale(
                        'FLASH SALE',
                        50,
                        '50% OFF',
                        'Huge 50% discount across all store items! Ends soon.'
                      )
                    }
                    className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition-all flex items-center gap-1.5"
                  >
                    ⚡ Flash Sale (50% OFF)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickPresetSale(
                        'WEEKEND SPECIAL',
                        20,
                        '20% OFF',
                        'Special 20% discount on all ranks, keys and coins this weekend.'
                      )
                    }
                    className="rounded-lg border border-accent/30 bg-accent/10 px-2.5 py-1.5 text-xs font-bold text-accent hover:bg-accent/20 transition-all flex items-center gap-1.5"
                  >
                    🎮 Weekend Deal (20% OFF)
                  </button>
                  {globalSaleEnabled && (
                    <button
                      type="button"
                      onClick={handleDisableGlobalSale}
                      className="rounded-lg border border-red-500/40 bg-red-500/10 px-2.5 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-1.5 ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Turn OFF / Remove Global Sale
                    </button>
                  )}
                </div>

                {/* Live Preview Card */}
                <div className="rounded-xl border border-border/80 bg-surface p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <span>Live Store Banner Preview:</span>
                    <span className="text-accent text-[10px]">What players see on the website</span>
                  </div>
                  {globalSaleEnabled ? (
                    <div className="relative overflow-hidden rounded-lg bg-surface border border-accent/40 px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <span className="rounded-md bg-accent px-2 py-0.5 text-[10px] font-black uppercase text-accent-foreground">
                          {globalSalePill || 'SUMMER SALE'}
                        </span>
                        <span className="text-xs font-bold text-gold">
                          {globalSaleHighlight || `${globalSalePercent}% OFF`}
                        </span>
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                          — {globalSaleText || `${globalSalePercent}% off on every product!`}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-accent">Active Now</span>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-border bg-surface-deep/50 px-3.5 py-3 text-center text-xs text-muted-foreground">
                      Global sale is currently disabled. No promotional banner is visible to players.
                    </div>
                  )}
                </div>

                {/* Global Sale Form */}
                <form onSubmit={handleSaveGlobalSale} className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                        Sale Status
                      </label>
                      <button
                        type="button"
                        onClick={() => setGlobalSaleEnabled(!globalSaleEnabled)}
                        className={`w-full flex items-center justify-center gap-2 rounded-xl border py-2.5 px-3 text-xs font-black uppercase transition-all ${
                          globalSaleEnabled
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                            : 'bg-surface border-border text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {globalSaleEnabled ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            Sale is Enabled
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-muted-foreground" />
                            Sale is Disabled
                          </>
                        )}
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                        Sale Pill Label
                      </label>
                      <input
                        type="text"
                        value={globalSalePill}
                        onChange={(e) => setGlobalSalePill(e.target.value)}
                        placeholder="e.g. SUMMER SALE"
                        className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                        Discount Percentage (%)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={globalSalePercent}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setGlobalSalePercent(val);
                            setGlobalSaleHighlight(`${val}% OFF`);
                          }}
                          className="w-24 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-mono font-bold text-foreground outline-none focus:border-accent"
                        />
                        <input
                          type="range"
                          min="5"
                          max="80"
                          step="5"
                          value={globalSalePercent}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setGlobalSalePercent(val);
                            setGlobalSaleHighlight(`${val}% OFF`);
                          }}
                          className="flex-1 accent-rose-500 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                        Highlight Text
                      </label>
                      <input
                        type="text"
                        value={globalSaleHighlight}
                        onChange={(e) => setGlobalSaleHighlight(e.target.value)}
                        placeholder="e.g. 30% OFF"
                        className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Banner Subtitle / Description
                    </label>
                    <input
                      type="text"
                      value={globalSaleText}
                      onChange={(e) => setGlobalSaleText(e.target.value)}
                      placeholder="e.g. 30% off on every product! Don't miss out."
                      className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                    {globalSaleEnabled && (
                      <button
                        type="button"
                        onClick={handleDisableGlobalSale}
                        className="rounded-xl border border-border bg-surface px-4 py-2 text-xs font-bold text-muted-foreground hover:text-red-400 hover:border-red-400 transition-colors"
                      >
                        Remove Global Sale
                      </button>
                    )}
                    <button
                      type="submit"
                      className="rounded-xl bg-accent px-5 py-2 text-xs font-black uppercase tracking-wider text-accent-foreground hover:bg-accent-hover transition-colors shadow-sm"
                    >
                      Save &amp; Apply Storewide Sale
                    </button>
                  </div>
                </form>
              </div>

              {/* SECTION 2: INDIVIDUAL PRODUCT DISCOUNTS */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Tag className="w-5 h-5 text-accent" />
                      <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                        Individual Product Discounts &amp; Overrides
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Set specific discount percentage for any single product, or apply a batch discount to all items.
                    </p>
                  </div>

                  {/* Batch Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Apply to All:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleApplyBatchDiscount(15)}
                      className="rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-bold text-foreground hover:border-accent hover:text-accent transition-colors"
                    >
                      15% to All
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyBatchDiscount(25)}
                      className="rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-bold text-foreground hover:border-accent hover:text-accent transition-colors"
                    >
                      25% to All
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyBatchDiscount(50)}
                      className="rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-bold text-foreground hover:border-accent hover:text-accent transition-colors"
                    >
                      50% to All
                    </button>
                    <button
                      type="button"
                      onClick={handleClearAllCustomDiscounts}
                      className="rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear Custom
                    </button>
                  </div>
                </div>

                {/* Filter & Search */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-deep p-3 rounded-xl border border-border">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      value={discountSearch}
                      onChange={(e) => setDiscountSearch(e.target.value)}
                      placeholder="Search products to discount..."
                      className="w-full rounded-lg border border-border bg-surface pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-accent"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {['All', ...availableCategories.map((c) => c.name)].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setDiscountCategoryFilter(cat)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase transition-colors ${
                          discountCategoryFilter.toLowerCase() === cat.toLowerCase()
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-surface text-muted-foreground hover:text-foreground border border-border'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Products Discount List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {displayedDiscountProducts.map((item) => {
                    const hasCustom = typeof item.discount_percent === 'number' && item.discount_percent > 0;
                    const effectivePercent = hasCustom
                      ? item.discount_percent!
                      : globalSaleEnabled
                      ? globalSalePercent
                      : 0;
                    const discountedPrice = Math.round(item.price * (100 - effectivePercent) / 100);
                    const inputValue = itemDiscountInputs[item.id] !== undefined
                      ? itemDiscountInputs[item.id]
                      : hasCustom
                      ? String(item.discount_percent)
                      : '';

                    return (
                      <div
                        key={item.id}
                        className={`rounded-xl border p-3.5 flex flex-col justify-between gap-3 bg-surface transition-all ${
                          hasCustom
                            ? 'border-rose-500/50 shadow-sm bg-rose-500/[0.02]'
                            : 'border-border hover:border-border-strong'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="h-12 w-12 rounded-lg object-contain bg-surface-deep border border-border p-1 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/store/ranks.png';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold uppercase text-accent bg-accent/10 px-1.5 py-0.5 rounded">
                                {item.category}
                              </span>
                              {hasCustom && (
                                <span className="text-[10px] font-black uppercase text-rose-300 bg-rose-500/20 border border-rose-500/40 px-1.5 py-0.5 rounded">
                                  Custom -{item.discount_percent}% OFF
                                </span>
                              )}
                              {!hasCustom && globalSaleEnabled && (
                                <span className="text-[10px] font-bold uppercase text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded">
                                  Global -{globalSalePercent}%
                                </span>
                              )}
                            </div>
                            <h4 className="text-xs font-bold text-foreground truncate mt-1">
                              {item.title}
                            </h4>
                            <div className="flex items-baseline gap-2 mt-1">
                              <span className="text-sm font-black text-gold font-display">
                                {formatINR(discountedPrice)}
                              </span>
                              {effectivePercent > 0 && (
                                <span className="text-[11px] text-muted-foreground line-through">
                                  {formatINR(item.price)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Discount Action Controls */}
                        <div className="pt-2 border-t border-border/60 flex items-center gap-2">
                          <div className="relative flex-1">
                            <input
                              type="number"
                              min="0"
                              max="99"
                              value={inputValue}
                              onChange={(e) =>
                                setItemDiscountInputs({
                                  ...itemDiscountInputs,
                                  [item.id]: e.target.value,
                                })
                              }
                              placeholder="e.g. 25"
                              className="w-full rounded-lg border border-border bg-surface-deep px-2.5 py-1.5 text-xs font-mono text-foreground placeholder:text-muted-foreground outline-none focus:border-accent"
                            />
                            <span className="absolute right-2.5 top-1.5 text-xs text-muted-foreground font-mono">
                              %
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const pct = Number(itemDiscountInputs[item.id] ?? item.discount_percent ?? 0);
                              if (pct > 0) {
                                handleSetProductDiscount(item.id, pct);
                              } else {
                                handleRemoveProductDiscount(item.id);
                              }
                            }}
                            className="rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground hover:bg-accent-hover transition-colors whitespace-nowrap"
                          >
                            Set %
                          </button>

                          {hasCustom && (
                            <button
                              type="button"
                              onClick={() => handleRemoveProductDiscount(item.id)}
                              title="Remove custom discount"
                              className="rounded-lg border border-red-500/40 bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {displayedDiscountProducts.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
                    No products found matching your search.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 5: SUPPORT TICKETS & PLAYER INQUIRIES            */}
          {/* ==================================================== */}
          {activeTab === 'tickets' && (
            <div className="space-y-6">
              {/* Header & Quick Stats */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    <LifeBuoy className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-foreground font-display flex items-center gap-2">
                      <span>Support Ticket Management</span>
                      <span className="rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold">
                        {tickets.length} Total
                      </span>
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Review player inquiries, verify UPI payments &amp; UTR numbers, resolve rank delays, and post staff responses.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleClearResolvedTickets}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-red-400 hover:border-red-400/50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Resolved</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetTicketsToDefault();
                      success('Support tickets reset to sample defaults');
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Samples</span>
                  </button>
                </div>
              </div>

              {/* 4 Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-border bg-surface-deep p-3.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-muted-foreground mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">All Tickets</span>
                    <Inbox className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="text-2xl font-black font-display text-foreground">
                    {tickets.length}
                  </span>
                </div>

                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-amber-400 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Open / Pending</span>
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="text-2xl font-black font-display text-amber-400">
                    {tickets.filter((t) => t.status === 'open').length}
                  </span>
                </div>

                <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-3.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-sky-400 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">In Progress</span>
                    <Clock className="w-4 h-4 text-sky-400" />
                  </div>
                  <span className="text-2xl font-black font-display text-sky-400">
                    {tickets.filter((t) => t.status === 'in_progress').length}
                  </span>
                </div>

                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-emerald-400 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Resolved</span>
                    <CheckCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-2xl font-black font-display text-emerald-400">
                    {tickets.filter((t) => t.status === 'resolved').length}
                  </span>
                </div>
              </div>

              {/* Filter and Search Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-deep p-3 rounded-xl border border-border">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={ticketSearch}
                    onChange={(e) => setTicketSearch(e.target.value)}
                    placeholder="Search by IGN, ticket #, UTR, subject, discord..."
                    className="w-full rounded-lg border border-border bg-surface pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-accent"
                  />
                </div>

                {/* Status Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'all', label: 'All', count: tickets.length },
                    { id: 'open', label: 'Open', count: tickets.filter((t) => t.status === 'open').length },
                    { id: 'in_progress', label: 'In Progress', count: tickets.filter((t) => t.status === 'in_progress').length },
                    { id: 'resolved', label: 'Resolved', count: tickets.filter((t) => t.status === 'resolved').length },
                    { id: 'closed', label: 'Closed', count: tickets.filter((t) => t.status === 'closed').length },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setTicketStatusFilter(st.id as any)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase transition-colors ${
                        ticketStatusFilter === st.id
                          ? 'bg-accent text-accent-foreground shadow-sm'
                          : 'bg-surface text-muted-foreground hover:text-foreground border border-border'
                      }`}
                    >
                      {st.label} ({st.count})
                    </button>
                  ))}
                </div>

                {/* Category Dropdown */}
                <div className="shrink-0">
                  <select
                    value={ticketCategoryFilter}
                    onChange={(e) => setTicketCategoryFilter(e.target.value)}
                    className="rounded-lg border border-border bg-surface px-2.5 py-1 text-[11px] font-bold text-foreground outline-none focus:border-accent"
                  >
                    <option value="All">All Categories</option>
                    <option value="Payment / Store Issue">Payment / Store Issue</option>
                    <option value="Rank Activation Delay">Rank Activation Delay</option>
                    <option value="In-Game Report / Bug">In-Game Report / Bug</option>
                    <option value="Account / Linking Issue">Account / Linking Issue</option>
                    <option value="Other Inquiries">Other Inquiries</option>
                  </select>
                </div>
              </div>

              {/* Tickets List */}
              <div className="space-y-3.5">
                {displayedTickets.map((tkt) => {
                  const currentNote =
                    ticketNotesInput[tkt.id] !== undefined
                      ? ticketNotesInput[tkt.id]
                      : tkt.staffNotes || '';

                  return (
                    <div
                      key={tkt.id}
                      className={`rounded-2xl border p-4 sm:p-5 transition-all bg-surface flex flex-col gap-4 ${
                        tkt.status === 'open'
                          ? 'border-amber-500/40 shadow-sm bg-amber-500/[0.02]'
                          : tkt.status === 'in_progress'
                          ? 'border-sky-500/40 bg-sky-500/[0.02]'
                          : tkt.status === 'resolved'
                          ? 'border-emerald-500/40 bg-emerald-500/[0.02]'
                          : 'border-border'
                      }`}
                    >
                      {/* Top Row: User Avatar, IGN, Ticket #, Priority, Status */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://mc-heads.net/avatar/${encodeURIComponent(tkt.ign)}/64`}
                            alt={tkt.ign}
                            className="h-10 w-10 rounded-xl object-contain bg-surface-deep border border-border p-1 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://mc-heads.net/avatar/MHF_Steve/64';
                            }}
                          />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-extrabold text-foreground">
                                {tkt.ign}
                              </span>
                              <span className="rounded-md bg-surface-deep px-1.5 py-0.5 text-[10px] font-mono font-bold text-muted-foreground border border-border">
                                #{tkt.ticketNumber}
                              </span>
                              {tkt.discordContact && (
                                <span className="rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 text-[10px] font-bold">
                                  Discord: {tkt.discordContact}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                              Submitted {new Date(tkt.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Badges & Actions */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Priority Selector */}
                          <select
                            value={tkt.priority}
                            onChange={(e) => updateTicketPriority(tkt.id, e.target.value as any)}
                            className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-wider outline-none border cursor-pointer ${
                              tkt.priority === 'high'
                                ? 'bg-red-500/20 text-red-300 border-red-500/40'
                                : tkt.priority === 'medium'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-surface-deep text-muted-foreground border-border'
                            }`}
                          >
                            <option value="high">🔥 High Priority</option>
                            <option value="medium">⚡ Medium Priority</option>
                            <option value="low">Low Priority</option>
                          </select>

                          {/* Status Pill / Dropdown */}
                          <select
                            value={tkt.status}
                            onChange={(e) => updateTicketStatus(tkt.id, e.target.value as any)}
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-black uppercase tracking-wider outline-none border cursor-pointer ${
                              tkt.status === 'open'
                                ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold'
                                : tkt.status === 'in_progress'
                                ? 'bg-sky-500 text-white border-sky-400'
                                : tkt.status === 'resolved'
                                ? 'bg-emerald-500 text-white border-emerald-400'
                                : 'bg-surface-deep text-muted-foreground border-border'
                            }`}
                          >
                            <option value="open">⚡ Open</option>
                            <option value="in_progress">🔄 In Progress</option>
                            <option value="resolved">✅ Resolved</option>
                            <option value="closed">🔒 Closed</option>
                          </select>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteTicket(tkt)}
                            className="p-1.5 rounded-lg border border-border bg-surface text-muted-foreground hover:text-red-400 hover:border-red-400 transition-colors"
                            title="Delete Ticket"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Middle: Category & Subject & Message */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-accent/15 text-accent border border-accent/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                            {tkt.category}
                          </span>
                          <h4 className="text-xs font-extrabold text-foreground">
                            {tkt.subject}
                          </h4>
                        </div>

                        <div className="rounded-xl border border-border/80 bg-surface-deep p-3.5 text-xs text-foreground leading-relaxed whitespace-pre-wrap font-sans">
                          {tkt.message}
                        </div>

                        {tkt.screenshotUrl && (
                          <div className="mt-2.5 rounded-xl border border-lime/30 bg-lime/5 p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] font-black text-lime flex items-center gap-1.5 uppercase tracking-wider">
                                <ImageIcon className="w-3.5 h-3.5 text-lime" />
                                <span>Attached Payment Receipt Screenshot</span>
                              </span>
                              {tkt.screenshotUrl.startsWith('http') && (
                                <a
                                  href={tkt.screenshotUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-lime hover:underline font-bold"
                                >
                                  Open Full Resolution ↗
                                </a>
                              )}
                            </div>
                            <div className="max-h-64 overflow-hidden rounded-lg border border-border bg-black/50 flex items-center justify-center p-1">
                              <img
                                src={tkt.screenshotUrl}
                                alt="Payment Receipt Screenshot"
                                className="max-h-60 w-auto object-contain rounded cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => window.open(tkt.screenshotUrl, '_blank')}
                                title="Click to view full image"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Bottom: Staff Notes / Staff Reply Form */}
                      <div className="rounded-xl border border-border/60 bg-surface-deep/60 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5">
                            <MessageCircle className="w-3.5 h-3.5 text-accent" />
                            <span>Staff Internal Notes &amp; Action Remarks:</span>
                          </label>
                          {tkt.staffNotes && (
                            <span className="text-[10px] text-lime font-bold">
                              ✓ Note saved
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={currentNote}
                            onChange={(e) =>
                              setTicketNotesInput((prev) => ({
                                ...prev,
                                [tkt.id]: e.target.value,
                              }))
                            }
                            placeholder="Type resolution notes (e.g. UTR verified, rank given in-game)..."
                            className="flex-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-accent"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveTicketNote(tkt.id)}
                            className="rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer flex items-center gap-1"
                          >
                            <Save className="w-3 h-3" />
                            <span>Save</span>
                          </button>
                        </div>
                      </div>

                      {/* Quick Status Buttons */}
                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/40">
                        {tkt.status !== 'in_progress' && (
                          <button
                            type="button"
                            onClick={() => {
                              updateTicketStatus(tkt.id, 'in_progress');
                              success(`Ticket #${tkt.ticketNumber} marked In Progress`);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-sky-500/40 bg-sky-500/10 px-2.5 py-1 text-[11px] font-bold text-sky-300 hover:bg-sky-500/20 transition-colors"
                          >
                            <Clock className="w-3 h-3" />
                            Set In Progress
                          </button>
                        )}
                        {tkt.status !== 'resolved' && (
                          <button
                            type="button"
                            onClick={() => handleApproveOrderTicket(tkt)}
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                          >
                            <CheckCheck className="w-3 h-3 text-emerald-400" />
                            Mark Resolved &amp; Notify
                          </button>
                        )}
                        {tkt.status !== 'closed' && (
                          <button
                            type="button"
                            onClick={() => {
                              updateTicketStatus(tkt.id, 'closed');
                              success(`Ticket #${tkt.ticketNumber} closed`);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1 text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <X className="w-3 h-3" />
                            Close
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {displayedTickets.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-surface-deep/40">
                    <Inbox className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-foreground">No Tickets Found</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      No support tickets match your current status or category filter.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB: UPDATES & ANNOUNCEMENTS MANAGEMENT              */}
          {/* ==================================================== */}
          {activeTab === 'updates' && (
            <div className="space-y-6">
              {/* Header Info & Publish Trigger */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-wide text-foreground font-display flex items-center gap-2">
                    <Radio className="w-5 h-5 text-sky-400 animate-pulse" />
                    <span>Server Updates &amp; Announcements</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Post news, maintenance alerts, patch notes &amp; gallery photos with automatic IST timestamps for the Updates Page.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddUpdate}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:from-sky-400 hover:to-blue-500 shadow-md transition-all shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post New Update</span>
                </button>
              </div>

              {/* Add / Edit Update Form Modal Box */}
              {isUpdateFormOpen && (
                <form onSubmit={handleSaveUpdate} className="rounded-2xl border border-sky-500/30 bg-surface-deep p-6 space-y-5 animate-fadeIn shadow-lg">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <h4 className="text-sm font-black uppercase tracking-wider text-sky-400 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>{editingUpdate ? 'Edit Server Update' : 'Publish New Server Update'}</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsUpdateFormOpen(false)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Update Title */}
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Update Title <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={updateTitle}
                        onChange={(e) => setUpdateTitle(e.target.value)}
                        placeholder="e.g. 🔥 Season 4 Lifesteal Grand Opening"
                        className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-xs text-foreground outline-none focus:border-sky-500"
                        required
                      />
                    </div>

                    {/* Category Tag */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Category Tag
                      </label>
                      <select
                        value={updateTag}
                        onChange={(e) => setUpdateTag(e.target.value as UpdateTag)}
                        className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-xs text-foreground outline-none focus:border-sky-500"
                      >
                        <option value="Announcement">📢 Announcement</option>
                        <option value="Update">⚡ Update</option>
                        <option value="Event">🎁 Event</option>
                        <option value="Maintenance">🔧 Maintenance</option>
                        <option value="Patch Notes">📝 Patch Notes</option>
                      </select>
                    </div>

                    {/* Author Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Posted By (Author)
                      </label>
                      <input
                        type="text"
                        value={updateAuthor}
                        onChange={(e) => setUpdateAuthor(e.target.value)}
                        placeholder="e.g. WonderMC Admin / SpearXDD"
                        className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-xs text-foreground outline-none focus:border-sky-500"
                      />
                    </div>

                    {/* Pinned Checkbox */}
                    <div className="sm:col-span-2 flex items-center gap-3 pt-3">
                      <label className="relative flex items-center gap-2.5 cursor-pointer text-xs font-bold text-foreground">
                        <input
                          type="checkbox"
                          checked={updatePinned}
                          onChange={(e) => setUpdatePinned(e.target.checked)}
                          className="w-4 h-4 rounded border-border bg-surface text-sky-500 focus:ring-sky-500"
                        />
                        <span className="flex items-center gap-1.5">
                          <Pin className="w-3.5 h-3.5 text-amber-400" />
                          <span>Pin this announcement at the top of Updates Page</span>
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Message / Announcement Content <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={updateContent}
                      onChange={(e) => setUpdateContent(e.target.value)}
                      rows={5}
                      placeholder="Write your update description here... (supports paragraphs and bullet points)"
                      className="w-full rounded-xl border border-border bg-surface p-3.5 text-xs text-foreground outline-none focus:border-sky-500 leading-relaxed font-sans"
                      required
                    />
                  </div>

                  {/* Multiple Images Attachment Section */}
                  <div className="space-y-3 border-t border-border/60 pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-foreground block">
                          Attach Images / Screenshots (Multiple Allowed)
                        </label>
                        <span className="text-[11px] text-muted-foreground">
                          Add as many images as you want — they will display vertically stacked (1 image ke niche 1 image).
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddImageSlot}
                        className="flex items-center gap-1.5 rounded-xl border border-sky-500/40 bg-sky-500/10 px-3 py-1.5 text-xs font-bold text-sky-400 hover:bg-sky-500/20 transition-colors cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Image</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {updateImageUrls.map((imgUrl, index) => (
                        <div
                          key={index}
                          className="rounded-2xl border border-border bg-surface-deep p-3.5 space-y-3"
                        >
                          <div className="flex items-center justify-between text-xs font-bold text-sky-400">
                            <span>Image #{index + 1}</span>
                            {updateImageUrls.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveImageSlot(index)}
                                className="text-red-400 hover:text-red-300 flex items-center gap-1 text-[11px] font-extrabold cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove</span>
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                            <div className="space-y-2">
                              {/* Direct URL input */}
                              <input
                                type="url"
                                value={imgUrl}
                                onChange={(e) => handleUpdateImageSlot(index, e.target.value)}
                                placeholder="Paste image URL (e.g. https://i.imgur.com/example.png)"
                                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground outline-none focus:border-sky-500"
                              />

                              {/* Gallery File Upload Button */}
                              <div className="relative">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleSlotGalleryUpload(index, e)}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-sky-500/30 bg-sky-500/5 px-3 py-2 text-xs font-bold text-sky-400 hover:bg-sky-500/10 transition-colors">
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>Upload Image #{index + 1} from Phone / Gallery</span>
                                </div>
                              </div>
                            </div>

                            {/* Image Thumbnail Preview */}
                            {imgUrl.trim() ? (
                              <div className="relative rounded-xl border border-border bg-black/60 p-1 overflow-hidden max-h-32 flex items-center justify-center">
                                <img
                                  src={imgUrl}
                                  alt={`Preview #${index + 1}`}
                                  className="max-h-28 w-auto object-contain rounded"
                                />
                              </div>
                            ) : (
                              <div className="rounded-xl border border-dashed border-border/50 bg-surface/30 p-2 text-center text-muted-foreground text-[11px] flex items-center justify-center min-h-[70px]">
                                No image attached for #{index + 1}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Form Action Buttons */}
                  <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                    <button
                      type="button"
                      onClick={() => setIsUpdateFormOpen(false)}
                      className="rounded-xl border border-border bg-surface px-4 py-2 text-xs font-bold text-foreground hover:bg-surface-deep"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2 text-xs font-black uppercase text-slate-950 hover:bg-sky-400 shadow-md transition-all cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>{editingUpdate ? 'Save Changes' : 'Publish Update'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Updates Search & Filter */}
              <div className="flex items-center justify-between gap-4">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={updateSearch}
                    onChange={(e) => setUpdateSearch(e.target.value)}
                    placeholder="Search published updates..."
                    className="w-full rounded-xl border border-border bg-surface pl-9 pr-3.5 py-2 text-xs text-foreground outline-none focus:border-sky-500"
                  />
                </div>

                <div className="text-xs font-mono font-bold text-muted-foreground">
                  Total Updates: {updatesList.length}
                </div>
              </div>

              {/* Updates List Table / Cards */}
              <div className="space-y-4">
                {updatesList
                  .filter(
                    (u) =>
                      u.title.toLowerCase().includes(updateSearch.toLowerCase()) ||
                      u.content.toLowerCase().includes(updateSearch.toLowerCase()) ||
                      u.author.toLowerCase().includes(updateSearch.toLowerCase())
                  )
                  .map((upd) => (
                    <div
                      key={upd.id}
                      className={`rounded-2xl border p-5 transition-all ${
                        upd.pinned
                          ? 'border-amber-500/40 bg-amber-500/5'
                          : 'border-border bg-surface-deep'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            {upd.pinned && (
                              <span className="inline-flex items-center gap-1 rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-black uppercase text-amber-300 border border-amber-500/40">
                                <Pin className="w-3 h-3 text-amber-400" />
                                Pinned
                              </span>
                            )}
                            <span className="rounded bg-sky-500/20 px-2 py-0.5 text-[10px] font-black uppercase text-sky-400 border border-sky-500/30">
                              {upd.tag}
                            </span>
                            <span className="font-mono text-sky-300 font-bold bg-sky-950/60 px-2 py-0.5 rounded text-[11px] border border-sky-500/20">
                              🕒 {formatISTDateTime(upd.createdAt)}
                            </span>
                          </div>

                          <h4 className="text-base font-black text-foreground font-display">
                            {upd.title}
                          </h4>

                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {upd.content}
                          </p>

                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1">
                            <span>Posted by: <strong className="text-foreground">{upd.author}</strong></span>
                            {upd.imageUrl && (
                              <span className="text-sky-400 flex items-center gap-1 font-bold">
                                <ImageIcon className="w-3 h-3" /> Image attached
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 flex-wrap shrink-0">
                          <button
                            type="button"
                            onClick={() => handleTogglePinUpdate(upd.id)}
                            title={upd.pinned ? 'Unpin Update' : 'Pin Update to top'}
                            className={`rounded-xl border p-2 text-xs font-bold transition-colors ${
                              upd.pinned
                                ? 'border-amber-500/40 bg-amber-500/20 text-amber-300'
                                : 'border-border bg-surface text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <Pin className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditUpdate(upd)}
                            className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-bold text-foreground hover:bg-surface-deep hover:border-accent/40 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-accent" />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteUpdate(upd.id, upd.title)}
                            className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                {updatesList.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-surface-deep/40">
                    <Radio className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-foreground">No Updates Published Yet</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Click "+ Post New Update" above to publish your first server announcement with custom image and IST timestamp.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB: VOTE LINKS & SITES MANAGEMENT                   */}
          {/* ==================================================== */}
          {activeTab === 'vote' && (
            <div className="space-y-6 max-w-4xl">
              {/* Vote Sites & Daily Links Management */}
              <div className="rounded-2xl border border-border bg-surface-deep p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-fuchsia-500/10 text-fuchsia-400">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black uppercase tracking-wider text-foreground font-display">
                          Vote Sites &amp; Daily Links
                        </h4>
                        <span className="rounded-full bg-fuchsia-500/20 text-fuchsia-300 px-2 py-0.5 text-[10px] font-extrabold border border-fuchsia-500/30">
                          {(voteLinks || []).length} Active
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Add, edit, delete, and configure daily vote server directories. Changes sync immediately to the website.
                      </p>
                    </div>
                  </div>

                  {(voteLinks || []).length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Are you sure you want to remove all vote links from the website?')) {
                          onUpdateVoteLinks?.([]);
                          success('All vote links removed from website!');
                          onLogActivity?.('All Vote Links Cleared', 'Removed all vote sites from store website', 'settings', activeSession?.name);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear All Links</span>
                    </button>
                  )}
                </div>

                {/* List of existing vote links */}
                <div className="space-y-3">
                  {(voteLinks || []).length === 0 ? (
                    <div className="text-center py-6 text-xs text-muted-foreground">
                      No vote links configured. Add your first vote site below!
                    </div>
                  ) : (
                    (voteLinks || []).map((link, idx) => (
                      <div
                        key={link.id}
                        className="p-4 rounded-xl border border-border bg-surface flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        {editingVoteId === link.id ? (
                          <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-1">
                                  Vote Site Name
                                </label>
                                <input
                                  type="text"
                                  value={editingVoteName}
                                  onChange={(e) => setEditingVoteName(e.target.value)}
                                  className="w-full rounded-lg border border-border bg-surface-deep px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
                                  placeholder="Minecraft Server List"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-1">
                                  Display Host
                                </label>
                                <input
                                  type="text"
                                  value={editingVoteHost}
                                  onChange={(e) => setEditingVoteHost(e.target.value)}
                                  className="w-full rounded-lg border border-border bg-surface-deep px-3 py-2 text-xs font-mono text-foreground outline-none focus:border-accent"
                                  placeholder="minecraft-server-list.com"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-1">
                                  Redirect Link URL
                                </label>
                                <input
                                  type="text"
                                  value={editingVoteUrl}
                                  onChange={(e) => setEditingVoteUrl(e.target.value)}
                                  className="w-full rounded-lg border border-border bg-surface-deep px-3 py-2 text-xs font-mono text-foreground outline-none focus:border-accent"
                                  placeholder="https://..."
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                type="button"
                                onClick={() => setEditingVoteId(null)}
                                className="px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-deep text-xs font-bold text-muted-foreground cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveEditVoteLink(link.id)}
                                className="px-3 py-1.5 rounded-lg bg-accent text-accent-foreground hover:opacity-90 text-xs font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Save Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-3">
                              <span className="flex h-6 w-6 items-center justify-center rounded bg-surface-deep text-xs font-bold text-muted-foreground border border-border">
                                {idx + 1}
                              </span>
                              <div>
                                <span className="block text-xs font-black text-foreground">{link.name}</span>
                                <span className="text-[10px] text-muted-foreground font-mono">{link.host}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg border border-border bg-surface-deep hover:border-border-strong text-muted-foreground hover:text-foreground transition-all"
                                title="Visit Site"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              <button
                                type="button"
                                onClick={() => handleStartEditVoteLink(link)}
                                className="p-1.5 rounded-lg border border-border bg-surface-deep hover:border-border-strong text-accent hover:text-accent/90 transition-all cursor-pointer"
                                title="Edit Vote Link"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteVoteLink(link.id, link.name)}
                                className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/5 hover:border-red-500/40 text-red-400 hover:text-red-300 transition-all cursor-pointer"
                                title="Delete Site"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Add new vote link form */}
                <form onSubmit={handleAddVoteLink} className="pt-4 border-t border-border/70 space-y-3">
                  <h5 className="text-xs font-black uppercase tracking-wider text-foreground">
                    Add New Vote Directory Site
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground block mb-1">
                        Site Name
                      </label>
                      <input
                        type="text"
                        value={newVoteName}
                        onChange={(e) => setNewVoteName(e.target.value)}
                        placeholder="e.g. MCSL Store Listing"
                        className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground block mb-1">
                        Display Hostname
                      </label>
                      <input
                        type="text"
                        value={newVoteHost}
                        onChange={(e) => setNewVoteHost(e.target.value)}
                        placeholder="e.g. minecraft-mp.com"
                        className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-xs font-mono text-foreground placeholder:text-muted-foreground outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground block mb-1">
                        Vote URL
                      </label>
                      <input
                        type="text"
                        value={newVoteUrl}
                        onChange={(e) => setNewVoteUrl(e.target.value)}
                        placeholder="e.g. https://minecraft-mp.com/vote/..."
                        className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-xs font-mono text-foreground placeholder:text-muted-foreground outline-none focus:border-accent"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 text-xs font-black uppercase tracking-wider text-accent-foreground hover:opacity-90 transition-opacity shadow-md shadow-accent/15 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Vote Site
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 7: UPI PAYMENT & QR CODE GATEWAY                 */}
          {/* ==================================================== */}
          {activeTab === 'payment' && (
            <div className="space-y-6 max-w-4xl">
              <form onSubmit={handleSavePaymentSettings} className="space-y-6">
                <div className="rounded-2xl border border-emerald-500/30 bg-surface-deep p-5 space-y-4 shadow-sm">
                  <div className="flex items-center gap-2.5 border-b border-border pb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-wider text-foreground font-display">
                        UPI Payment &amp; QR Code Gateway Configuration
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Configure your merchant UPI VPA address and select dynamic QR or custom upload QR standee.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1.5">
                        UPI ID (Virtual Payment Address / VPA) <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formUpiId}
                        onChange={(e) => setFormUpiId(e.target.value)}
                        placeholder="e.g. farhanastro@fam or 9876543210@paytm"
                        className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs font-mono text-foreground placeholder:text-muted-foreground outline-none focus:border-emerald-400"
                      />
                      <span className="text-[11px] text-muted-foreground mt-1 block">
                        Customers will send payments to this exact UPI address.
                      </span>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1.5">
                        Payee / Merchant Name
                      </label>
                      <input
                        type="text"
                        value={formPayeeName}
                        onChange={(e) => setFormPayeeName(e.target.value)}
                        placeholder="e.g. WonderMC Store"
                        className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-emerald-400"
                      />
                      <span className="text-[11px] text-muted-foreground mt-1 block">
                        Display name shown in Google Pay / PhonePe / Paytm / BHIM app when scanning.
                      </span>
                    </div>
                  </div>

                  {/* QR Mode Selector */}
                  <div className="pt-2 border-t border-border">
                    <label className="text-xs font-bold text-foreground block mb-2">
                      QR Code Generation Mode
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormQrMode('dynamic')}
                        className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all cursor-pointer ${
                          formQrMode === 'dynamic'
                            ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                            : 'border-border bg-surface hover:border-border-strong'
                        }`}
                      >
                        <div className={`mt-0.5 rounded-lg p-1.5 ${formQrMode === 'dynamic' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-surface-deep text-muted-foreground'}`}>
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-foreground block">
                            Auto Dynamic UPI QR
                          </span>
                          <span className="text-[11px] text-muted-foreground leading-tight block mt-0.5">
                            Automatically generates a real-time scannable QR code matching your active UPI ID &amp; cart total.
                          </span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormQrMode('custom')}
                        className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all cursor-pointer ${
                          formQrMode === 'custom'
                            ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                            : 'border-border bg-surface hover:border-border-strong'
                        }`}
                      >
                        <div className={`mt-0.5 rounded-lg p-1.5 ${formQrMode === 'custom' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-surface-deep text-muted-foreground'}`}>
                          <ImageIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-foreground block">
                            Custom Uploaded QR Image
                          </span>
                          <span className="text-[11px] text-muted-foreground leading-tight block mt-0.5">
                            Display your merchant standee / custom QR code image directly from file upload or URL.
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Custom QR URL & Upload */}
                  {formQrMode === 'custom' && (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 space-y-3">
                      <div>
                        <label className="text-xs font-bold text-foreground block mb-1">
                          Custom QR Code Image URL / Link
                        </label>
                        <input
                          type="url"
                          value={formCustomQrUrl}
                          onChange={(e) => setFormCustomQrUrl(e.target.value)}
                          placeholder="https://i.imgur.com/... or https://your-cdn.com/qr.png"
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground outline-none focus:border-emerald-400"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">Or upload directly from gallery:</span>
                        <label className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-bold text-foreground hover:bg-surface-deep transition-colors cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Choose Image File</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleQrFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Live QR Preview Box */}
                  <div className="rounded-xl border border-border bg-surface p-4 flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-border shrink-0">
                      {previewQrDataUrl ? (
                        <img
                          src={previewQrDataUrl}
                          alt="QR Preview"
                          className="h-28 w-28 object-contain rounded"
                        />
                      ) : (
                        <div className="h-28 w-28 flex items-center justify-center text-xs text-muted-foreground font-mono">
                          Generating QR...
                        </div>
                      )}
                      <span className="text-[10px] font-black uppercase text-slate-800 tracking-wider mt-1">
                        LIVE PREVIEW
                      </span>
                    </div>
                    <div className="space-y-1 text-center sm:text-left">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
                        Customer Checkout Preview
                      </span>
                      <p className="text-xs font-bold text-foreground">
                        {formPayeeName || 'Store Payee'} ({formUpiId || 'No UPI ID'})
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        This is the exact QR code and payment identifier that your players will see and scan during the UPI checkout flow.
                      </p>
                    </div>
                  </div>

                  {/* Save Button for Payment Gateway */}
                  <div className="flex items-center justify-end pt-3">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-xs font-black uppercase tracking-wider text-slate-950 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Payment Gateway Settings</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 8: SUB-ADMIN PASSWORDS & CATEGORY PERMISSIONS    */}
          {/* ==================================================== */}
          {activeTab === 'passwords' && (
            <div className="space-y-6 max-w-4xl">
              <div className="rounded-2xl border border-indigo-500/30 bg-surface-deep p-5 space-y-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                      <Key className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black uppercase tracking-wider text-foreground font-display">
                          Sub-Admin Passwords &amp; Category Access
                        </h4>
                        <span className="rounded-full bg-indigo-500/20 text-indigo-300 px-2 py-0.5 text-[10px] font-extrabold border border-indigo-500/30">
                          {subAdminKeysList.length} Active Passwords
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Create custom sub-admin passwords and assign specific category permissions. Click Save to permanently persist to storage.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveSubAdminKeysListExplicitly}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-950 hover:bg-emerald-400 transition-colors cursor-pointer shadow-sm"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Passwords</span>
                    </button>

                    {activeSession?.isOwner && (
                      <button
                        type="button"
                        onClick={handleOpenAddKey}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-indigo-500 transition-colors cursor-pointer shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>New Sub-Admin Password</span>
                      </button>
                    )}
                  </div>
                </div>

                {!activeSession?.isOwner && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>Logged in as Sub-Admin. Adding or editing sub-admin passwords requires Main Owner password authentication.</span>
                  </div>
                )}

                {/* Sub-Admin Password Cards List */}
                <div className="space-y-3">
                  {subAdminKeysList.map((k) => (
                    <div
                      key={k.id}
                      className="rounded-xl border border-border bg-surface p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-border-strong"
                    >
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-sm text-foreground">{k.name}</span>
                          <span className="text-[10px] font-mono text-muted-foreground bg-surface-deep px-2 py-0.5 rounded border border-border">
                            ID: {k.id}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="text-muted-foreground font-medium">Password:</span>
                          <span className="font-mono bg-surface-deep text-indigo-400 px-2.5 py-1 rounded-lg border border-border font-bold">
                            {showKeyPasswords[k.id] ? k.password : '••••••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setShowKeyPasswords((prev) => ({ ...prev, [k.id]: !prev[k.id] }))
                            }
                            className="text-muted-foreground hover:text-foreground p-1 cursor-pointer"
                            title={showKeyPasswords[k.id] ? 'Hide password' : 'Show password'}
                          >
                            {showKeyPasswords[k.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyPassword(k.password)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-400 hover:text-sky-300 bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/20 cursor-pointer"
                            title="Copy password"
                          >
                            <Copy className="w-3 h-3" /> Copy
                          </button>
                        </div>

                        {/* Category Permission badges */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[11px] font-bold text-muted-foreground mr-1">Allowed Category Access:</span>
                          {k.permissions.map((perm) => {
                            const info = ALL_TAB_PERMISSIONS_INFO.find((p) => p.id === perm);
                            return (
                              <span
                                key={perm}
                                className="inline-flex items-center gap-1 rounded-md bg-indigo-500/10 text-indigo-300 px-2 py-0.5 text-[11px] font-extrabold border border-indigo-500/20"
                              >
                                <span>{info?.icon || '📁'}</span>
                                <span>{info?.label || perm}</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {activeSession?.isOwner && (
                        <div className="flex items-center gap-2 flex-wrap shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenEditKey(k)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface-deep px-3 py-2 text-xs font-bold text-foreground hover:border-indigo-400 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSubAdminKey(k.id, k.name)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {subAdminKeysList.length === 0 && (
                    <div className="rounded-xl border border-dashed border-border p-8 text-center bg-surface">
                      <Key className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                      <h5 className="text-xs font-bold text-foreground">No Sub-Admin Passwords Active</h5>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Click "+ New Sub-Admin Password" to generate custom role passwords with selective tab permissions.
                      </p>
                    </div>
                  )}
                </div>

                {/* Explicit Save Passwords Button at Bottom */}
                <div className="flex items-center justify-end pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={handleSaveSubAdminKeysListExplicitly}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-xs font-black uppercase tracking-wider text-slate-950 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Sub-Admin Passwords &amp; Permissions</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 9: SETTINGS, WEBHOOKS & COMMUNITY LINKS          */}
          {/* ==================================================== */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-4xl">
              <form onSubmit={handleSaveStoreSettings} className="space-y-6">
                {/* 1. Social & Support Links */}
                <div className="rounded-2xl border border-border bg-surface-deep p-5 space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-border pb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                      <LinkIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-wider text-foreground font-display">
                        Social &amp; Support Links
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Change links for Discord, WhatsApp, Instagram, YouTube, and Telegram across the whole store.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-1.5">
                        <Users className="w-3.5 h-3.5 text-accent" />
                        Discord Server Invite Link
                      </label>
                      <input
                        type="url"
                        value={formDiscordUrl}
                        onChange={(e) => setFormDiscordUrl(e.target.value)}
                        placeholder="https://discord.gg/yourserver"
                        className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-accent"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-1.5">
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                        WhatsApp Support Link / Number
                      </label>
                      <input
                        type="text"
                        value={formWhatsappUrl}
                        onChange={(e) => setFormWhatsappUrl(e.target.value)}
                        placeholder="https://wa.me/919876543210 or 9876543210"
                        className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-accent"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-1.5">
                        <Flame className="w-3.5 h-3.5 text-rose-400" />
                        Instagram Profile URL
                      </label>
                      <input
                        type="url"
                        value={formInstagramUrl}
                        onChange={(e) => setFormInstagramUrl(e.target.value)}
                        placeholder="https://instagram.com/yourhandle"
                        className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-accent"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-1.5">
                        <Tag className="w-3.5 h-3.5 text-red-500" />
                        YouTube Channel URL
                      </label>
                      <input
                        type="url"
                        value={formYoutubeUrl}
                        onChange={(e) => setFormYoutubeUrl(e.target.value)}
                        placeholder="https://youtube.com/@yourchannel"
                        className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-accent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-1.5">
                        <Send className="w-3.5 h-3.5 text-sky-400" />
                        Telegram Channel / Group URL
                      </label>
                      <input
                        type="url"
                        value={formTelegramUrl}
                        onChange={(e) => setFormTelegramUrl(e.target.value)}
                        placeholder="https://t.me/yourchannel"
                        className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-accent"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Discord Bot & Real-Time Webhook Notifications */}
                <div className="rounded-2xl border border-indigo-500/30 bg-surface-deep p-5 space-y-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black uppercase tracking-wider text-foreground font-display">
                            Discord Bot &amp; Webhook Alerts
                          </h4>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                            formDiscordWebhookUrl ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-surface text-muted-foreground border border-border'
                          }`}>
                            {formDiscordWebhookUrl ? '● Connected' : '○ Not Configured'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Send instant Discord channel embeds when players submit UPI payments, UTR codes, or open support tickets.
                        </p>
                      </div>
                    </div>

                    {/* Enable / Disable Switch */}
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formDiscordWebhookEnabled}
                        onChange={(e) => setFormDiscordWebhookEnabled(e.target.checked)}
                        className="h-4 w-4 rounded border-border text-indigo-500 focus:ring-indigo-400 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-foreground">
                        Enable Discord Alerts
                      </span>
                    </label>
                  </div>

                  {/* Webhook URL input & Setup Guide */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground block">
                      Discord Channel Webhook URL <span className="text-red-400">*</span>
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="url"
                        value={formDiscordWebhookUrl}
                        onChange={(e) => setFormDiscordWebhookUrl(e.target.value)}
                        placeholder="https://discord.com/api/webhooks/1234567890/abcdef..."
                        className="flex-1 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs font-mono text-foreground placeholder:text-muted-foreground outline-none focus:border-indigo-400"
                      />
                      <button
                        type="button"
                        onClick={handleTestDiscordWebhook}
                        disabled={isTestingDiscordWebhook || !formDiscordWebhookUrl.trim()}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-4 py-2.5 text-xs font-bold text-indigo-300 hover:bg-indigo-500/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap"
                      >
                        {isTestingDiscordWebhook ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Zap className="w-3.5 h-3.5" />
                        )}
                        <span>{isTestingDiscordWebhook ? 'Testing...' : 'Send Test Alert'}</span>
                      </button>
                    </div>

                    {/* Discord Webhook Setup Guide Tip */}
                    <div className="rounded-xl bg-indigo-500/5 border border-indigo-500/20 p-3 text-xs text-muted-foreground flex items-start gap-2.5">
                      <Radio className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <div className="space-y-1 text-[11px] leading-relaxed">
                        <strong className="text-foreground">How to get your Discord Webhook URL in 10 seconds:</strong>
                        <ol className="list-decimal pl-4 space-y-0.5 text-muted-foreground">
                          <li>Open your Discord Server &rarr; Right click on your desired alerts channel &rarr; <strong>Edit Channel</strong>.</li>
                          <li>Click on <strong>Integrations</strong> &rarr; <strong>Webhooks</strong> &rarr; Click <strong>New Webhook</strong>.</li>
                          <li>Click <strong>Copy Webhook URL</strong> and paste it into the box above, then click <strong>Save</strong>!</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  {/* Bot Customization Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">
                        Bot Display Name
                      </label>
                      <input
                        type="text"
                        value={formDiscordBotName}
                        onChange={(e) => setFormDiscordBotName(e.target.value)}
                        placeholder="e.g. WonderMC Store Bot"
                        className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-indigo-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">
                        Staff Role Mention / Ping
                      </label>
                      <input
                        type="text"
                        value={formDiscordPingRole}
                        onChange={(e) => setFormDiscordPingRole(e.target.value)}
                        placeholder="@here, @everyone or <@&ROLE_ID>"
                        className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-indigo-400"
                      />
                      <span className="text-[10px] text-muted-foreground mt-0.5 block">
                        Pings staff when a new payment arrives.
                      </span>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">
                        Bot Avatar Image URL
                      </label>
                      <input
                        type="url"
                        value={formDiscordAvatarUrl}
                        onChange={(e) => setFormDiscordAvatarUrl(e.target.value)}
                        placeholder="https://mc-heads.net/avatar/MHF_Chest/128"
                        className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-indigo-400"
                      />
                    </div>
                  </div>

                  {/* Notification Event Selectors */}
                  <div className="pt-2 border-t border-border/70 flex flex-wrap gap-4 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formDiscordNotifyOnPayment}
                        onChange={(e) => setFormDiscordNotifyOnPayment(e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-border text-indigo-500 focus:ring-indigo-400 cursor-pointer"
                      />
                      <span className="text-foreground font-medium">
                        🛒 Real-Time UPI Payment &amp; UTR Notifications
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formDiscordNotifyOnTicket}
                        onChange={(e) => setFormDiscordNotifyOnTicket(e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-border text-indigo-500 focus:ring-indigo-400 cursor-pointer"
                      />
                      <span className="text-foreground font-medium">
                        📩 Customer Support Ticket Submissions
                      </span>
                    </label>
                  </div>
                </div>

                {/* 3. Minecraft Server Info & Brand */}
                <div className="rounded-2xl border border-border bg-surface-deep p-5 space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-border pb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime/10 text-lime">
                      <Server className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-wider text-foreground font-display">
                        Minecraft Server &amp; Branding
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Set your live Minecraft server address and store title.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1.5">
                        Java Server IP / Hostname
                      </label>
                      <input
                        type="text"
                        value={formServerIp}
                        onChange={(e) => setFormServerIp(e.target.value)}
                        placeholder="play.wondermc.fun"
                        className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs font-mono text-foreground placeholder:text-muted-foreground outline-none focus:border-accent"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1.5">
                        Bedrock Port
                      </label>
                      <input
                        type="text"
                        value={formBedrockPort}
                        onChange={(e) => setFormBedrockPort(e.target.value)}
                        placeholder="19132"
                        className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs font-mono text-foreground placeholder:text-muted-foreground outline-none focus:border-accent"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1.5">
                        Brand / Network Name
                      </label>
                      <input
                        type="text"
                        value={formBrand}
                        onChange={(e) => setFormBrand(e.target.value)}
                        placeholder="WonderMC"
                        className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-accent"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1.5">
                        Store Tagline
                      </label>
                      <input
                        type="text"
                        value={formTagline}
                        onChange={(e) => setFormTagline(e.target.value)}
                        placeholder="Official Minecraft Store"
                        className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-accent"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-xs font-black uppercase tracking-wider text-accent-foreground hover:opacity-90 transition-opacity shadow-lg shadow-accent/20 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Server Settings &amp; Webhooks</span>
                  </button>
                </div>
              </form>

              {/* Store Categories Management Card */}
              <div className="rounded-2xl border border-border bg-surface-deep p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-wider text-foreground font-display">
                        Store Categories &amp; Homepage Tiles
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Manage categories, change icons, and save category configurations shown on store homepage.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('products');
                      handleOpenAddStoreCategory();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-3 py-1.5 text-xs font-black uppercase tracking-wide text-accent-foreground hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Category</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categories.map((cat) => (
                    <div key={cat.id} className="rounded-xl border border-border bg-surface p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={cat.image_url || '/store/ranks.png'}
                          alt={cat.name}
                          className="h-10 w-10 object-contain drop-shadow shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/store/ranks.png';
                          }}
                        />
                        <div className="min-w-0">
                          <span className="font-extrabold text-xs text-foreground block truncate">{cat.name}</span>
                          <span className="text-[10px] text-muted-foreground block truncate">{cat.description || 'Category'}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('products');
                          handleOpenEditStoreCategory(cat);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-accent/15 border border-accent/30 text-[10px] font-extrabold text-accent hover:bg-accent/25 transition-colors shrink-0 cursor-pointer"
                      >
                        💾 Save Category
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Server In-Game Commands Cheat Sheet */}
              <div className="rounded-2xl border border-border bg-surface-deep p-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Quick Staff Management In-Game Commands
                </h4>
                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-surface border border-border flex items-center justify-between">
                    <span className="text-lime">/lp user &lt;player&gt; parent set owner</span>
                    <span className="text-[10px] text-muted-foreground font-sans">Owner Role</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface border border-border flex items-center justify-between">
                    <span className="text-accent">/lp user &lt;player&gt; parent set admin</span>
                    <span className="text-[10px] text-muted-foreground font-sans">Admin Role</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface border border-border flex items-center justify-between">
                    <span className="text-indigo-400">/lp user &lt;player&gt; parent set mod</span>
                    <span className="text-[10px] text-muted-foreground font-sans">Mod Role</span>
                  </div>
                </div>
              </div>

              {/* Danger Zone / Factory Reset */}
              <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5 space-y-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-red-400">
                    Danger Zone / Reset Store Data
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Reset staff team, top supporters, store catalog, and settings back to original initial defaults.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-500/20 border border-red-500/40 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-red-300 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset Store To Defaults
                </button>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 10: ACTIVITY AUDIT LOG                           */}
          {/* ==================================================== */}
          {activeTab === 'activity_log' && (
            <div className="space-y-6 max-w-5xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface-deep p-4 sm:p-5 rounded-2xl border border-border">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-foreground font-display flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-purple-400" />
                    <span>Admin Activity Audit Log ({activityLogs.length})</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Real-time track of all administrative changes, product updates, coupon creations, and security actions.
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {activeSession?.isOwner && activityLogs.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteConfirm({
                          title: 'Clear All Activity Logs',
                          message: 'Are you sure you want to clear all activity logs? This will reset the audit history.',
                          actionName: 'Clear Logs',
                          onConfirm: () => {
                            onUpdateActivityLogs?.([]);
                            success('Activity logs cleared successfully.');
                          },
                        });
                      }}
                      className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-xs font-black uppercase tracking-wider text-red-400 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                    >
                      Clear Logs
                    </button>
                  )}
                </div>
              </div>

              {/* Search & Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8 relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={activitySearch}
                    onChange={(e) => setActivitySearch(e.target.value)}
                    placeholder="Search logs by action, admin name, or details..."
                    className="w-full rounded-xl border border-border bg-surface-deep pl-10 pr-4 py-2.5 text-xs text-foreground outline-none focus:border-accent"
                  />
                </div>
                <div className="sm:col-span-4">
                  <select
                    value={activityFilterType}
                    onChange={(e) => setActivityFilterType(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface-deep px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-accent"
                  >
                    <option value="all">All Action Types</option>
                    <option value="product">📦 Products & Categories</option>
                    <option value="coupon">🎟️ Coupons & Sales</option>
                    <option value="staff">👥 Staff Team</option>
                    <option value="ticket">💬 Support Tickets</option>
                    <option value="settings">⚙️ Settings & Security</option>
                    <option value="other">📋 Other Actions</option>
                  </select>
                </div>
              </div>

              {/* Logs List */}
              <div className="space-y-3">
                {activityLogs
                  .filter((log) => {
                    const matchesSearch =
                      !activitySearch ||
                      log.action.toLowerCase().includes(activitySearch.toLowerCase()) ||
                      log.details.toLowerCase().includes(activitySearch.toLowerCase()) ||
                      log.adminName.toLowerCase().includes(activitySearch.toLowerCase());
                    const matchesType = activityFilterType === 'all' || log.type === activityFilterType;
                    return matchesSearch && matchesType;
                  })
                  .map((log) => {
                    const badgeColor =
                      log.type === 'product'
                        ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                        : log.type === 'coupon' || log.type === 'sale'
                        ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                        : log.type === 'staff'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : log.type === 'ticket'
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : log.type === 'settings'
                        ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                        : 'bg-purple-500/15 text-purple-400 border-purple-500/30';

                    return (
                      <div
                        key={log.id}
                        className="rounded-2xl border border-border bg-surface-deep p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-border-strong transition-all"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-xl border shrink-0 text-xs ${badgeColor}`}>
                            {log.type === 'product' ? '📦' : log.type === 'coupon' ? '🎟️' : log.type === 'staff' ? '👥' : log.type === 'ticket' ? '💬' : log.type === 'settings' ? '⚙️' : '📋'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs font-black uppercase tracking-wider text-foreground font-display">
                                {log.action}
                              </h4>
                              <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-bold text-muted-foreground border border-border">
                                {log.adminName}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                              {log.details}
                            </p>
                          </div>
                        </div>

                        <div className="text-[11px] font-mono text-muted-foreground shrink-0 sm:text-right">
                          {formatISTRelative(log.timestamp)}
                        </div>
                      </div>
                    );
                  })}

                {activityLogs.filter((log) => {
                  const matchesSearch =
                    !activitySearch ||
                    log.action.toLowerCase().includes(activitySearch.toLowerCase()) ||
                    log.details.toLowerCase().includes(activitySearch.toLowerCase()) ||
                    log.adminName.toLowerCase().includes(activitySearch.toLowerCase());
                  const matchesType = activityFilterType === 'all' || log.type === activityFilterType;
                  return matchesSearch && matchesType;
                }).length === 0 && (
                  <div className="text-center py-12 rounded-2xl border border-border bg-surface-deep p-8">
                    <ClipboardList className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                    <h4 className="text-sm font-bold text-foreground">No activity logs found</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try adjusting your search query or filter settings.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 11: CONNECTION GUIDE MANAGER                     */}
          {/* ==================================================== */}
          {activeTab === 'guide' && (
            <div className="space-y-6 max-w-5xl animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface-deep p-4 sm:p-5 rounded-2xl border border-border">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-foreground font-display flex items-center gap-2">
                    <Compass className="w-4 h-4 text-sky-400 animate-spin" style={{ animationDuration: '6s' }} />
                    <span>Connection Guide Steps Editor</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Dynamically change Java and Bedrock titles, descriptions, and connection steps.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSaveConnectionGuide}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 transition-colors cursor-pointer shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Guide Steps</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Java Edition Steps */}
                <div className="rounded-2xl border border-border bg-surface-deep p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <Server className="w-4 h-4 text-sky-400" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                      Java Edition Settings &amp; Steps
                    </h4>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                        Java Title
                      </label>
                      <input
                        type="text"
                        value={guideJavaTitle}
                        onChange={(e) => setGuideJavaTitle(e.target.value)}
                        className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
                        placeholder="Java Edition"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                        Java Description / Subtitle
                      </label>
                      <input
                        type="text"
                        value={guideJavaDesc}
                        onChange={(e) => setGuideJavaDescription(e.target.value)}
                        className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
                        placeholder="For PC and Laptop players"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="text-[11px] font-bold text-muted-foreground block">
                      Connection Steps List
                    </label>

                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {guideJavaSteps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-surface p-2 rounded-xl border border-border">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-500/10 font-mono text-[10px] font-black text-sky-400">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={step}
                            onChange={(e) => {
                              const next = [...guideJavaSteps];
                              next[idx] = e.target.value;
                              setGuideJavaSteps(next);
                            }}
                            placeholder={`Step ${idx + 1} text`}
                            className="flex-1 text-xs text-foreground bg-transparent border border-transparent hover:border-border/60 focus:border-accent focus:bg-surface-deep px-2 py-1 rounded-lg outline-none font-semibold transition-all min-w-0"
                          />
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => {
                                if (idx === 0) return;
                                const next = [...guideJavaSteps];
                                const temp = next[idx];
                                next[idx] = next[idx - 1];
                                next[idx - 1] = temp;
                                setGuideJavaSteps(next);
                              }}
                              className="p-1 rounded bg-surface-deep hover:bg-border border border-border text-muted-foreground hover:text-foreground disabled:opacity-35 cursor-pointer"
                              title="Move Up"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === guideJavaSteps.length - 1}
                              onClick={() => {
                                if (idx === guideJavaSteps.length - 1) return;
                                const next = [...guideJavaSteps];
                                const temp = next[idx];
                                next[idx] = next[idx + 1];
                                next[idx + 1] = temp;
                                setGuideJavaSteps(next);
                              }}
                              className="p-1 rounded bg-surface-deep hover:bg-border border border-border text-muted-foreground hover:text-foreground disabled:opacity-35 cursor-pointer"
                              title="Move Down"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveJavaStep(idx)}
                              className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 cursor-pointer"
                              title="Delete Step"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {guideJavaSteps.length === 0 && (
                        <div className="text-center py-6 text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                          No steps defined. Add a step below!
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <input
                        type="text"
                        value={newJavaStep}
                        onChange={(e) => setNewJavaStep(e.target.value)}
                        placeholder="Add a new step (e.g. Type Server Address: play.wondermc.fun)..."
                        className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddJavaStep();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddJavaStep}
                        className="rounded-xl bg-accent px-3 text-xs font-bold text-accent-foreground hover:opacity-95 transition-all cursor-pointer"
                      >
                        Add Step
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bedrock Edition Steps */}
                <div className="rounded-2xl border border-border bg-surface-deep p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <Smartphone className="w-4 h-4 text-amber-500" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                      Bedrock Edition Settings &amp; Steps
                    </h4>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                        Bedrock Title
                      </label>
                      <input
                        type="text"
                        value={guideBedrockTitle}
                        onChange={(e) => setGuideBedrockTitle(e.target.value)}
                        className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
                        placeholder="Bedrock Edition"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                        Bedrock Description / Subtitle
                      </label>
                      <input
                        type="text"
                        value={guideBedrockDesc}
                        onChange={(e) => setGuideBedrockDescription(e.target.value)}
                        className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
                        placeholder="For MCPE, Mobile, Console &amp; Win 10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="text-[11px] font-bold text-muted-foreground block">
                      Connection Steps List
                    </label>

                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {guideBedrockSteps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-surface p-2 rounded-xl border border-border">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 font-mono text-[10px] font-black text-amber-500">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={step}
                            onChange={(e) => {
                              const next = [...guideBedrockSteps];
                              next[idx] = e.target.value;
                              setGuideBedrockSteps(next);
                            }}
                            placeholder={`Step ${idx + 1} text`}
                            className="flex-1 text-xs text-foreground bg-transparent border border-transparent hover:border-border/60 focus:border-accent focus:bg-surface-deep px-2 py-1 rounded-lg outline-none font-semibold transition-all min-w-0"
                          />
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => {
                                if (idx === 0) return;
                                const next = [...guideBedrockSteps];
                                const temp = next[idx];
                                next[idx] = next[idx - 1];
                                next[idx - 1] = temp;
                                setGuideBedrockSteps(next);
                              }}
                              className="p-1 rounded bg-surface-deep hover:bg-border border border-border text-muted-foreground hover:text-foreground disabled:opacity-35 cursor-pointer"
                              title="Move Up"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === guideBedrockSteps.length - 1}
                              onClick={() => {
                                if (idx === guideBedrockSteps.length - 1) return;
                                const next = [...guideBedrockSteps];
                                const temp = next[idx];
                                next[idx] = next[idx + 1];
                                next[idx + 1] = temp;
                                setGuideBedrockSteps(next);
                              }}
                              className="p-1 rounded bg-surface-deep hover:bg-border border border-border text-muted-foreground hover:text-foreground disabled:opacity-35 cursor-pointer"
                              title="Move Down"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveBedrockStep(idx)}
                              className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 cursor-pointer"
                              title="Delete Step"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {guideBedrockSteps.length === 0 && (
                        <div className="text-center py-6 text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                          No steps defined. Add a step below!
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <input
                        type="text"
                        value={newBedrockStep}
                        onChange={(e) => setNewBedrockStep(e.target.value)}
                        placeholder="Add a new step (e.g. Enter Port number as: 19132)..."
                        className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddBedrockStep();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddBedrockStep}
                        className="rounded-xl bg-accent px-3 text-xs font-bold text-accent-foreground hover:opacity-95 transition-all cursor-pointer"
                      >
                        Add Step
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instant Save Bar */}
              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={handleSaveConnectionGuide}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-xs font-black uppercase tracking-wider text-accent-foreground hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-accent/20"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Connection Guide</span>
                </button>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 12: SERVER RULES CATEGORIES & CUSTOM RULES        */}
          {/* ==================================================== */}
          {activeTab === 'rules' && (
            <div className="space-y-6 max-w-5xl animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface-deep p-4 sm:p-5 rounded-2xl border border-border">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-foreground font-display flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-rose-500" />
                    <span>Server Rules &amp; Regulations Editor</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Add, edit, or remove categories and manage customized rule lists with premium icons.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddCategory}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:opacity-95 transition-all cursor-pointer shadow-md shadow-rose-500/10"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Category Group</span>
                </button>
              </div>

              {/* List of Category groups */}
              <div className="space-y-6">
                {rulesCats.map((cat) => {
                  return (
                    <div key={cat.id} className="rounded-2xl border border-border bg-surface-deep p-5 space-y-4 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg text-rose-400">
                            {cat.icon === 'shield' && <Shield className="w-4 h-4" />}
                            {cat.icon === 'zap' && <Zap className="w-4 h-4" />}
                            {cat.icon === 'chat' && <MessageCircle className="w-4 h-4" />}
                            {cat.icon === 'alert' && <ShieldAlert className="w-4 h-4" />}
                          </span>
                          <div>
                            <h4 className="text-sm font-black uppercase tracking-wider text-foreground">
                              {cat.name}
                            </h4>
                            <span className="text-[10px] font-mono text-muted-foreground bg-surface px-1.5 py-0.5 rounded border border-border">
                              Icon: {cat.icon} ({cat.rules.length} Rules)
                            </span>
                          </div>
                        </div>

                        {/* Category Actions */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleOpenAddRule(cat.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-sky-500/40 bg-sky-500/10 px-2.5 py-1 text-[11px] font-bold text-sky-400 hover:bg-sky-500/20 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add Rule Item
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditCategory(cat)}
                            className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1 text-[11px] font-bold text-foreground hover:bg-surface-deep transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-accent" />
                            Edit Group
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/5 px-2.5 py-1 text-[11px] font-bold text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete Group
                          </button>
                        </div>
                      </div>

                      {/* Rule items in this category */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {cat.rules.map((rule) => (
                          <div key={rule.id} className="rounded-xl border border-border bg-surface p-3.5 flex flex-col justify-between gap-3 hover:border-border-strong transition-all">
                            <div className="space-y-1.5">
                              <h5 className="text-xs font-black uppercase tracking-wide text-sky-400">
                                {rule.title}
                              </h5>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {rule.description}
                              </p>
                            </div>

                            <div className="flex items-center justify-end gap-2 flex-wrap pt-2 border-t border-border/40">
                              <button
                                type="button"
                                onClick={() => handleOpenEditRule(cat.id, rule)}
                                className="p-1 rounded bg-surface-deep hover:bg-border border border-border text-accent hover:text-accent-hover cursor-pointer"
                                title="Edit Rule"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteRule(cat.id, rule.id, rule.title)}
                                className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 cursor-pointer"
                                title="Delete Rule"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}

                        {cat.rules.length === 0 && (
                          <div className="md:col-span-2 rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground bg-surface">
                            No rules configured under this group yet. Click "Add Rule Item" to get started!
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {rulesCats.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-surface-deep/40">
                    <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-foreground">No Rules Groups Found</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Click "+ Add Category Group" at the top to create a custom server rules tab!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ==================================================== */}
      {/* CREATE / EDIT COUPON MODAL                          */}
      {/* ==================================================== */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsCouponModalOpen(false)}
              className="absolute top-4 right-4 rounded-xl border border-border bg-surface-deep p-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-border pb-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent border border-accent/40">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-foreground font-display">
                  {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create New Coupon / Discount Code'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Configure discount percentage or fixed amount, expiry date, usage limit, and status.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Coupon Code <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
                    placeholder="e.g. SUMMER30, DIWALI100, WONDER50"
                    className="w-full rounded-xl border border-border bg-surface-deep px-3.5 py-2.5 text-xs font-mono font-bold tracking-wider text-gold uppercase outline-none focus:border-accent"
                  />
                </div>
                <span className="text-[11px] text-muted-foreground mt-1 block">
                  Players will enter this promo code during store checkout.
                </span>
              </div>

              {/* Coupon Category Selection: Normal (Public) vs Private (Secret) */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Coupon Category <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCouponCategoryInput('normal')}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                      couponCategoryInput === 'normal'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/40'
                        : 'border-border bg-surface-deep text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider mb-0.5">
                      <span>🌐 Normal / Public</span>
                    </div>
                    <span className="text-[10px] opacity-80 leading-snug">
                      Shows on store website for all players when they join.
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCouponCategoryInput('private')}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                      couponCategoryInput === 'private'
                        ? 'border-purple-500 bg-purple-500/10 text-purple-300 ring-1 ring-purple-500/40'
                        : 'border-border bg-surface-deep text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider mb-0.5">
                      <span>🔒 Private / Secret</span>
                    </div>
                    <span className="text-[10px] opacity-80 leading-snug">
                      Hidden from website. Only players who know the code can redeem.
                    </span>
                  </button>
                </div>
              </div>

              {/* Discount Type Selection */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Discount Type <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCouponTypeInput('percentage')}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition-all ${
                      couponTypeInput === 'percentage'
                        ? 'border-accent bg-accent/20 text-accent shadow-sm'
                        : 'border-border bg-surface-deep text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Percent className="w-4 h-4" />
                    <span>Percentage (%)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCouponTypeInput('fixed')}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition-all ${
                      couponTypeInput === 'fixed'
                        ? 'border-accent bg-accent/20 text-accent shadow-sm'
                        : 'border-border bg-surface-deep text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Fixed Amount (₹)</span>
                  </button>
                </div>
              </div>

              {/* Discount Value */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Discount Value {couponTypeInput === 'percentage' ? '(%)' : '(₹ INR)'} <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={couponTypeInput === 'percentage' ? '100' : '100000'}
                  value={couponValueInput}
                  onChange={(e) => setCouponValueInput(e.target.value)}
                  placeholder={couponTypeInput === 'percentage' ? 'e.g. 20 (for 20% off)' : 'e.g. 100 (for ₹100 off)'}
                  className="w-full rounded-xl border border-border bg-surface-deep px-3.5 py-2.5 text-xs font-mono font-bold text-foreground outline-none focus:border-accent"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Expiry Date <span className="text-muted-foreground font-normal">(Optional)</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={couponExpiryInput}
                    onChange={(e) => setCouponExpiryInput(e.target.value)}
                    className="flex-1 rounded-xl border border-border bg-surface-deep px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-accent"
                  />
                  {couponExpiryInput && (
                    <button
                      type="button"
                      onClick={() => setCouponExpiryInput('')}
                      className="rounded-xl border border-border bg-surface-deep px-3 py-2.5 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <span className="text-[11px] text-muted-foreground mt-1 block">
                  Leave empty for a coupon that never expires.
                </span>
              </div>

              {/* Usage Limit */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Usage Limit (Max Redeems) <span className="text-muted-foreground font-normal">(Optional)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={couponLimitInput}
                  onChange={(e) => setCouponLimitInput(e.target.value)}
                  placeholder="e.g. 100 (leave 0 or empty for unlimited)"
                  className="w-full rounded-xl border border-border bg-surface-deep px-3.5 py-2.5 text-xs font-mono text-foreground outline-none focus:border-accent"
                />
              </div>

              {/* Enabled / Disabled Toggle */}
              <div className="flex items-center justify-between rounded-xl border border-border bg-surface-deep p-3.5">
                <div>
                  <span className="text-xs font-bold text-foreground block">Enable Coupon Code</span>
                  <span className="text-[11px] text-muted-foreground block">
                    {couponEnabledInput
                      ? 'Coupon is active and can be used at checkout'
                      : 'Coupon is disabled and cannot be redeemed'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCouponEnabledInput(!couponEnabledInput)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all ${
                    couponEnabledInput
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-zinc-500/20 text-zinc-400 border border-zinc-500/40'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${couponEnabledInput ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
                  {couponEnabledInput ? 'ACTIVE' : 'DISABLED'}
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="rounded-xl border border-border bg-surface-deep px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-accent px-5 py-2 text-xs font-black uppercase tracking-wider text-accent-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-md"
                >
                  {editingCoupon ? 'Save Coupon Changes' : 'Create Coupon Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SUB-ADMIN KEY CREATE / EDIT MODAL                   */}
      {/* ==================================================== */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsKeyModalOpen(false)}
              className="absolute top-4 right-4 rounded-xl border border-border bg-surface-deep p-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-border pb-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-foreground font-display">
                  {editingKey ? 'Edit Sub-Admin Password & Permissions' : 'Create New Sub-Admin Password'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Set password and choose category tab permissions for this sub-admin.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveSubAdminKey} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Role / Sub-Admin Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="e.g. Support & News Manager, Catalog Admin"
                  className="w-full rounded-xl border border-border bg-surface-deep px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Sub-Admin Access Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showKeyPasswords['form'] ? 'text' : 'password'}
                    required
                    value={keyPassword}
                    onChange={(e) => setKeyPassword(e.target.value)}
                    placeholder="Enter login password for this role..."
                    className="w-full rounded-xl border border-border bg-surface-deep pl-3.5 pr-10 py-2.5 text-xs text-foreground font-mono outline-none focus:border-accent"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowKeyPasswords((prev) => ({ ...prev, form: !prev.form }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 cursor-pointer"
                  >
                    {showKeyPasswords['form'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[11px] text-muted-foreground mt-1 block">
                  Sub-admins will enter this password on the admin login screen.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-2">
                  Allowed Category Tab Permissions <span className="text-red-400">*</span>
                </label>

                <div className="space-y-2">
                  {ALL_TAB_PERMISSIONS_INFO.map((perm) => {
                    const isSelected = keyPermissions.includes(perm.id);
                    return (
                      <div
                        key={perm.id}
                        onClick={() => handleTogglePermission(perm.id)}
                        className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer select-none transition-all ${
                          isSelected
                            ? 'border-accent bg-accent/10 shadow-sm'
                            : 'border-border bg-surface-deep/60 hover:border-border-strong'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // Handled by container onClick
                          className="mt-0.5 h-4 w-4 rounded border-border text-accent focus:ring-accent cursor-pointer"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">{perm.icon}</span>
                            <span className="text-xs font-black text-foreground">{perm.label}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {perm.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsKeyModalOpen(false)}
                  className="rounded-xl border border-border bg-surface-deep px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-accent px-5 py-2 text-xs font-black uppercase tracking-wider text-accent-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-md"
                >
                  {editingKey ? 'Save Key Changes' : 'Create Sub-Admin Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* CUSTOM IN-APP DELETE CONFIRMATION MODAL              */}
      {/* ==================================================== */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-foreground font-display">
                  {deleteConfirm.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed mb-6 bg-surface-deep p-3 rounded-xl border border-border">
              {deleteConfirm.message}
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="rounded-xl border border-border bg-surface px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-surface-deep transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const cb = deleteConfirm.onConfirm;
                  setDeleteConfirm(null);
                  cb();
                }}
                className="rounded-xl bg-red-500 px-4 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 cursor-pointer"
              >
                {deleteConfirm.actionName}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* ADD / EDIT RULES CATEGORY MODAL                     */}
      {/* ==================================================== */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-2xl">
            <button
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute top-4 right-4 rounded-xl border border-border bg-surface-deep p-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-border pb-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-foreground font-display">
                  {editingCategory ? 'Edit Rules Category' : 'Create Rules Category'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Give a name and select an associated visual icon.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Category Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={catNameInput}
                  onChange={(e) => setCatNameInput(e.target.value)}
                  placeholder="e.g. Chat Rules, General Conduct, Punishments"
                  className="w-full rounded-xl border border-border bg-surface-deep px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-rose-400 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Select Visual Icon <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'shield', icon: <Shield className="w-4 h-4" />, label: 'Shield' },
                    { id: 'zap', icon: <Zap className="w-4 h-4" />, label: 'Zap' },
                    { id: 'chat', icon: <MessageCircle className="w-4 h-4" />, label: 'Chat' },
                    { id: 'alert', icon: <ShieldAlert className="w-4 h-4" />, label: 'Alert' },
                  ].map((ic) => (
                    <button
                      key={ic.id}
                      type="button"
                      onClick={() => setCatIconInput(ic.id as any)}
                      className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2 text-xs transition-all ${
                        catIconInput === ic.id
                          ? 'border-rose-500 bg-rose-500/10 text-rose-400 shadow-sm font-extrabold'
                          : 'border-border bg-surface-deep text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {ic.icon}
                      <span className="text-[10px]">{ic.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="rounded-xl border border-border bg-surface-deep px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-500 px-5 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-rose-600 transition-all cursor-pointer shadow-md"
                >
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* ADD / EDIT RULE ITEM MODAL                          */}
      {/* ==================================================== */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-2xl">
            <button
              onClick={() => setIsRuleModalOpen(false)}
              className="absolute top-4 right-4 rounded-xl border border-border bg-surface-deep p-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-border pb-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-foreground font-display">
                  {editingRule ? 'Edit Rule Item' : 'Add Rule Item'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Specify the short rule title and detailed guidelines description.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveRule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Rule Title / Short Headline <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={ruleTitleInput}
                  onChange={(e) => setRuleTitleInput(e.target.value)}
                  placeholder="e.g. 1. No Griefing / Stealing"
                  className="w-full rounded-xl border border-border bg-surface-deep px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-sky-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Rule Description / Details <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={ruleDescInput}
                  onChange={(e) => setRuleDescriptionInput(e.target.value)}
                  placeholder="Explain what is forbidden and any details..."
                  className="w-full rounded-xl border border-border bg-surface-deep p-3.5 text-xs text-foreground outline-none focus:border-sky-500 font-sans leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsRuleModalOpen(false)}
                  className="rounded-xl border border-border bg-surface-deep px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-sky-500 px-5 py-2 text-xs font-black uppercase tracking-wider text-slate-950 hover:bg-sky-400 transition-all cursor-pointer shadow-md"
                >
                  {editingRule ? 'Save Changes' : 'Add Rule Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
