import React, { useState } from 'react';

const SIZE = 48;
const W = SIZE * 2;

// Pre-compute points as a plain string at module level (no SVG DOM objects)
const POINTS = (() => {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    pts.push(`${SIZE + Math.cos(angle) * (SIZE - 1)},${SIZE + Math.sin(angle) * (SIZE - 1)}`);
  }
  return pts.join(' ');
})();

function Hexagon({ x, y }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: W,
        height: W,
        cursor: 'pointer',
      }}
    >
      <svg
        width={W}
        height={W}
        viewBox={`0 0 ${W} ${W}`}
        style={{
          transition: 'filter 0.3s ease',
          filter: hovered ? 'drop-shadow(0 0 8px rgba(200,200,200,0.7))' : 'none',
        }}
      >
        <polygon
          points={POINTS}
          style={{
            fill: hovered ? 'rgba(255,255,255,0.08)' : 'transparent',
            stroke: hovered ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.12)',
            strokeWidth: '1',
            transition: 'fill 0.3s ease, stroke 0.3s ease',
          }}
        />
      </svg>
    </div>
  );
}

const HEXES = [
  // top-left cluster
  { x: -20, y: -20 },
  { x: 60,  y: -30 },
  { x: 20,  y: 50  },
  { x: 100, y: 30  },
  // top-right cluster
  { x: 'calc(100% - 180px)', y: -15 },
  { x: 'calc(100% - 100px)', y: -30 },
  { x: 'calc(100% - 230px)', y: 45  },
  { x: 'calc(100% - 140px)', y: 55  },
  // bottom-left cluster
  { x: -10, y: 'calc(100% - 100px)' },
  { x: 70,  y: 'calc(100% - 120px)' },
  { x: 30,  y: 'calc(100% - 50px)'  },
  // mid-right sparse
  { x: 'calc(100% - 80px)',  y: '35%' },
  { x: 'calc(100% - 155px)', y: '38%' },
];

export default function HexagonField() {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 1, pointerEvents: 'none' }}>
      <div className="absolute inset-0" style={{ pointerEvents: 'auto' }}>
        {HEXES.map((h, i) => (
          <Hexagon key={i} x={h.x} y={h.y} />
        ))}
      </div>
    </div>
  );
}