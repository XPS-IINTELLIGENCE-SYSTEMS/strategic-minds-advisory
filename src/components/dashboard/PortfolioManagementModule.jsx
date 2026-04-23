import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Plus, Zap, Trash2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PortfolioManagementModule() {
  const [portfolios, setPortfolios] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [testing, setTesting] = useState(null);
  const [newPortfolio, setNewPortfolio] = useState({
    name: '',
    description: '',
    selectedModels: [],
  });
  const [results, setResults] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await base44.auth.me();
      const [allPortfolios, allModels] = await Promise.all([
        base44.entities.Portfolio.filter({ owner_email: user.email }),
        base44.entities.SavedModel.list(),
      ]);
      
      setPortfolios(allPortfolios);
      setModels(allModels);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPortfolio = async () => {
    if (!newPortfolio.name || newPortfolio.selectedModels.length === 0) {
      alert('Please enter portfolio name and select models');
      return;
    }

    setCreating(true);
    try {
      const user = await base44.auth.me();
      
      const portfolio = await base44.entities.Portfolio.create({
        name: newPortfolio.name,
        description: newPortfolio.description,
        owner_email: user.email,
        model_ids: newPortfolio.selectedModels.join(','),
      });

      setPortfolios(prev => [...prev, portfolio]);
      setNewPortfolio({ name: '', description: '', selectedModels: [] });
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setCreating(false);
    }
  };

  const runAggregateStressTest = async (portfolioId) => {
    setTesting(portfolioId);
    try {
      const response = await base44.functions.invoke('portfolioAggregateStressTest', {
        portfolioId,
      });

      setResults(prev => ({
        ...prev,
        [portfolioId]: {
          resilience_score: response.data.resilience_score,
          collective_risk: response.data.collective_risk_assessment,
          diversification: response.data.diversification_analysis,
          correlated_risks: response.data.correlated_risks,
          recommendations: response.data.portfolio_recommendations,
          survival_probability: response.data.survival_probability,
        },
      }));
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setTesting(null);
    }
  };

  const deletePortfolio = async (portfolioId) => {
    if (!confirm('Delete this portfolio?')) return;
    
    try {
      await base44.entities.Portfolio.delete(portfolioId);
      setPortfolios(prev => prev.filter(p => p.id !== portfolioId));
    } catch (error) {
      alert(`Error: ${error.message}`);
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
          <TrendingUp className="w-5 h-5 text-accent" />
          <div>
            <h3 className="font-medium text-foreground">Portfolio Management</h3>
            <p className="text-xs text-muted-foreground">Group models and run aggregate stress tests</p>
          </div>
        </div>
      </div>

      {/* Create Portfolio */}
      <div className="glass-card rounded-2xl p-6 border border-border">
        <h4 className="font-bold text-accent mb-4">Create New Portfolio</h4>
        
        <div className="space-y-3">
          <input
            type="text"
            value={newPortfolio.name}
            onChange={(e) => setNewPortfolio(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Portfolio name"
            className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent transition"
          />

          <textarea
            value={newPortfolio.description}
            onChange={(e) => setNewPortfolio(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Portfolio description (optional)"
            rows={2}
            className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent transition resize-none"
          />

          <div>
            <p className="text-xs font-bold text-accent mb-2">Select Models</p>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {models.map(model => (
                <label key={model.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPortfolio.selectedModels.includes(model.id)}
                    onChange={(e) => {
                      setNewPortfolio(prev => ({
                        ...prev,
                        selectedModels: e.target.checked
                          ? [...prev.selectedModels, model.id]
                          : prev.selectedModels.filter(id => id !== model.id),
                      }));
                    }}
                    className="rounded"
                  />
                  <span className="text-xs text-foreground">{model.name}</span>
                </label>
              ))}
            </div>
          </div>

          <Button
            onClick={createPortfolio}
            disabled={creating}
            className="btn-ivory rounded-lg w-full"
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Portfolio
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Portfolios List */}
      <div className="space-y-4">
        {portfolios.map(portfolio => {
          const result = results[portfolio.id];
          const modelCount = portfolio.model_ids.split(',').length;

          return (
            <div key={portfolio.id} className="glass-card rounded-2xl p-6 border border-border">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="font-bold text-foreground">{portfolio.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{modelCount} models • Risk: {portfolio.collective_risk_score || '--'}/100</p>
                </div>
                <Button
                  onClick={() => deletePortfolio(portfolio.id)}
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {!result ? (
                <Button
                  onClick={() => runAggregateStressTest(portfolio.id)}
                  disabled={testing === portfolio.id}
                  className="btn-ivory rounded-lg w-full"
                >
                  {testing === portfolio.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Run Aggregate Stress Test
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-secondary/30">
                      <p className="text-xs text-muted-foreground mb-1">Resilience Score</p>
                      <p className="text-xl font-bold text-accent">{result.resilience_score}/100</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/30">
                      <p className="text-xs text-muted-foreground mb-1">Survival Probability</p>
                      <p className="text-xl font-bold text-green-400">{result.survival_probability}%</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-secondary/30">
                    <p className="text-xs font-bold text-accent mb-2">Collective Risk Assessment</p>
                    <p className="text-xs text-foreground/80">{result.collective_risk}</p>
                  </div>

                  {result.correlated_risks.length > 0 && (
                    <div className="p-3 rounded-lg bg-secondary/30">
                      <p className="text-xs font-bold text-destructive mb-2">Correlated Risks</p>
                      <ul className="text-xs text-foreground/80 space-y-1">
                        {result.correlated_risks.map((risk, idx) => (
                          <li key={idx}>• {risk}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button
                    onClick={() => setResults(prev => { const copy = {...prev}; delete copy[portfolio.id]; return copy; })}
                    variant="outline"
                    className="w-full rounded-lg"
                  >
                    Clear Results
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}