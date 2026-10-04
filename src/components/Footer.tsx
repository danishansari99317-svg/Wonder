import React from 'react';
import { useStoreConfig } from '../context/StoreConfigContext';
import { useToast } from '../context/ToastContext';
import { LegalDocType } from './LegalModal';
import { Copy, Check, MessageSquare, Instagram, Youtube, Send, MessageCircle, Lock } from 'lucide-react';

interface FooterProps {
  onOpenLegal: (type: LegalDocType) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal, onOpenAdmin }) => {
  const { config } = useStoreConfig();
  const { success, error } = useToast();
  const [copied, setCopied] = React.useState(false);

  const handleCopyIp = async () => {
    try {
      await navigator.clipboard.writeText(config.serverIp);
      setCopied(true);
      success(`Copied ${config.serverIp} to clipboard`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      error(`Server IP: ${config.serverIp}`);
    }
  };

  return (
    <footer className="relative z-10 border-t border-border bg-surface-deep/90 mt-20 pt-12 pb-8">
      <div className="mx-auto max-w-[1100px] px-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-border">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/wondermc-logo.png"
                alt="Wonder MC Logo"
                className="h-9 w-auto object-contain drop-shadow-[0_4px_12px_rgba(0,195,255,0.25)]"
              />
              <span className="text-xl font-black text-foreground font-display tracking-tight">
                {config.brand}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {config.tagline} — Join thousands of players fighting, trading, and competing on our high-performance Minecraft network.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyIp}
                className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-mono text-foreground hover:border-border-strong transition-all cursor-pointer"
              >
                <span>{config.serverIp}</span>
                {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
              </button>
            </div>
          </div>

          {/* Community & Discord */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-foreground font-display uppercase tracking-wider">
              Join Our Community
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Get in-game announcements, participate in rank giveaways, and connect with other players on our official Discord server.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={config.discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-xs font-black uppercase tracking-wider text-accent-foreground hover:opacity-90 transition-opacity"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Join Discord</span>
              </a>
              {config.whatsappUrl && (
                <a
                  href={config.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-emerald-500 transition-colors"
                  title="WhatsApp Support"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          </div>

          {/* Social Links & Support */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-foreground font-display uppercase tracking-wider">
              Follow &amp; Connect
            </h4>
            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href={config.discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-muted-foreground hover:text-foreground hover:border-accent hover:bg-accent/10 transition-all"
                aria-label="Discord"
                title="Discord Community"
              >
                <MessageSquare className="w-4 h-4" />
              </a>

              {config.instagramUrl && (
                <a
                  href={config.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-muted-foreground hover:text-foreground hover:border-rose hover:bg-rose/10 transition-all"
                  aria-label="Instagram"
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}

              {config.youtubeUrl && (
                <a
                  href={config.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-muted-foreground hover:text-foreground hover:border-destructive hover:bg-destructive/10 transition-all"
                  aria-label="YouTube"
                  title="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}

              {config.telegramUrl && (
                <a
                  href={config.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-muted-foreground hover:text-foreground hover:border-sky-400 hover:bg-sky-400/10 transition-all"
                  aria-label="Telegram"
                  title="Telegram"
                >
                  <Send className="w-4 h-4" />
                </a>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground pt-1">
              Not an official Minecraft product. Not approved by or associated with Mojang or Microsoft.
            </p>
          </div>
        </div>

        {/* Bottom copyright & policies */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 text-xs text-muted-foreground">
          <div>{config.copyright}</div>

          <div className="flex flex-wrap items-center gap-4 font-semibold">
            <button
              type="button"
              onClick={() => onOpenLegal('terms')}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Terms &amp; Conditions
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onOpenLegal('privacy')}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onOpenLegal('refund')}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Refund Policy
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={onOpenAdmin}
              className="flex items-center gap-1 hover:text-accent transition-colors cursor-pointer"
            >
              <Lock className="w-3 h-3" />
              <span>Admin Login</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
