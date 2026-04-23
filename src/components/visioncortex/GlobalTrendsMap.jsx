import React, { useState, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Loader2, RefreshCw, TrendingUp, Zap } from 'lucide-react';

const DOMAINS = [
  { id: 'ai', label: 'AI & LLM', color: '#a78bfa', glow: 'rgba(167,139,250,0.4)' },
  { id: 'crypto', label: 'Crypto & DeFi', color: '#f59e0b', glow: 'rgba(245,158,11,0.4)' },
  { id: 'science', label: 'Science & Bio', color: '#34d399', glow: 'rgba(52,211,153,0.4)' },
  { id: 'finance', label: 'Finance', color: '#60a5fa', glow: 'rgba(96,165,250,0.4)' },
  { id: 'geo', label: 'Geopolitics', color: '#f87171', glow: 'rgba(248,113,113,0.4)' },
  { id: 'social', label: 'Social Media', color: '#fb7185', glow: 'rgba(251,113,133,0.4)' },
  { id: 'climate', label: 'Climate', color: '#4ade80', glow: 'rgba(74,222,128,0.4)' },
  { id: 'philosophy', label: 'Philosophy', color: '#e879f9', glow: 'rgba(232,121,249,0.4)' },
];

// Generate pseudo-random but deterministic positions per domain+signal
function hashPos(str, offset = 0) {
  let h = offset;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h) + str.charCodeAt(i);
  return Math.abs(h);
}

function Node({ signal, domain, x, y, onHover, isHovered }) {
  const domainConfig = DOMAINS.find(d => d.id === domain) || DOMAINS[0];
  const impact = signal.urgency === 'high' ? 1 : signal.urgency === 'low' ? 0.5 : 0.75;
  const r = 8 + impact * 14;

  return (
    <g transform={`translate(${x},${y})`}
      onMouseEnter={() => onHover(signal, x, y)}
      onMouseLeave={() => onHover(null)}
      style={{ cursor: 'pointer' }}>
      {/* Glow ring */}
      <circle r={r + 8} fill="none" stroke={domainConfig.color} strokeWidth="1" strokeOpacity={isHovered ? 0.6 : 0.15}
        style={{ transition: 'all 0.3s' }} />
      {/* Pulse ring */}
      {isHovered && (
        <circle r={r + 16} fill="none" stroke={domainConfig.color} strokeWidth="1" strokeOpacity={0.3}>
          <animate attributeName="r" values={`${r + 8};${r + 28}`} dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.4;0" dur="1.5s" repeatCount="indefinite" />
        </circle>
      )}
      {/* Main dot */}
      <circle r={r} fill={domainConfig.glow} stroke={domainConfig.color} strokeWidth={isHovered ? 2 : 1}
        style={{ transition: 'all 0.3s', filter: isHovered ? `drop-shadow(0 0 8px ${domainConfig.color})` : 'none' }} />
      {/* Inner dot */}
      <circle r={r * 0.4} fill={domainConfig.color} opacity={0.9} />
    </g>
  );
}

function GridLines({ width, height }) {
  const lines = [];
  for (let x = 0; x <= width; x += 80) {
    lines.push(<line key={`v${x}`} x1={x} y1={0} x2={x} y2={height} stroke="hsl(var(--border))" strokeOpacity={0.3} strokeWidth={0.5} />);
  }
  for (let y = 0; y <= height; y += 60) {
    lines.push(<line key={`h${y}`} x1={0} y1={y} x2={width} y2={y} stroke="hsl(var(--border))" strokeOpacity={0.3} strokeWidth={0.5} />);
  }
  return <g>{lines}</g>;
}

