import React from 'react';

const S = 36;
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

export default function HexGlowCorner() {
  const rows = 3;
  const cols = 16;
  const hexagons = [];

  // Create a grid of hexagons
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * W * 0.75 + (row % 2) * W * 0.375;
      const y = row * H * 0.75;
      
      // Determine opacity: brightest in top-middle, fades to edges and down
      let opacity = 0.15;
      const fromTop = row;
      const fromMiddle = Math.abs(col - cols / 2);
      
      if (fromTop === 0) {
        opacity = 0.5 - (fromMiddle / cols) * 0.35;
      } else if (fromTop === 1) {
        opacity = 0.25 - (fromMiddle / cols) * 0.2;
      } else {
        opacity = 0.08 - (fromMiddle / cols) * 0.05;
      }
      
      hexagons.push({ x, y, opacity });
    }
  }

  const SVG_W = cols * W * 0.75 + W;
  const SVG_H = rows * H * 0.75 + H;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: SVG_H + 20,
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden',
      }}
    >
      <svg 
        width="100%" 
        height={SVG_H + 20} 
        viewBox={`0 0 ${SVG_W} ${SVG_H + 20}`}
        preserveAspectRatio="xMidYMid slice"
      >
        {hexagons.map((h, i) => (
          <polygon
            key={i}
            points={HEX_POINTS}
            transform={`translate(${h.x}, ${h.y})`}
            style={{
              fill: 'none',
              stroke: 'rgb(180,110,20)',
              strokeWidth: '0.7',
              opacity: h.opacity,
            }}
          />
        ))}
      </svg>
    </div>
  );
}