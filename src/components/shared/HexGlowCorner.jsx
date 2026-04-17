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

// Single wavy path of connected hexagons across top-right
const HEX_PATH = [
  { x: 0, y: 0 },
  { x: W * 0.75, y: -H * 0.5 },
  { x: W * 1.5, y: 0 },
  { x: W * 2.25, y: -H * 0.5 },
  { x: W * 3, y: 0 },
  { x: W * 3.75, y: -H * 0.5 },
  { x: W * 4.5, y: 0 },
  { x: W * 5.25, y: -H * 0.5 },
  { x: W * 6, y: 0 },
];

const SVG_W = W * 6.5;
const SVG_H = H * 2;

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
      }}
    >
      <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}>
        <defs>
          <style>{`
            @keyframes hexGlow {
              0%, 100% { stroke-opacity: 0.25; filter: drop-shadow(0 0 2px rgba(210,120,20,0.3)); }
              50%       { stroke-opacity: 0.08; filter: drop-shadow(0 0 0px rgba(210,120,20,0.1)); }
            }
            .hex-line { animation: hexGlow 4s ease-in-out infinite; }
          `}</style>
        </defs>

        {HEX_PATH.map((h, i) => (
          <polygon
            key={i}
            points={HEX_POINTS}
            transform={`translate(${h.x}, ${h.y})`}
            className="hex-line"
            style={{
              fill: 'none',
              stroke: 'rgb(200,120,30)',
              strokeWidth: '0.8',
              animationDelay: `${(i * 0.15).toFixed(2)}s`,
            }}
          />
        ))}
      </svg>
    </div>
  );
}