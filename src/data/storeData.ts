import { Gamemode, StoreCategory, StoreItem, TopBuyer, StaffMember, VoteLink, StoreSaleConfig, SupportTicket, ServerUpdate, SubAdminKey, Coupon, ActivityLog, ConnectionGuide, RuleCategory } from '../types';

export const INITIAL_SUB_ADMIN_KEYS: SubAdminKey[] = [
  {
    id: 'key-support-admin',
    name: 'Support & News Admin',
    password: 'supportpass123',
    permissions: ['tickets', 'updates'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'key-store-manager',
    name: 'Store Catalog Manager',
    password: 'storepass123',
    permissions: ['products', 'discounts', 'supporters'],
    createdAt: new Date().toISOString(),
  },
];

export const STORE_CONFIG = {
  brand: 'WonderMC',
  brandUpper: 'WONDERMC',
  storeName: 'WonderMC Store',
  tagline: 'Best Indian Minecraft Network',
  description: 'Buy ranks, perks, coins and crate keys for the WonderMC Minecraft server.',
  serverIp: 'play.wondermc.fun',
  serverName: 'Lifesteal',
  website: 'play.wondermc.fun',
  discordUrl: 'https://discord.gg/ThS4XSJ9bC',
  upiId: 'farhanastro@fam',
  instagramUrl: 'https://www.instagram.com/wondermc',
  youtubeUrl: 'https://www.youtube.com/@wondermc',
  copyright: '© 2026 WonderMC Network. All Rights Reserved.',
  sale: {
    pill: 'SUMMER SALE',
    highlight: '30% OFF',
    text: '30% off on every product!',
    percent: 30,
    enabled: true,
  } as StoreSaleConfig,
};

export const INITIAL_GAMEMODES: Gamemode[] = [
  {
    id: '2ba1b343-dcdc-4a3b-be81-6b5f87f0339a',
    name: 'Lifesteal',
    active: true,
    display_order: 0,
  },
];

export const INITIAL_CATEGORIES: StoreCategory[] = [
  {
    id: 'cat-1',
    name: 'Ranks',
    game_mode: 'Lifesteal',
    description: 'Exclusive perks, commands, and abilities',
    image_url: '/store/ranks.png',
    display_order: 0,
  },
  {
    id: 'cat-2',
    name: 'Coins',
    game_mode: 'Lifesteal',
    description: 'In-game currency for trading and shops',
    image_url: '/store/coins.png',
    display_order: 1,
  },
  {
    id: 'cat-3',
    name: 'Crate Keys',
    game_mode: 'Lifesteal',
    description: 'Unlock mystery crates for rare loot',
    image_url: '/store/keys.png',
    display_order: 2,
  },
  {
    id: 'cat-4',
    name: 'Kits',
    game_mode: 'Lifesteal',
    description: 'Armor, weapon, and utility loadouts',
    image_url: '/store/kits.png',
    display_order: 3,
  },
  {
    id: 'cat-5',
    name: 'Others',
    game_mode: 'Lifesteal',
    description: 'Special weapons, elytra, and items',
    image_url: '/store/others.png',
    display_order: 4,
  },
];

export const INITIAL_ITEMS: StoreItem[] = [
  // Ranks
  {
    id: 'item-rank-titan',
    title: 'Titan Rank [Monthly]',
    category: 'Ranks',
    price: 200.0,
    description: `<p><strong>Perks:</strong><br/>Create Up to <strong>5</strong> Auction Listings<br/>Create Up to <strong>5</strong> Homes<br/><strong>2</strong> Personal Vaults<br/><strong>Lime</strong> Chat Color<br/><strong>Pro Kit</strong> Access</p><p><strong>Commands:</strong><br/>/enderchest<br/>/anvil<br/>/nick<br/>/craft<br/>/crawl</p>`,
    image_url: '/store/ranks.png',
    display_order: 0,
  },
  {
    id: 'item-rank-lord',
    title: 'Lord Rank [Monthly]',
    category: 'Ranks',
    price: 320.0,
    description: `<p><strong>Perks:</strong><br/>Create Up to <strong>8</strong> Auction Listings<br/>Create Up to <strong>8</strong> Homes<br/><strong>3</strong> Personal Vaults<br/><strong>Blue</strong> Chat Color<br/><strong>Master Kit</strong> Access</p><p><strong>Commands:</strong><br/>/enderchest<br/>/anvil<br/>/nick<br/>/craft<br/>/crawl<br/>/ptime</p>`,
    image_url: '/store/ranks.png',
    display_order: 1,
  },
  {
    id: 'item-rank-shulker',
    title: 'Shulker Rank [Monthly]',
    category: 'Ranks',
    price: 429.0,
    description: `<p><strong>Perks:</strong><br/>Create Up to <strong>10</strong> Auction Listings<br/>Create Up to <strong>10</strong> Homes<br/><strong>5</strong> Personal Vaults<br/><strong>Red</strong> Chat Color<br/><strong>Deadliest Kit</strong> Access</p><p><strong>Commands:</strong><br/>/enderchest<br/>/anvil<br/>/nick<br/>/craft<br/>/crawl<br/>/pweather<br/>/ptime</p>`,
    image_url: '/store/ranks.png',
    display_order: 2,
  },
  {
    id: 'item-rank-dragon',
    title: 'Dragon Rank',
    category: 'Ranks',
    price: 549.0,
    description: `<p><strong>Perks:</strong><br/>Create Up to <strong>12</strong> Auction Listings<br/>Create Up to <strong>12</strong> Homes<br/><strong>7</strong> Personal Vaults<br/><strong>Pink</strong> Chat Color<br/><strong>GOD Kit</strong> Access</p><p><strong>Commands:</strong><br/>/enderchest<br/>/anvil<br/>/lay<br/>/craft<br/>/crawl<br/>/pweather<br/>/ptime</p>`,
    image_url: '/store/ranks.png',
    display_order: 3,
  },
  {
    id: 'item-rank-wonder-plus',
    title: 'Wonder+ Rank',
    category: 'Ranks',
    price: 699.0,
    description: `<p><strong>Perks:</strong><br/>Create Up to <strong>15</strong> Auction Listings<br/>Create Up to <strong>15</strong> Homes<br/><strong>10</strong> Personal Vaults<br/><strong>Orange</strong> Chat Color<br/><strong>DON Kit</strong> Access</p><p><strong>Commands:</strong><br/>/enderchest<br/>/anvil<br/>/nick<br/>/craft<br/>/crawl<br/>/lay<br/>/pweather<br/>/ptime</p>`,
    image_url: '/store/ranks.png',
    display_order: 4,
  },
  {
    id: 'item-rank-custom',
    title: 'CUSTOM Rank',
    category: 'Ranks',
    price: 899.0,
    description: `<p><strong>Perks:</strong><br/>Custom Prefix of your choice<br/>Create Up to <strong>20</strong> Auction Listings<br/>Create Up to <strong>20</strong> Homes<br/><strong>15</strong> Personal Vaults<br/>Custom Chat Color<br/>Access to ALL server kits</p><p><strong>Commands:</strong><br/>/enderchest<br/>/anvil<br/>/nick<br/>/craft<br/>/crawl<br/>/lay<br/>/pweather<br/>/ptime<br/>/fly</p>`,
    image_url: '/store/ranks.png',
    display_order: 5,
  },

  // Coins
  {
    id: 'item-coins-500',
    title: '500 Coins',
    category: 'Coins',
    price: 79.0,
    description: `<p><strong>500</strong> In Game Coins credited directly to your balance on <strong>play.wondermc.fun</strong>.</p>`,
    image_url: '/store/coins.png',
    display_order: 0,
  },
  {
    id: 'item-coins-1000',
    title: '1000 Coins',
    category: 'Coins',
    price: 149.0,
    description: `<p><strong>1000</strong> In Game Coins credited directly to your balance on <strong>play.wondermc.fun</strong>.</p>`,
    image_url: '/store/coins.png',
    display_order: 1,
  },
  {
    id: 'item-coins-5000',
    title: '5000 Coins',
    category: 'Coins',
    price: 549.0,
    description: `<p><strong>5000</strong> In Game Coins credited directly to your balance on <strong>play.wondermc.fun</strong>.</p>`,
    image_url: '/store/coins.png',
    display_order: 2,
  },
  {
    id: 'item-coins-10000',
    title: '10,000 Coins',
    category: 'Coins',
    price: 899.0,
    description: `<p><strong>10,000</strong> In Game Coins credited directly to your balance on <strong>play.wondermc.fun</strong>.</p>`,
    image_url: '/store/coins.png',
    display_order: 3,
  },

  // Crate Keys
  {
    id: 'item-key-spawner',
    title: 'Spawner Key',
    category: 'Crate Keys',
    price: 39.0,
    description: `<p>Ability to open <strong>Spawner Crate</strong> for mob spawners and eggs.</p>`,
    image_url: '/store/keys.png',
    display_order: 0,
  },
  {
    id: 'item-key-epic',
    title: 'Epic Key',
    category: 'Crate Keys',
    price: 49.0,
    description: `<p>Ability to open <strong>Epic Crate</strong> for enchanted books, gear, and supplies.</p>`,
    image_url: '/store/keys.png',
    display_order: 1,
  },
  {
    id: 'item-key-rare',
    title: 'Rare Key',
    category: 'Crate Keys',
    price: 59.0,
    description: `<p>Ability to open <strong>Rare Crate</strong> with ultra-exclusive server drops.</p>`,
    image_url: '/store/keys.png',
    display_order: 2,
  },

  // Kits
  {
    id: 'item-kit-strom',
    title: 'STROM Kit [PROT 3]',
    category: 'Kits',
    price: 229.0,
    description: `<p>Strom Kit with Protection 3 diamond/netherite armor, sharpness sword, and golden apples.</p>`,
    image_url: '/store/kits.png',
    display_order: 0,
  },

  // Others
  {
    id: 'item-other-elytra',
    title: 'Elytra',
    category: 'Others',
    price: 349.0,
    description: `<p><strong>Unbreakable Elytra</strong> with Mending and Unbreaking III for effortless flight.</p>`,
    image_url: '/store/others.png',
    display_order: 0,
  },
  {
    id: 'item-other-mace',
    title: 'Mace',
    category: 'Others',
    price: 349.0,
    description: `<p><strong>Heavy Mace</strong> with Wind Burst and Density for devastating smash attacks.</p>`,
    image_url: '/store/others.png',
    display_order: 1,
  },
];

export const INITIAL_LEADERBOARD: TopBuyer[] = [
  {
    id: '381e5a4c-0526-4081-802f-fc64f299872e',
    username: 'A4DV',
    total_spent: 3430,
    rank: 1,
  },
  {
    id: 'lead-2',
    username: 'SpearXDD',
    total_spent: 2450,
    rank: 2,
  },
  {
    id: 'lead-3',
    username: 'MrABD',
    total_spent: 1890,
    rank: 3,
  },
  {
    id: 'lead-4',
    username: 'ShadowCrafter',
    total_spent: 1240,
    rank: 4,
  },
  {
    id: 'lead-5',
    username: 'PixelKnight',
    total_spent: 899,
    rank: 5,
  },
];

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'staff-1',
    name: 'SpearXDD',
    role: 'Owner',
    description: 'Server Founder & Network Lead',
    discord_username: 'spearxdd',
  },
  {
    id: 'staff-2',
    name: 'MrABD',
    role: 'Co-Owner',
    description: 'Co-Owner & Development Management',
    discord_username: 'mrabd',
  },
  {
    id: 'staff-3',
    name: 'VortexAdmin',
    role: 'Manager',
    description: 'Head of Staff & Network Operations',
    discord_username: 'vortexadmin',
  },
  {
    id: 'staff-4',
    name: 'FarhanAstro',
    role: 'Senior Admin',
    description: 'Store & Billing Operations Manager',
    discord_username: 'farhanastro',
  },
  {
    id: 'staff-5',
    name: 'PixelKnight',
    role: 'Admin',
    description: 'Server Administrator & Ticket Supervisor',
    discord_username: 'pixelknight',
  },
  {
    id: 'staff-6',
    name: 'NovaCrafter',
    role: 'Junior Admin',
    description: 'Assistant Admin & Event Coordinator',
    discord_username: 'novacrafter',
  },
  {
    id: 'staff-7',
    name: 'ByteCode',
    role: 'Developer',
    description: 'Custom Plugin Developer & Systems Engineer',
    discord_username: 'bytecode',
  },
  {
    id: 'staff-8',
    name: 'ShadowGuardian',
    role: 'Senior Moderator',
    description: 'Head of Anti-Cheat & Senior Community Enforcement',
    discord_username: 'shadowguardian',
  },
  {
    id: 'staff-9',
    name: 'LifestealMod',
    role: 'Moderator',
    description: 'Community Protection & Chat Moderation',
    discord_username: 'lifestealmod',
  },
  {
    id: 'staff-10',
    name: 'BlazeRider',
    role: 'Junior Moderator',
    description: 'In-Game Support & Player Assistance',
    discord_username: 'blazerider',
  },
  {
    id: 'staff-11',
    name: 'AstroHelper',
    role: 'Helper',
    description: 'Newbie Support & Discord Helper',
    discord_username: 'astrohelper',
  },
];

