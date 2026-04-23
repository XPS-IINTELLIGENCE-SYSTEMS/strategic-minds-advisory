import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { TrendingUp, Loader2, AlertTriangle, CheckCircle2, Target, BarChart3 } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import PullToRefresh from '@/components/common/PullToRefresh';

const PRED_TYPES = [
  'Market Trends', 'Revenue Forecast', 'Customer Behavior',
  'Competitive Landscape', 'Technology Adoption', 'IPO/Exit Timing',
];

const HORIZONS = ['3 months', '6 months', '12 months', '18 months', '24 months', '3 years', '5 years'];

const PROB_COLOR = (p) => {
  if (p >= 0.6) return 'text-green-400 bg-green-400/10';
  if (p >= 0.4) return 'text-yellow-400 bg-yellow-400/10';
  return 'text-red-400 bg-red-400/10';
};

export default function PredictionTool() {
  const [type, setType] = useState('Market Trends');
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [horizon, setHorizon] = useState('12 months');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const run = async () => {
    if (!topic) return;
    setLoading(true);
    setResult(null);
    const res = await base44.functions.invoke('runPrediction', { topic, context, horizon, predictionType: type });
    setResult(res.data);
    setLoading(false);
  };

  const contentRef = useRef(null);

  return (
    <PullToRefresh onRefresh={() => run()}>
      <div ref={contentRef} className="h-full overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div>
          <h2 className="font-display text-2xl text-gradient-ivory">Prediction Engine</h2>
          <p className="text-sm text-muted-foreground mt-1">AI-powered forecasting with scenario analysis</p>
        </div>

        {/* Config */}
        <div className="grid md:grid-cols-2 gap-5">
          <div className="p-5 rounded-2xl border border-border bg-card/50 space-y-4">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3 block">Prediction Type</label>
              <div className="grid grid-cols-2 gap-2">
                {PRED_TYPES.map(t => (
                  <button key={t} onClick={() => setType(t)}
                    className={`text-left text-xs px-3 py-2.5 rounded-xl border transition-all ${
                      type === t ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-secondary/30 hover:bg-secondary text-foreground/70'
                    }`}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Time Horizon</label>
              <div className="flex flex-wrap gap-2">
                {HORIZONS.map(h => (
                  <button key={h} onClick={() => setHorizon(h)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      horizon === h ? 'border-accent text-accent bg-accent/10' : 'border-border text-muted-foreground hover:text-foreground'
                    }`}>{h}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card/50 space-y-4">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Prediction Topic *</label>
              <input value={topic} onChange={e => setTopic(e.target.value)}
                placeholder="e.g. AI SaaS market in healthcare"
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Additional Context</label>
              <textarea value={context} onChange={e => setContext(e.target.value)} rows={4}
                placeholder="Company stage, current metrics, specific angles to explore..."
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition resize-none" />
            </div>
          </div>
        </div>

        <button onClick={run} disabled={loading || !topic}
          className="btn-ivory rounded-full w-full py-3.5 text-sm font-medium inline-flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-60">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating Prediction…</> : <><TrendingUp className="w-4 h-4" /> Generate Prediction</>}
        </button>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              {/* Headline */}
              <div className="p-6 rounded-2xl border border-accent/30 bg-accent/5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-accent mb-3">Prediction</div>
                    <h3 className="font-display text-2xl text-gradient-ivory">{result.headline}</h3>
                    <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{result.verdict}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-sm font-medium flex-shrink-0 ${PROB_COLOR(result.probability)}`}>
                    {Math.round(result.probability * 100)}% probability
                  </div>
                </div>
              </div>

              {/* Scenarios */}
              <div className="grid md:grid-cols-3 gap-4">
                {(result.scenarios || []).map((s, i) => (
                  <div key={i} className={`p-5 rounded-2xl border bg-card/50 ${
                    s.name?.includes('Bull') ? 'border-green-500/30' : s.name?.includes('Bear') ? 'border-red-500/30' : 'border-border'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">{s.name}</span>
                      <span className={`text-xs px-2.5 py-1 rounded-full ${PROB_COLOR(s.probability)}`}>
                        {Math.round(s.probability * 100)}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">{s.description}</p>
                    <div className="font-display text-xl text-gradient-accent">{s.projectedValue}</div>
                    <div className="mt-3 space-y-1">
                      {(s.keyDrivers || []).map((d, j) => (
                        <div key={j} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                          <div className="w-1 h-1 rounded-full bg-accent" />{d}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Key Metrics */}
              {result.keyMetrics?.length > 0 && (
                <div className="p-5 rounded-2xl border border-border bg-card/50">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Key Metrics Forecast</div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {result.keyMetrics.map((m, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 border border-border/50">
                        <div>
                          <div className="text-xs text-muted-foreground">{m.metric}</div>
                          <div className="text-sm mt-0.5">{m.current} → <span className="text-accent">{m.predicted}</span></div>
                        </div>
                        <span className={`text-sm font-medium ${m.change?.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{m.change}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Signals + Catalysts */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border border-border bg-card/50">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Market Signals</div>
                  <div className="space-y-3">
                    {(result.signals || []).map((s, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                          s.direction === 'bullish' ? 'bg-green-400' : s.direction === 'bearish' ? 'bg-red-400' : 'bg-yellow-400'
                        }`} />
                        <div>
                          <div className="text-sm font-medium">{s.signal}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{s.description}</div>
                        </div>
                        <span className={`text-[10px] uppercase tracking-wider flex-shrink-0 ${
                          s.strength === 'high' ? 'text-green-400' : s.strength === 'medium' ? 'text-yellow-400' : 'text-red-400'
                        }`}>{s.strength}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-5 rounded-2xl border border-border bg-card/50">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Catalysts</div>
                  <div className="space-y-2">
                    {(result.catalysts || []).map((c, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                        <span className="text-foreground/80">{c}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Key Risks</div>
                    {(result.risks || []).map((r, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm mt-1.5">
                        <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <span className="text-foreground/80">{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </PullToRefresh>
  );
}