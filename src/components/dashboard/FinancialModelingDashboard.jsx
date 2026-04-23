import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SCENARIOS = [
  { id: 'conservative', label: 'Conservative', color: '#F97316', growth: 0.05 },
  { id: 'baseline', label: 'Baseline', color: '#FBBF24', growth: 0.15 },
  { id: 'aggressive', label: 'Aggressive', color: '#10B981', growth: 0.30 },
];

export default function FinancialModelingDashboard() {
  const [scenario, setScenario] = useState('baseline');
  const [monthlyData, setMonthlyData] = useState([]);
  const [assumptions, setAssumptions] = useState({
    initialRevenue: 100000,
    churnRate: 0.05,
    avgContractValue: 5000,
    opexPercent: 0.4,
  });
  const [modeling, setModeling] = useState(false);
  const [summary, setSummary] = useState(null);

  const runProjection = async () => {
    setModeling(true);

    try {
      const res = await base44.functions.invoke('projectionEngine', {
        scenario,
        assumptions,
        months: 12,
      });

      setMonthlyData(res.data.monthlyProjection);
      setSummary(res.data.summary);
    } catch (error) {
      console.error('Projection failed:', error);
    }

    setModeling(false);
  };

  useEffect(() => {
    runProjection();
  }, [scenario]);

  const currentScenario = SCENARIOS.find(s => s.id === scenario);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-gradient-ivory">Financial Modeling</h2>
        <p className="text-sm text-muted-foreground mt-1">Dynamic revenue & cash flow projections</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {SCENARIOS.map(s => (
          <button
            key={s.id}
            onClick={() => setScenario(s.id)}
            className={`p-4 rounded-xl border-2 transition text-left ${
              scenario === s.id
                ? 'border-accent bg-accent/10'
                : 'border-border bg-secondary/30 hover:bg-secondary'
            }`}
          >
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1 font-medium">
              {s.label}
            </div>
            <div className="text-sm font-bold text-foreground">{s.growth * 100}% Growth</div>
          </button>
        ))}
      </div>

      {/* Assumptions */}
      <div className="p-5 rounded-2xl border border-border bg-card/50 space-y-4">
        <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">
          Model Assumptions
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { key: 'initialRevenue', label: 'Initial Revenue (Y1)', prefix: '$' },
            { key: 'avgContractValue', label: 'Avg Contract Value', prefix: '$' },
            { key: 'churnRate', label: 'Monthly Churn Rate', suffix: '%' },
            { key: 'opexPercent', label: 'OpEx % of Revenue', suffix: '%' },
          ].map(field => (
            <div key={field.key}>
              <label className="text-xs text-muted-foreground mb-1 block">{field.label}</label>
              <div className="flex items-center gap-2">
                {field.prefix && <span className="text-sm text-muted-foreground">{field.prefix}</span>}
                <input
                  type="number"
                  value={
                    field.suffix
                      ? assumptions[field.key] * 100
                      : assumptions[field.key]
                  }
                  onChange={e => {
                    const value = parseFloat(e.target.value) || 0;
                    setAssumptions(prev => ({
                      ...prev,
                      [field.key]: field.suffix ? value / 100 : value,
                    }));
                  }}
                  className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent transition"
                />
                {field.suffix && <span className="text-sm text-muted-foreground">{field.suffix}</span>}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={runProjection}
          disabled={modeling}
          className="w-full py-2 rounded-lg border border-border bg-secondary/30 hover:bg-secondary text-xs font-medium transition disabled:opacity-40"
        >
          {modeling ? 'Modeling…' : 'Update Projection'}
        </button>
      </div>

      {/* Charts */}
      <AnimatePresence>
        {monthlyData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Revenue Projection */}
            <div className="p-5 rounded-2xl border border-border bg-card/50">
              <h3 className="text-sm font-medium text-foreground mb-4">Revenue Projection</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    formatter={v => `$${(v / 1000).toFixed(1)}k`}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke={currentScenario?.color}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Cash Flow */}
            <div className="p-5 rounded-2xl border border-border bg-card/50">
              <h3 className="text-sm font-medium text-foreground mb-4">Cash Flow Analysis</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    formatter={v => `$${(v / 1000).toFixed(1)}k`}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="income" fill="#10B981" />
                  <Bar dataKey="costs" fill="#EF4444" />
                  <Bar dataKey="cashFlow" fill={currentScenario?.color} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Summary Metrics */}
            {summary && (
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  {
                    label: 'Year 1 Revenue',
                    value: `$${(summary.year1Revenue / 1000).toFixed(0)}k`,
                    icon: TrendingUp,
                  },
                  {
                    label: 'Avg Monthly Growth',
                    value: `${summary.avgMonthlyGrowth.toFixed(1)}%`,
                    icon: TrendingUp,
                  },
                  {
                    label: 'Peak Cash Position',
                    value: `$${(summary.peakCashFlow / 1000).toFixed(0)}k`,
                    icon: DollarSign,
                  },
                  {
                    label: 'Profitability Month',
                    value: summary.profitabilityMonth || 'N/A',
                    icon: AlertCircle,
                  },
                ].map((metric, i) => {
                  const Icon = metric.icon;
                  return (
                    <div key={i} className="p-4 rounded-xl border border-border/50 bg-secondary/30">
                      <Icon className="w-4 h-4 text-accent mb-2" />
                      <div className="text-[10px] text-muted-foreground mb-1">{metric.label}</div>
                      <div className="text-sm font-bold text-foreground">{metric.value}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {modeling && (
        <div className="flex items-center justify-center py-8 gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-accent" />
          <span className="text-xs text-muted-foreground">Generating projections…</span>
        </div>
      )}
    </div>
  );
}