export const INITIAL_VOTE_LINKS: VoteLink[] = [
  {
    id: 'vote-1',
    name: 'Minecraft Server List',
    host: 'minecraft-server-list.com',
    url: 'https://minecraft-server-list.com/server/wondermc',
  },
  {
    id: 'vote-2',
    name: 'TopG Servers',
    host: 'topg.org',
    url: 'https://topg.org/minecraft-servers/server-wondermc',
  },
  {
    id: 'vote-3',
    name: 'Planet Minecraft',
    host: 'planetminecraft.com',
    url: 'https://www.planetminecraft.com/server/wondermc-lifesteal',
  },
  {
    id: 'vote-4',
    name: 'Best Minecraft Servers',
    host: 'best-minecraft-servers.co',
    url: 'https://best-minecraft-servers.co/server-wondermc',
  },
];

export const RECENT_PURCHASES_TICKER = [
  '🔥 Indian Best Minecraft Server Wonder MC • play.wondermc.fun',
  '⚡ Indian Best Minecraft Server Wonder MC • play.wondermc.fun',
  '👑 Indian Best Minecraft Server Wonder MC • play.wondermc.fun',
  '🎮 Indian Best Minecraft Server Wonder MC • play.wondermc.fun',
];

// Deprecated legacy map - coupons are strictly validated against dynamic coupons state / localStorage
export const VALID_COUPONS: Record<string, number> = {};

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'coup-1',
    code: 'SUMMER30',
    category: 'normal',
    discountType: 'percentage',
    discountValue: 30,
    expiryDate: '2026-12-31',
    usageLimit: 100,
    usedCount: 14,
    enabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'coup-2',
    code: 'WONDERMC10',
    category: 'normal',
    discountType: 'percentage',
    discountValue: 10,
    expiryDate: '2026-11-30',
    usageLimit: 500,
    usedCount: 42,
    enabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'coup-3',
    code: 'FLAT50',
    category: 'normal',
    discountType: 'fixed',
    discountValue: 50,
    expiryDate: '2026-10-15',
    usageLimit: 50,
    usedCount: 8,
    enabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'coup-4',
    code: 'SPECIAL20',
    category: 'private',
    discountType: 'percentage',
    discountValue: 20,
    expiryDate: '',
    usageLimit: 0,
    usedCount: 19,
    enabled: true,
    createdAt: new Date().toISOString(),
  },
];

