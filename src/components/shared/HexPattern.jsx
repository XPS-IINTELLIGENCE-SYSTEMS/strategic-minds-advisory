export default function HexPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 1400 900"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="hexFadeTop" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{stopColor: 'rgba(120,120,120,1)', stopOpacity: 1}} />
          <stop offset="40%" style={{stopColor: 'rgba(100,100,100,0.3)', stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: 'rgba(0,0,0,0)', stopOpacity: 1}} />
        </linearGradient>
      </defs>
      
      {/* Full width hex grid at top */}
      <g stroke="url(#hexFadeTop)" strokeWidth="1.5" fill="none">
        {Array.from({length: 16}).map((_, col) => 
          Array.from({length: 6}).map((_, row) => {
            const x = col * 85 - 50;
            const y = row * 75;
            const hexSize = 28;
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