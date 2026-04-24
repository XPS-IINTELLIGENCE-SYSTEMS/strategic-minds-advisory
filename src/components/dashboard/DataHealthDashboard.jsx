import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Database, CheckCircle2, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DataHealthDashboard() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState(null);
  const [syncing, setSyncing] = useState(null);

  useEffect(() => {
    loadDataSources();
  }, []);

  const loadDataSources = async () => {
    try {
      const dataSources = await base44.entities.ExternalDataSource.list();
      setSources(dataSources);
      calculateHealth(dataSources);
    } catch (error) {
      console.error('Failed to load sources:', error);
    }
    setLoading(false);
  };

  const calculateHealth = async (dataSources) => {
    try {
      const res = await base44.functions.invoke('calculateDataHealth', {
        sources: dataSources,
      });
      setHealth(res.data);
    } catch (error) {
      console.error('Health calculation failed:', error);
    }
  };

  const syncSource = async (sourceId) => {
    setSyncing(sourceId);

    try {
      const res = await base44.functions.invoke('syncDataSource', {
        sourceId,
      });

      // Update source
      setSources(prev =>
        prev.map(s =>
          s.id === sourceId
            ? { ...s, last_sync: new Date().toISOString(), items_synced: res.data.itemsProcessed }
            : s
        )
      );

      // Recalculate health
      loadDataSources();
    } catch (error) {
      console.error('Sync failed:', error);
    }

    setSyncing(null);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-gradient-ivory">Data Health Monitor</h2>
        <p className="text-sm text-muted-foreground mt-1">Track sync status and data quality</p>
      </div>

      {/* Overall Health */}
      {health && (
        <div className="grid md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-border bg-card/50">
            <div className="text-xs text-muted-foreground mb-1">Overall Health</div>
            <div className="flex items-end gap-2">
              <div className="text-2xl font-bold text-accent">{health.overallHealth}%</div>
              <div className="w-16 h-1.5 rounded-full bg-secondary/40 overflow-hidden mb-1">
                <div
                  className={`h-full transition-all ${
                    health.overallHealth >= 80 ? 'bg-green-400' : 'bg-yellow-400'
                  }`}
                  style={{ width: `${health.overallHealth}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card/50">
            <div className="text-xs text-muted-foreground mb-1">Connected Sources</div>
            <div className="text-2xl font-bold text-foreground">{health.totalSources}</div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card/50">
            <div className="text-xs text-muted-foreground mb-1">Items Synced</div>
            <div className="text-2xl font-bold text-accent">{health.totalItemsSynced}</div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card/50">
            <div className="text-xs text-muted-foreground mb-1">Last Sync</div>
            <div className="text-xs font-medium text-foreground">
              {health.lastSyncTime || 'Never'}
            </div>
          </div>
        </div>
      )}

      {/* Data Sources */}
      <div className="space-y-3">
        <h3 className="font-medium text-foreground">Connected Sources</h3>

        {sources.length === 0 ? (
          <div className="p-6 rounded-2xl border border-border bg-card/50 text-center">
            <Database className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-sm text-muted-foreground">No data sources connected yet</p>
            <button className="mt-3 px-4 py-2 rounded-lg border border-border bg-secondary/30 hover:bg-secondary text-xs transition">
              Connect Source
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {sources.map(source => {
              const sourceHealth = health?.sources?.[source.id] || {};
              const status = sourceHealth.status || 'idle';

              return (
                <motion.div
                  key={source.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl border border-border bg-card/50 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-foreground">{source.source_name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                        {source.source_type}
                      </p>
                    </div>
                    <button
                      onClick={() => syncSource(source.id)}
                      disabled={syncing === source.id}
                      className="p-1.5 rounded-lg hover:bg-secondary transition disabled:opacity-40"
                    >
                      <RefreshCw
                        className={`w-4 h-4 text-accent ${syncing === source.id ? 'animate-spin' : ''}`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {status === 'synced' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                      ) : status === 'syncing' ? (
                        <Loader2 className="w-3.5 h-3.5 text-accent animate-spin" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-yellow-400" />
                      )}
                      <span className="text-muted-foreground capitalize">{status}</span>
                    </div>
                    <span className="text-foreground font-medium">
                      {source.items_synced || 0} items
                    </span>
                  </div>

                  {source.last_sync && (
                    <div className="text-[10px] text-muted-foreground">
                      Last synced: {new Date(source.last_sync).toLocaleString()}
                    </div>
                  )}

                  {sourceHealth.quality !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Data Quality</span>
                      <div className="w-24 h-1.5 rounded-full bg-secondary/40 overflow-hidden">
                        <div
                          className={`h-full ${
                            sourceHealth.quality >= 80
                              ? 'bg-green-400'
                              : sourceHealth.quality >= 60
                              ? 'bg-yellow-400'
                              : 'bg-red-400'
                          }`}
                          style={{ width: `${sourceHealth.quality}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {sourceHealth.issues && sourceHealth.issues.length > 0 && (
                    <div className="pt-2 border-t border-border/30 space-y-1">
                      {sourceHealth.issues.map((issue, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[10px] text-yellow-400">
                          <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                          <span>{issue}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Data Categorization Stats */}
      {health?.categorization && (
        <div className="p-5 rounded-2xl border border-border bg-card/50 space-y-3">
          <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">
            Intelligence Categorization
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(health.categorization).map(([category, count]) => (
              <div key={category} className="p-2 rounded-lg bg-secondary/30 text-center">
                <div className="text-xs text-accent font-medium">{count}</div>
                <div className="text-[10px] text-muted-foreground capitalize mt-0.5">{category}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}