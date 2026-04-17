import React from 'react';

const SIZE = 32;
const W = SIZE * 2;
const H = Math.sqrt(3) * SIZE;

// Flat-top hexagon points
const HEX_POINTS = (() => {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i);
    pts.push(`${SIZE + Math.cos(angle) * (SIZE - 1)},${SIZE + Math.sin(angle) * (SIZE - 1)}`);
  }
  return pts.join(' ');
})();

export default function HexGlowCorner() {
  const cols = 20;
  const rows = 2;
  const hexagons = [];

  // Create hexagon grid matching the reference image
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * W * 0.75 + (row % 2) * W * 0.375;
      const y = row * H * 0.75;
      
      // Wavy taper effect: hexagons fade in middle
      let opacity = 0.6;
      const distFromMiddle = Math.abs(col - cols / 2);
      
      if (row === 0) {
        opacity = 0.6 - (distFromMiddle / (cols / 2)) * 0.3;
      } else {
        opacity = 0.3 - (distFromMiddle / (cols / 2)) * 0.2;
      }
      
      hexagons.push({ x, y, opacity: Math.max(opacity, 0.05) });
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: H * 1.5 + 40,
        backgroundColor: '#000000',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <svg 
        width="100%" 
        height={H * 1.5 + 40}
        viewBox={`0 0 ${cols * W * 0.75 + W} ${H * 1.5 + 40}`}
        preserveAspectRatio="xMidYMid slice"
      >
        {hexagons.map((h, i) => (
          <polygon
            key={i}
            points={HEX_POINTS}
            transform={`translate(${h.x}, ${h.y})`}
            style={{
              fill: 'none',
              stroke: 'rgb(200,120,40)',
              strokeWidth: '0.9',
              opacity: h.opacity,
            }}
          />
        ))}
      </svg>
    </div>
  );
}