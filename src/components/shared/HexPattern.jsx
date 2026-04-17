export default function HexPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 1400 800"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="hexFade" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{stopColor: 'rgba(100,100,100,1)', stopOpacity: 1}} />
          <stop offset="35%" style={{stopColor: 'rgba(80,80,80,0.4)', stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: 'rgba(0,0,0,0)', stopOpacity: 1}} />
        </linearGradient>
      </defs>
      
      {/* Hexagon grid matching reference image */}
      <g stroke="rgba(100,100,100,1)" strokeWidth="1.2" fill="none" opacity="1">
        {Array.from({length: 18}).map((_, col) => 
          Array.from({length: 5}).map((_, row) => {
            const x = col * 80;
            const y = row * 70 + (col % 2 ? 35 : 0);
            const hexSize = 25;
            const points = Array.from({length: 6})
              .map((_, i) => {
                const angle = (Math.PI / 3) * i;
                return `${x + hexSize * Math.cos(angle)},${y + hexSize * Math.sin(angle)}`;
              })
              .join(' ');
            return <polygon key={`${col}-${row}`} points={points} style={{opacity: 1 - (row * 0.2)}} />;
          })
        )}
      </g>
      
      {/* Fade gradient overlay */}
      <rect width="1400" height="800" fill="url(#hexFade)" />
    </svg>
  );
}