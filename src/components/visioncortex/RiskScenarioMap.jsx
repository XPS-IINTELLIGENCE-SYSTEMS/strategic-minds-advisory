import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, AlertTriangle, ChevronRight } from 'lucide-react';

export default function RiskScenarioMap() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);

  useEffect(() => {
    fetchStressTestResults();
  }, []);

  const fetchStressTestResults = async () => {
    try {
      const allResults = await base44.entities.StressTestResult.list();
      setResults(allResults);
    } catch (error) {
      console.error('Failed to fetch stress test results:', error);
    } finally {
      setLoading(false);
    }
  };

  // Map scenario names to probability and impact scores
  const getScenarioCoordinates = (scenarioName) => {
    const scenarios = {
      'Global Recession': { probability: 0.35, impact: 0.95 },
      'Geopolitical Crisis': { probability: 0.25, impact: 0.85 },
      'Technology Disruption': { probability: 0.40, impact: 0.90 },
      'Regulatory Crackdown': { probability: 0.30, impact: 0.75 },
      'Supply Chain Collapse': { probability: 0.20, impact: 0.80 },
    };
    return scenarios[scenarioName] || { probability: 0.3, impact: 0.5 };
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 p-6 overflow-hidden">
      <div className="flex-1 min-h-0 flex gap-6">
        {/* Risk Map */}
        <div className="flex-1 flex flex-col">
          <h3 className="font-medium text-foreground mb-4">Black Swan Risk Matrix</h3>
          
          <div className="flex-1 relative bg-secondary/20 rounded-2xl border border-border overflow-hidden">
            {/* Quadrant Labels */}
            <div className="absolute top-2 left-2 text-[10px] text-muted-foreground font-mono">LOW PROB / HIGH IMPACT</div>
            <div className="absolute top-2 right-2 text-[10px] text-muted-foreground font-mono">HIGH PROB / HIGH IMPACT</div>
            <div className="absolute bottom-2 left-2 text-[10px] text-muted-foreground font-mono">LOW PROB / LOW IMPACT</div>
            <div className="absolute bottom-2 right-2 text-[10px] text-muted-foreground font-mono">HIGH PROB / LOW IMPACT</div>

            {/* Axes */}
            <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
              {/* Grid */}
              <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="hsl(var(--border))" strokeDasharray="4" opacity="0.3" />
              <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="hsl(var(--border))" strokeDasharray="4" opacity="0.3" />

              {/* Labels */}
              <text x="2%" y="8%" fontSize="10" fill="hsl(var(--muted-foreground))" opacity="0.5">PROBABILITY →</text>
              <text x="95%" y="95%" fontSize="10" fill="hsl(var(--muted-foreground))" opacity="0.5">IMPACT ↓</text>
            </svg>

            {/* Plot Points */}
            <div className="absolute inset-0">
              {results.map((result, idx) => {
                const coords = getScenarioCoordinates(result.scenario_name);
                const left = `${coords.probability * 100}%`;
                const top = `${coords.impact * 100}%`;
                const survived = result.survived;

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedResult(result)}
                    className={`absolute w-8 h-8 rounded-full border-2 transform -translate-x-1/2 -translate-y-1/2 transition cursor-pointer ${
                      survived
                        ? 'bg-green-500/20 border-green-400 hover:scale-125'
                        : 'bg-destructive/20 border-destructive hover:scale-125'
                    }`}
                    style={{ left, top }}
                    title={result.scenario_name}
                  >
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                      {survived ? '✓' : '✗'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-3">
            <span className="inline-block w-3 h-3 rounded-full bg-green-500/40 border border-green-400 mr-2" />
            Survived
            <span className="inline-block w-3 h-3 rounded-full bg-destructive/40 border border-destructive ml-4 mr-2" />
            Failed
          </p>
        </div>

        {/* Details Panel */}
        <div className="w-96 flex flex-col gap-4">
          {selectedResult ? (
            <>
              <div className="glass-card rounded-2xl p-4 border border-border">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-foreground">{selectedResult.scenario_name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{selectedResult.idea_id}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    selectedResult.survived ? 'bg-green-500/15 text-green-400' : 'bg-destructive/15 text-destructive'
                  }`}>
                    {selectedResult.survived ? 'SURVIVED' : 'FAILED'}
                  </span>
                </div>

                <p className="text-sm text-foreground mb-4">{selectedResult.verdict}</p>

                {/* Failure Points */}
                {selectedResult.failure_points && (
                  <div className="mb-4 pb-4 border-b border-border">
                    <h5 className="text-xs font-bold text-destructive mb-2">Critical Failure Points</h5>
                    <div className="space-y-1">
                      {selectedResult.failure_points.split(';').slice(0, 3).map((point, idx) => (
                        <p key={idx} className="text-xs text-foreground/80">• {point.trim()}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {selectedResult.recommendations && (
                  <div>
                    <h5 className="text-xs font-bold text-accent mb-2">Pivot Strategies</h5>
                    <div className="space-y-1">
                      {selectedResult.recommendations.split(';').slice(0, 3).map((rec, idx) => (
                        <p key={idx} className="text-xs text-foreground/80">• {rec.trim()}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="glass-card rounded-2xl p-6 border border-border flex flex-col items-center justify-center h-full text-center">
              <AlertTriangle className="w-8 h-8 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Click a scenario point to view details and pivot strategies</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}