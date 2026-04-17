export default function HexPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-35"
      viewBox="0 0 1200 600"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="hexPattern" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
          <g stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" fill="none">
            <polygon points="30,0 60,15 60,45 30,60 0,45 0,15" />
          </g>
        </pattern>
      </defs>
      <rect width="1200" height="600" fill="url(#hexPattern)" />
    </svg>
  );
}