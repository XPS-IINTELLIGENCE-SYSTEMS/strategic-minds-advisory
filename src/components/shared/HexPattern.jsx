export default function HexPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 1400 900"
      preserveAspectRatio="xMidYMid slice"
      style={{ mixBlendMode: 'screen' }}
    >
      <defs>
        <linearGradient id="hexGridFade" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{stopColor: 'rgba(120,120,120,1)', stopOpacity: 1}} />
          <stop offset="30%" style={{stopColor: 'rgba(100,100,100,0.6)', stopOpacity: 1}} />
          <stop offset="60%" style={{stopColor: 'rgba(60,60,60,0.1)', stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: 'rgba(0,0,0,0)', stopOpacity: 0}} />
        </linearGradient>
      </defs>
      
      {/* Hexagon grid - top section with fade */}
      <g stroke="url(#hexGridFade)" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {Array.from({length: 16}).map((_, col) => 
          Array.from({length: 7}).map((_, row) => {
            const x = col * 90 - 45;
            const y = row * 78;
            const hexSize = 32;
            const points = Array.from({length: 6})
              .map((_, i) => {
                const angle = (Math.PI / 3) * i;
                return `${x + hexSize * Math.cos(angle)},${y + hexSize * Math.sin(angle)}`;
              })
              .join(' ');
            return <polygon key={`${col}-${row}`} points={points} />;
          })
        )}
      </g>
    </svg>
  );
}