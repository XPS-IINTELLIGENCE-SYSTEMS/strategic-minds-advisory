import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';
import { motion } from 'framer-motion';
import CompetitorBenchmarkOverlay from './CompetitorBenchmarkOverlay';
import PresentationGenerator from './PresentationGenerator';
import { BarChart3, Loader2, RefreshCw, TrendingUp, TrendingDown, DollarSign, Users, Percent } from 'lucide-react';

const SLIDER_CONFIG = [
  { key: 'marketGrowth',   label: 'Market Growth Rate',    min: -20, max: 60,  step: 1,  unit: '%',  default: 15 },
  { key: 'churnRate',      label: 'Annual Churn Rate',     min: 1,   max: 80,  step: 1,  unit: '%',  default: 20 },
  { key: 'cac',            label: 'CAC ($)',                min: 10,  max: 5000,step: 10, unit: '$',  default: 200 },
  { key: 'convRate',       label: 'Conversion Rate',       min: 0.1, max: 20,  step: 0.1,unit: '%',  default: 3 },
  { key: 'virality',       label: 'Virality Coefficient',  min: 0,   max: 2,   step: 0.01,unit: 'k', default: 0.4 },
  { key: 'avgRevPerUser',  label: 'Avg Revenue / User ($)', min: 1,  max: 1000,step: 1,  unit: '$',  default: 50 },
];

function generateProjection(params, simData) {
  const { marketGrowth, churnRate, cac, convRate, virality, avgRevPerUser } = params;
  const baseUsers = simData?.prediction?.initial_users || 500;
  const months = 36;
  const data = [];

  let users = baseUsers;
  let cumCost = 0;

  for (let m = 1; m <= months; m++) {
    const newOrganic = users * (marketGrowth / 100 / 12);
    const newViral = users * virality * 0.1;
    const newPaid = (cumCost * 0.02) / Math.max(cac, 1);
    const churned = users * (churnRate / 100 / 12);

    users = Math.max(0, users + newOrganic + newViral + newPaid - churned);
    const monthlyRev = users * avgRevPerUser;
    const marketingSpend = monthlyRev * 0.2;
    cumCost += marketingSpend;

    const ltv = avgRevPerUser / Math.max(churnRate / 100, 0.01);
    const ltvCac = ltv / Math.max(cac, 1);
    const grossMargin = Math.min(85, 40 + ltvCac * 5);

    data.push({
      month: m,
      label: `M${m}`,
      users: Math.round(users),
      revenue: Math.round(monthlyRev / 1000),  // $K
      churn: Math.round(churned),
      cac: Math.round(cac),
      ltv: Math.round(ltv),
      ltvCac: parseFloat(ltvCac.toFixed(2)),
      grossMargin: Math.round(grossMargin),
      cumRevenue: Math.round(data.reduce((s, d) => s + d.revenue, 0) + monthlyRev / 1000),
    });
  }
  return data;
}

