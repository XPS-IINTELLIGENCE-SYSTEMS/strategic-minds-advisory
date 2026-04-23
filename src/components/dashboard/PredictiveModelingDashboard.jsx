import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Loader2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PredictiveModelingDashboard() {
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

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

  const generatePredictions = async (modelId) => {
    setGenerating(true);
    try {
      const response = await base44.functions.invoke('predictiveModelingEngine', {
        modelId,
      });

      setPredictions(response.data.predictions);
      setSelectedModel(modelId);
    } catch (error) {
      console.error('Failed to generate predictions:', error);
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

  // Prepare chart data
  let chartData = [];
  if (predictions) {
    const years = [1, 2, 3, 4, 5];
    chartData = years.map((year, idx) => ({
      year: `Year ${year}`,
      revenue: predictions.year_by_year_revenue?.[idx] || 0,
      growth: predictions.growth_rates?.[idx] || 0,
      upside: predictions.upside_scenario || 0,
      downside: predictions.downside_scenario || 0,
    }));
  }

  return (
    <div className="h-full flex flex-col gap-6 p-6 overflow-y-auto">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 border border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Predictive Modeling</h3>
            <p className="text-xs text-muted-foreground">5-year revenue & growth projections</p>
          </div>
        </div>
      </div>

      {/* Model Selection */}
      <div className="grid gap-3">
        {models.map(model => (
          <button
            key={model.id}
            onClick={() => generatePredictions(model.id)}
            className="glass-card rounded-2xl p-4 border border-border hover:border-accent/50 transition text-left"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-foreground">{model.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">{model.description?.substring(0, 80)}</p>
              </div>
              <Button
                disabled={generating && selectedModel === model.id}
                className="btn-ivory rounded-lg"
                size="sm"
              >
                {generating && selectedModel === model.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Generate'
                )}
              </Button>
            </div>
          </button>
        ))}
      </div>

      {/* Predictions Display */}
      {predictions && (
        <div className="glass-card rounded-2xl p-6 border border-border space-y-6">
          <h4 className="font-medium text-foreground text-lg">5-Year Projections</h4>

          {/* Revenue Chart */}
          <div>
            <h5 className="text-sm font-bold text-accent mb-3">Revenue Trajectory (Thousands)</h5>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: 'none', borderRadius: '0.5rem' }}
                  formatter={(value) => `$${value}k`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--accent))' }}
                  name="Base Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="upside"
                  stroke="hsl(120 70% 50%)"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  name="Upside Scenario"
                />
                <Line
                  type="monotone"
                  dataKey="downside"
                  stroke="hsl(0 70% 50%)"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  name="Downside Scenario"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Growth Rates */}
          <div>
            <h5 className="text-sm font-bold text-accent mb-3">Annual Growth Rates (%)</h5>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: 'none', borderRadius: '0.5rem' }}
                  formatter={(value) => `${value}%`}
                />
                <Bar dataKey="growth" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Key Assumptions */}
          {predictions.market_assumptions && (
            <div>
              <h5 className="text-sm font-bold text-accent mb-2">Market Assumptions</h5>
              <p className="text-sm text-foreground/80">{predictions.market_assumptions}</p>
            </div>
          )}

          {/* Risk Factors */}
          {predictions.risk_factors && (
            <div>
              <h5 className="text-sm font-bold text-destructive mb-2">Top Risk Factors</h5>
              <ul className="space-y-1">
                {predictions.risk_factors.map((risk, idx) => (
                  <li key={idx} className="text-sm text-foreground/80">⚠ {risk}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Confidence */}
          {predictions.confidence_score && (
            <div>
              <h5 className="text-sm font-bold text-accent mb-2">Model Confidence</h5>
              <div className="w-full bg-secondary/40 rounded h-3">
                <div
                  className="bg-accent h-3 rounded transition-all"
                  style={{ width: `${predictions.confidence_score}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{predictions.confidence_score}/100</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}