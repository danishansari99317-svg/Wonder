import React, { useEffect, useState } from 'react';

interface RisingParticleItem {
  left: string;
  size: number;
  duration: number;
  delay: number;
  icon: string;
}

interface BatItem {
  top: string;
  size: number;
  duration: number;
  delay: number;
}

const TREAT_ICONS = ['🎃', '🎃', '🎃', '👻', '🍬', '💀', '🦇'];

export const GamingParticles: React.FC = () => {
  const [particles, setParticles] = useState<RisingParticleItem[]>([]);
  const [bats, setBats] = useState<BatItem[]>([]);

  useEffect(() => {
    // Generate static values once on mount to avoid layout thrashing
    const risingList: RisingParticleItem[] = Array.from({ length: 16 }).map((_, i) => ({
      left: (Math.random() * 96 + 2).toFixed(1) + '%',
      size: Math.floor(Math.random() * 20) + 18, // 18px to 38px
      duration: Math.floor(Math.random() * 12) + 16, // 16s to 28s
      delay: -(Math.random() * 24),
      icon: TREAT_ICONS[i % TREAT_ICONS.length],
    }));
    setParticles(risingList);

    const batList: BatItem[] = Array.from({ length: 6 }).map(() => ({
      top: (Math.random() * 60 + 5).toFixed(1) + '%',
      size: Math.floor(Math.random() * 24) + 26, // 26px to 50px
      duration: Math.floor(Math.random() * 10) + 16, // 16s to 26s
      delay: -(Math.random() * 24),
    }));
    setBats(batList);
  }, []);

  return (
    <div className="spooky-bg fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Rare Lightning Flash */}
      <div className="spooky-flash absolute inset-0 bg-[#dcc8ff] pointer-events-none" />

      {/* Creeping Fog Layers */}
      <div className="spooky-fog absolute -left-1/2 -bottom-[6vh] w-[200%] h-[32vh] pointer-events-none" />
      <div className="spooky-fog spooky-fog-two absolute -left-1/2 -bottom-[12vh] w-[200%] h-[32vh] pointer-events-none opacity-80" />

      {/* Hanging Spiders on Top Left & Right */}
      <div className="spooky-spider left-[7%] pointer-events-none" style={{ '--spider-h': '140px' } as React.CSSProperties} />
      <div className="spooky-spider left-[92%] pointer-events-none" style={{ '--spider-h': '95px', animationDelay: '-2.5s' } as React.CSSProperties} />

      {/* Flying Bats */}
      {bats.map((bat, idx) => (
        <div
          key={`bat-${idx}`}
          className="spooky-bat"
          style={{
            top: bat.top,
            width: `${bat.size}px`,
            height: `${bat.size * 0.5}px`,
            animationDuration: `${bat.duration}s`,
            animationDelay: `${bat.delay}s`,
          }}
        >
          <svg viewBox="0 0 64 32" className="w-full h-full fill-[#050008] drop-shadow-[0_0_6px_rgba(139,61,255,0.7)] animate-[flap_0.35s_steps(2)_infinite]">
            <path d="M32 10c2-4 4-6 4-6l1 5c3-1 6 0 8 2 4-5 11-7 19-5-5 3-7 8-7 14-4-3-9-3-12 0-2-3-5-4-8-3-2 0-4 3-5 6-1-3-3-6-5-6-3-1-6 0-8 3-3-3-8-3-12 0 0-6-2-11-7-14 8-2 15 0 19 5 2-2 5-3 8-2l1-5s2 2 4 6z" />
          </svg>
        </div>
      ))}

      {/* Rising Pumpkins, Candies, Skulls, Ghosts */}
      {particles.map((p, idx) => (
        <span
          key={`particle-${idx}`}
          className="spooky-rising-treat"
          style={{
            left: p.left,
            fontSize: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.icon}
        </span>
      ))}
    </div>
  );
};
