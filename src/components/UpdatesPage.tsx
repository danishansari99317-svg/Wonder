import React, { useState, useEffect } from 'react';
import { ServerUpdate, UpdateTag } from '../types';
import { useStoreConfig } from '../context/StoreConfigContext';
import { useToast } from '../context/ToastContext';
import { formatISTDateTime, formatISTRelative } from '../utils/dateUtils';
import {
  Bell,
  Pin,
  Clock,
  User,
  Search,
  Share2,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Calendar,
  Tag as TagIcon,
  Maximize2,
  X,
  MessageSquare,
  ThumbsUp,
  Flame,
  Radio,
  Layers,
} from 'lucide-react';

interface UpdatesPageProps {
  updates: ServerUpdate[];
  onBackToStore: () => void;
}

const TAG_STYLES: Record<UpdateTag, { bg: string; text: string; border: string; icon: string }> = {
  Announcement: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    icon: '📢',
  },
  Update: {
    bg: 'bg-sky-500/10',
    text: 'text-sky-400',
    border: 'border-sky-500/30',
    icon: '⚡',
  },
  Event: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    icon: '🎁',
  },
  Maintenance: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    icon: '🔧',
  },
  'Patch Notes': {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    icon: '📝',
  },
};

export const UpdatesPage: React.FC<UpdatesPageProps> = ({ updates, onBackToStore }) => {
  const { config } = useStoreConfig();
  const { success } = useToast();
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeImageModal, setActiveImageModal] = useState<string | null>(null);
  const [reactions, setReactions] = useState<Record<string, { likes: number; fire: number; reacted?: string }>>({});
  const [currentISTTime, setCurrentISTTime] = useState<string>('');
  const [highlightedUpdateId, setHighlightedUpdateId] = useState<string | null>(null);

  // Live IST Clock & Direct Update Link Scroll Detection
  useEffect(() => {
    const updateClock = () => {
      setCurrentISTTime(formatISTDateTime(new Date()));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);

    // Auto scroll & highlight if update URL query parameter is present
    try {
      const params = new URLSearchParams(window.location.search);
      const updateId = params.get('update');
      if (updateId) {
        setHighlightedUpdateId(updateId);
        setTimeout(() => {
          const el = document.getElementById(`update-card-${updateId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
      }
    } catch {
      // ignore
    }

    return () => clearInterval(interval);
  }, []);

  const handleShare = (upd: ServerUpdate) => {
    // Generate shareable direct link with update ID query param
    const shareUrl = new URL(window.location.href);
    shareUrl.searchParams.set('page', 'updates');
    shareUrl.searchParams.set('update', upd.id);
    const fullLink = shareUrl.toString();

    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(fullLink);
        success('Direct update link copied to clipboard!');
      } else {
        prompt('Copy share link:', fullLink);
      }
    } catch {
      prompt('Copy share link:', fullLink);
    }
  };

  const handleReact = (id: string, type: 'like' | 'fire') => {
    setReactions((prev) => {
      const current = prev[id] || { likes: Math.floor(Math.random() * 8) + 3, fire: Math.floor(Math.random() * 5) + 2 };
      if (current.reacted === type) return prev;
      return {
        ...prev,
        [id]: {
          likes: type === 'like' ? current.likes + 1 : current.likes,
          fire: type === 'fire' ? current.fire + 1 : current.fire,
          reacted: type,
        },
      };
    });
  };

  const filteredUpdates = updates.filter((u) => {
    const matchesTag = selectedTag === 'All' || u.tag === selectedTag;
    const matchesSearch =
      u.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  const pinnedUpdates = filteredUpdates.filter((u) => u.pinned);
  const regularUpdates = filteredUpdates.filter((u) => !u.pinned);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Lightbox Image Preview Modal */}
      {activeImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn"
          onClick={() => setActiveImageModal(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/20 bg-surface-deep shadow-2xl">
            <button
              onClick={() => setActiveImageModal(null)}
              className="absolute top-3 right-3 z-10 rounded-full bg-black/70 p-2 text-white hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={activeImageModal}
              alt="Update Attachment"
              className="max-h-[85vh] w-auto object-contain mx-auto"
            />
          </div>
        </div>
      )}

      {/* Hero Header Banner */}
      <div className="relative overflow-hidden border-b border-border bg-gradient-to-b from-sky-950/40 via-surface-deep to-background pt-10 pb-12 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400 bg-sky-950 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-sky-400 mb-3 shadow-md">
                <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                <span>{config.brand} Official Newsroom</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-wide text-foreground font-display flex items-center gap-3">
                Server Updates &amp; Announcements
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Stay informed with real-time server patches, events, shop releases, and community news direct from staff team.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              {/* IST Live Clock Badge */}
              <div className="rounded-2xl border border-sky-500/30 bg-surface-deep/90 p-3 text-center sm:text-right shadow-md">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center justify-center sm:justify-end gap-1">
                  <Clock className="w-3 h-3 text-sky-400" />
                  <span>Current IST Time</span>
                </div>
                <div className="text-xs font-mono font-black text-sky-300 mt-0.5">
                  {currentISTTime || 'Loading IST...'}
                </div>
              </div>
            </div>
          </div>

          {/* Tag Filter Bar & Search */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-6 border-t border-border/60">
            {/* Tag Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {['All', 'Announcement', 'Update', 'Event', 'Maintenance', 'Patch Notes'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer border ${
                    selectedTag === tag
                      ? 'border-sky-500 bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                      : 'border-border bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-deep'
                  }`}
                >
                  {tag === 'All' ? '🔥 All Posts' : tag}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search updates..."
                className="w-full rounded-xl border border-border bg-surface pl-9 pr-3.5 py-2 text-xs text-foreground outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Feed */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 pt-8 space-y-6">
        {/* Pinned Updates Section */}
        {pinnedUpdates.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
              <Pin className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>Pinned Announcements</span>
            </div>

            {pinnedUpdates.map((upd) => (
              <UpdateCard
                key={upd.id}
                upd={upd}
                onShare={() => handleShare(upd)}
                onOpenImage={(url) => setActiveImageModal(url)}
                reactions={reactions[upd.id] || { likes: 12, fire: 8 }}
                onReact={(type) => handleReact(upd.id, type)}
                isPinned
                isHighlighted={highlightedUpdateId === upd.id}
              />
            ))}
          </div>
        )}

        {/* Regular Updates Timeline */}
        <div className="space-y-4 pt-2">
          {pinnedUpdates.length > 0 && regularUpdates.length > 0 && (
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
              <Layers className="w-4 h-4 text-accent" />
              <span>Recent Server Updates ({regularUpdates.length})</span>
            </div>
          )}

          {filteredUpdates.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-12 text-center">
              <Bell className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <h3 className="text-base font-bold text-foreground">No updates found</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Try clearing your search query or selecting a different category tag.
              </p>
            </div>
          ) : (
            regularUpdates.map((upd) => (
              <UpdateCard
                key={upd.id}
                upd={upd}
                onShare={() => handleShare(upd)}
                onOpenImage={(url) => setActiveImageModal(url)}
                reactions={reactions[upd.id] || { likes: 5, fire: 3 }}
                onReact={(type) => handleReact(upd.id, type)}
                isHighlighted={highlightedUpdateId === upd.id}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

interface UpdateCardProps {
  upd: ServerUpdate;
  onShare: () => void;
  onOpenImage: (url: string) => void;
  reactions: { likes: number; fire: number; reacted?: string };
  onReact: (type: 'like' | 'fire') => void;
  isPinned?: boolean;
  isHighlighted?: boolean;
}

const UpdateCard: React.FC<UpdateCardProps> = ({
  upd,
  onShare,
  onOpenImage,
  reactions,
  onReact,
  isPinned,
  isHighlighted,
}) => {
  const tagStyle = TAG_STYLES[upd.tag] || TAG_STYLES.Announcement;
  const istTime = formatISTRelative(upd.createdAt);
  const istExact = formatISTDateTime(upd.createdAt);

  // Consolidate all images (multiple images support)
  const allImages: string[] = [];
  if (upd.imageUrls && Array.isArray(upd.imageUrls) && upd.imageUrls.length > 0) {
    upd.imageUrls.forEach((u) => {
      if (u.trim()) allImages.push(u.trim());
    });
  } else if (upd.imageUrl && upd.imageUrl.trim()) {
    allImages.push(upd.imageUrl.trim());
  }

  return (
    <div
      id={`update-card-${upd.id}`}
      className={`group relative rounded-2xl border transition-all duration-300 ${
        isHighlighted
          ? 'ring-2 ring-sky-500 border-sky-400 bg-sky-500/10 shadow-xl shadow-sky-500/20'
          : isPinned
          ? 'border-amber-500/40 bg-gradient-to-b from-amber-500/10 via-surface-deep to-surface shadow-lg shadow-amber-500/10'
          : 'border-border bg-surface-deep hover:border-accent/40 hover:shadow-md'
      } p-5 sm:p-6`}
    >
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3 mb-4">
        <div className="flex items-center gap-2">
          {isPinned && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-black uppercase text-amber-300 border border-amber-500/40">
              <Pin className="w-3 h-3 text-amber-400" />
              Pinned
            </span>
          )}
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-[11px] font-black uppercase border ${tagStyle.bg} ${tagStyle.text} ${tagStyle.border}`}
          >
            <span>{tagStyle.icon}</span>
            <span>{upd.tag}</span>
          </span>
        </div>

        {/* IST Timestamp Display */}
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-sky-700 bg-sky-500/10 border border-sky-500/20 px-3 py-1 rounded-xl">
          <Clock className="w-3.5 h-3.5 text-sky-600" />
          <span title={`Exact IST: ${istExact}`}>{istTime}</span>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-xl sm:text-2xl font-extrabold text-foreground font-sans tracking-tight mb-2">
        {upd.title}
      </h2>

      {/* Author & Sub-meta */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
        <div className="flex items-center gap-1.5 font-bold text-foreground">
          <img
            src={`https://mc-heads.net/avatar/${encodeURIComponent(upd.author)}/32`}
            alt={upd.author}
            className="w-5 h-5 rounded [image-rendering:pixelated] border border-border"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://mc-heads.net/avatar/MHF_Steve/32';
            }}
          />
          <span>Posted by {upd.author}</span>
        </div>
        <span>•</span>
        <span className="text-[11px] font-mono text-muted-foreground" title="Indian Standard Time">
          IST Time Verified
        </span>
      </div>

      {/* Main Content Body */}
      <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap font-sans mb-5">
        {upd.content}
      </div>

      {/* Multiple Image Attachments (Stacked Vertically) */}
      {allImages.length > 0 && (
        <div className="mb-5 space-y-4">
          {allImages.map((imgUrl, idx) => (
            <div
              key={idx}
              className="relative overflow-hidden rounded-xl border border-border bg-black/40 group/img max-h-[500px]"
            >
              <img
                src={imgUrl}
                alt={`${upd.title} attachment ${idx + 1}`}
                className="w-full h-full object-contain max-h-[500px] mx-auto transition-transform duration-300 group-hover/img:scale-[1.01]"
              />
              <button
                type="button"
                onClick={() => onOpenImage(imgUrl)}
                className="absolute bottom-3 right-3 rounded-xl bg-black/80 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity cursor-pointer shadow-md border border-white/20"
              >
                <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Expand Image {allImages.length > 1 ? `#${idx + 1}` : ''}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Footer Actions & Reactions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onReact('like')}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-bold transition-all ${
              reactions.reacted === 'like'
                ? 'border-accent bg-accent/20 text-accent'
                : 'border-border bg-surface text-muted-foreground hover:text-foreground'
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{reactions.likes}</span>
          </button>

          <button
            type="button"
            onClick={() => onReact('fire')}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-bold transition-all ${
              reactions.reacted === 'fire'
                ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                : 'border-border bg-surface text-muted-foreground hover:text-foreground'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>{reactions.fire}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onShare}
          className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:border-accent/50 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5 text-accent" />
          <span>Share Update</span>
        </button>
      </div>
    </div>
  );
};
