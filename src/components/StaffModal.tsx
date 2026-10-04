import React from 'react';
import { StaffMember } from '../types';
import { INITIAL_STAFF } from '../data/storeData';
import { useStoreConfig } from '../context/StoreConfigContext';
import { useToast } from '../context/ToastContext';
import { MinecraftSkinImage } from './MinecraftSkinImage';
import { sortStaffByHierarchy } from '../utils/staffHierarchy';
import { getStaffDiscordUrl } from '../utils/discordUtils';
import { X, Shield, Crown, UserCheck, Code, HeartHandshake, ShieldAlert, MessageSquare, ExternalLink } from 'lucide-react';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffList?: StaffMember[];
  onOpenFullPage?: () => void;
}

export const StaffModal: React.FC<StaffModalProps> = ({
  isOpen,
  onClose,
  staffList = INITIAL_STAFF,
  onOpenFullPage,
}) => {
  const { config } = useStoreConfig();
  const { success } = useToast();
  if (!isOpen) return null;

  const handleDiscordClick = (staff: StaffMember, e: React.MouseEvent) => {
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

  const getRoleBadge = (role: StaffMember['role']) => {
    switch (role) {
      case 'Owner':
        return {
          classes: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-sm',
          emoji: '👑',
          border: 'border-amber-500/40 bg-amber-500/5',
        };
      case 'Co-Owner':
        return {
          classes: 'bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 font-black shadow-sm',
          emoji: '🔱',
          border: 'border-yellow-500/40 bg-yellow-500/5',
        };
      case 'Manager':
        return {
          classes: 'bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white font-black shadow-sm',
          emoji: '💼',
          border: 'border-purple-500/40 bg-purple-500/5',
        };
      case 'Senior Admin':
        return {
          classes: 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-black shadow-sm',
          emoji: '💎',
          border: 'border-cyan-500/40 bg-cyan-500/5',
        };
      case 'Admin':
        return {
          classes: 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black shadow-sm',
          emoji: '🛡️',
          border: 'border-sky-500/40 bg-sky-500/5',
        };
      case 'Junior Admin':
        return {
          classes: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-black shadow-sm',
          emoji: '🔰',
          border: 'border-blue-500/40 bg-blue-500/5',
        };
      case 'Developer':
        return {
          classes: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-sm',
          emoji: '💻',
          border: 'border-emerald-500/40 bg-emerald-500/5',
        };
      case 'Senior Moderator':
        return {
          classes: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black shadow-sm',
          emoji: '⚔️',
          border: 'border-indigo-500/40 bg-indigo-500/5',
        };
      case 'Moderator':
        return {
          classes: 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-black shadow-sm',
          emoji: '🔨',
          border: 'border-violet-500/40 bg-violet-500/5',
        };
      case 'Junior Moderator':
        return {
          classes: 'bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black shadow-sm',
          emoji: '🗡️',
          border: 'border-rose-500/40 bg-rose-500/5',
        };
      case 'Helper':
        return {
          classes: 'bg-gradient-to-r from-amber-400 to-pink-500 text-slate-950 font-black shadow-sm',
          emoji: '🤝',
          border: 'border-amber-400/40 bg-amber-400/5',
        };
      case 'Staff':
      default:
        return {
          classes: 'bg-gradient-to-r from-slate-600 to-slate-800 text-white font-black shadow-sm',
          emoji: '✨',
          border: 'border-slate-500/40 bg-slate-500/5',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-surface p-6 shadow-2xl sm:p-7 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-xl border border-border bg-surface-deep p-2 text-muted-foreground hover:text-foreground hover:border-border-strong transition-colors"
          aria-label="Close staff modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-between border-b border-border pb-4 mb-5 pr-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-2/15 text-accent-2">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-foreground font-display">
                {config.brand} Staff Team
              </h2>
              <p className="text-xs text-muted-foreground">
                Meet the leadership and moderation team behind {config.brand}
              </p>
            </div>
          </div>

          {onOpenFullPage && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenFullPage();
              }}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-accent px-3 py-1.5 text-xs font-black uppercase tracking-wide text-accent-foreground hover:opacity-90 transition-opacity"
            >
              <span>Full Page View →</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 max-h-[60vh] overflow-y-auto pr-1">
          {sortStaffByHierarchy(staffList).map((staff: StaffMember) => {
            const badge = getRoleBadge(staff.role);

            return (
              <div
                key={staff.id}
                className={`flex items-center gap-3.5 p-3.5 rounded-xl border transition-all ${badge.border}`}
              >
                {/* Full Minecraft Body Render with fallbacks */}
                <div className="h-20 w-12 flex items-center justify-center shrink-0">
                  <MinecraftSkinImage
                    name={staff.name}
                    type="body"
                    customUrl={staff.avatar_url}
                    className="h-20 object-contain drop-shadow-md"
                    alt={`${staff.name}'s Minecraft skin`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-black text-foreground font-display truncate">
                      {staff.name}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider shrink-0 ${badge.classes}`}
                    >
                      <span>{badge.emoji}</span>
                      <span>{staff.role}</span>
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-2">
                    {staff.description || `${staff.role} on ${config.brand}`}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleDiscordClick(staff, e)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 text-[11px] font-bold text-indigo-300 hover:text-white transition-colors cursor-pointer"
                      title={
                        staff.discord_id
                          ? `Open ${staff.name}'s Discord Profile (ID: ${staff.discord_id})`
                          : staff.discord_username
                          ? `Message @${staff.discord_username.replace(/^@/, '')} on Discord`
                          : `Message ${staff.name} on Discord`
                      }
                    >
                      <MessageSquare className="w-3 h-3 text-indigo-400 shrink-0" />
                      <span>Message on Discord</span>
                      <ExternalLink className="w-2.5 h-2.5 text-indigo-400/80 shrink-0" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface-deep p-3.5 text-xs text-muted-foreground">
          <span>
            Want to apply for staff? Join our Discord at{' '}
            <a
              href={config.discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline font-semibold"
            >
              {config.discordUrl.replace('https://', '')}
            </a>
          </span>

          {onOpenFullPage && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenFullPage();
              }}
              className="font-bold text-accent hover:underline sm:hidden"
            >
              Open Full Staff Directory →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
