export interface Gamemode {
  id: string;
  name: string;
  active: boolean;
  display_order: number;
}

export interface StoreCategory {
  id: string;
  name: string;
  game_mode: string;
  description: string;
  image_url: string;
  display_order: number;
}

export interface StoreItem {
  id: string;
  title: string;
  category: string;
  price: number;
  description: string;
  image_url: string;
  display_order?: number;
  discount_percent?: number;
}

export interface CartLine {
  id: string;
  name: string;
  price: number;
  image: string;
  qty: number;
  originalPrice?: number;
  discountPercent?: number;
}

export interface TopBuyer {
  id: string;
  username: string;
  total_spent: number;
  rank?: number;
}

export type StaffRole =
  | 'Owner'
  | 'Co-Owner'
  | 'Manager'
  | 'Senior Admin'
  | 'Admin'
  | 'Junior Admin'
  | 'Developer'
  | 'Senior Moderator'
  | 'Moderator'
  | 'Junior Moderator'
  | 'Helper'
  | 'Staff';

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  avatar_url?: string;
  description?: string;
  discord_id?: string;
  discord_username?: string;
  discord_url?: string;
}

export interface VoteLink {
  id: string;
  name: string;
  host: string;
  url: string;
}

export interface Coupon {
  id?: string;
  code: string;
  category?: 'normal' | 'private'; // 'normal' = Publicly shown on website, 'private' = Secret code
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  expiryDate?: string;
  usageLimit?: number;
  usedCount?: number;
  enabled?: boolean;
  createdAt?: string;
  percent?: number;
}

export interface StoreSaleConfig {
  pill: string;
  highlight: string;
  text: string;
  percent: number;
  enabled: boolean;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  ign: string;
  contact?: string; // discord tag or email
  category: string;
  subject?: string;
  message: string;
  screenshotUrl?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high';
  createdAt: string;
  adminNote?: string;
}

export type UpdateTag = 'Announcement' | 'Update' | 'Event' | 'Maintenance' | 'Patch Notes';

export interface ServerUpdate {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  imageUrls?: string[];
  author: string;
  tag: UpdateTag;
  pinned?: boolean;
  createdAt: string; // ISO string
}

export type AdminTabPermission =
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

export interface ActivityLog {
  id: string;
  action: string;
  adminName: string;
  details: string;
  timestamp: string;
  type?: 'product' | 'coupon' | 'staff' | 'settings' | 'ticket' | 'sale' | 'other';
}

export interface SubAdminKey {
  id: string;
  name: string;
  password: string;
  permissions: AdminTabPermission[];
  createdAt: string;
}

export interface ActiveAdminSession {
  isOwner: boolean;
  name: string;
  permissions: AdminTabPermission[];
}

export interface ConnectionGuide {
  javaTitle: string;
  javaDescription: string;
  javaSteps: string[];
  bedrockTitle: string;
  bedrockDescription: string;
  bedrockSteps: string[];
}

export interface RuleItem {
  id: string;
  title: string;
  description: string;
}

export interface RuleCategory {
  id: string;
  name: string;
  icon: 'shield' | 'zap' | 'chat' | 'alert';
  rules: RuleItem[];
}


