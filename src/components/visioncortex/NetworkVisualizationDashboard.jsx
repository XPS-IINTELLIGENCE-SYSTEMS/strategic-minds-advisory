import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Network } from 'lucide-react';

export default function NetworkVisualizationDashboard() {
  const [intelligence, setIntelligence] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [correlations, setCorrelations] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [intelData, modelData] = await Promise.all([
        base44.entities.StrategicIntelligence.list(),
        base44.entities.SavedModel.list(),
      ]);

      setIntelligence(intelData);
      setModels(modelData);

      // Calculate correlations between intelligence items and models
      const correlationMatrix = [];
      for (const model of modelData) {
        for (const intel of intelData.slice(0, 20)) {
          const strength = calculateCorrelation(intel, model);
          if (strength > 0.3) {
            correlationMatrix.push({
              model_id: model.id,
              model_name: model.name,
              intel_id: intel.id,
              intel_title: intel.title,
              strength,
              intel_type: intel.intelligence_type,
              domains: intel.domains,
            });
          }
        }
      }

      setCorrelations(correlationMatrix);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCorrelation = (intel, model) => {
    let score = 0;

    // Domain matching
    if (intel.domains && model.name) {
      const intelDomains = intel.domains.toLowerCase().split(',');
      const modelLower = model.name.toLowerCase();
      const matchCount = intelDomains.filter(d => modelLower.includes(d.trim())).length;
      score += matchCount * 0.25;
    }

    // Type matching
    const relevantTypes = ['competitive', 'market_trend', 'opportunity', 'technology'];
    if (relevantTypes.includes(intel.intelligence_type)) {
      score += 0.2;
    }

    // Recency boost
    if (intel.extracted_date) {
      const ageInDays = Math.floor((Date.now() - new Date(intel.extracted_date).getTime()) / (1000 * 60 * 60 * 24));
      if (ageInDays < 7) score += 0.3;
      else if (ageInDays < 30) score += 0.15;
    }

    // Value score
    if (intel.value_score) {
      score += (intel.value_score / 100) * 0.2;
    }

    return Math.min(score, 1);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  // Calculate node positions
  const nodePositions = {};
  const padding = 60;
  const width = 800;
  const height = 600;

  models.forEach((model, idx) => {
    const angle = (idx / Math.max(models.length, 1)) * Math.PI * 2;
    const radius = 200;
    nodePositions[`model_${model.id}`] = {
      x: width / 2 + radius * Math.cos(angle),
      y: height / 2 + radius * Math.sin(angle),
      type: 'model',
      label: model.name,
    };
  });

  intelligence.slice(0, 15).forEach((intel, idx) => {
    const angle = (idx / 15) * Math.PI * 2;
    const radius = 100;
    nodePositions[`intel_${intel.id}`] = {
      x: width / 2 + radius * Math.cos(angle),
      y: height / 2 + radius * Math.sin(angle),
      type: 'intel',
      label: intel.title.substring(0, 20),
    };
  });

  return (
    <div className="h-full flex flex-col gap-6 p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <Network className="w-5 h-5 text-accent" />
        <div>
          <h3 className="font-medium text-foreground">Intelligence-Model Network</h3>
          <p className="text-xs text-muted-foreground">{correlations.length} active connections</p>
        </div>
      </div>

      {/* Network Visualization */}
      <div className="flex-1 flex gap-6 min-h-0">
        <div className="flex-1 bg-secondary/20 rounded-2xl border border-border overflow-hidden relative">
          <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill="hsl(var(--accent))" opacity="0.5" />
              </marker>
            </defs>

            {/* Connection Lines */}
            {correlations.map((conn, idx) => {
              const start = nodePositions[`model_${conn.model_id}`];
              const end = nodePositions[`intel_${conn.intel_id}`];
              
              if (!start || !end) return null;

              const opacity = conn.strength;
              const width = 1 + conn.strength * 3;

              return (
                <line
                  key={idx}
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke="hsl(var(--accent))"
                  strokeWidth={width}
                  opacity={opacity * 0.4}
                  markerEnd="url(#arrowhead)"
                  onClick={() => setSelectedConnection(conn)}
                  style={{ cursor: 'pointer' }}
                />
              );
            })}

            {/* Model Nodes */}
            {models.map(model => {
              const pos = nodePositions[`model_${model.id}`];
              if (!pos) return null;

              return (
                <g key={`model_${model.id}`}>
                  <circle cx={pos.x} cy={pos.y} r="20" fill="hsl(var(--accent))" opacity="0.8" />
                  <text x={pos.x} y={pos.y} textAnchor="middle" dy="0.3em" fontSize="10" fill="white" fontWeight="bold">
                    M
                  </text>
                </g>
              );
            })}

            {/* Intelligence Nodes */}
            {intelligence.slice(0, 15).map(intel => {
              const pos = nodePositions[`intel_${intel.id}`];
              if (!pos) return null;

              const typeColor = intel.intelligence_type === 'competitive' ? 'hsl(0 70% 50%)' :
                               intel.intelligence_type === 'market_trend' ? 'hsl(120 70% 50%)' :
                               'hsl(200 70% 50%)';

              return (
                <g key={`intel_${intel.id}`}>
                  <circle cx={pos.x} cy={pos.y} r="12" fill={typeColor} opacity="0.7" />
                  <text x={pos.x} y={pos.y} textAnchor="middle" dy="0.3em" fontSize="8" fill="white" fontWeight="bold">
                    I
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-accent opacity-80" />
              <span className="text-muted-foreground">Business Models</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(0 70% 50%)' }} />
              <span className="text-muted-foreground">Competitive</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(120 70% 50%)' }} />
              <span className="text-muted-foreground">Trend</span>
            </div>
          </div>
        </div>

        {/* Details Panel */}
        <div className="w-80 flex flex-col">
          {selectedConnection ? (
            <div className="glass-card rounded-2xl p-4 border border-border h-full overflow-y-auto">
              <h4 className="font-medium text-foreground mb-3">Connection Details</h4>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs font-bold text-accent mb-1">Business Model</p>
                  <p className="text-foreground">{selectedConnection.model_name}</p>
                </div>

                <div>
                  <p className="text-xs font-bold text-accent mb-1">Intelligence Signal</p>
                  <p className="text-foreground/80">{selectedConnection.intel_title}</p>
                </div>

                <div>
                  <p className="text-xs font-bold text-accent mb-1">Correlation Strength</p>
                  <div className="w-full bg-secondary/40 rounded h-3">
                    <div
                      className="bg-accent h-3 rounded"
                      style={{ width: `${selectedConnection.strength * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {(selectedConnection.strength * 100).toFixed(0)}/100
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-accent mb-1">Signal Type</p>
                  <p className="text-foreground/80 capitalize">{selectedConnection.intel_type}</p>
                </div>

                {selectedConnection.domains && (
                  <div>
                    <p className="text-xs font-bold text-accent mb-2">Domains</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedConnection.domains.split(',').slice(0, 3).map((domain, i) => (
                        <span key={i} className="text-[10px] px-2 py-1 rounded bg-secondary/40">
                          {domain.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-muted-foreground pt-2 border-t border-border italic">
                  This intelligence signal has {(selectedConnection.strength * 100).toFixed(0)}% impact on {selectedConnection.model_name}'s market position.
                </p>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-6 border border-border flex items-center justify-center h-full text-center">
              <p className="text-sm text-muted-foreground">Click a connection to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}