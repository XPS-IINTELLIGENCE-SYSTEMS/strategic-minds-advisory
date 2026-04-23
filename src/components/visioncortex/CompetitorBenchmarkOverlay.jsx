import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { TrendingUp, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function CompetitorBenchmarkOverlay({ ideaDomain, ideaModel }) {
  const [benchmark, setBenchmark] = useState(null);
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBenchmark();
  }, [ideaDomain, ideaModel]);

  const loadBenchmark = async () => {
    if (!ideaDomain || !ideaModel) { setLoading(false); return; }
    setLoading(true);
    const data = await base44.entities.CompetitorBenchmark.filter({
      domain: ideaDomain.toLowerCase(),
      business_model: ideaModel
    });
    if (data.length > 0) setBenchmark(data[0]);
    setLoading(false);
  };

  if (!visible || !benchmark) return null;

  const getComparison = (yourValue, benchValue, higherIsBetter = true) => {
    if (!yourValue || !benchValue) return null;
    const diff = yourValue - benchValue;
    const pctDiff = Math.round((diff / benchValue) * 100);
    const isBetter = higherIsBetter ? diff > 0 : diff < 0;
    return { pctDiff, isBetter };
  };

  return (
    <div className="absolute top-4 right-4 z-20 bg-card/95 border border-accent/30 rounded-2xl shadow-xl overflow-hidden max-w-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/40 bg-accent/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent" />
          <span className="text-xs font-medium uppercase tracking-wider">Industry Benchmarks</span>
          <span className="text-[9px] text-muted-foreground">({benchmark.sample_count} companies)</span>
        </div>
        <button onClick={() => setVisible(false)} className="p-1 hover:bg-secondary rounded transition">
          <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Benchmarks */}
      <div className="p-4 space-y-3">
        {[
          { label: 'Avg CAC', key: 'avg_cac', unit: '$', yourValue: null },
          { label: 'Growth Rate', key: 'avg_growth_rate', unit: '%', yourValue: null },
          { label: 'Churn Rate', key: 'avg_churn_rate', unit: '%', yourValue: null, higherIsBetter: false },
          { label: 'LTV:CAC Ratio', key: 'avg_ltv_cac_ratio', unit: ':1', yourValue: null },
          { label: 'Gross Margin', key: 'avg_gross_margin', unit: '%', yourValue: null },
        ].map(metric => (
          <div key={metric.key} className="text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground">{metric.label}</span>
              <span className="font-mono font-medium text-foreground">
                {metric.unit}{benchmark[metric.key]?.toFixed(1) || 'N/A'}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-secondary/40 overflow-hidden">
              <div className="h-full bg-accent/30 w-1/2" />
            </div>
          </div>
        ))}

        {/* Data quality */}
        <div className="pt-2 border-t border-border/40">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-muted-foreground">Confidence</span>
            <span className={`text-xs font-medium ${benchmark.confidence_score >= 80 ? 'text-green-400' : 'text-amber-400'}`}>
              {benchmark.confidence_score}%
            </span>
          </div>
          <div className="text-[9px] text-muted-foreground mt-1">
            Updated: {new Date(benchmark.last_updated).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Toggle */}
      <button onClick={() => setVisible(true)} className="hidden">
        <Eye className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}