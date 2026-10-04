import { StoreConfigState } from '../context/StoreConfigContext';

export interface PaymentWebhookData {
  ign: string;
  utr: string;
  amount: number;
  itemsDescription: string;
  contact?: string;
  screenshotUrl?: string;
  ticketNumber?: string;
  gamemode?: string;
  serverIp?: string;
  paymentMethod?: string;
}

export interface TicketWebhookData {
  ticketNumber: string;
  ign: string;
  contact?: string;
  category: string;
  subject: string;
  message: string;
  screenshotUrl?: string;
  priority?: string;
}

export interface OrderApprovedWebhookData {
  ign: string;
  utr?: string;
  amount: number;
  itemsDescription: string;
  approvedBy?: string;
  ticketNumber?: string;
}

/**
 * Converts base64 data URL to Blob for Discord attachment upload
 */
function dataURLtoBlob(dataurl: string): { blob: Blob; filename: string } | null {
  try {
    const arr = dataurl.split(',');
    if (arr.length < 2) return null;
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const ext = mime.split('/')[1] || 'png';
    return {
      blob: new Blob([u8arr], { type: mime }),
      filename: `payment_screenshot.${ext}`,
    };
  } catch (e) {
    return null;
  }
}

/**
 * Sends a generic payload to Discord Webhook with safety checks and error handling
 */
