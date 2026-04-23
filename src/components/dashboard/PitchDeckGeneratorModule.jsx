import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Download, ExternalLink, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PitchDeckGeneratorModule() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);
  const [presentations, setPresentations] = useState({});
  const [investorName, setInvestorName] = useState('');

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      const allModels = await base44.entities.SavedModel.list();
      setModels(allModels);
    } catch (error) {
      console.error('Failed to load models:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDeck = async (modelId) => {
    setGenerating(modelId);
    try {
      const response = await base44.functions.invoke('generateInvestorPitchDeck', {
        modelId,
        investorName: investorName || 'Potential Investor',
      });

      setPresentations(prev => ({
        ...prev,
        [modelId]: {
          presentation_id: response.data.presentation_id,
          presentation_url: response.data.presentation_url,
          title: response.data.title,
        },
      }));
    } catch (error) {
      console.error('Failed to generate deck:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setGenerating(null);
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
          <TrendingUp className="w-5 h-5 text-accent" />
          <div>
            <h3 className="font-medium text-foreground">Investor Pitch Deck Generator</h3>
            <p className="text-xs text-muted-foreground">AI-generated decks from predictive modeling data, exported to Google Slides</p>
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs font-bold text-accent mb-2 block">Investor/Fund Name (Optional)</label>
          <input
            type="text"
            value={investorName}
            onChange={(e) => setInvestorName(e.target.value)}
            placeholder="e.g., Sequoia Capital, a16z..."
            className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent transition"
          />
        </div>
      </div>

      {/* Models List */}
      <div className="grid gap-3">
        {models.map(model => {
          const presentation = presentations[model.id];

          return (
            <div key={model.id} className="glass-card rounded-2xl p-5 border border-border">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{model.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{model.description?.substring(0, 80)}</p>
                </div>
              </div>

              {presentation ? (
                <div className="flex gap-2">
                  <a
                    href={presentation.presentation_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg btn-ivory text-sm font-medium transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in Google Slides
                  </a>
                  <Button
                    onClick={() => {
                      window.open(presentation.presentation_url, '_blank');
                    }}
                    variant="outline"
                    className="rounded-lg"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => generateDeck(model.id)}
                  disabled={generating === model.id}
                  className="btn-ivory rounded-lg w-full"
                >
                  {generating === model.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4" />
                      Generate Pitch Deck
                    </>
                  )}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}