import React from 'react';

const SIZE = 32;
const W = SIZE * 2;
const H = Math.sqrt(3) * SIZE;

const HEX_POINTS = (() => {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i);
    pts.push(`${SIZE + Math.cos(angle) * (SIZE - 1)},${SIZE + Math.sin(angle) * (SIZE - 1)}`);
  }
  return pts.join(' ');
})();

export default function HexGlowCorner() {
  const cols = 28;
  const rows = 2;
  const hexagons = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * W * 0.75 + (row % 2) * W * 0.375;
      const y = row * H * 0.75;
      
      // Fade from edges and create wavy dip in middle
      const centerDist = Math.abs(col - cols / 2) / (cols / 2);
      const waveY = Math.sin((col / cols) * Math.PI) * 0.6;
      
      let opacity = 1 - centerDist;
      if (row === 1) {
        opacity *= 0.5 - waveY * 0.3;
      }
      
      hexagons.push({ x, y, opacity: Math.max(opacity, 0) });
    }
  }

  const viewBoxWidth = cols * W * 0.75 + W;
  const viewBoxHeight = rows * H * 0.75 + H;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: viewBoxHeight + 100,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        background: `linear-gradient(to bottom, rgba(0,0,0,0) 0%, #000000 100%)`,
      }}
    >
      <svg 
        width="100%" 
        height={viewBoxHeight + 100}
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight + 100}`}
        preserveAspectRatio="xMidYMid slice"
      >
        {hexagons.map((h, i) => (
          <polygon
            key={i}
            points={HEX_POINTS}
            transform={`translate(${h.x}, ${h.y})`}
            style={{
              fill: 'none',
              stroke: 'rgba(180, 140, 80, 0.6)',
              strokeWidth: '0.7',
              opacity: h.opacity,
            }}
          />
        ))}
      </svg>
    </div>
  );
}