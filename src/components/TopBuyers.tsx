import React from 'react';
import { TopBuyer } from '../types';
import { formatINR } from '../data/storeData';
import { Trophy, Medal } from 'lucide-react';

interface TopBuyersProps {
  buyers: TopBuyer[];
}

export const TopBuyers: React.FC<TopBuyersProps> = ({ buyers }) => {
  return (
    <section className="mt-14 rounded-2xl border border-border bg-surface p-6 sm:p-7 shadow-panel">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-foreground font-display">
              Top WonderMC Donators
            </h2>
            <p className="text-xs text-muted-foreground">
              Biggest monthly supporters keeping play.wondermc.fun running!
            </p>
          </div>
        </div>

        <span className="rounded-full bg-surface-deep px-3 py-1 text-xs font-bold text-muted-foreground border border-border">
          This Month
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {buyers.map((buyer, index) => {
          const rank = buyer.rank || index + 1;
          const isFirst = rank === 1;
          const isSecond = rank === 2;
          const isThird = rank === 3;

          return (
            <div
              key={buyer.id}
              className={`flex items-center gap-3.5 p-3.5 rounded-xl border transition-all ${
                isFirst
                  ? 'border-gold/50 bg-gold/5 shadow-md shadow-gold/10'
                  : isSecond
                  ? 'border-silver/40 bg-surface-deep'
                  : isThird
                  ? 'border-bronze/40 bg-surface-deep'
                  : 'border-border bg-surface-deep/70'
              }`}
            >
              {/* Rank Medal Indicator */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-black text-xs font-display ${
                  isFirst
                    ? 'bg-gold text-lime-foreground shadow-sm'
                    : isSecond
                    ? 'bg-silver text-slate-900'
                    : isThird
                    ? 'bg-bronze text-white'
                    : 'bg-surface text-muted-foreground border border-border'
                }`}
              >
                {isFirst ? (
                  <Medal className="w-4 h-4" />
                ) : (
                  `#${rank}`
                )}
              </div>

              {/* Player Avatar */}
              <img
                src={`https://mc-heads.net/avatar/${buyer.username}/64`}
                alt={`${buyer.username}'s skin`}
                className="h-10 w-10 rounded-lg [image-rendering:pixelated] border border-border/70 shrink-0"
              />

              {/* Player Info */}
              <div className="flex-1 min-w-0">
                <span className="block text-sm font-extrabold text-foreground truncate">
                  {buyer.username}
                </span>
                <span className="text-[11px] font-bold text-muted-foreground">
                  Supporter
                </span>
              </div>

              {/* Amount Donated */}
              <div className="text-right shrink-0">
                <span
                  className={`text-sm font-black font-display ${
                    isFirst ? 'text-gold' : 'text-foreground'
                  }`}
                >
                  {formatINR(buyer.total_spent)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
