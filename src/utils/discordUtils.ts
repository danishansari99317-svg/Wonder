import { StaffMember } from '../types';

/**
 * Extracts a Discord Profile URL from any user ID, mention, or Discord URL string.
 * Supports:
 * - 17 to 20 digit snowflake ID: '109054142759123456' -> 'https://discord.com/users/109054142759123456'
 * - Mention string: '<@109054142759123456>' or '<@!109054142759123456>'
 * - Full URL: 'https://discord.com/users/109054142759123456'
 * - Protocol-less URL: 'discord.com/users/109054142759123456'
 */
export function extractDiscordProfileUrl(input?: string): string | null {
  if (!input) return null;
  const raw = input.trim();
  if (!raw) return null;

  // Direct user profile link
  if (raw.startsWith('https://discord.com/users/') || raw.startsWith('https://discordapp.com/users/')) {
    return raw;
  }
  if (raw.startsWith('http://discord.com/users/') || raw.startsWith('http://discordapp.com/users/')) {
    return raw.replace(/^http:/, 'https:');
  }

  // Without protocol
  if (raw.startsWith('discord.com/users/') || raw.startsWith('discordapp.com/users/')) {
    return `https://${raw}`;
  }

  // Extract 17-20 digit snowflake ID from any string or mention
  const idMatch = raw.match(/\b\d{17,20}\b/);
  if (idMatch) {
    return `https://discord.com/users/${idMatch[0]}`;
  }

  // Generic valid URL
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw;
  }

  return null;
}

/**
 * Gets the resolved Discord profile URL for a staff member.
 */
export function getStaffDiscordUrl(staff: StaffMember): string | null {
  if (staff.discord_url) {
    const url = extractDiscordProfileUrl(staff.discord_url);
    if (url) return url;
  }

  if (staff.discord_id) {
    const url = extractDiscordProfileUrl(staff.discord_id);
    if (url) return url;
  }

  return null;
}
