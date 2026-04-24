import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, AlertTriangle, CheckCircle2, Copy, Zap, ChevronDown, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DebuggerMode({ onApplyFix }) {
  const [logs, setLogs] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [expandedError, setExpandedError] = useState(null);
  const [applying, setApplying] = useState(null);

  const fetchAndAnalyzeLogs = async () => {
    setAnalyzing(true);
    setSuggestions([]);

    try {
      // Fetch recent Vercel deployment logs
      const logsRes = await base44.functions.invoke('fetchVercelLogs', {
        limit: 5,
      });

      setLogs(logsRes.data.logs || []);

      // Analyze logs for issues
      const suggestionsRes = await base44.functions.invoke('analyzeLogsForFixes', {
        logs: logsRes.data.logs || [],
      });

      setSuggestions(suggestionsRes.data.suggestions || []);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }

    setAnalyzing(false);
  };

  const applyFix = async (suggestionId, suggestion) => {
    setApplying(suggestionId);

    try {
      const result = await base44.functions.invoke('applyDebugFix', {
        suggestion,
        suggestionId,
      });

      setSuggestions(prev =>
        prev.map(s =>
          s.id === suggestionId ? { ...s, status: 'applied', appliedAt: new Date().toISOString() } : s
        )
      );

      onApplyFix?.(result.data);
    } catch (error) {
      console.error('Failed to apply fix:', error);
    }

    setApplying(null);
  };

  return (
    <div className="space-y-4">
      <button
        onClick={fetchAndAnalyzeLogs}
        disabled={analyzing}
        className="w-full py-2.5 rounded-xl bg-accent/15 text-accent border border-accent text-sm font-medium hover:bg-accent/25 transition disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {analyzing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Fetching & Analyzing Logs…
          </>
        ) : (
          <>
            <AlertTriangle className="w-4 h-4" /> Debug Vercel Logs
          </>
        )}
      </button>

      {/* Error Logs */}
      {logs.length > 0 && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i} className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-xs">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="text-red-400 font-medium truncate">{log.message || log.error}</div>
                  <div className="text-muted-foreground mt-1 truncate">{log.timestamp}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Suggestions */}
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 max-h-96 overflow-y-auto"
          >
            {suggestions.map((suggestion, i) => (
              <motion.div
                key={suggestion.id || i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-lg border border-border bg-secondary/40 space-y-3"
              >
                <button
                  onClick={() => setExpandedError(expandedError === i ? null : i)}
                  className="w-full flex items-start justify-between text-left"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {suggestion.status === 'applied' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                      )}
                      <span className="text-sm font-medium truncate">{suggestion.title}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{suggestion.file}</div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition flex-shrink-0 ${
                      expandedError === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {expandedError === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-3 border-t border-border/50 space-y-2"
                  >
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1.5">Problem</div>
                      <div className="text-xs text-foreground/80 bg-background rounded-lg p-2">{suggestion.problem}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1.5">Solution</div>
                      <div className="text-xs text-foreground/80 bg-background rounded-lg p-2 font-mono whitespace-pre-wrap">
                        {suggestion.solution}
                      </div>
                    </div>

                    {suggestion.status !== 'applied' && (
                      <button
                        onClick={() => applyFix(suggestion.id || i, suggestion)}
                        disabled={applying === (suggestion.id || i)}
                        className="w-full py-2 rounded-lg bg-green-500/15 text-green-400 border border-green-500/30 text-xs font-medium hover:bg-green-500/25 transition disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {applying === (suggestion.id || i) ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Applying…
                          </>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5" /> Apply Fix to GitHub
                          </>
                        )}
                      </button>
                    )}
                    {suggestion.status === 'applied' && (
                      <div className="flex items-center gap-2 text-xs text-green-400 py-2">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Applied {new Date(suggestion.appliedAt).toLocaleTimeString()}
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}