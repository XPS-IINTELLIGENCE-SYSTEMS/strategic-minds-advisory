import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, BookOpen, Sparkles, CheckCircle2, Save, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIPlaybookGenerator({ idea }) {
  const [loading, setLoading] = useState(false);
  const [playbook, setPlaybook] = useState(null);
  const [refining, setRefining] = useState(false);
  const [refinementPrompt, setRefinementPrompt] = useState('');
  const [stressTestData, setStressTestData] = useState(null);
  const [intelligenceData, setIntelligenceData] = useState(null);

  useEffect(() => {
    if (idea) {
      loadContextData();
    }
  }, [idea]);

  const loadContextData = async () => {
    try {
      // Load recent stress tests
      const stressTests = await base44.entities.StressTestResult.filter(
        { idea_id: idea.id },
        '-created_at',
        5
      );
      setStressTestData(stressTests);

      // Load market intelligence
      const intelligence = await base44.entities.StrategicIntelligence.list('-created_at', 10);
      setIntelligenceData(intelligence);
    } catch (error) {
      console.error('Failed to load context:', error);
    }
  };

  const generatePlaybook = async () => {
    if (!idea) return;
    setLoading(true);

    try {
      const res = await base44.functions.invoke('generateAIPlaybook', {
        ideaId: idea.id,
        ideaTitle: idea.title,
        ideaDescription: idea.description,
        businessModel: idea.business_model,
        stressTests: stressTestData || [],
        intelligence: intelligenceData || [],
      });

      setPlaybook(res.data);
    } catch (error) {
      console.error('Generation failed:', error);
    }

    setLoading(false);
  };

  const refinePlaybook = async () => {
    if (!playbook || !refinementPrompt.trim()) return;
    setRefining(true);

    try {
      const res = await base44.functions.invoke('refineAIPlaybook', {
        playbookId: playbook.id,
        currentPlaybook: playbook,
        refinementPrompt,
      });

      setPlaybook(res.data);
      setRefinementPrompt('');
    } catch (error) {
      console.error('Refinement failed:', error);
    }

    setRefining(false);
  };

  const savePlaybook = async () => {
    if (!playbook) return;

    try {
      await base44.entities.StrategyPlaybook.create({
        title: playbook.title || 'Generated Playbook',
        description: playbook.description,
        creator_email: (await base44.auth.me())?.email,
        source_scenario: idea.title,
        pivot_strategy: playbook.strategy,
        implementation_steps: JSON.stringify(playbook.steps || []),
        expected_outcomes: playbook.outcomes,
        success_metrics: playbook.metrics,
      });

      alert('✓ Playbook saved to library');
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-xl text-gradient-ivory flex items-center gap-2">
          <BookOpen className="w-5 h-5" /> Collaborative Playbook Generator
        </h3>
        <p className="text-xs text-muted-foreground mt-1">AI-powered strategic playbook refinement</p>
      </div>

      {!playbook ? (
        <div className="p-6 rounded-2xl border border-border bg-card/50 text-center space-y-4">
          <div className="w-12 h-12 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Generate Strategic Playbook</p>
            <p className="text-xs text-muted-foreground mb-4">
              AI analyzes stress tests and market intelligence to suggest optimal strategies
            </p>
          </div>
          <button
            onClick={generatePlaybook}
            disabled={loading || !idea}
            className="px-4 py-2.5 rounded-lg bg-accent/15 text-accent border border-accent text-sm font-medium hover:bg-accent/25 transition disabled:opacity-40 flex items-center justify-center gap-2 mx-auto"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Generating…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Generate Playbook
              </>
            )}
          </button>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Playbook Content */}
            <div className="p-5 rounded-2xl border border-border bg-card/50 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-foreground">{playbook.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{playbook.description}</p>
                </div>
                <button
                  onClick={savePlaybook}
                  className="p-1.5 rounded-lg hover:bg-secondary transition text-accent"
                >
                  <Save className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-3 border-t border-border/50 space-y-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-accent mb-2 font-medium">
                    Strategic Direction
                  </div>
                  <p className="text-xs text-foreground/80 leading-relaxed">{playbook.strategy}</p>
                </div>

                {playbook.steps && playbook.steps.length > 0 && (
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-accent mb-2 font-medium">
                      Implementation Steps
                    </div>
                    <ol className="space-y-1">
                      {playbook.steps.map((step, i) => (
                        <li key={i} className="text-xs text-foreground/80 flex items-start gap-2">
                          <span className="text-accent font-medium">{i + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {playbook.outcomes && (
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-accent mb-2 font-medium">
                      Expected Outcomes
                    </div>
                    <p className="text-xs text-foreground/80">{playbook.outcomes}</p>
                  </div>
                )}

                {playbook.metrics && (
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-accent mb-2 font-medium">
                      Success Metrics
                    </div>
                    <p className="text-xs text-foreground/80">{playbook.metrics}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Refinement */}
            <div className="p-5 rounded-2xl border border-border bg-card/50 space-y-3">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">
                Refine Strategy
              </div>
              <div className="flex gap-2">
                <input
                  value={refinementPrompt}
                  onChange={e => setRefinementPrompt(e.target.value)}
                  placeholder="e.g., Add focus on sustainability, consider B2B markets..."
                  className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-accent transition"
                />
                <button
                  onClick={refinePlaybook}
                  disabled={refining || !refinementPrompt.trim()}
                  className="px-3 py-2 rounded-lg bg-accent/15 text-accent border border-accent text-xs font-medium hover:bg-accent/25 transition disabled:opacity-40 flex items-center gap-1"
                >
                  {refining ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3" />
                  )}
                  Refine
                </button>
              </div>
            </div>

            {/* Generate New */}
            <button
              onClick={() => setPlaybook(null)}
              className="w-full py-2 rounded-lg border border-border bg-secondary/30 hover:bg-secondary text-xs font-medium transition"
            >
              Generate New Playbook
            </button>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}