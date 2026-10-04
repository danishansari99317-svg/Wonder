import React, { useEffect, useState } from 'react';

export const GamingParticles: React.FC = () => {
  const [cubes, setCubes] = useState<{ left: string; s: string; d: string; delay: string }[]>([]);

  useEffect(() => {
    // Generate static values on mount to prevent server-side mismatches or re-render layout thrashing
    const list = Array.from({ length: 18 }).map(() => ({
      left: Math.random() * 100 + "%",
      s: 14 + Math.round(Math.random() * 26) + "px",
      d: 14 + Math.random() * 16 + "s",
      delay: -Math.random() * 30 + "s",
    }));
    setCubes(list);
  }, []);

  return (
    <div className="gaming-particles" aria-hidden="true">
      {cubes.map((cube, index) => (
        <span
          key={index}
          style={{
            left: cube.left,
            '--s': cube.s,
            '--d': cube.d,
            '--delay': cube.delay,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};
