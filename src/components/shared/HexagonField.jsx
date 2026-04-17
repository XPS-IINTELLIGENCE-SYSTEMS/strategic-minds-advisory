import React, { useState } from 'react';

// Hexagon SVG path for a flat-top hex, size ~48px
const HEX_SIZE = 48;
const W = HEX_SIZE * 2;
const H = Math.sqrt(3) * HEX_SIZE;

function Hexagon({ x, y, delay }) {
  const [hovered, setHovered] = useState(false);

  const points = (() => {
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 180) * (60 * i - 30);
      pts.push(`${HEX_SIZE + Math.cos(angle) * (HEX_SIZE - 1)},${HEX_SIZE + Math.sin(angle) * (HEX_SIZE - 1)}`);
    }
    return pts.join(' ');
  })();

  return (
    <svg
      width={W}
      height={W}
      viewBox={`0 0 ${W} ${W}`}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        filter: hovered ? 'drop-shadow(0 0 8px rgba(200,200,200,0.7))' : 'none',
        animationDelay: `${delay}s`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <polygon
        points={points}
        fill={hovered ? 'rgba(255,255,255,0.08)' : 'transparent'}
        stroke={hovered ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.12)'}
        strokeWidth="1"
        style={{ transition: 'all 0.3s ease' }}
      />
    </svg>
  );
}

// Scattered positions — a few clusters in random corners/edges
const HEXES = [
  // top-left cluster
  { x: -20, y: -20, delay: 0 },
  { x: 60,  y: -30, delay: 0.1 },
  { x: 20,  y: 50,  delay: 0.2 },
  { x: 100, y: 30,  delay: 0.15 },

  // top-right cluster (% based handled via CSS right offset)
  { x: 'calc(100% - 180px)', y: -15, delay: 0.05 },
  { x: 'calc(100% - 100px)', y: -30, delay: 0.1 },
  { x: 'calc(100% - 230px)', y: 45, delay: 0.2 },
  { x: 'calc(100% - 140px)', y: 55, delay: 0.3 },

  // bottom-left cluster
  { x: -10, y: 'calc(100% - 100px)', delay: 0.1 },
  { x: 70,  y: 'calc(100% - 120px)', delay: 0.2 },
  { x: 30,  y: 'calc(100% - 50px)', delay: 0.05 },

  // mid-right sparse
  { x: 'calc(100% - 80px)', y: '35%', delay: 0.3 },
  { x: 'calc(100% - 155px)', y: '38%', delay: 0.1 },
];

export default function HexagonField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
      <div className="absolute inset-0 pointer-events-auto">
        {HEXES.map((h, i) => (
          <Hexagon key={i} x={h.x} y={h.y} delay={h.delay} />
        ))}
      </div>
    </div>
  );
}