export const formatINR = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'ticket-101',
    ticketNumber: 'TKT-8492',
    ign: 'ShadowCrafter',
    contact: 'shadow#4412',
    category: 'Payment / Store Issue',
    subject: 'Rank activation pending after UPI payment',
    message: 'I purchased Titan Rank 15 minutes ago with UTR 420938472910 via Google Pay, but the rank has not activated in-game yet. Please check and credit.',
    status: 'open',
    priority: 'high',
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    adminNote: '',
  },
  {
    id: 'ticket-102',
    ticketNumber: 'TKT-8480',
    ign: 'SpearHero99',
    contact: 'spear_official',
    category: 'Rank Activation Delay',
    subject: 'Keys not received in inventory',
    message: 'Bought 10x Mystery Crate Keys during the Summer Sale. My inventory was full so only 3 came in. Can you grant the remaining 7 keys?',
    status: 'in_progress',
    priority: 'medium',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    adminNote: 'Checking console logs for inventory drop event.',
  },
  {
    id: 'ticket-103',
    ticketNumber: 'TKT-8455',
    ign: 'NightRider_MC',
    contact: 'nightrider@gmail.com',
    category: 'In-Game Report / Bug',
    subject: 'Claim blocks question for Lifesteal base',
    message: 'Is claim protection active on the nether roof or only in overworld? Thanks for helping!',
    status: 'resolved',
    priority: 'low',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    adminNote: 'Answered: Overworld only as per server rules.',
  },
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    action: 'System Initialized',
    adminName: 'Main Server Owner',
    details: 'WonderMC store initialized with default products, categories, and security rules.',
    timestamp: new Date().toISOString(),
    type: 'settings',
  },
];

