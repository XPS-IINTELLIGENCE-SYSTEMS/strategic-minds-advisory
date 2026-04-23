import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Download, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PitchDeckGenerator() {
  const [ideas, setIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      const allIdeas = await base44.entities.VisionIdea.list();
      setIdeas(allIdeas.filter(idea => idea.status === 'validated'));
    } catch (error) {
      console.error('Failed to fetch ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePitchDeck = async (ideaId) => {
    setGenerating(true);
    try {
      const response = await base44.functions.invoke('generateInvestorPitchDeck', {
        ideaId,
      });

      // Download PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PitchDeck_${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Pitch deck generation failed:', error);
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
            <FileText className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Investor Pitch Deck Generator</h3>
            <p className="text-xs text-muted-foreground">Professional decks with financials and projections</p>
          </div>
        </div>
        <p className="text-sm text-foreground/80">
          Select a validated business idea to generate a professional pitch deck with financial models, market analysis, and investor-ready materials.
        </p>
      </div>

      {/* Ideas List */}
      <div className="grid gap-3">
        {ideas.length > 0 ? (
          ideas.map((idea) => (
            <div key={idea.id} className="glass-card rounded-2xl p-4 border border-border hover:border-accent/50 transition">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-foreground">{idea.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{idea.description?.substring(0, 100)}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/15 text-green-400">
                  {idea.domain}
                </span>
              </div>

              {idea.revenue_potential && (
                <p className="text-xs text-muted-foreground mb-3">
                  Potential: {idea.revenue_potential}
                </p>
              )}

              <Button
                onClick={() => generatePitchDeck(idea.id)}
                disabled={generating}
                className="btn-ivory rounded-lg w-full"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Generate Pitch Deck
                  </>
                )}
              </Button>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">No validated ideas yet. Create and validate ideas first.</p>
          </div>
        )}
      </div>
    </div>
  );
}