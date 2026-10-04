import React, { useState, useEffect } from 'react';

interface MinecraftSkinImageProps {
  name: string;
  type?: 'body' | 'avatar' | 'head';
  customUrl?: string;
  className?: string;
  alt?: string;
}

export const MinecraftSkinImage: React.FC<MinecraftSkinImageProps> = ({
  name,
  type = 'body',
  customUrl,
  className = '',
  alt,
}) => {
  const cleanName = (name || 'Steve').trim();
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFailedAll, setHasFailedAll] = useState(false);

  // Generate clean, highly reliable fallback sources list
  const getSources = (): string[] => {
    const sources: string[] = [];
    if (customUrl && customUrl.trim()) {
      sources.push(customUrl.trim());
    }

    const encoded = encodeURIComponent(cleanName);

    if (type === 'body') {
      sources.push(`https://mc-heads.net/body/${encoded}/right`);
      sources.push(`https://minotar.net/armor/body/${encoded}/300.png`);
      sources.push(`https://minotar.net/body/${encoded}/300.png`);
      sources.push(`https://mc-heads.net/player/${encoded}`);
      sources.push(`https://mc-heads.net/body/Steve/right`);
      sources.push(`https://minotar.net/armor/body/Steve/300.png`);
    } else if (type === 'head') {
      sources.push(`https://mc-heads.net/head/${encoded}/128`);
      sources.push(`https://minotar.net/cube/${encoded}/128.png`);
      sources.push(`https://minotar.net/helm/${encoded}/128.png`);
      sources.push(`https://mc-heads.net/head/Steve/128`);
    } else {
      // avatar (2D face)
      sources.push(`https://mc-heads.net/avatar/${encoded}/128`);
      sources.push(`https://minotar.net/avatar/${encoded}/128.png`);
      sources.push(`https://mc-heads.net/avatar/Steve/128`);
    }
    return sources;
  };

  const sources = getSources();
  const currentSrc = sources[fallbackIndex] || sources[sources.length - 1];

  useEffect(() => {
    setFallbackIndex(0);
    setIsLoading(true);
    setHasFailedAll(false);
  }, [name, type, customUrl]);

  // Safety timer to prevent perpetual loading state if image hangs
  useEffect(() => {
    if (!isLoading) return;
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, [isLoading, fallbackIndex]);

  const handleError = () => {
    if (fallbackIndex < sources.length - 1) {
      setFallbackIndex((prev) => prev + 1);
    } else {
      setIsLoading(false);
      setHasFailedAll(true);
    }
  };

  return (
    <div className={`relative inline-block overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-surface-deep/40 animate-pulse rounded-lg flex items-center justify-center z-10" />
      )}

      {hasFailedAll ? (
        /* Backup SVG Minecraft Steve/Character Render if all CDN skin servers fail */
        <div className="w-full h-full flex flex-col items-center justify-center bg-surface-deep/80 rounded-xl border border-amber-500/20 p-2 text-center">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500/30 to-accent/30 border border-amber-400/40 flex items-center justify-center font-mono font-black text-xl text-amber-300 shadow-lg">
            {cleanName.slice(0, 2).toUpperCase()}
          </div>
          <span className="text-[10px] font-bold text-muted-foreground mt-1.5 truncate max-w-full">
            {cleanName}
          </span>
        </div>
      ) : (
        <img
          src={currentSrc}
          alt={alt || `${cleanName}'s Minecraft skin`}
          onLoad={() => setIsLoading(false)}
          onError={handleError}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          className={`w-full h-full object-contain [image-rendering:pixelated] transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
        />
      )}
    </div>
  );
};
