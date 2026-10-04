import React, { useState } from 'react';
import { StaffMember } from '../types';
import { useStoreConfig } from '../context/StoreConfigContext';
import { useToast } from '../context/ToastContext';
import { MinecraftSkinImage } from './MinecraftSkinImage';
import { sortStaffByHierarchy } from '../utils/staffHierarchy';
import { getStaffDiscordUrl } from '../utils/discordUtils';
import {
  Shield,
  Crown,
  ShieldAlert,
  Code,
  HeartHandshake,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Users,
  Award,
  Zap,
} from 'lucide-react';

interface StaffPageProps {
  staffList: StaffMember[];
  onBackToStore: () => void;
}

export const StaffPage: React.FC<StaffPageProps> = ({ staffList }) => {
  const { config } = useStoreConfig();
  const { success } = useToast();
  const [copiedIgn, setCopiedIgn] = useState<string | null>(null);
  const [copiedDiscordTag, setCopiedDiscordTag] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIgn(text);
    success(`Copied ${label}: ${text}`);
    setTimeout(() => setCopiedIgn(null), 2000);
  };

  const handleMessageOnDiscord = (staff: StaffMember, e: React.MouseEvent) => {
    e.preventDefault();
    const profileUrl = getStaffDiscordUrl(staff);
    if (profileUrl) {
      window.open(profileUrl, '_blank', 'noopener,noreferrer');
      success(`Opening ${staff.name}'s Discord Profile...`);
      return;
    }

    if (staff.discord_username?.trim()) {
      const username = staff.discord_username.trim().replace(/^@/, '');
      try {
        navigator.clipboard.writeText(username);
        success(`Copied Discord username: @${username}! Opening Discord...`);
      } catch {}
      window.open(config.discordUrl || 'https://discord.com/app', '_blank', 'noopener,noreferrer');
      return;
    }

    // Fallback: Copy IGN and open server Discord
    try {
      navigator.clipboard.writeText(staff.name);
      success(`Copied ${staff.name}'s name! Opening ${config.brand} Discord...`);
    } catch {}
    window.open(config.discordUrl || 'https://discord.com', '_blank', 'noopener,noreferrer');
  };

  const getRoleTheme = (role: StaffMember['role']) => {
    switch (role) {
      case 'Owner':
        return {
          title: 'Owner & Leadership',
          emoji: '👑',
          badgeBg: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30',
          border: 'border-amber-500/50 hover:border-amber-400',
          glow: 'from-amber-500/20 via-yellow-500/10 to-transparent',
          pedestal: 'bg-gradient-to-r from-amber-500/40 via-yellow-400/50 to-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.5)]',
          icon: <Crown className="w-4 h-4 text-amber-950 fill-amber-950" />,
          accentText: 'text-amber-400',
          chipBorder: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
        };
      case 'Co-Owner':
        return {
          title: 'Co-Owner & Executive',
          emoji: '🔱',
          badgeBg: 'bg-gradient-to-r from-yellow-500 via-amber-400 to-orange-500 text-slate-950 font-black shadow-lg shadow-yellow-500/30',
          border: 'border-yellow-500/50 hover:border-yellow-400',
          glow: 'from-yellow-500/20 via-amber-500/10 to-transparent',
          pedestal: 'bg-gradient-to-r from-yellow-500/40 via-amber-400/50 to-yellow-500/40 shadow-[0_0_25px_rgba(234,179,8,0.5)]',
          icon: <Crown className="w-4 h-4 text-slate-950" />,
          accentText: 'text-yellow-400',
          chipBorder: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300',
        };
      case 'Manager':
        return {
          title: 'Management & Operations',
          emoji: '💼',
          badgeBg: 'bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 text-white font-black shadow-lg shadow-purple-500/30',
          border: 'border-purple-500/50 hover:border-purple-400',
          glow: 'from-purple-500/20 via-fuchsia-500/10 to-transparent',
          pedestal: 'bg-gradient-to-r from-purple-500/40 via-fuchsia-400/50 to-purple-500/40 shadow-[0_0_25px_rgba(168,85,247,0.5)]',
          icon: <Zap className="w-4 h-4 text-white" />,
          accentText: 'text-purple-400',
          chipBorder: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
        };
      case 'Senior Admin':
        return {
          title: 'Senior Administration',
          emoji: '💎',
          badgeBg: 'bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 text-slate-950 font-black shadow-lg shadow-cyan-500/30',
          border: 'border-cyan-500/50 hover:border-cyan-400',
          glow: 'from-cyan-500/20 via-teal-500/10 to-transparent',
          pedestal: 'bg-gradient-to-r from-cyan-500/40 via-teal-400/50 to-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.5)]',
          icon: <Shield className="w-4 h-4 text-slate-950 fill-slate-950" />,
          accentText: 'text-cyan-400',
          chipBorder: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
        };
      case 'Admin':
        return {
          title: 'Network Administrator',
          emoji: '🛡️',
          badgeBg: 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black shadow-lg shadow-sky-500/30',
          border: 'border-sky-500/50 hover:border-sky-400',
          glow: 'from-sky-500/20 via-blue-500/10 to-transparent',
          pedestal: 'bg-gradient-to-r from-sky-500/40 via-blue-400/50 to-sky-500/40 shadow-[0_0_25px_rgba(14,165,233,0.5)]',
          icon: <Shield className="w-4 h-4 text-white fill-white" />,
          accentText: 'text-sky-400',
          chipBorder: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
        };
      case 'Junior Admin':
        return {
          title: 'Junior Administration',
          emoji: '🔰',
          badgeBg: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-black shadow-lg shadow-blue-500/30',
          border: 'border-blue-500/50 hover:border-blue-400',
          glow: 'from-blue-500/20 via-indigo-500/10 to-transparent',
          pedestal: 'bg-gradient-to-r from-blue-500/40 via-indigo-400/50 to-blue-500/40 shadow-[0_0_25px_rgba(59,130,246,0.5)]',
          icon: <ShieldAlert className="w-4 h-4 text-white" />,
          accentText: 'text-blue-300',
          chipBorder: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
        };
      case 'Developer':
        return {
          title: 'Lead Development',
          emoji: '💻',
          badgeBg: 'bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500 text-slate-950 font-black shadow-lg shadow-emerald-500/30',
          border: 'border-emerald-500/50 hover:border-emerald-400',
          glow: 'from-emerald-500/20 via-teal-500/10 to-transparent',
          pedestal: 'bg-gradient-to-r from-emerald-500/40 via-teal-400/50 to-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.5)]',
          icon: <Code className="w-4 h-4 text-slate-950" />,
          accentText: 'text-emerald-400',
          chipBorder: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
        };
      case 'Senior Moderator':
        return {
          title: 'Senior Moderation',
          emoji: '⚔️',
          badgeBg: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-500 text-white font-black shadow-lg shadow-indigo-500/30',
          border: 'border-indigo-500/50 hover:border-indigo-400',
          glow: 'from-indigo-500/20 via-purple-500/10 to-transparent',
          pedestal: 'bg-gradient-to-r from-indigo-500/40 via-purple-400/50 to-indigo-500/40 shadow-[0_0_25px_rgba(99,102,241,0.5)]',
          icon: <ShieldAlert className="w-4 h-4 text-white" />,
          accentText: 'text-indigo-400',
          chipBorder: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300',
        };
      case 'Moderator':
        return {
          title: 'Server Moderator',
          emoji: '🔨',
          badgeBg: 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-black shadow-lg shadow-violet-500/30',
          border: 'border-violet-500/50 hover:border-violet-400',
          glow: 'from-violet-500/20 via-fuchsia-500/10 to-transparent',
          pedestal: 'bg-gradient-to-r from-violet-500/40 via-fuchsia-400/50 to-violet-500/40 shadow-[0_0_25px_rgba(139,92,246,0.5)]',
          icon: <ShieldAlert className="w-4 h-4 text-white" />,
          accentText: 'text-violet-400',
          chipBorder: 'border-violet-500/30 bg-violet-500/10 text-violet-300',
        };
      case 'Junior Moderator':
        return {
          title: 'Junior Moderator',
          emoji: '🗡️',
          badgeBg: 'bg-gradient-to-r from-rose-500 via-pink-500 to-red-400 text-white font-black shadow-lg shadow-rose-500/30',
          border: 'border-rose-500/50 hover:border-rose-400',
          glow: 'from-rose-500/20 via-pink-500/10 to-transparent',
          pedestal: 'bg-gradient-to-r from-rose-500/40 via-pink-400/50 to-rose-500/40 shadow-[0_0_25px_rgba(244,63,94,0.5)]',
          icon: <Shield className="w-4 h-4 text-white" />,
          accentText: 'text-rose-400',
          chipBorder: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
        };
      case 'Helper':
        return {
          title: 'Community Helper',
          emoji: '🤝',
          badgeBg: 'bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500 text-slate-950 font-black shadow-lg shadow-amber-400/30',
          border: 'border-amber-400/50 hover:border-amber-300',
          glow: 'from-amber-400/20 via-orange-400/10 to-transparent',
          pedestal: 'bg-gradient-to-r from-amber-400/40 via-orange-400/50 to-amber-400/40 shadow-[0_0_25px_rgba(251,191,36,0.5)]',
          icon: <HeartHandshake className="w-4 h-4 text-slate-950" />,
          accentText: 'text-amber-300',
          chipBorder: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
        };
      case 'Staff':
      default:
        return {
          title: 'General Staff',
          emoji: '✨',
          badgeBg: 'bg-gradient-to-r from-slate-600 to-slate-800 text-white font-black shadow-lg shadow-slate-600/30',
          border: 'border-slate-500/50 hover:border-slate-400',
          glow: 'from-slate-500/20 via-slate-600/10 to-transparent',
          pedestal: 'bg-gradient-to-r from-slate-500/40 via-slate-600/50 to-slate-500/40 shadow-[0_0_25px_rgba(100,116,139,0.5)]',
          icon: <Sparkles className="w-4 h-4 text-white" />,
          accentText: 'text-slate-300',
          chipBorder: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
        };
    }
  };

  return (
    <div className="min-h-screen pb-20 animate-in fade-in duration-300">
      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-border/80 bg-gradient-to-b from-surface-deep via-surface to-surface-deep py-12 sm:py-16">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-0 right-10 w-[350px] h-[250px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-accent mb-4">
            <Shield className="w-4 h-4 text-accent" />
            <span>Official Network Roster</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-foreground font-display mb-4">
            Meet The <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-accent to-sky-400">{config.brand}</span> Staff Team
          </h1>

          <p className="mx-auto max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            The dedicated administrators, engineers, and community moderators who maintain the server, protect gameplay, and assist players 24/7.
          </p>

          {/* Quick Stat Highlights */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-surface-deep/80 px-4 py-2.5 backdrop-blur-sm">
              <Users className="w-4 h-4 text-accent" />
              <span className="text-xs font-bold text-muted-foreground">Total Staff:</span>
              <span className="text-sm font-black text-foreground font-mono">{staffList.length} Members</span>
            </div>

            <div className="flex items-center gap-2.5 rounded-2xl border border-amber-500/30 bg-amber-500/5 px-4 py-2.5 backdrop-blur-sm">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-300/80">Leadership:</span>
              <span className="text-sm font-black text-amber-300 font-mono">
                {staffList.filter((s) => s.role === 'Owner').length} Owners
              </span>
            </div>

            <div className="flex items-center gap-2.5 rounded-2xl border border-sky-500/30 bg-sky-500/5 px-4 py-2.5 backdrop-blur-sm">
              <Award className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold text-sky-300/80">Support Active:</span>
              <span className="text-sm font-black text-sky-300 font-mono">24/7 on Discord</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area: Staff Grid */}
      <main className="mx-auto max-w-[1200px] px-4 sm:px-6 py-10">
        {/* Staff Members Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortStaffByHierarchy(staffList).map((staff) => {
            const theme = getRoleTheme(staff.role);
            const isOwner = staff.role === 'Owner';
            const cleanName = staff.name.trim();
            const fullBodyUrl = `https://mc-heads.net/body/${encodeURIComponent(cleanName)}/right`;

            return (
              <div
                key={staff.id}
                className={`group relative flex flex-col justify-between rounded-2xl border bg-surface transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl overflow-hidden ${theme.border} ${
                  isOwner ? 'ring-1 ring-amber-500/30' : ''
                }`}
              >
                {/* Ambient Top Glow */}
                <div
                  className={`absolute top-0 inset-x-0 h-36 bg-gradient-to-b ${theme.glow} pointer-events-none`}
                />

                {/* Card Header: Role Badge & In-Game Status */}
                <div className="relative p-5 pb-0 flex items-center justify-between gap-2 z-10">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] uppercase tracking-wider ${theme.badgeBg}`}
                  >
                    <span>{theme.emoji}</span>
                    <span>{staff.role}</span>
                  </span>

                  <span className="inline-flex items-center gap-1 rounded-full bg-surface-deep/90 border border-border px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Staff Active</span>
                  </span>
                </div>

                {/* Character Body Centerpiece with 3D Pedestal */}
                <div className="relative flex flex-col items-center justify-center pt-4 pb-2 px-4 z-10 min-h-[290px]">
                  {/* Full Minecraft Body Character Render with Multi-API Fallback */}
                  <div className="relative z-10 transition-transform duration-300 group-hover:scale-105">
                    <MinecraftSkinImage
                      name={cleanName}
                      type="body"
                      customUrl={staff.avatar_url}
                      className="h-56 sm:h-64 drop-shadow-[0_12px_20px_rgba(0,0,0,0.6)]"
                      alt={`${cleanName}'s full Minecraft body skin`}
                    />
                  </div>

                  {/* 3D Glowing Minecraft Pedestal Platform */}
                  <div className="relative -mt-3 w-36 h-7 flex items-center justify-center">
                    <div
                      className={`w-32 h-5 rounded-[100%] ${theme.pedestal} blur-[2px] transition-all group-hover:scale-110`}
                    />
                    <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-t from-black/40 to-transparent rounded-full" />
                  </div>
                </div>

                {/* Staff Member Info & Bio */}
                <div className="relative p-5 pt-3 bg-surface-deep/70 border-t border-border/80 flex-1 flex flex-col justify-between z-10">
                  <div>
                    {/* IGN Name & Copy Button */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <h3 className="text-base sm:text-lg font-black text-foreground font-display truncate">
                        {cleanName}
                      </h3>

                      <button
                        type="button"
                        onClick={() => handleCopy(cleanName, 'Minecraft IGN')}
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2 py-1 text-[11px] font-bold text-muted-foreground hover:text-accent hover:border-accent transition-colors"
                        title="Copy Minecraft IGN"
                      >
                        {copiedIgn === cleanName ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-[10px] text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span className="text-[10px]">Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Role / Responsibility Description */}
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-3">
                      {staff.description ||
                        `Responsible for server management, community moderation, and network reliability on ${config.brand}.`}
                    </p>
                  </div>

                  {/* Bottom Quick Contact & Discord */}
                  <div className="space-y-2 pt-2 border-t border-border/50">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground font-medium flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span>Rank Hierarchy:</span>
                      </span>
                      <span className={`font-bold ${theme.accentText}`}>{theme.title}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground font-medium flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-indigo-400" />
                        <span>Discord:</span>
                      </span>
                      {staff.discord_username ? (
                        <span className="font-mono text-indigo-400 font-bold text-[11px]">
                          @{staff.discord_username.replace(/^@/, '')}
                        </span>
                      ) : staff.discord_id ? (
                        <span className="font-mono text-indigo-400 text-[10px]">
                          ID: {staff.discord_id.slice(0, 6)}...
                        </span>
                      ) : (
                        <span className="text-muted-foreground/70 text-[11px]">Direct Support</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleMessageOnDiscord(staff, e)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 hover:border-indigo-400/60 py-2 px-3 text-xs font-extrabold uppercase tracking-wide text-indigo-300 hover:text-white transition-all cursor-pointer shadow-sm group/btn"
                        title={
                          staff.discord_id
                            ? `Open ${staff.name}'s Discord Profile (ID: ${staff.discord_id})`
                            : staff.discord_username
                            ? `Message @${staff.discord_username.replace(/^@/, '')} on Discord`
                            : `Message ${staff.name} on Discord`
                        }
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-400 shrink-0 group-hover/btn:scale-110 transition-transform" />
                        <span className="truncate">Message on Discord</span>
                        <ExternalLink className="w-3 h-3 text-indigo-400/80 shrink-0" />
                      </button>

                      {(staff.discord_username || staff.discord_id) && (
                        <button
                          type="button"
                          onClick={() => {
                            const val = staff.discord_username
                              ? `@${staff.discord_username.replace(/^@/, '')}`
                              : staff.discord_id!;
                            navigator.clipboard.writeText(val);
                            success(`Copied Discord Tag/ID: ${val}`);
                            setCopiedDiscordTag(staff.id);
                            setTimeout(() => setCopiedDiscordTag(null), 2000);
                          }}
                          className="p-2 rounded-xl border border-border bg-surface hover:bg-surface-deep text-muted-foreground hover:text-indigo-400 transition-colors cursor-pointer"
                          title="Copy Discord Tag/ID"
                        >
                          {copiedDiscordTag === staff.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Staff Role Explanation & How to Contact Guide */}
        <section className="mt-16 rounded-3xl border border-border bg-surface-deep p-6 sm:p-8">
          <div className="flex items-center gap-3 border-b border-border pb-4 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight text-foreground font-display">
                WonderMC Staff Hierarchy &amp; Support Guide
              </h2>
              <p className="text-xs text-muted-foreground">
                Know who to reach out to for tickets, payment confirmations, in-game disputes, and bugs
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/20 text-amber-300 px-2 py-0.5 text-[11px] font-black uppercase">
                <Crown className="w-3.5 h-3.5" />
                <span>Owners</span>
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Network founders managing server operations, core game modes, host infrastructure, and business inquiries.
              </p>
            </div>

            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4 space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-sky-500/20 text-sky-300 px-2 py-0.5 text-[11px] font-black uppercase">
                <Shield className="w-3.5 h-3.5" />
                <span>Admins</span>
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Manages store orders, manual UPI &amp; UTR verifications, staff promotions, and high-priority support tickets.
              </p>
            </div>

            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-indigo-500/20 text-indigo-300 px-2 py-0.5 text-[11px] font-black uppercase">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Moderators</span>
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Maintains in-game chat civility, handles player reports, hacker bans, anticheat alerts, and rule enforcement.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-[11px] font-black uppercase">
                <Code className="w-3.5 h-3.5" />
                <span>Developers</span>
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Creates custom Minecraft plugins, optimizes lag performance, fixes bugs, and designs seasonal features.
              </p>
            </div>
          </div>
        </section>

        {/* Apply for Staff CTA */}
        <section className="mt-8 rounded-3xl border-2 border-accent/40 bg-gradient-to-r from-accent/15 via-surface-deep to-sky-500/10 p-6 sm:p-8 flex flex-wrap items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1.5 max-w-xl">
            <span className="rounded-md bg-accent px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-accent-foreground">
              Recruitment Open
            </span>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-foreground font-display">
              Want To Join The WonderMC Staff Team?
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              We are constantly seeking active and mature helpers, moderators, and builders. Join our Discord server to view requirements and apply when positions open!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={config.discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-xs font-black uppercase tracking-wider text-accent-foreground hover:opacity-90 transition-opacity shadow-lg shadow-accent/20"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Apply on Discord</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>
      </main>
    </div>
  );
};
