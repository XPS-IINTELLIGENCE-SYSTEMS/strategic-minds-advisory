import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Activity, Zap, Shield, Wrench, Brain, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SystemAuditDashboard() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('audit');

  const runSystemAudit = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('systemAudit', {});
      setResults({ ...response.data, tab: 'audit' });
      setActiveTab('audit');
    } catch (error) {
      alert('Audit failed: ' + error.message);
    }
    setLoading(false);
  };

  const runAutoFixOptimize = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('autoFixAndOptimize', {});
      setResults({ ...response.data, tab: 'fix' });
      setActiveTab('fix');
    } catch (error) {
      alert('Auto-fix failed: ' + error.message);
    }
    setLoading(false);
  };

  const runHeadlessBrowser = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('headlessBrowserAgent', {});
      setResults({ ...response.data, tab: 'browser' });
      setActiveTab('browser');
    } catch (error) {
      alert('Browser testing failed: ' + error.message);
    }
    setLoading(false);
  };

  const runAutoSuggest = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('autoSuggestAndImplement', {});
      setResults({ ...response.data, tab: 'suggest' });
      setActiveTab('suggest');
    } catch (error) {
      alert('Auto-suggest failed: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="font-display text-2xl text-gradient-ivory">System Audit & Auto-Enhancement</h2>
        <p className="text-sm text-muted-foreground mt-1">Complete system analysis, optimization, and auto-implementation</p>
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={runSystemAudit}
          disabled={loading}
          className="p-4 rounded-2xl border border-border bg-card/50 hover:bg-secondary/50 hover:border-accent transition disabled:opacity-50 text-left"
        >
          <Activity className="w-5 h-5 text-accent mb-2" />
          <p className="text-xs font-bold text-foreground">System Audit</p>
          <p className="text-[10px] text-muted-foreground mt-1">Full analysis</p>
        </button>

        <button
          onClick={runAutoFixOptimize}
          disabled={loading}
          className="p-4 rounded-2xl border border-border bg-card/50 hover:bg-secondary/50 hover:border-accent transition disabled:opacity-50 text-left"
        >
          <Wrench className="w-5 h-5 text-accent mb-2" />
          <p className="text-xs font-bold text-foreground">Auto-Fix</p>
          <p className="text-[10px] text-muted-foreground mt-1">Fix & Optimize</p>
        </button>

        <button
          onClick={runHeadlessBrowser}
          disabled={loading}
          className="p-4 rounded-2xl border border-border bg-card/50 hover:bg-secondary/50 hover:border-accent transition disabled:opacity-50 text-left"
        >
          <Zap className="w-5 h-5 text-accent mb-2" />
          <p className="text-xs font-bold text-foreground">Browser Tests</p>
          <p className="text-[10px] text-muted-foreground mt-1">E2E Testing</p>
        </button>

        <button
          onClick={runAutoSuggest}
          disabled={loading}
          className="p-4 rounded-2xl border border-border bg-card/50 hover:bg-secondary/50 hover:border-accent transition disabled:opacity-50 text-left"
        >
          <Brain className="w-5 h-5 text-accent mb-2" />
          <p className="text-xs font-bold text-foreground">Auto-Enhance</p>
          <p className="text-[10px] text-muted-foreground mt-1">AI Suggestions</p>
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center p-8 rounded-2xl border border-border bg-card/50">
          <Loader2 className="w-6 h-6 animate-spin text-accent mr-3" />
          <span className="text-sm text-foreground">Running comprehensive analysis...</span>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {results && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* AUDIT RESULTS */}
            {activeTab === 'audit' && results.sections && (
              <div className="glass-card rounded-2xl p-6 border border-border space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-accent">System Audit Report</h3>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    results.health_score >= 80 ? 'bg-green-500/20 text-green-400' :
                    results.health_score >= 60 ? 'bg-amber-500/20 text-amber-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    Health: {results.health_score}%
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-secondary/30">
                    <p className="text-[10px] text-muted-foreground">Total Records</p>
                    <p className="text-lg font-bold text-accent">{results.sections.entities?.total_records}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/30">
                    <p className="text-[10px] text-muted-foreground">Total Issues</p>
                    <p className="text-lg font-bold text-accent">{results.summary?.total_issues}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-accent mb-2">Issues Found</p>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {results.issues?.map((issue, i) => (
                      <p key={i} className="text-xs text-foreground/70">{issue}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* AUTO-FIX RESULTS */}
            {activeTab === 'fix' && results.applied_fixes && (
              <div className="glass-card rounded-2xl p-6 border border-border space-y-4">
                <h3 className="font-bold text-accent">Auto-Fix & Optimize Results</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-green-500/10">
                    <p className="text-[10px] text-green-400">Fixes Applied</p>
                    <p className="text-lg font-bold text-green-400">{results.applied_fixes.length}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-500/10">
                    <p className="text-[10px] text-blue-400">Optimizations</p>
                    <p className="text-lg font-bold text-blue-400">{results.optimizations.length}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-accent">Applied Fixes</p>
                  {results.applied_fixes.map((fix, i) => (
                    <div key={i} className="p-2 rounded bg-secondary/30 text-xs">
                      <p className="font-bold text-foreground">{fix.category}</p>
                      <p className="text-muted-foreground">{fix.issue}</p>
                      <p className="text-green-400">✓ {fix.fix}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BROWSER TEST RESULTS */}
            {activeTab === 'browser' && results.tests_run && (
              <div className="glass-card rounded-2xl p-6 border border-border space-y-4">
                <h3 className="font-bold text-accent">Headless Browser Test Results</h3>

                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-lg bg-secondary/30">
                    <p className="text-[10px] text-muted-foreground">Tests Run</p>
                    <p className="text-lg font-bold">{results.tests_run.length}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/30">
                    <p className="text-[10px] text-muted-foreground">Passed</p>
                    <p className="text-lg font-bold text-green-400">{results.tests_run.filter(t => t.passed).length}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/30">
                    <p className="text-[10px] text-muted-foreground">Coverage</p>
                    <p className="text-lg font-bold">{results.summary?.test_coverage}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {results.tests_run.map((test, i) => (
                    <div key={i} className="p-3 rounded-lg bg-secondary/30 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-foreground">{test.scenario}</p>
                        <p className="text-[10px] text-muted-foreground">{test.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AUTO-SUGGEST RESULTS */}
            {activeTab === 'suggest' && results.auto_suggestions && (
              <div className="glass-card rounded-2xl p-6 border border-border space-y-4">
                <h3 className="font-bold text-accent">AI Auto-Suggestions Implemented</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-secondary/30">
                    <p className="text-[10px] text-muted-foreground">Suggestions Generated</p>
                    <p className="text-lg font-bold">{results.auto_suggestions.length}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/30">
                    <p className="text-[10px] text-muted-foreground">Implemented</p>
                    <p className="text-lg font-bold text-green-400">{results.implemented_suggestions.length}</p>
                  </div>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {results.implemented_suggestions.map((impl, i) => (
                    <div key={i} className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-green-400">{impl.suggestion_name}</p>
                          <p className="text-[10px] text-foreground/70 mt-1">
                            Modified {impl.result?.files_modified} files, +{impl.result?.lines_added} -{impl.result?.lines_removed} lines
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}