function Slider({ config, value, onChange }) {
  const pct = ((value - config.min) / (config.max - config.min)) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs text-muted-foreground">{config.label}</label>
        <span className="text-xs font-medium text-accent">{config.unit === '$' ? `$${value}` : `${value}${config.unit}`}</span>
      </div>
      <input
        type="range" min={config.min} max={config.max} step={config.step}
        value={value} onChange={e => onChange(config.key, parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, hsl(var(--accent)) ${pct}%, hsl(var(--secondary)) ${pct}%)`
        }}
      />
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-xl text-xs space-y-1">
      <div className="font-medium text-muted-foreground mb-1.5">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-medium">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function IdeaAnalytics() {
  const [ideas, setIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState(() => Object.fromEntries(SLIDER_CONFIG.map(s => [s.key, s.default])));
  const [activeChart, setActiveChart] = useState('revenue');
  const [showDeckGen, setShowDeckGen] = useState(false);

  useEffect(() => {
    base44.entities.VisionIdea.list('-validation_score', 50).then(data => {
      setIdeas(data.filter(i => i.simulation_result));
      if (data.length > 0) setSelectedIdea(data[0]);
      setLoading(false);
    });
  }, []);

  const simData = useMemo(() => {
    if (!selectedIdea?.simulation_result) return null;
    try { return JSON.parse(selectedIdea.simulation_result); } catch { return null; }
  }, [selectedIdea]);

  const projection = useMemo(() => generateProjection(params, simData), [params, simData]);

  const updateParam = (key, val) => setParams(p => ({ ...p, [key]: val }));

  const y3Revenue = projection[35]?.cumRevenue || 0;
  const y1Users = projection[11]?.users || 0;
  const finalLtvCac = projection[35]?.ltvCac || 0;
  const avgChurnLoss = Math.round(projection.reduce((s, d) => s + d.churn, 0) / 36);
  const viabilityScore = Math.min(100, Math.round(
    (finalLtvCac > 3 ? 30 : finalLtvCac * 10) +
    (y3Revenue > 1000 ? 30 : y3Revenue / 33) +
    (params.churnRate < 10 ? 20 : Math.max(0, 20 - params.churnRate)) +
    (params.convRate > 2 ? 20 : params.convRate * 10)
  ));

  const CHART_DEFS = {
    revenue: {
      label: 'Revenue Growth ($K)',
      chart: (
        <AreaChart data={projection}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
          <XAxis dataKey="label" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} interval={5} />
          <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="revenue" name="Monthly Rev $K" stroke="hsl(var(--accent))" fill="url(#revGrad)" strokeWidth={2} />
          <Area type="monotone" dataKey="cumRevenue" name="Cumulative $K" stroke="#60a5fa" fill="none" strokeWidth={1.5} strokeDasharray="4 2" />
        </AreaChart>
      ),
    },
    users: {
      label: 'User Growth',
      chart: (
        <AreaChart data={projection}>
          <defs>
            <linearGradient id="usrGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#818cf8" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
          <XAxis dataKey="label" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} interval={5} />
          <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="users" name="Active Users" stroke="#818cf8" fill="url(#usrGrad)" strokeWidth={2} />
          <Area type="monotone" dataKey="churn" name="Monthly Churn" stroke="#f87171" fill="none" strokeWidth={1.5} />
        </AreaChart>
      ),
    },
    cac: {
      label: 'Unit Economics (LTV:CAC)',
      chart: (
        <LineChart data={projection}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
          <XAxis dataKey="label" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} interval={5} />
          <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={3} stroke="#4ade80" strokeDasharray="4 2" label={{ value: 'Healthy (3:1)', fontSize: 9, fill: '#4ade80' }} />
          <Line type="monotone" dataKey="ltvCac" name="LTV:CAC" stroke="#4ade80" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="grossMargin" name="Gross Margin %" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
        </LineChart>
      ),
    },
  };

  if (loading) return (
    <div className="flex justify-center items-center h-full">
      <Loader2 className="w-6 h-6 animate-spin text-accent" />
    </div>
  );

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left — controls */}
      <div className="w-64 flex-shrink-0 border-r border-border flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">Idea Analytics</span>
          </div>
          {/* Idea selector */}
          <select value={selectedIdea?.id || ''} onChange={e => setSelectedIdea(ideas.find(i => i.id === e.target.value) || null)}
            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs outline-none focus:border-accent transition">
            {ideas.map(i => <option key={i.id} value={i.id}>{i.title}</option>)}
            {ideas.length === 0 && <option value="">Simulate ideas first…</option>}
          </select>
        </div>

        {/* Viability score */}
        {selectedIdea && (
          <div className="p-4 border-b border-border">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Viability Score</div>
            <div className="flex items-end gap-2 mb-2">
              <span className={`font-display text-3xl ${viabilityScore >= 70 ? 'text-green-400' : viabilityScore >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                {viabilityScore}
              </span>
              <span className="text-muted-foreground text-sm mb-1">/100</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <motion.div className="h-full rounded-full" key={viabilityScore}
                initial={{ width: 0 }} animate={{ width: `${viabilityScore}%` }} transition={{ duration: 0.5 }}
                style={{ background: viabilityScore >= 70 ? '#4ade80' : viabilityScore >= 40 ? '#f59e0b' : '#f87171' }} />
            </div>
          </div>
        )}

        {/* Sliders */}
        <div className="p-4 space-y-4 flex-1">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Market Conditions</div>
          {SLIDER_CONFIG.map(s => (
            <Slider key={s.key} config={s} value={params[s.key]} onChange={updateParam} />
          ))}
        </div>
      </div>

      {/* Right — charts */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* KPI strip */}
        <div className="flex-shrink-0 grid grid-cols-4 border-b border-border">
          {[
            { icon: DollarSign, label: 'Y3 Revenue', value: `$${y3Revenue.toLocaleString()}K`, color: 'text-green-400' },
            { icon: Users,      label: 'Y1 Users',   value: y1Users.toLocaleString(),            color: 'text-blue-400' },
            { icon: TrendingUp, label: 'LTV:CAC',    value: `${finalLtvCac.toFixed(1)}:1`,       color: finalLtvCac >= 3 ? 'text-green-400' : 'text-amber-400' },
            { icon: Percent,    label: 'Avg Churn',  value: `${avgChurnLoss}/mo`,                color: params.churnRate < 15 ? 'text-green-400' : 'text-red-400' },
          ].map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <div key={i} className={`px-5 py-4 ${i < 3 ? 'border-r border-border' : ''}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{kpi.label}</span>
                </div>
                <div className={`font-display text-xl ${kpi.color}`}>{kpi.value}</div>
              </div>
            );
          })}
        </div>

        {/* Chart tabs */}
        <div className="flex-shrink-0 flex gap-1 px-5 pt-4">
          {Object.entries(CHART_DEFS).map(([key, def]) => (
            <button key={key} onClick={() => setActiveChart(key)}
              className={`px-4 py-2 rounded-xl text-xs border transition-all ${
                activeChart === key ? 'btn-ivory border-transparent' : 'border-border bg-secondary/30 text-muted-foreground hover:text-foreground'
              }`}>
              {def.label}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="flex-1 p-5 min-h-0 relative">
          <CompetitorBenchmarkOverlay ideaDomain={selectedIdea?.domain} ideaModel={selectedIdea?.simulation_result ? JSON.parse(selectedIdea.simulation_result).revenueModel : null} />
          <motion.div key={activeChart + JSON.stringify(params)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              {CHART_DEFS[activeChart]?.chart}
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Actions & summary */}
        {selectedIdea && (
          <div className="flex-shrink-0 px-5 pb-4 space-y-3">
            <div className="p-4 rounded-2xl border border-border bg-card/50">
              <div className="grid grid-cols-3 gap-6 text-xs mb-4">
                <div>
                  <div className="text-muted-foreground mb-1">Break-even estimate</div>
                  <div className="font-medium">
                    {projection.findIndex(d => d.cumRevenue > params.cac * 100) + 1 || 'Not reached'} months
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Peak month rev</div>
                  <div className="font-medium">${Math.max(...projection.map(d => d.revenue)).toLocaleString()}K</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Total churn (3yr)</div>
                  <div className="font-medium">{projection.reduce((s, d) => s + d.churn, 0).toLocaleString()} users</div>
                </div>
              </div>
              
              <button onClick={() => setShowDeckGen(!showDeckGen)}
                className="w-full px-4 py-2 rounded-xl border border-accent/30 bg-accent/10 text-accent text-xs hover:bg-accent/20 transition">
                📊 Generate Investor Pitch Deck
              </button>
            </div>

            {/* Presentation Generator */}
            {showDeckGen && (
              <PresentationGenerator ideaId={selectedIdea.id} ideaTitle={selectedIdea.title} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}