export const INITIAL_UPDATES: ServerUpdate[] = [
  {
    id: 'upd-101',
    title: '🔥 Season 4 Lifesteal Grand Update & Store Sale',
    tag: 'Announcement',
    author: 'WonderMC Admin',
    pinned: true,
    imageUrl: '/store/ranks.png',
    content: `Welcome to the all-new **WonderMC Lifesteal Season 4**!\n\nWe are excited to announce major improvements across our server infrastructure:\n- ⚡ **Enhanced Anti-Cheat System**: 100% lag-free PVP combat with active anti-xray protection.\n- 🏆 **Top Buyer Rewards**: Weekly rank upgrades & exclusive crate keys for top supporters.\n- 🎁 **30% Summer Sale**: Automatic 30% discount applied at store checkout!\n\nJoin our Discord server to participate in daily giveaways!`,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'upd-102',
    title: '🛠️ Server Payment Verification System Upgraded',
    tag: 'Update',
    author: 'SpearXDD',
    pinned: false,
    content: `We have updated our store verification portal! When making a UPI purchase, you can now attach your payment screenshot directly for fast staff review.\n\n- Real-time Discord notifications for staff.\n- Instant ticket log tracking in Admin Panel.`,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
];

export const INITIAL_CONNECTION_GUIDE: ConnectionGuide = {
  javaTitle: "Java Edition",
  javaDescription: "For PC and Laptop players",
  javaSteps: [
    "Open Launcher (Cracked Client / TLauncher Included)",
    "Launch game and click \"Multiplayer\" on menu",
    "Click \"Add Server\" at the bottom right",
    "Select the \"Server Address\" textbox",
    "Type the Server Address: play.wondermc.fun",
    "Click Done, select the server and click \"Join Server\""
  ],
  bedrockTitle: "Bedrock Edition",
  bedrockDescription: "For MCPE, Mobile, Console & Win 10",
  bedrockSteps: [
    "Launch Minecraft and click \"Play\" on the main screen",
    "Select the \"Servers\" tab on the top menu",
    "Scroll down to the bottom and click \"Add Server\"",
    "Type the Server Name as: WonderMC",
    "Type Server Address: play.wondermc.fun",
    "Enter the Port number as: 19132",
    "Click \"Play\" or \"Save\" to join the Server instantly!"
  ]
};

export const INITIAL_RULES_CATEGORIES: RuleCategory[] = [
  {
    id: 'rules-conduct',
    name: "General Conduct",
    icon: 'shield',
    rules: [
      {
        id: 'cond-1',
        title: "The Basics",
        description: "Respect the WONDER MC network, its community, and its staff at all times. Follow the rules of the server and cooperate with staff when required."
      },
      {
        id: 'cond-2',
        title: "Respect Others",
        description: "Treat every player with respect. Harassment, threats, discrimination, targeted toxicity, or intentionally creating a hostile environment is not allowed."
      },
      {
        id: 'cond-3',
        title: "Advertising",
        description: "Advertising other servers, communities, services, or invite links without permission is not allowed. Keep promotions within the channels specifically designated for them."
      },
      {
        id: 'cond-4',
        title: "Channels",
        description: "Use each channel for its intended purpose. Avoid unnecessary messages, spam, flooding, or content that does not belong in the respective channel."
      }
    ]
  },
  {
    id: 'rules-fairplay',
    name: "Fair Play",
    icon: 'zap',
    rules: [
      {
        id: 'fair-1',
        title: "Unfair Advantage",
        description: "Any hacked client, cheat, modification, exploit, or external tool that provides an unfair advantage is prohibited. Abusing bugs or unintended mechanics is also not allowed."
      },
      {
        id: 'fair-2',
        title: "Teaming and Exploits",
        description: "Do not abuse glitches, exploits, or unintended game mechanics to gain an advantage. Any discovered exploit should be reported to the staff team instead of being abused."
      },
      {
        id: 'fair-3',
        title: "Account Security",
        description: "Do not share, sell, trade, or give away your WONDER MC account or login information. You are responsible for all activity performed through your account."
      }
    ]
  },
  {
    id: 'rules-chat',
    name: "Chat Rules",
    icon: 'chat',
    rules: [
      { id: 'chat-1', title: "No Spam", description: "Do not spam or flood the chat." },
      { id: 'chat-2', title: "No Caps Abuse", description: "Do not excessively use caps or repeated messages." },
      { id: 'chat-3', title: "No Harassment", description: "Do not harass, threaten, or target other players." },
      { id: 'chat-4', title: "No NSFW Content", description: "Do not share inappropriate or NSFW content." },
      { id: 'chat-5', title: "No Discrimination", description: "Do not use discriminatory or hateful language." },
      { id: 'chat-6', title: "Respectful Interactions", description: "Keep conversations appropriate and respectful at all times." }
    ]
  },
  {
    id: 'rules-punishments',
    name: "Punishments",
    icon: 'alert',
    rules: [
      {
        id: 'pun-1',
        title: "Enforcement",
        description: "Punishments may vary depending on the severity and history of an offense. Repeated or serious violations may result in longer or permanent punishments. Staff members reserve the right to take appropriate action against behavior that negatively affects WONDER MC, even if a specific situation is not explicitly listed in these rules."
      }
    ]
  }
];


