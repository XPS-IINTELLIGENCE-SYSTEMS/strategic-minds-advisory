import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Zap, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CompetitorBattlecard() {
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [battlecard, setBattlecard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const allModels = await base44.entities.SavedModel.list();
      setModels(allModels);
    } catch (error) {
      console.error('Failed to fetch models:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateBattlecard = async (modelId) => {
    setGenerating(true);
    try {
      const response = await base44.functions.invoke('generateCompetitorBattlecard', {
        modelId,
      });
      setBattlecard(response.data.battlecard);
      setSelectedModel(modelId);
    } catch (error) {
      console.error('Failed to generate battlecard:', error);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 p-6 overflow-y-auto">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 border border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center">
            <Zap className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Competitor Battlecard</h3>
            <p className="text-xs text-muted-foreground">Real-time competitive positioning for investor meetings</p>
          </div>
        </div>
      </div>

      {/* Model Selection */}
      <div className="grid gap-3">
        {models.map(model => (
          <button
            key={model.id}
            onClick={() => generateBattlecard(model.id)}
            className="glass-card rounded-2xl p-4 border border-border hover:border-accent/50 transition text-left"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-foreground">{model.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">{model.description?.substring(0, 80)}</p>
              </div>
              <Button
                disabled={generating && selectedModel === model.id}
                className="btn-ivory rounded-lg"
                size="sm"
              >
                {generating && selectedModel === model.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </button>
        ))}
      </div>

      {/* Battlecard Display */}
      {battlecard && (
        <div className="glass-card rounded-2xl p-6 border border-border space-y-6">
          <h4 className="font-medium text-foreground text-lg">Competitive Analysis</h4>

          {/* Competitors */}
          {battlecard.competitors && (
            <div>
              <h5 className="text-sm font-bold text-accent mb-3">Top Competitors</h5>
              <div className="space-y-3">
                {battlecard.competitors.map((comp, idx) => (
                  <div key={idx} className="px-3 py-2.5 rounded-lg bg-secondary/30 border border-border">
                    <p className="text-sm font-medium text-foreground">{comp.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">Funding: {comp.funding}</p>
                    {comp.key_features && (
                      <div className="flex gap-1.5 mt-2">
                        {comp.key_features.slice(0, 3).map((feat, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 rounded bg-secondary/40">
                            {feat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advantages */}
          {battlecard.advantages && (
            <div>
              <h5 className="text-sm font-bold text-green-400 mb-3">Our Competitive Advantages</h5>
              <ul className="space-y-1">
                {battlecard.advantages.map((adv, idx) => (
                  <li key={idx} className="text-sm text-foreground">✓ {adv}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Vulnerabilities */}
          {battlecard.vulnerabilities && (
            <div>
              <h5 className="text-sm font-bold text-destructive mb-3">Vulnerabilities</h5>
              <ul className="space-y-1">
                {battlecard.vulnerabilities.map((vuln, idx) => (
                  <li key={idx} className="text-sm text-foreground">⚠ {vuln}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Positioning */}
          {battlecard.gtm_statement && (
            <div>
              <h5 className="text-sm font-bold text-accent mb-3">Go-to-Market Statement</h5>
              <p className="text-sm text-foreground/80">{battlecard.gtm_statement}</p>
            </div>
          )}

          {/* Investor Talking Points */}
          {battlecard.investor_talking_points && (
            <div>
              <h5 className="text-sm font-bold text-accent mb-3">Top Investor Talking Points</h5>
              <ul className="space-y-1">
                {battlecard.investor_talking_points.map((point, idx) => (
                  <li key={idx} className="text-sm text-foreground">💡 {point}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Export */}
          <Button className="btn-ivory rounded-lg w-full">
            <Download className="w-4 h-4" />
            Export Battlecard
          </Button>
        </div>
      )}
    </div>
  );
}