async function postToDiscord(
  webhookUrl: string,
  payload: Record<string, any>,
  imageBlob?: Blob | null,
  imageFileName?: string
): Promise<{ success: boolean; error?: string }> {
  const cleanUrl = (webhookUrl || '').trim();

  if (!cleanUrl) {
    return { success: false, error: 'No Discord Webhook URL configured' };
  }

  // Validate that it looks like a Discord webhook URL
  if (
    !cleanUrl.startsWith('https://discord.com/api/webhooks/') &&
    !cleanUrl.startsWith('https://discordapp.com/api/webhooks/') &&
    !cleanUrl.startsWith('https://canary.discord.com/api/webhooks/') &&
    !cleanUrl.startsWith('https://ptb.discord.com/api/webhooks/')
  ) {
    return {
      success: false,
      error: 'Invalid Webhook URL. It must start with https://discord.com/api/webhooks/...',
    };
  }

  try {
    let response: Response;

    if (imageBlob) {
      const formData = new FormData();
      formData.append('payload_json', JSON.stringify(payload));
      formData.append('files[0]', imageBlob, imageFileName || 'payment_screenshot.png');

      response = await fetch(cleanUrl, {
        method: 'POST',
        body: formData,
      });
    } else {
      response = await fetch(cleanUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    }

    if (response.ok || response.status === 204) {
      return { success: true };
    }

    const errText = await response.text().catch(() => 'Discord returned error status ' + response.status);
    console.warn('[Discord Webhook Error]', response.status, errText);
    return {
      success: false,
      error: `Discord Webhook Error (${response.status}): ${errText.slice(0, 150)}`,
    };
  } catch (err: any) {
    console.error('[Discord Webhook Network Failure]', err);
    return {
      success: false,
      error: err?.message || 'Network error while contacting Discord Webhook',
    };
  }
}

/**
 * 🛒 Send Payment / Order Verification Notification to Discord
 */
export async function sendPaymentDiscordNotification(
  data: PaymentWebhookData,
  config: StoreConfigState
): Promise<{ success: boolean; error?: string }> {
  if (!config.discordWebhookEnabled || !config.discordWebhookUrl) {
    return { success: false, error: 'Discord webhook is disabled or URL not set' };
  }

  if (config.discordNotifyOnPayment === false) {
    return { success: false, error: 'Payment notifications are disabled in settings' };
  }

  const cleanIgn = data.ign.trim() || 'Player';
  const cleanUtr = data.utr.trim() || 'N/A';
  const pingText = config.discordPingRole ? `${config.discordPingRole.trim()} ` : '';

  let imageBlob: Blob | null = null;
  let imageFileName = 'payment_receipt.png';
  let embedImageUrl: string | undefined = undefined;

  if (data.screenshotUrl) {
    const trimmedScreen = data.screenshotUrl.trim();
    if (trimmedScreen.startsWith('data:image/')) {
      const converted = dataURLtoBlob(trimmedScreen);
      if (converted) {
        imageBlob = converted.blob;
        imageFileName = converted.filename;
        embedImageUrl = `attachment://${imageFileName}`;
      }
    } else if (trimmedScreen.startsWith('http')) {
      embedImageUrl = trimmedScreen;
    }
  }

  const payload = {
    username: config.discordBotName || `${config.brand} Store Bot`,
    avatar_url:
      config.discordAvatarUrl ||
      'https://mc-heads.net/avatar/MHF_Chest/128',
    content: `${pingText}🚨 **New Store Payment Verification Received!**`,
    embeds: [
      {
        title: `🛒 New Payment Submitted — ₹${data.amount}`,
        description: `A player has completed checkout on **${config.brand} Store** and submitted their UPI transaction reference for verification.`,
        color: 0xf59e0b, // Amber Gold
        thumbnail: {
          url: `https://mc-heads.net/body/${encodeURIComponent(cleanIgn)}/right`,
        },
        fields: [
          {
            name: '👤 Minecraft IGN',
            value: `**\`${cleanIgn}\`**\n[View Skin](https://mc-heads.net/avatar/${encodeURIComponent(cleanIgn)}/128)`,
            inline: true,
          },
          {
            name: '💰 Amount Paid',
            value: `**₹${data.amount}** (INR)`,
            inline: true,
          },
          {
            name: '🧾 UTR / Ref ID',
            value: `\`${cleanUtr}\``,
            inline: true,
          },
          {
            name: '📦 Purchased Item(s)',
            value: data.itemsDescription || 'Store Items',
            inline: false,
          },
          {
            name: '💳 Payment UPI VPA',
            value: `\`${config.upiId || 'Direct UPI'}\` (${config.upiPayeeName || 'Store'})`,
            inline: true,
          },
          {
            name: '🎫 Support Ticket',
            value: data.ticketNumber ? `\`#${data.ticketNumber}\`` : '`Auto-Logged`',
            inline: true,
          },
          {
            name: '🌐 Server IP',
            value: `\`${data.serverIp || config.serverIp}\` (${data.gamemode || config.serverName})`,
            inline: true,
          },
          {
            name: '📞 Player Contact',
            value: data.contact ? `\`${data.contact}\`` : '*Not provided during checkout*',
            inline: true,
          },
          {
            name: '🖼️ Payment Screenshot',
            value: data.screenshotUrl
              ? data.screenshotUrl.startsWith('http')
                ? `[View Direct Payment Link](${data.screenshotUrl})`
                : '`Attached Payment Screenshot Image Below ⬇️`'
              : '*No screenshot attached*',
            inline: false,
          },
        ],
        ...(embedImageUrl ? { image: { url: embedImageUrl } } : {}),
        footer: {
          text: `${config.brand} Store Bot • Verify in Admin Panel & Grant Perks`,
          icon_url: 'https://mc-heads.net/avatar/MHF_Exclamation/64',
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  return postToDiscord(config.discordWebhookUrl, payload, imageBlob, imageFileName);
}

/**
 * 🎫 Send Support Ticket Notification to Discord
 */
export async function sendTicketDiscordNotification(
  data: TicketWebhookData,
  config: StoreConfigState
): Promise<{ success: boolean; error?: string }> {
  if (!config.discordWebhookEnabled || !config.discordWebhookUrl) {
    return { success: false, error: 'Discord webhook is disabled or URL not set' };
  }

  if (config.discordNotifyOnTicket === false) {
    return { success: false, error: 'Ticket notifications are disabled in settings' };
  }

  const cleanIgn = data.ign.trim() || 'Player';
  const pingText = config.discordPingRole ? `${config.discordPingRole.trim()} ` : '';

  const payload = {
    username: config.discordBotName || `${config.brand} Store Bot`,
    avatar_url:
      config.discordAvatarUrl ||
      'https://mc-heads.net/avatar/MHF_Chest/128',
    content: `${pingText}📩 **New Support Ticket Opened!**`,
    embeds: [
      {
        title: `🎫 Ticket #${data.ticketNumber}: ${data.subject}`,
        description: `A player has submitted a new support request on **${config.brand}** web portal.`,
        color: data.priority === 'high' || data.priority === 'urgent' ? 0xf43f5e : 0x3b82f6,
        thumbnail: {
          url: `https://mc-heads.net/avatar/${encodeURIComponent(cleanIgn)}/128`,
        },
        fields: [
          {
            name: '👤 Minecraft IGN',
            value: `\`${cleanIgn}\``,
            inline: true,
          },
          {
            name: '🏷️ Category',
            value: `\`${data.category}\``,
            inline: true,
          },
          {
            name: '⚡ Priority',
            value: `**${(data.priority || 'Medium').toUpperCase()}**`,
            inline: true,
          },
          {
            name: '📱 Discord / Contact',
            value: data.contact ? `\`${data.contact}\`` : '*Not provided*',
            inline: true,
          },
          {
            name: '💬 Player Message',
            value: data.message.length > 1000 ? `${data.message.slice(0, 990)}...` : data.message,
            inline: false,
          },
        ],
        footer: {
          text: `${config.brand} Support System • Respond via Admin Panel or Discord`,
          icon_url: 'https://mc-heads.net/avatar/MHF_Question/64',
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  return postToDiscord(config.discordWebhookUrl, payload);
}

/**
 * 🧪 Send Test Discord Notification (For Testing Webhook in Admin Panel)
 */
export async function sendTestDiscordNotification(
  config: StoreConfigState
): Promise<{ success: boolean; error?: string }> {
  if (!config.discordWebhookUrl) {
    return { success: false, error: 'Please enter a Discord Webhook URL first' };
  }

  const payload = {
    username: config.discordBotName || `${config.brand} Store Bot`,
    avatar_url:
      config.discordAvatarUrl ||
      'https://mc-heads.net/avatar/MHF_Chest/128',
    content: `✅ **Discord Bot Connected Successfully!**`,
    embeds: [
      {
        title: `⚡ ${config.brand} Store Bot Connection Test`,
        description: `This is a test notification from the **${config.brand} Store Admin Panel**. Your Discord webhook is properly configured and ready to receive real-time order and payment alerts!`,
        color: 0x10b981, // Emerald green
        thumbnail: {
          url: 'https://mc-heads.net/body/SpearXDD/right',
        },
        fields: [
          {
            name: '🌐 Server IP',
            value: `\`${config.serverIp}\``,
            inline: true,
          },
          {
            name: '💳 Merchant UPI ID',
            value: `\`${config.upiId}\``,
            inline: true,
          },
          {
            name: '🔔 Notifications Enabled',
            value: `• Payment & Orders: **${config.discordNotifyOnPayment ? 'Active' : 'Muted'}**\n• Support Tickets: **${config.discordNotifyOnTicket ? 'Active' : 'Muted'}**`,
            inline: false,
          },
          {
            name: '📣 Ping Configured',
            value: config.discordPingRole ? `\`${config.discordPingRole}\`` : '*No role ping configured*',
            inline: true,
          },
          {
            name: '⏰ Test Timestamp',
            value: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' (IST)',
            inline: true,
          },
        ],
        footer: {
          text: `${config.brand} Store Bot • Powered by Webhook Integration`,
          icon_url: 'https://mc-heads.net/avatar/MHF_Checkmark/64',
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  return postToDiscord(config.discordWebhookUrl, payload);
}

/**
 * 🛡️ Send Order Approved / Perks Granted Notification to Discord
 */
export async function sendOrderApprovedDiscordNotification(
  data: OrderApprovedWebhookData,
  config: StoreConfigState
): Promise<{ success: boolean; error?: string }> {
  if (!config.discordWebhookEnabled || !config.discordWebhookUrl) {
    return { success: false, error: 'Discord webhook is disabled or URL not set' };
  }

  const cleanIgn = data.ign.trim() || 'Player';

  const payload = {
    username: config.discordBotName || `${config.brand} Store Bot`,
    avatar_url:
      config.discordAvatarUrl ||
      'https://mc-heads.net/avatar/MHF_Chest/128',
    embeds: [
      {
        title: `✅ Payment Verified & Order Fulfilled!`,
        description: `Staff has verified the payment for player **${cleanIgn}** and delivered the purchased items in-game.`,
        color: 0x10b981, // Emerald Green
        thumbnail: {
          url: `https://mc-heads.net/body/${encodeURIComponent(cleanIgn)}/right`,
        },
        fields: [
          {
            name: '👤 Minecraft IGN',
            value: `\`${cleanIgn}\``,
            inline: true,
          },
          {
            name: '💰 Order Amount',
            value: `**₹${data.amount}**`,
            inline: true,
          },
          {
            name: '📦 Product Delivered',
            value: data.itemsDescription,
            inline: false,
          },
          {
            name: '🧾 Verified UTR',
            value: data.utr ? `\`${data.utr}\`` : '*Manual Verification*',
            inline: true,
          },
          {
            name: '🛡️ Verified By',
            value: `\`${data.approvedBy || 'Admin'}\``,
            inline: true,
          },
        ],
        footer: {
          text: `${config.brand} Network • Thank you for supporting the server!`,
          icon_url: 'https://mc-heads.net/avatar/MHF_Checkmark/64',
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  return postToDiscord(config.discordWebhookUrl, payload);
}
