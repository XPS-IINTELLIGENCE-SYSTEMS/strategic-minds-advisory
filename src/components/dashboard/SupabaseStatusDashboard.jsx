import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Database, RefreshCw, CheckCircle2, AlertCircle, Loader2, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SupabaseStatusDashboard() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState({});

  const queryStatus = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('querySupabaseStatus', {});
      setStatus(response.data);
    } catch (error) {
      alert('Query failed: ' + error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    queryStatus();
    const interval = setInterval(queryStatus, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (!status && !loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <button
          onClick={queryStatus}
          className="px-4 py-2 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 transition"
        >
          Initialize Supabase Status
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl text-gradient-ivory">Supabase Status</h2>
          <p className="text-sm text-muted-foreground mt-1">Project configuration and database health</p>
        </div>
        <button
          onClick={queryStatus}
          disabled={loading}
          className="p-2 rounded-lg hover:bg-secondary transition disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && !status && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
        </div>
      )}

      {status && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl border border-border bg-card/50">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-accent" />
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Tables</p>
              </div>
              <p className="text-2xl font-bold text-accent">{status.summary?.total_tables || 0}</p>
            </div>

            <div className="p-4 rounded-2xl border border-border bg-card/50">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Records</p>
              </div>
              <p className="text-2xl font-bold text-green-400">{status.summary?.total_records?.toLocaleString() || 0}</p>
            </div>

            <div className="p-4 rounded-2xl border border-border bg-card/50">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-blue-400" />
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Size</p>
              </div>
              <p className="text-2xl font-bold text-blue-400">{status.summary?.database_size_mb} MB</p>
            </div>

            <div className="p-4 rounded-2xl border border-border bg-card/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Status</p>
              </div>
              <p className="text-sm font-bold text-green-400">{status.summary?.status}</p>
            </div>
          </div>

          {/* Project URL */}
          <div className="p-4 rounded-2xl border border-border bg-card/50">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Project URL</p>
            <p className="text-sm font-mono text-foreground break-all">{status.supabase_url}</p>
          </div>

          {/* Tables Section */}
          {status.sections?.tables && (
            <div className="p-4 rounded-2xl border border-border bg-card/50 space-y-3">
              <button
                onClick={() => setExpanded(prev => ({ ...prev, tables: !prev.tables }))}
                className="w-full flex items-center justify-between text-left"
              >
                <h3 className="font-bold text-accent">Tables ({status.sections.tables.count})</h3>
                <div className={`transition transform ${expanded.tables ? 'rotate-180' : ''}`}>
                  ▼
                </div>
              </button>

              <AnimatePresence>
                {expanded.tables && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 max-h-96 overflow-y-auto"
                  >
                    {status.sections.tables.tables?.map((table, i) => (
                      <div key={i} className="p-3 rounded-lg bg-secondary/30 flex items-start justify-between">
                        <div>
                          <p className="text-xs font-bold text-foreground">{table.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {status.sections.record_counts?.[table.name]?.toLocaleString() || '0'} records
                          </p>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{table.type}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Database Size Details */}
          {status.sections?.database_size && (
            <div className="p-4 rounded-2xl border border-border bg-card/50">
              <h3 className="font-bold text-accent mb-3">Database Size</h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded bg-secondary/30">
                  <p className="text-[10px] text-muted-foreground">Bytes</p>
                  <p className="text-sm font-bold text-foreground">{status.sections.database_size.bytes?.toLocaleString()}</p>
                </div>
                <div className="p-2 rounded bg-secondary/30">
                  <p className="text-[10px] text-muted-foreground">Megabytes</p>
                  <p className="text-sm font-bold text-foreground">{status.sections.database_size.mb}</p>
                </div>
                <div className="p-2 rounded bg-secondary/30">
                  <p className="text-[10px] text-muted-foreground">Gigabytes</p>
                  <p className="text-sm font-bold text-foreground">{status.sections.database_size.gb}</p>
                </div>
              </div>
            </div>
          )}

          {/* RLS Status */}
          {status.sections?.rls_status && Object.keys(status.sections.rls_status).length > 0 && (
            <div className="p-4 rounded-2xl border border-border bg-card/50 space-y-3">
              <button
                onClick={() => setExpanded(prev => ({ ...prev, rls: !prev.rls }))}
                className="w-full flex items-center justify-between text-left"
              >
                <h3 className="font-bold text-accent flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  RLS Status
                </h3>
                <div className={`transition transform ${expanded.rls ? 'rotate-180' : ''}`}>
                  ▼
                </div>
              </button>

              <AnimatePresence>
                {expanded.rls && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1 text-xs max-h-48 overflow-y-auto"
                  >
                    {Object.entries(status.sections.rls_status || {}).map(([table, enabled]) => (
                      <div key={table} className="flex items-center justify-between p-2 rounded bg-secondary/30">
                        <span>{table}</span>
                        {typeof enabled === 'boolean' ? (
                          <span className={enabled ? 'text-green-400' : 'text-amber-400'}>
                            {enabled ? '✓ Enabled' : '⊘ Disabled'}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">{String(enabled)}</span>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Last Updated */}
          <div className="text-xs text-muted-foreground text-center pt-2">
            Last checked: {new Date(status.timestamp).toLocaleTimeString()}
          </div>
        </motion.div>
      )}
    </div>
  );
}