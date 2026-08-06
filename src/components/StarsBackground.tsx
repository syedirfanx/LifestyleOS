import React, { useMemo } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delayClass: string;
  colorClass: string;
}

export const StarsBackground: React.FC = () => {
  const stars = useMemo<Star[]>(() => {
    const starList: Star[] = [];
    // Generate a fixed set of beautiful, slowly breathing stars
    const delays = [
      'animate-blink-slow-1',
      'animate-blink-slow-2',
      'animate-blink-slow-3'
    ];
    const colors = [
      'bg-white',
      'bg-blue-300',
      'bg-indigo-200',
      'bg-amber-100'
    ];

    for (let i = 0; i < 75; i++) {
      // Use deterministic pseudo-random distribution or simple random coordinates
      // Since it's inside useMemo, it will only generate once per mount
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      // Stars of size 1px to 3px
      const size = Math.random() < 0.75 ? 1 : Math.random() < 0.9 ? 2 : 3;
      const delayClass = delays[i % delays.length];
      const colorClass = colors[i % colors.length];

      starList.push({
        id: i,
        x,
        y,
        size,
        delayClass,
        colorClass
      });
    }
    return starList;
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {stars.map((star) => (
        <div
          key={star.id}
          className={`absolute rounded-full ${star.colorClass} ${star.delayClass} transition-opacity duration-1000`}
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            boxShadow: star.size > 1 ? `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.4)` : 'none'
          }}
        />
      ))}
    </div>
  );
};
