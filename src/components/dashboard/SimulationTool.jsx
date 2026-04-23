import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Zap, Loader2, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Save } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import PullToRefresh from '@/components/common/PullToRefresh';

const SIM_TYPES = [
  'Market Entry', 'Financial Model', 'Product Launch', 'Pricing Strategy',
  'Competitive Battle', 'Customer Journey', 'Churn Prevention', 'Revenue Forecast',
];

const VARIABLE_TEMPLATES = {
  'Market Entry': [
    { key: 'market_size', label: 'Total Market Size ($M)', value: '500' },
    { key: 'target_share', label: 'Target Market Share (%)', value: '5' },
    { key: 'monthly_budget', label: 'Monthly Budget ($K)', value: '50' },
    { key: 'team_size', label: 'Team Size', value: '10' },
    { key: 'competitive_intensity', label: 'Competitive Intensity (1-10)', value: '7' },
  ],
  'Financial Model': [
    { key: 'starting_mrr', label: 'Starting MRR ($)', value: '10000' },
    { key: 'growth_rate', label: 'Monthly Growth Rate (%)', value: '15' },
    { key: 'churn_rate', label: 'Monthly Churn Rate (%)', value: '3' },
    { key: 'gross_margin', label: 'Gross Margin (%)', value: '70' },
    { key: 'burn_rate', label: 'Monthly Burn ($K)', value: '80' },
  ],
  'Product Launch': [
    { key: 'waitlist_size', label: 'Pre-launch Waitlist', value: '2000' },
    { key: 'activation_rate', label: 'Day-1 Activation Rate (%)', value: '40' },
    { key: 'week1_retention', label: 'Week-1 Retention (%)', value: '60' },
    { key: 'viral_coefficient', label: 'Viral Coefficient (K-factor)', value: '0.3' },
    { key: 'launch_budget', label: 'Launch Budget ($K)', value: '30' },
  ],
};

