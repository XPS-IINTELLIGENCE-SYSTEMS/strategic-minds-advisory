import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Zap, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SimulationWithScraping() {
  const [pipelineConfig, setPipelineConfig] = useState({
    scrapeUrls: [],
    runSimulation: true,
    simulationType: 'Market Entry',
    analyzeIntelligence: true,
    generateReport: true,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [urlInput, setUrlInput] = useState('');

  const runFullPipeline = async () => {
    if (pipelineConfig.scrapeUrls.length === 0) return;
    
    setLoading(true);
    setResult(null);

    const res = await base44.functions.invoke('pipelineOrchestrator', {
      workspaceId: 'current',
      pipelineId: `pipeline-${Date.now()}`,
      config: {
        ...pipelineConfig,
        simulationVariables: {
          market_size: '500',
          target_share: '5',
          monthly_budget: '50',
          team_size: '10',
        },
        periods: 12,
      },
    });

    setResult(res.data);
    setLoading(false);
  };

  const addUrl = () => {
    if (urlInput.trim() && !pipelineConfig.scrapeUrls.includes(urlInput)) {
      setPipelineConfig(p => ({
        ...p,
        scrapeUrls: [...p.scrapeUrls, urlInput],
      }));
      setUrlInput('');
    }
  };

  const removeUrl = (url) => {
    setPipelineConfig(p => ({
      ...p,
      scrapeUrls: p.scrapeUrls.filter(u => u !== url),
    }));
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div>
          <h2 className="font-display text-2xl text-gradient-ivory">Scrape → Simulate → Analyze</h2>
          <p className="text-sm text-muted-foreground mt-1">Full intelligence pipeline in one execution</p>
        </div>

        {/* Config */}
        <div className="grid md:grid-cols-2 gap-5">
          <div className="p-5 rounded-2xl border border-border bg-card/50 space-y-4">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Pipeline Configuration</div>

            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Add URLs to Scrape</label>
              <div className="flex gap-2 mb-3">
                <input
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addUrl()}
                  placeholder="https://example.com"
                  className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent transition"
                />
                <button
                  onClick={addUrl}
                  className="px-4 py-2.5 rounded-xl bg-secondary/40 hover:bg-secondary text-sm transition"
                >
                  Add
                </button>
              </div>

              {pipelineConfig.scrapeUrls.length > 0 && (
                <div className="space-y-2">
                  {pipelineConfig.scrapeUrls.map(url => (
                    <div key={url} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/40 text-xs">
                      <span className="truncate">{url}</span>
                      <button
                        onClick={() => removeUrl(url)}
                        className="text-muted-foreground hover:text-red-400 transition text-lg leading-none"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card/50 space-y-4">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Options</div>

            {[
              { key: 'runSimulation', label: 'Run Simulation', icon: Zap },
              { key: 'analyzeIntelligence', label: 'Analyze Intelligence', icon: Sparkles },
              { key: 'generateReport', label: 'Generate Report', icon: Sparkles },
            ].map(({ key, label, icon: Icon }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pipelineConfig[key]}
                  onChange={e => setPipelineConfig(p => ({ ...p, [key]: e.target.checked }))}
                  className="w-4 h-4 rounded border-border bg-background cursor-pointer"
                />
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-accent" />
                  <span className="text-sm">{label}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={runFullPipeline}
          disabled={loading || pipelineConfig.scrapeUrls.length === 0}
          className="btn-ivory rounded-full w-full py-3.5 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Pipeline Running...</> : <><Zap className="w-4 h-4" /> Execute Pipeline</>}
        </button>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="p-5 rounded-2xl border border-green-500/30 bg-green-500/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-green-400">✓ Pipeline Complete</div>
                  <div className="text-xs text-muted-foreground">{result.stepsCompleted} steps</div>
                </div>
                <div className="text-xs text-foreground/80 leading-relaxed space-y-2">
                  {result.results.map((r, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1 flex-shrink-0" />
                      <span className="capitalize font-medium">{r.step}</span>: {r.result?.successCount ? `${r.result.successCount} URLs scraped` : 'Complete'}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}