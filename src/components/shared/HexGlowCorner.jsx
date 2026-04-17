import React, { useState } from 'react';

const S = 44; // hex radius
const W = S * 2;
const H = Math.sqrt(3) * S;

// Pre-compute hex points as plain string
const HEX_POINTS = (() => {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i);
    pts.push(`${S + Math.cos(angle) * (S - 1)},${S + Math.sin(angle) * (S - 1)}`);
  }
  return pts.join(' ');
})();

// Build a grid of hex positions (flat-top pointy layout)
function buildGrid(cols, rows) {
  const hexes = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * (W * 0.75);
      const y = row * H + (col % 2 === 1 ? H / 2 : 0);
      // distance from top-right corner (col=max, row=0) for glow intensity
      const distFromGlow = Math.sqrt(Math.pow(col - (cols - 1), 2) + Math.pow(row, 2));
      hexes.push({ x, y, distFromGlow, id: `${row}-${col}` });
    }
  }
  return hexes;
}

const COLS = 7;
const ROWS = 6;
const HEXES = buildGrid(COLS, ROWS);
const SVG_W = COLS * W * 0.75 + W * 0.25;
const SVG_H = ROWS * H + H / 2;

function HexCell({ x, y, distFromGlow }) {
  const [hovered, setHovered] = useState(false);

  // Base opacity and glow based on distance from top-right
  const maxDist = Math.sqrt((COLS - 1) ** 2 + (ROWS - 1) ** 2);
  const proximity = 1 - distFromGlow / maxDist; // 0-1, 1 = closest to glow center
  const baseStrokeOpacity = 0.1 + proximity * 0.5;
  const baseFillOpacity = proximity * 0.15;

  const strokeColor = hovered
    ? 'rgba(255, 180, 60, 0.95)'
    : `rgba(200, 120, 30, ${baseStrokeOpacity})`;
  const fillColor = hovered
    ? 'rgba(255, 160, 40, 0.18)'
    : `rgba(160, 80, 10, ${baseFillOpacity})`;
  const glowFilter = hovered || proximity > 0.6 ? 'url(#goldGlow)' : 'none';

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'pointer' }}
    >
      <polygon
        points={HEX_POINTS}
        style={{
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: hovered ? '1.5' : '1',
          filter: glowFilter,
          transition: 'fill 0.3s ease, stroke 0.3s ease',
        }}
      />
    </g>
  );
}

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
        maskImage: 'radial-gradient(ellipse 80% 80% at 100% 0%, black 30%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 100% 0%, black 30%, transparent 100%)',
      }}
    >
      <div style={{ pointerEvents: 'auto' }}>
        <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}>
          <defs>
            <filter id="goldGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="glowBg" cx="100%" cy="0%" r="70%">
              <stop offset="0%" stopColor="rgba(200,100,10,0.25)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
          </defs>
          {/* Ambient glow behind hexes */}
          <rect width={SVG_W} height={SVG_H} fill="url(#glowBg)" />
          {HEXES.map((h) => (
            <HexCell key={h.id} x={h.x} y={h.y} distFromGlow={h.distFromGlow} />
          ))}
        </svg>
      </div>
    </div>
  );
}