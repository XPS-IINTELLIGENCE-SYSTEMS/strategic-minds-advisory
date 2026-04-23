import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Bell, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RealTimeAlertsDashboard() {
  const [watchedModels, setWatchedModels] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    initializeMonitoring();
  }, []);

  const initializeMonitoring = async () => {
    try {
      // Fetch saved models
      const models = await base44.entities.SavedModel.list();
      setWatchedModels(models.filter(m => m.watched_for_alerts));

      // Run initial scan
      if (models.some(m => m.watched_for_alerts)) {
        await scanForAlerts(models.filter(m => m.watched_for_alerts).map(m => m.id));
      }
    } catch (error) {
      console.error('Failed to initialize monitoring:', error);
    } finally {
      setLoading(false);
    }
  };

  const scanForAlerts = async (modelIds) => {
    setScanning(true);
    try {
      const response = await base44.functions.invoke('intelligenceRealtimeMonitor', {
        watchedModelIds: modelIds,
      });

      setAlerts(response.data.alerts || []);
    } catch (error) {
      console.error('Alert scan failed:', error);
    } finally {
      setScanning(false);
    }
  };

  const toggleModelWatch = async (modelId) => {
    try {
      const model = watchedModels.find(m => m.id === modelId);
      if (model) {
        await base44.entities.SavedModel.update(modelId, {
          watched_for_alerts: !model.watched_for_alerts,
        });

        setWatchedModels(prev =>
          prev.map(m => m.id === modelId ? { ...m, watched_for_alerts: !m.watched_for_alerts } : m)
        );
      }
    } catch (error) {
      console.error('Failed to toggle watch:', error);
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center">
              <Bell className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Real-Time Intelligence Monitoring</h3>
              <p className="text-xs text-muted-foreground">
                {watchedModels.length} model{watchedModels.length !== 1 ? 's' : ''} actively watched
              </p>
            </div>
          </div>
          <Button
            onClick={() => scanForAlerts(watchedModels.map(m => m.id))}
            disabled={scanning || watchedModels.length === 0}
            className="btn-ivory rounded-lg"
          >
            {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Scan Now'}
          </Button>
        </div>
      </div>

      {/* Watched Models */}
      <div className="glass-card rounded-2xl p-6 border border-border">
        <h4 className="text-sm font-medium mb-4">Monitoring Status</h4>
        
        {watchedModels.length > 0 ? (
          <div className="space-y-2">
            {watchedModels.map(model => (
              <div key={model.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-secondary/30 border border-border">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{model.name}</p>
                  <p className="text-xs text-muted-foreground">Watching for market signals</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0 ml-2" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No models being monitored. Select models to watch in the Idea Board.</p>
        )}
      </div>

      {/* Alerts */}
      <div className="glass-card rounded-2xl p-6 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-accent" />
          <h4 className="text-sm font-medium">Critical Signals (24h)</h4>
        </div>

        {alerts.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {alerts.slice(0, 8).map((alert, idx) => (
              <div key={idx} className="px-3 py-2.5 rounded-lg border border-accent/30 bg-accent/10">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-accent uppercase">
                    {alert.keyword}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Severity: {alert.severity}/100
                  </span>
                </div>
                <p className="text-xs font-medium text-foreground">{alert.title}</p>
                <p className="text-xs text-foreground/70 mt-1">{alert.content}</p>
              </div>
            ))}
            {alerts.length > 8 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                +{alerts.length - 8} more signals
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-xs text-muted-foreground">No critical signals detected in the last 24 hours</p>
          </div>
        )}
      </div>
    </div>
  );
}