import React from 'react';
import { MinecraftEdition } from '../context/CartContext';

interface EditionSelectorProps {
  edition: MinecraftEdition;
  onChange: (newEdition: MinecraftEdition) => void;
  size?: 'sm' | 'md';
  className?: string;
  showHelper?: boolean;
}

export const EditionSelector: React.FC<EditionSelectorProps> = ({
  edition,
  onChange,
  size = 'md',
  className = '',
  showHelper = false,
}) => {
  const isSm = size === 'sm';

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div
        role="group"
        aria-label="Select Minecraft Edition"
        className="inline-flex items-center p-1 rounded-xl bg-surface-deep/90 border border-border/80 shadow-inner"
      >
        {/* Java Edition Button */}
        <button
          type="button"
          onClick={() => onChange('java')}
          className={`flex items-center gap-1.5 rounded-lg font-black transition-all cursor-pointer ${
            isSm ? 'px-2.5 py-1 text-[11px]' : 'px-3.5 py-1.5 text-xs'
          } ${
            edition === 'java'
              ? 'bg-accent text-accent-foreground shadow-sm scale-100'
              : 'text-muted-foreground hover:text-foreground hover:bg-surface/60 opacity-80'
          }`}
        >
          <span className="text-sm">☕</span>
          <span>Java Edition</span>
        </button>

        {/* Bedrock Edition Button */}
        <button
          type="button"
          onClick={() => onChange('bedrock')}
          className={`flex items-center gap-1.5 rounded-lg font-black transition-all cursor-pointer ${
            isSm ? 'px-2.5 py-1 text-[11px]' : 'px-3.5 py-1.5 text-xs'
          } ${
            edition === 'bedrock'
              ? 'bg-emerald-500 text-white shadow-sm scale-100 ring-1 ring-emerald-400/50'
              : 'text-muted-foreground hover:text-foreground hover:bg-surface/60 opacity-80'
          }`}
        >
          <span className="text-sm">📱</span>
          <span>Bedrock/PE</span>
        </button>
      </div>

      {showHelper && (
        <p className="text-[11px] leading-tight flex items-center gap-1 font-medium">
          {edition === 'bedrock' ? (
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="font-bold underline decoration-emerald-500/50">Bedrock/PE Mode:</span>
              <span>Prefix <strong>'.'</strong> automatically added to your name for GeyserMC server delivery.</span>
            </span>
          ) : (
            <span className="text-muted-foreground">
              <strong className="text-foreground">Java Mode:</strong> Standard PC Minecraft IGN (without '.' prefix).
            </span>
          )}
        </p>
      )}
    </div>
  );
};
