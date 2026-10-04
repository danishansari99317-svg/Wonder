import React from 'react';
import { VoteLink } from '../types';
import { useStoreConfig } from '../context/StoreConfigContext';
import { useToast } from '../context/ToastContext';
import { X, ExternalLink, Gift, CheckCircle, Vote as VoteIcon } from 'lucide-react';

interface VoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  voteLinks?: VoteLink[];
}

export const VoteModal: React.FC<VoteModalProps> = ({ isOpen, onClose, voteLinks = [] }) => {
  const { config } = useStoreConfig();
  const { success } = useToast();

  if (!isOpen) return null;

  const displayLinks = voteLinks;

  const handleClaim = () => {
    success(`Use /vote claim in-game on ${config.serverIp} to receive your vote keys!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl sm:p-7 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-xl border border-border bg-surface-deep p-2 text-muted-foreground hover:text-foreground hover:border-border-strong transition-colors cursor-pointer"
          aria-label="Close vote modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-border pb-4 mb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose/15 text-rose">
            <VoteIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-foreground font-display">
              Vote for {config.brand}
            </h2>
            <p className="text-xs text-muted-foreground">
              Vote on server lists daily to earn free Crate Keys &amp; In-Game Coins!
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface-deep p-3.5 mb-5 flex items-center gap-3">
          <Gift className="w-5 h-5 text-accent shrink-0" />
          <div className="text-xs text-muted-foreground">
            Type <strong className="font-mono text-accent">/vote claim</strong> after voting on any site to receive your rewards instantly.
          </div>
        </div>

        <div className="space-y-2.5 mb-6">
          {displayLinks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-surface-deep/40">
              <VoteIcon className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-foreground">No Vote Sites Configured</h3>
              <p className="text-xs text-muted-foreground mt-1">
                There are currently no active voting links. Please check back later!
              </p>
            </div>
          ) : (
            displayLinks.map((link: VoteLink, index: number) => (
              <div
                key={link.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-surface-deep/70 hover:border-border-strong transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-surface text-xs font-bold text-muted-foreground border border-border">
                    {index + 1}
                  </span>
                  <div>
                    <span className="block text-xs font-black text-foreground">{link.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{link.host}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg bg-rose px-3 py-1.5 text-xs font-extrabold uppercase text-rose-foreground hover:opacity-90 transition-opacity"
                  >
                    <span>Vote</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        {displayLinks.length > 0 && (
          <button
            type="button"
            onClick={handleClaim}
            className="w-full rounded-xl bg-accent py-2.5 text-xs font-black uppercase tracking-wider text-accent-foreground hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>How to Claim In-Game</span>
          </button>
        )}
      </div>
    </div>
  );
};
