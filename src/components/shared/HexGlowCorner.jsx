import React from 'react';

const S = 44;
const W = S * 2;
const H = Math.sqrt(3) * S;

// Flat-top hex points as plain string
const HEX_POINTS = (() => {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i);
    pts.push(`${S + Math.cos(angle) * (S - 1)},${S + Math.sin(angle) * (S - 1)}`);
  }
  return pts.join(' ');
})();

const COLS = 8;
const ROWS = 7;

function buildGrid(cols, rows) {
  const hexes = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * (W * 0.75);
      const y = row * H + (col % 2 === 1 ? H / 2 : 0);
      // distance from top-right corner for glow intensity
      const distFromGlow = Math.sqrt(Math.pow(col - (cols - 1), 2) + Math.pow(row, 2));
      hexes.push({ x, y, distFromGlow, id: `${row}-${col}` });
    }
  }
  return hexes;
}

const HEXES = buildGrid(COLS, ROWS);
const SVG_W = COLS * W * 0.75 + W * 0.25;
const SVG_H = ROWS * H + H / 2;
const MAX_DIST = Math.sqrt((COLS - 1) ** 2 + (ROWS - 1) ** 2);

export default function HexGlowCorner() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: SVG_W,
        height: SVG_H,
        pointerEvents: 'none',
        zIndex: 1,
        maskImage: 'radial-gradient(ellipse 90% 85% at 100% 0%, black 20%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 90% 85% at 100% 0%, black 20%, transparent 100%)',
      }}
    >
      <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}>
        <defs>
          {/* Keyframe glow animation per proximity group */}
          <style>{`
            @keyframes hexPulse0 {
              0%, 100% { stroke-opacity: 0.9; filter: drop-shadow(0 0 6px rgba(210,120,20,0.9)); }
              50%       { stroke-opacity: 0.5; filter: drop-shadow(0 0 2px rgba(210,120,20,0.4)); }
            }
            @keyframes hexPulse1 {
              0%, 100% { stroke-opacity: 0.55; filter: drop-shadow(0 0 4px rgba(180,90,10,0.6)); }
              50%       { stroke-opacity: 0.25; filter: drop-shadow(0 0 1px rgba(180,90,10,0.2)); }
            }
            @keyframes hexPulse2 {
              0%, 100% { stroke-opacity: 0.28; }
              50%       { stroke-opacity: 0.10; }
            }
            .hex-bright  { animation: hexPulse0 3s ease-in-out infinite; }
            .hex-mid     { animation: hexPulse1 4s ease-in-out infinite; }
            .hex-dim     { animation: hexPulse2 5s ease-in-out infinite; }
          `}</style>
        </defs>

        {HEXES.map((h) => {
          const proximity = 1 - h.distFromGlow / MAX_DIST;
          let cls, strokeColor, baseWidth;
          
          if (proximity > 0.65) {
            cls = 'hex-bright';
            strokeColor = 'rgb(220,140,30)';
            baseWidth = 2.2;
          } else if (proximity > 0.35) {
            cls = 'hex-mid';
            strokeColor = 'rgb(190,100,20)';
            baseWidth = 1.5;
          } else {
            cls = 'hex-dim';
            strokeColor = 'rgb(140,60,10)';
            baseWidth = 0.6;
          }

          // stagger each hex slightly using animationDelay
          const delay = `${((h.distFromGlow / MAX_DIST) * 2).toFixed(2)}s`;

          return (
            <polygon
              key={h.id}
              points={HEX_POINTS}
              transform={`translate(${h.x}, ${h.y})`}
              className={cls}
              style={{
                fill: 'none',
                stroke: strokeColor,
                strokeWidth: baseWidth,
                animationDelay: delay,
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}