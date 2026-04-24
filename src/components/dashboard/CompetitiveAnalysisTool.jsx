import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, TrendingDown, Shield, Target, AlertCircle, Copy, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ANALYSIS_TYPES = [
  { id: 'swot', label: 'SWOT Analysis', desc: 'Strengths, weaknesses, opportunities, threats' },
  { id: 'positioning', label: 'Positioning Map', desc: 'Market position vs competitors' },
  { id: 'feature_comparison', label: 'Feature Comparison', desc: 'Product features analysis' },
  { id: 'pricing_strategy', label: 'Pricing Analysis', desc: 'Price positioning intelligence' },
];

export default function CompetitiveAnalysisTool() {
  const [competitors, setCompetitors] = useState('');
  const [analysisType, setAnalysisType] = useState('swot');
  const [market, setMarket] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [copied, setCopied] = useState(false);

  const runAnalysis = async () => {
    if (!competitors.trim() || !market.trim()) return;

    setAnalyzing(true);
    setAnalysis(null);

    try {
      const res = await base44.functions.invoke('aiCompetitiveAnalysis', {
        competitors: competitors.split(',').map(c => c.trim()),
        analysisType,
        market,
      });

      setAnalysis(res.data);
    } catch (error) {
      console.error('Analysis failed:', error);
    }

    setAnalyzing(false);
  };

  const copyAnalysis = () => {
    if (!analysis) return;
    const text = JSON.stringify(analysis, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-gradient-ivory">Competitive Intelligence</h2>
        <p className="text-sm text-muted-foreground mt-1">AI-powered competitive analysis</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="p-5 rounded-2xl border border-border bg-card/50 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 block">
              Competitors (comma-separated)
            </label>
            <textarea
              value={competitors}
              onChange={e => setCompetitors(e.target.value)}
              placeholder="e.g., Salesforce, HubSpot, Pipedrive"
              rows={3}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition resize-none"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 block">
              Market/Industry
            </label>
            <input
              value={market}
              onChange={e => setMarket(e.target.value)}
              placeholder="e.g., AI consulting, SaaS"
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3 block">
              Analysis Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ANALYSIS_TYPES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setAnalysisType(t.id)}
                  className={`text-left p-3 rounded-lg border text-xs transition ${
                    analysisType === t.id
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border bg-secondary/30 text-foreground/70 hover:bg-secondary'
                  }`}
                >
                  <div className="font-medium">{t.label}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={runAnalysis}
            disabled={analyzing || !competitors.trim() || !market.trim()}
            className="w-full py-3 rounded-xl bg-accent/15 text-accent border border-accent font-medium text-sm hover:bg-accent/25 transition disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Analyzing…
              </>
            ) : (
              <>
                <Target className="w-4 h-4" /> Run Analysis
              </>
            )}
          </button>
        </div>

        {/* Results Panel */}
        <AnimatePresence>
          {analysis && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-5 rounded-2xl border border-border bg-card/50 space-y-4 max-h-96 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-accent">{analysis.title || 'Analysis Results'}</h3>
                <button
                  onClick={copyAnalysis}
                  className="p-1.5 rounded-lg hover:bg-secondary transition"
                >
                  {copied ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>

              {/* SWOT Analysis */}
              {analysisType === 'swot' && analysis.swot && (
                <div className="space-y-3">
                  {['strengths', 'weaknesses', 'opportunities', 'threats'].map(category => (
                    <div key={category} className="p-3 rounded-lg bg-secondary/40 border border-border/50">
                      <div className="text-xs uppercase tracking-[0.2em] text-accent mb-2 font-medium">
                        {category}
                      </div>
                      <ul className="space-y-1">
                        {(analysis.swot[category] || []).map((item, i) => (
                          <li key={i} className="text-xs text-foreground/80 flex items-start gap-2">
                            <span className="text-accent mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Positioning Map */}
              {analysisType === 'positioning' && analysis.positioning && (
                <div className="space-y-2">
                  {Object.entries(analysis.positioning).map(([competitor, position]) => (
                    <div key={competitor} className="text-xs">
                      <div className="font-medium text-foreground">{competitor}</div>
                      <div className="text-muted-foreground mt-1">{position}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Feature Comparison */}
              {analysisType === 'feature_comparison' && analysis.features && (
                <div className="space-y-2 text-xs">
                  {analysis.features.map((feature, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded bg-secondary/20">
                      <span>{feature.name}</span>
                      <span className="text-muted-foreground">{feature.count} competitors</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Insights */}
              {analysis.insights && (
                <div className="pt-3 border-t border-border/50">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 font-medium">
                    Key Insights
                  </div>
                  <p className="text-xs text-foreground/80 leading-relaxed">{analysis.insights}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Insights */}
      {analysis && (
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: Shield, label: 'Competitive Position', value: analysis.positionScore },
            { icon: TrendingDown, label: 'Market Gap', value: analysis.marketGap },
            { icon: AlertCircle, label: 'Risk Level', value: analysis.riskLevel },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="p-4 rounded-xl border border-border bg-secondary/40 text-center">
                <Icon className="w-5 h-5 text-accent mx-auto mb-2" />
                <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
                <div className="text-sm font-medium text-foreground">{stat.value}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}