export default function GlobalTrendsMap() {
  const [feedData, setFeedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [enabledDomains, setEnabledDomains] = useState(DOMAINS.map(d => d.id));
  const [hoveredSignal, setHoveredSignal] = useState(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  const W = 800, H = 480;

  const loadFeed = async () => {
    setLoading(true);
    const catMap = {
      ai: 'AI & LLM Research', crypto: 'Crypto & DeFi', science: 'Science & Biotech',
      finance: 'Finance & Markets', geo: 'Geopolitics & Economy', social: 'Social Media Trends',
      climate: 'Climate & Energy', philosophy: 'Philosophy & Consciousness',
    };
    const cats = enabledDomains.map(d => catMap[d]).filter(Boolean);
    const res = await base44.functions.invoke('visionCortexFeed', { categories: cats });
    setFeedData(res.data);
    setLoading(false);
  };

  const toggleDomain = (id) => setEnabledDomains(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );

  // Map signals to domain ids
  const domainIdMap = {
    'AI & LLM Research': 'ai', 'Crypto & DeFi': 'crypto', 'Science & Biotech': 'science',
    'Finance & Markets': 'finance', 'Geopolitics & Economy': 'geo', 'Social Media Trends': 'social',
    'Climate & Energy': 'climate', 'Philosophy & Consciousness': 'philosophy',
  };

  const signals = feedData?.intelligence_brief?.filter(s => {
    const domId = domainIdMap[s.domain] || 'ai';
    return enabledDomains.includes(domId);
  }) || [];

  // Cross-domain opportunities
  const crossOps = feedData?.cross_domain_opportunities || [];

  const getNodePos = (signal, i) => {
    const h = hashPos(signal.signal || signal.domain, i);
    const x = 60 + (h % (W - 120));
    const y = 60 + ((h >> 8) % (H - 120));
    return { x, y };
  };

  const handleHover = (signal, svgX, svgY) => {
    setHoveredSignal(signal);
    if (signal && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const scaleX = rect.width / W;
      const scaleY = rect.height / H;
      setHoverPos({ x: svgX * scaleX, y: svgY * scaleY });
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Controls */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-card/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">Global Signal Map</span>
            {feedData && <span className="text-xs text-muted-foreground">· {signals.length} signals active</span>}
          </div>
          <button onClick={loadFeed} disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl btn-ivory text-xs disabled:opacity-60">
            {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading…</> : <><RefreshCw className="w-3.5 h-3.5" /> Refresh Feed</>}
          </button>
        </div>

        {/* Domain toggles */}
        <div className="flex flex-wrap gap-2">
          {DOMAINS.map(d => (
            <button key={d.id} onClick={() => toggleDomain(d.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-all ${
                enabledDomains.includes(d.id) ? 'border-transparent text-foreground' : 'border-border text-muted-foreground opacity-40'
              }`}
              style={enabledDomains.includes(d.id) ? { background: `${d.glow}`, borderColor: d.color, color: d.color } : {}}>
              <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative overflow-hidden bg-background/60">
        {!feedData && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <Globe className="w-16 h-16 opacity-10" />
            <div className="text-center">
              <p className="font-medium text-sm">Intelligence Signal Map</p>
              <p className="text-xs mt-1">Load the feed to visualize cross-domain signals</p>
            </div>
            <button onClick={loadFeed} className="btn-ivory rounded-xl px-5 py-2.5 text-sm flex items-center gap-2">
              <Zap className="w-4 h-4" /> Load Intelligence Feed
            </button>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin text-accent mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Ingesting signals from {enabledDomains.length} domains…</p>
            </div>
          </div>
        )}

        {feedData && (
          <div className="relative w-full h-full">
            <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ display: 'block' }}>
              {/* Background grid */}
              <GridLines width={W} height={H} />

              {/* Ambient glow zones per domain */}
              {DOMAINS.filter(d => enabledDomains.includes(d.id)).map((d, i) => (
                <ellipse key={d.id}
                  cx={100 + (i * 95) % (W - 100)} cy={80 + (i * 70) % (H - 80)}
                  rx={60} ry={40}
                  fill={d.glow} opacity={0.08} />
              ))}

              {/* Cross-domain connection lines */}
              {crossOps.slice(0, 5).map((opp, i) => {
                const d1 = DOMAINS.find(d => (opp.domains_intersecting || [])[0]?.toLowerCase().includes(d.id));
                const d2 = DOMAINS.find(d => (opp.domains_intersecting || [])[1]?.toLowerCase().includes(d.id));
                if (!d1 || !d2) return null;
                const x1 = 100 + hashPos(d1.id, 0) % (W - 200);
                const y1 = 100 + hashPos(d1.id, 1) % (H - 200);
                const x2 = 100 + hashPos(d2.id, 0) % (W - 200);
                const y2 = 100 + hashPos(d2.id, 1) % (H - 200);
                return (
                  <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="hsl(var(--accent))" strokeOpacity={0.2} strokeWidth={1} strokeDasharray="4 4" />
                );
              })}

              {/* Signal nodes */}
              {signals.map((signal, i) => {
                const domId = domainIdMap[signal.domain] || 'ai';
                const { x, y } = getNodePos(signal, i);
                return (
                  <Node key={i} signal={signal} domain={domId} x={x} y={y}
                    onHover={handleHover}
                    isHovered={hoveredSignal === signal} />
                );
              })}

              {/* Domain labels */}
              {DOMAINS.filter(d => enabledDomains.includes(d.id)).map((d, i) => (
                <text key={d.id}
                  x={16 + (i * 100) % (W - 32)} y={H - 12}
                  fill={d.color} fontSize="9" opacity={0.5} fontFamily="monospace">
                  {d.label}
                </text>
              ))}
            </svg>

            {/* Tooltip */}
            <AnimatePresence>
              {hoveredSignal && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -8 }}
                  className="absolute z-20 max-w-xs pointer-events-none"
                  style={{ left: Math.min(hoverPos.x + 12, window.innerWidth - 320), top: Math.max(hoverPos.y - 120, 8) }}>
                  <div className="bg-card border border-border rounded-2xl p-4 shadow-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{hoveredSignal.domain}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                        hoveredSignal.urgency === 'high' ? 'border-red-500/30 text-red-400 bg-red-500/10' :
                        hoveredSignal.urgency === 'low' ? 'border-green-500/30 text-green-400 bg-green-500/10' :
                        'border-amber-500/30 text-amber-400 bg-amber-500/10'
                      }`}>{hoveredSignal.urgency}</span>
                    </div>
                    <p className="text-sm font-medium mb-1.5">{hoveredSignal.signal}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{hoveredSignal.implication}</p>
                    {hoveredSignal.idea_seed && (
                      <div className="mt-2 pt-2 border-t border-border/50 text-xs text-accent/80">
                        💡 {hoveredSignal.idea_seed}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Top seed */}
            {feedData.top_seed_for_today && (
              <div className="absolute bottom-4 left-4 right-4 max-w-md">
                <div className="bg-card/90 backdrop-blur-sm border border-accent/30 rounded-2xl px-4 py-3 flex items-start gap-3">
                  <TrendingUp className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-accent mb-0.5">Top Signal Today</div>
                    <p className="text-xs leading-relaxed">{feedData.top_seed_for_today}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}