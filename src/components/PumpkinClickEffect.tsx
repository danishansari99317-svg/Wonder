import React, { useEffect, useState } from 'react';

interface ClickExplosion {
  id: number;
  x: number;
  y: number;
  particles: {
    dx: number;
    dy: number;
    rotate: number;
    size: number;
  }[];
}

export const PumpkinClickEffect: React.FC = () => {
  const [explosions, setExplosions] = useState<ClickExplosion[]>([]);

  useEffect(() => {
    let nextId = 0;

    const handleClick = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;

      const numParticles = 5;
      const particles = Array.from({ length: numParticles }).map(() => {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 45 + 20;
        return {
          dx: Math.cos(angle) * speed,
          dy: Math.sin(angle) * speed - 15,
          rotate: Math.random() * 360,
          size: Math.floor(Math.random() * 10) + 16,
        };
      });

      const newExplosion: ClickExplosion = {
        id: nextId++,
        x,
        y,
        particles,
      };

      setExplosions((prev) => [...prev.slice(-15), newExplosion]);

      setTimeout(() => {
        setExplosions((prev) => prev.filter((item) => item.id !== newExplosion.id));
      }, 650);
    };

    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <>
      {/* Pumpkin Blast / Sparkle Effects */}
      <div className="fixed inset-0 pointer-events-none z-[999999] overflow-hidden">
        {explosions.map((exp) => (
          <div
            key={exp.id}
            className="absolute left-0 top-0 pointer-events-none"
            style={{ transform: `translate(${exp.x}px, ${exp.y}px)` }}
          >
            <span
              className="absolute -translate-x-1/2 -translate-y-1/2 select-none animate-[pumpkinBlast_0.6s_ease-out_forwards]"
              style={{ fontSize: '24px' }}
            >
              🎃
            </span>

            {exp.particles.map((p, idx) => (
              <span
                key={idx}
                className="absolute -translate-x-1/2 -translate-y-1/2 select-none animate-[particleFly_0.6s_ease-out_forwards]"
                style={
                  {
                    '--dx': `${p.dx}px`,
                    '--dy': `${p.dy}px`,
                    fontSize: `${p.size}px`,
                    transform: `rotate(${p.rotate}deg)`,
                  } as React.CSSProperties
                }
              >
                {idx % 2 === 0 ? '✨' : '🍬'}
              </span>
            ))}
          </div>
        ))}
      </div>
    </>
  );
};