export default function SimulationTool() {
  const [simType, setSimType] = useState('Market Entry');
  const [periods, setPeriods] = useState(12);
  const [variables, setVariables] = useState(VARIABLE_TEMPLATES['Market Entry']);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleTypeChange = (type) => {
    setSimType(type);
    setVariables(VARIABLE_TEMPLATES[type] || VARIABLE_TEMPLATES['Market Entry']);
    setResult(null);
  };

  const setVar = (key, value) => {
    setVariables(v => v.map(item => item.key === key ? { ...item, value } : item));
  };

  const run = async () => {
    setLoading(true);
    setResult(null);
    const varsObj = Object.fromEntries(variables.map(v => [v.key, v.value]));
    const res = await base44.functions.invoke('runSimulation', {
      variables: varsObj,
      simulationType: simType,
      periods,
    });
    setResult(res.data);
    setLoading(false);
  };

  const save = async () => {
    if (!result) return;
    await base44.entities.SimulationResult.create({
      title: `${simType} Simulation`,
      type: simType,
      variables: JSON.stringify(Object.fromEntries(variables.map(v => [v.key, v.value]))),
      result: JSON.stringify(result),
      summary: result.summary,
      confidence: result.confidence,
    });
  };

  const trendIcon = result?.trend === 'up' ? TrendingUp : TrendingDown;
  const TrendIcon = trendIcon;

  const contentRef = useRef(null);

  return (
    <PullToRefresh onRefresh={() => run()}>
      <div ref={contentRef} className="h-full overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl text-gradient-ivory">Simulation Engine</h2>
            <p className="text-sm text-muted-foreground mt-1">Model outcomes before committing resources</p>
          </div>
          {result && (
            <button onClick={save} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-secondary/40 hover:bg-secondary text-sm transition">
              <Save className="w-4 h-4" /> Save Result
            </button>
          )}
        </div>

        {/* Config */}
        <div className="grid md:grid-cols-2 gap-5">
          <div className="p-5 rounded-2xl border border-border bg-card/50">
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3 block">Simulation Type</label>
            <div className="grid grid-cols-2 gap-2">
              {SIM_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => handleTypeChange(t)}
                  className={`text-left text-xs px-3 py-2.5 rounded-xl border transition-all ${
                    simType === t ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-secondary/30 hover:bg-secondary text-foreground/70'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="mt-4">
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Projection Periods: {periods}</label>
              <input type="range" min={3} max={36} value={periods} onChange={e => setPeriods(+e.target.value)}
                className="w-full accent-amber-500" />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>3 mo</span><span>36 mo</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card/50">
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3 block">Variables</label>
            <div className="space-y-3">
              {variables.map(v => (
                <div key={v.key} className="flex items-center gap-3">
                  <label className="text-xs text-muted-foreground flex-1 min-w-0 truncate">{v.label}</label>
                  <input
                    type="text"
                    value={v.value}
                    onChange={e => setVar(v.key, e.target.value)}
                    className="w-24 bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-accent text-right"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={run}
          disabled={loading}
          className="btn-ivory rounded-full w-full py-3.5 text-sm font-medium inline-flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-60"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Running Simulation…</> : <><Zap className="w-4 h-4" /> Run Simulation</>}
        </button>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl border border-border bg-card/50">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Confidence</div>
                  <div className="font-display text-3xl text-gradient-accent">{Math.round(result.confidence * 100)}%</div>
                </div>
                <div className="p-4 rounded-2xl border border-border bg-card/50">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Trend</div>
                  <div className="flex items-center gap-2 mt-2">
                    <TrendIcon className={`w-5 h-5 ${result.trend === 'up' ? 'text-green-400' : 'text-red-400'}`} />
                    <span className="font-medium capitalize">{result.trend}</span>
                  </div>
                </div>
                <div className="p-4 rounded-2xl border border-border bg-card/50">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Periods</div>
                  <div className="font-display text-3xl">{result.projections?.length || 0}</div>
                </div>
              </div>

              {/* Chart */}
              {result.projections?.length > 0 && (
                <div className="p-5 rounded-2xl border border-border bg-card/50">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Projection Chart</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={result.projections}>
                      <defs>
                        <linearGradient id="optimistic" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(36 55% 62%)" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="hsl(36 55% 62%)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="base" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(40 30% 98%)" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="hsl(40 30% 98%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(30 6% 15%)" />
                      <XAxis dataKey="period" tick={{ fontSize: 10, fill: 'hsl(30 10% 60%)' }} />
                      <YAxis tick={{ fontSize: 10, fill: 'hsl(30 10% 60%)' }} />
                      <Tooltip contentStyle={{ background: 'hsl(30 8% 8%)', border: '1px solid hsl(30 6% 15%)', borderRadius: 12, fontSize: 12 }} />
                      <Area type="monotone" dataKey="optimistic" stroke="hsl(36 55% 62%)" fill="url(#optimistic)" strokeDasharray="4 2" strokeWidth={1.5} />
                      <Area type="monotone" dataKey="value" stroke="hsl(40 30% 98%)" fill="url(#base)" strokeWidth={2} />
                      <Area type="monotone" dataKey="pessimistic" stroke="hsl(0 70% 50%)" fill="none" strokeDasharray="4 2" strokeWidth={1.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Summary */}
              <div className="p-5 rounded-2xl border border-border bg-card/50">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Executive Summary</div>
                <p className="text-sm leading-relaxed">{result.summary}</p>
              </div>

              {/* Insights + Risks + Recommendations */}
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { label: 'Key Insights', items: result.insights, icon: CheckCircle2, color: 'text-green-400' },
                  { label: 'Risks', items: result.risks, icon: AlertTriangle, color: 'text-yellow-400' },
                  { label: 'Recommendations', items: result.recommendations, icon: Zap, color: 'text-accent' },
                ].map(({ label, items, icon: Icon, color }) => (
                  <div key={label} className="p-5 rounded-2xl border border-border bg-card/50">
                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">{label}</div>
                    <ul className="space-y-2">
                      {(items || []).map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs">
                          <Icon className={`w-3.5 h-3.5 ${color} mt-0.5 flex-shrink-0`} />
                          <span className="text-foreground/80">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </PullToRefresh>
  );
}