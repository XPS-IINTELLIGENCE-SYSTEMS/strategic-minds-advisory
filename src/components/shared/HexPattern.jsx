export default function HexPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 1400 800"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="hexFade" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{stopColor: 'rgba(255,255,255,0.3)', stopOpacity: 1}} />
          <stop offset="50%" style={{stopColor: 'rgba(255,255,255,0.1)', stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: 'rgba(255,255,255,0)', stopOpacity: 1}} />
        </linearGradient>
      </defs>
      <rect width="1400" height="800" fill="url(#hexFade)" />
      
      {/* Top-left cluster */}
      <g stroke="rgba(150,150,150,0.6)" strokeWidth="1.2" fill="none">
        {[0,1,2,3,4,5].map((i) => (
          <polygon key={`tl-${i}`} points={`${40 + i*55},${20 + (i%2)*48} ${70 + i*55},${35 + (i%2)*48} ${70 + i*55},${65 + (i%2)*48} ${40 + i*55},${80 + (i%2)*48} ${10 + i*55},${65 + (i%2)*48} ${10 + i*55},${35 + (i%2)*48}`} />
        ))}
        {[0,1,2,3,4].map((i) => (
          <polygon key={`tl2-${i}`} points={`${40 + i*55},${120 + (i%2)*48} ${70 + i*55},${135 + (i%2)*48} ${70 + i*55},${165 + (i%2)*48} ${40 + i*55},${180 + (i%2)*48} ${10 + i*55},${165 + (i%2)*48} ${10 + i*55},${135 + (i%2)*48}`} />
        ))}
      </g>

      {/* Top-right cluster */}
      <g stroke="rgba(150,150,150,0.6)" strokeWidth="1.2" fill="none">
        {[0,1,2,3,4,5].map((i) => (
          <polygon key={`tr-${i}`} points={`${1220 + i*55},${20 + (i%2)*48} ${1250 + i*55},${35 + (i%2)*48} ${1250 + i*55},${65 + (i%2)*48} ${1220 + i*55},${80 + (i%2)*48} ${1190 + i*55},${65 + (i%2)*48} ${1190 + i*55},${35 + (i%2)*48}`} />
        ))}
        {[0,1,2,3,4].map((i) => (
          <polygon key={`tr2-${i}`} points={`${1220 + i*55},${120 + (i%2)*48} ${1250 + i*55},${135 + (i%2)*48} ${1250 + i*55},${165 + (i%2)*48} ${1220 + i*55},${180 + (i%2)*48} ${1190 + i*55},${165 + (i%2)*48} ${1190 + i*55},${135 + (i%2)*48}`} />
        ))}
      </g>

      {/* Center-top scattered */}
      <g stroke="rgba(150,150,150,0.5)" strokeWidth="1.2" fill="none">
        {[0,1,2,3].map((i) => (
          <polygon key={`ct-${i}`} points={`${580 + i*70},${40 + (i%2)*50} ${610 + i*70},${55 + (i%2)*50} ${610 + i*70},${85 + (i%2)*50} ${580 + i*70},${100 + (i%2)*50} ${550 + i*70},${85 + (i%2)*50} ${550 + i*70},${55 + (i%2)*50}`} />
        ))}
      </g>
    </svg>
  );
}