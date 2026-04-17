import React from 'react';

const SIZE = 28;
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
  const cols = 24;
  const rows = 3;
  const hexagons = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * W * 0.75 + (row % 2) * W * 0.375;
      const y = row * H * 0.75;
      
      // Wavy taper: create the flowing cutout effect
      let opacity = 0.5;
      const distFromMiddle = Math.abs(col - cols / 2);
      const waveAmount = Math.sin((col / cols) * Math.PI) * 1.5;
      
      // Different opacity per row
      if (row === 0) {
        opacity = 0.7 - (distFromMiddle / (cols / 2)) * 0.4;
      } else if (row === 1) {
        opacity = (0.3 - (distFromMiddle / (cols / 2)) * 0.25) * (1 - waveAmount * 0.3);
      } else {
        opacity = (0.1 - (distFromMiddle / (cols / 2)) * 0.08) * (1 - waveAmount * 0.4);
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
        height: viewBoxHeight + 40,
        backgroundColor: '#000000',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <svg 
        width="100%" 
        height={viewBoxHeight + 40}
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight + 40}`}
        preserveAspectRatio="xMidYMid slice"
        style={{
          animation: 'hexPulse 6s ease-in-out infinite',
        }}
      >
        <defs>
          <style>{`
            @keyframes hexPulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.85; }
            }
          `}</style>
        </defs>
        {hexagons.map((h, i) => (
          <polygon
            key={i}
            points={HEX_POINTS}
            transform={`translate(${h.x}, ${h.y})`}
            style={{
              fill: 'none',
              stroke: 'rgb(200,140,60)',
              strokeWidth: '0.8',
              opacity: h.opacity,
              animation: `hexPulse 8s ease-in-out infinite`,
              animationDelay: `${(i * 0.05).toFixed(2)}s`,
            }}
          />
        ))}
      </svg>
    </div>
  );
}