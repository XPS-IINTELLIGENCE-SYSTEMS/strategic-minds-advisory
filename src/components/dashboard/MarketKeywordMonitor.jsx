import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Plus, Trash2, AlertTriangle, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MarketKeywordMonitor() {
  const [alerts, setAlerts] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newAlert, setNewAlert] = useState({
    model_id: '',
    keywords: '',
    minimum_impact_score: 70,
    alert_method: 'email',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await base44.auth.me();
      const [allAlerts, allModels] = await Promise.all([
        base44.entities.KeywordAlert.filter({ user_email: user.email }),
        base44.entities.SavedModel.list(),
      ]);
      
      setAlerts(allAlerts);
      setModels(allModels);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAlert = async () => {
    if (!newAlert.model_id || !newAlert.keywords.trim()) {
      alert('Please select a model and enter keywords');
      return;
    }

    try {
      const user = await base44.auth.me();
      const model = models.find(m => m.id === newAlert.model_id);

      const alert = await base44.entities.KeywordAlert.create({
        user_email: user.email,
        model_id: newAlert.model_id,
        model_name: model.name,
        keywords: newAlert.keywords,
        minimum_impact_score: newAlert.minimum_impact_score,
        alert_method: newAlert.alert_method,
      });

      setAlerts(prev => [...prev, alert]);
      setNewAlert({
        model_id: '',
        keywords: '',
        minimum_impact_score: 70,
        alert_method: 'email',
      });
      setShowForm(false);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const deleteAlert = async (alertId) => {
    if (!confirm('Delete this keyword alert?')) return;

    try {
      await base44.entities.KeywordAlert.delete(alertId);
      setAlerts(prev => prev.filter(a => a.id !== alertId));
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const toggleAlert = async (alertId, isActive) => {
    try {
      await base44.entities.KeywordAlert.update(alertId, {
        is_active: !isActive,
      });

      setAlerts(prev => prev.map(a => 
        a.id === alertId ? { ...a, is_active: !isActive } : a
      ));
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
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-accent" />
            <div>
              <h3 className="font-medium text-foreground">Market Keyword Monitor</h3>
              <p className="text-xs text-muted-foreground">Real-time alerts for market shifts matching your keywords</p>
            </div>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} variant="outline" className="rounded-lg">
              <Plus className="w-4 h-4" />
              Add Alert
            </Button>
          )}
        </div>
      </div>

      {/* Create Alert Form */}
      {showForm && (
        <div className="glass-card rounded-2xl p-6 border border-border">
          <h4 className="font-bold text-accent mb-4">Create Keyword Alert</h4>

          <div className="space-y-4">
            {/* Model Selection */}
            <div>
              <label className="text-xs font-bold text-accent mb-2 block">Business Model</label>
              <select
                value={newAlert.model_id}
                onChange={(e) => setNewAlert(prev => ({ ...prev, model_id: e.target.value }))}
                className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent transition"
              >
                <option value="">Select a model...</option>
                {models.map(model => (
                  <option key={model.id} value={model.id}>{model.name}</option>
                ))}
              </select>
            </div>

            {/* Keywords */}
            <div>
              <label className="text-xs font-bold text-accent mb-2 block">Keywords (comma-separated)</label>
              <input
                type="text"
                value={newAlert.keywords}
                onChange={(e) => setNewAlert(prev => ({ ...prev, keywords: e.target.value }))}
                placeholder="e.g., market downturn, competitor A, new regulation"
                className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent transition"
              />
              <p className="text-[10px] text-muted-foreground mt-1">Enter keywords to monitor intelligence against</p>
            </div>

            {/* Impact Threshold */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-accent">Minimum Impact Score</label>
                <span className="text-xs font-bold text-accent">{newAlert.minimum_impact_score}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                value={newAlert.minimum_impact_score}
                onChange={(e) => setNewAlert(prev => ({ 
                  ...prev, 
                  minimum_impact_score: parseInt(e.target.value) 
                }))}
                className="w-full h-2 bg-secondary/40 rounded-lg appearance-none cursor-pointer accent-accent"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>Low Impact</span>
                <span>High Impact</span>
              </div>
            </div>

            {/* Alert Method */}
            <div>
              <label className="text-xs font-bold text-accent mb-2 block">Alert Method</label>
              <select
                value={newAlert.alert_method}
                onChange={(e) => setNewAlert(prev => ({ ...prev, alert_method: e.target.value }))}
                className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent transition"
              >
                <option value="email">Email Only</option>
                <option value="both">Email + SMS (when available)</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={createAlert}
                className="flex-1 btn-ivory rounded-lg"
              >
                <Plus className="w-4 h-4" />
                Create Alert
              </Button>
              <Button
                onClick={() => setShowForm(false)}
                variant="outline"
                className="flex-1 rounded-lg"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Active Alerts */}
      <div className="space-y-3">
        {alerts.map(alert => (
          <div key={alert.id} className="glass-card rounded-2xl p-5 border border-border">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-foreground">{alert.model_name}</h4>
                  {alert.is_active ? (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-muted">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Keywords: {alert.keywords}</p>
              </div>
              <Button
                onClick={() => deleteAlert(alert.id)}
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Alert Stats */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="p-2 rounded-lg bg-secondary/30 text-center">
                <p className="text-[10px] text-muted-foreground">Impact Threshold</p>
                <p className="text-sm font-bold text-accent">{alert.minimum_impact_score}%</p>
              </div>
              <div className="p-2 rounded-lg bg-secondary/30 text-center">
                <p className="text-[10px] text-muted-foreground">Total Alerts</p>
                <p className="text-sm font-bold text-accent">{alert.alert_count || 0}</p>
              </div>
              <div className="p-2 rounded-lg bg-secondary/30 text-center">
                <p className="text-[10px] text-muted-foreground">Method</p>
                <p className="text-sm font-bold text-accent">{alert.alert_method === 'email' ? '📧' : '📧📱'}</p>
              </div>
            </div>

            {alert.last_alert_date && (
              <p className="text-[10px] text-muted-foreground mb-3">
                Last alert: {new Date(alert.last_alert_date).toLocaleString()}
              </p>
            )}

            {/* Toggle Button */}
            <Button
              onClick={() => toggleAlert(alert.id, alert.is_active)}
              variant={alert.is_active ? 'default' : 'outline'}
              className="w-full rounded-lg text-xs"
            >
              {alert.is_active ? '✓ Monitoring Active' : '○ Monitoring Paused'}
            </Button>
          </div>
        ))}
      </div>

      {alerts.length === 0 && !showForm && (
        <div className="glass-card rounded-2xl p-12 border border-border text-center">
          <AlertTriangle className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">No keyword alerts configured</p>
          <Button onClick={() => setShowForm(true)} className="btn-ivory rounded-lg">
            <Plus className="w-4 h-4" />
            Create Your First Alert
          </Button>
        </div>
      )}
    </div>
  );
}