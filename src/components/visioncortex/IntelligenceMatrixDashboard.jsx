import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Filter } from 'lucide-react';

export default function IntelligenceMatrixDashboard() {
  const [intelligence, setIntelligence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [domainFilter, setDomainFilter] = useState('all');
  const [domains, setDomains] = useState([]);

  useEffect(() => {
    loadIntelligence();
  }, []);

  const loadIntelligence = async () => {
    try {
      const allIntel = await base44.entities.StrategicIntelligence.list();
      setIntelligence(allIntel);

      // Extract unique domains
      const uniqueDomains = new Set();
      allIntel.forEach(item => {
        if (item.domains) {
          item.domains.split(',').forEach(d => uniqueDomains.add(d.trim()));
        }
      });
      setDomains(Array.from(uniqueDomains));
    } catch (error) {
      console.error('Failed to load intelligence:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate scores based on item properties
  const calculateScores = (item) => {
    let impact = (item.value_score || 50) / 100;
    let velocity = 0;

    // Velocity based on how recent and how quickly it's been referenced
    const ageInDays = item.extracted_date ? 
      Math.floor((Date.now() - new Date(item.extracted_date).getTime()) / (1000 * 60 * 60 * 24)) : 30;
    
    if (ageInDays < 7) velocity = 0.9;
    else if (ageInDays < 14) velocity = 0.7;
    else if (ageInDays < 30) velocity = 0.5;
    else velocity = 0.3;

    return { impact, velocity };
  };

  const filteredIntel = domainFilter === 'all' 
    ? intelligence 
    : intelligence.filter(item => item.domains?.includes(domainFilter));

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 p-6 overflow-hidden">
      {/* Header & Filter */}
      <div className="flex items-center justify-between flex-shrink-0">
        <h3 className="font-medium text-foreground">Intelligence Evolution Matrix</h3>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg bg-secondary/40 border border-border outline-none focus:border-accent transition"
          >
            <option value="all">All Domains</option>
            {domains.map(domain => (
              <option key={domain} value={domain}>{domain}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Matrix Container */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Visualization */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative bg-secondary/20 rounded-2xl border border-border overflow-hidden">
            {/* Quadrant Labels */}
            <div className="absolute top-2 left-2 text-[9px] text-muted-foreground font-mono">LOW VELOCITY / HIGH IMPACT</div>
            <div className="absolute top-2 right-2 text-[9px] text-muted-foreground font-mono">HIGH VELOCITY / HIGH IMPACT</div>
            <div className="absolute bottom-2 left-2 text-[9px] text-muted-foreground font-mono">LOW VEL / LOW IMP</div>
            <div className="absolute bottom-2 right-2 text-[9px] text-muted-foreground font-mono">HIGH VEL / LOW IMP</div>

            {/* Axes */}
            <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
              <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="hsl(var(--border))" strokeDasharray="4" opacity="0.3" />
              <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="hsl(var(--border))" strokeDasharray="4" opacity="0.3" />
              <text x="2%" y="8%" fontSize="10" fill="hsl(var(--muted-foreground))" opacity="0.5">VELOCITY →</text>
              <text x="95%" y="95%" fontSize="10" fill="hsl(var(--muted-foreground))" opacity="0.5">IMPACT ↓</text>
            </svg>

            {/* Plot Points */}
            <div className="absolute inset-0">
              {filteredIntel.map((item, idx) => {
                const { impact, velocity } = calculateScores(item);
                const left = `${velocity * 100}%`;
                const top = `${impact * 100}%`;
                
                const typeColor = item.intelligence_type === 'competitive' ? 'bg-destructive/30 border-destructive' :
                                  item.intelligence_type === 'market_trend' ? 'bg-accent/30 border-accent' :
                                  item.intelligence_type === 'risk' ? 'bg-amber-500/30 border-amber-400' :
                                  'bg-blue-500/30 border-blue-400';

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedItem(item)}
                    className={`absolute w-6 h-6 rounded-full border-2 transform -translate-x-1/2 -translate-y-1/2 transition hover:scale-150 ${typeColor}`}
                    style={{ left, top }}
                    title={item.title}
                  >
                    <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold opacity-0 group-hover:opacity-100">
                      📍
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-3 flex gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-destructive/40 border border-destructive" />
              <span className="text-muted-foreground">Competitive</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-accent/40 border border-accent" />
              <span className="text-muted-foreground">Trend</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500/40 border border-amber-400" />
              <span className="text-muted-foreground">Risk</span>
            </div>
          </div>
        </div>

        {/* Details Panel */}
        <div className="w-80 flex flex-col">
          {selectedItem ? (
            <div className="glass-card rounded-2xl p-4 border border-border h-full overflow-y-auto">
              <h4 className="font-medium text-foreground mb-3">{selectedItem.title}</h4>
              
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs font-bold text-accent mb-1">Type</p>
                  <p className="text-xs text-foreground/80 capitalize">{selectedItem.intelligence_type}</p>
                </div>

                <div>
                  <p className="text-xs font-bold text-accent mb-1">Content</p>
                  <p className="text-xs text-foreground/80 line-clamp-4">{selectedItem.content}</p>
                </div>

                <div>
                  <p className="text-xs font-bold text-accent mb-1">Value Score</p>
                  <div className="w-full bg-secondary/40 rounded h-2">
                    <div 
                      className="bg-accent h-2 rounded"
                      style={{ width: `${(selectedItem.value_score || 50)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{selectedItem.value_score || 50}/100</p>
                </div>

                {selectedItem.domains && (
                  <div>
                    <p className="text-xs font-bold text-accent mb-2">Domains</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedItem.domains.split(',').map((domain, i) => (
                        <span key={i} className="text-[10px] px-2 py-1 rounded bg-secondary/40">
                          {domain.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedItem.extracted_date && (
                  <div>
                    <p className="text-xs font-bold text-accent mb-1">Extracted</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(selectedItem.extracted_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-6 border border-border flex items-center justify-center h-full text-center">
              <p className="text-sm text-muted-foreground">Click an intelligence point to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}