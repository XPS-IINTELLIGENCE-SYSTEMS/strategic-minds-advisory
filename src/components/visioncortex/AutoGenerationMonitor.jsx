import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Loader2, Play, Pause, Settings, TrendingUp, Calendar,
  CheckCircle2, AlertCircle, Clock, Cpu, BarChart3
} from 'lucide-react';

const STATUSES = ['seeded', 'debating', 'simulating', 'validated', 'building', 'documented'];
const STATUS_COLORS = {
  seeded: 'text-blue-400',
  debating: 'text-purple-400',
  simulating: 'text-amber-400',
  validated: 'text-green-400',
  building: 'text-cyan-400',
  documented: 'text-accent',
};

export default function AutoGenerationMonitor() {
  const [running, setRunning] = useState(false);
  const [interval, setInterval] = useState(3600); // Default 1 hour
  const [lastRun, setLastRun] = useState(null);
  const [nextRun, setNextRun] = useState(null);
  const [todayGenerated, setTodayGenerated] = useState(0);
  const [statusBreakdown, setStatusBreakdown] = useState({});
  const [topIdeas, setTopIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [intervalInput, setIntervalInput] = useState('60'); // minutes
  const [benchmarkTarget, setBenchmarkTarget] = useState(10);

  // Load today's ideas on mount
  useEffect(() => {
    loadTodayStats();
    const interval = setInterval(loadTodayStats, 60000); // Refresh every min
    return () => clearInterval(interval);
  }, []);

  const loadTodayStats = async () => {
    const allIdeas = await base44.entities.VisionIdea.list('-created_date', 300);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIdeas = allIdeas.filter(i => new Date(i.created_date) >= today);

    setTodayGenerated(todayIdeas.length);

    const breakdown = {};
    todayIdeas.forEach(i => {
      breakdown[i.status] = (breakdown[i.status] || 0) + 1;
    });
    setStatusBreakdown(breakdown);

    const topByScore = todayIdeas
      .sort((a, b) => (b.validation_score || 0) - (a.validation_score || 0))
      .slice(0, 5);
    setTopIdeas(topByScore);
  };

  const runGeneration = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('visionAutoGenerate', {});
      if (res.data?.generatedCount > 0) {
        setLastRun(new Date());
        const nextTime = new Date(Date.now() + interval * 1000);
        setNextRun(nextTime);
        await loadTodayStats();
      }
    } catch (error) {
      console.error('Auto-generation failed:', error);
    }
    setLoading(false);
  };

  const toggleAutoRun = () => {
    if (!running) {
      setRunning(true);
      runGeneration(); // Run immediately
      setNextRun(new Date(Date.now() + interval * 1000));
    } else {
      setRunning(false);
      setNextRun(null);
    }
  };

  const saveSettings = () => {
    const mins = Math.max(5, Math.min(1440, parseInt(intervalInput) || 60));
    setInterval(mins * 60);
    setShowSettings(false);
    if (running) {
      setNextRun(new Date(Date.now() + mins * 60 * 1000));
    }
  };

  const benchmarkPercent = Math.min(100, Math.round((todayGenerated / benchmarkTarget) * 100));
  const benchmarkMet = todayGenerated >= benchmarkTarget;

  return (
    <div className="space-y-4">
      {/* Header + Controls */}
      <div className="rounded-2xl border border-border bg-card/50 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${running ? 'bg-green-400 animate-pulse' : 'bg-muted-foreground'}`} />
            <span className="text-sm font-medium">{running ? 'Auto-Generation Running' : 'Auto-Generation Paused'}</span>
          </div>
          <button onClick={toggleAutoRun} className="flex items-center gap-2 px-4 py-2 rounded-xl btn-ivory text-sm">
            {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {running ? 'Pause' : 'Start 24/7'}
          </button>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Today Generated</div>
            <div className="font-display text-2xl text-accent">{todayGenerated}</div>
            <div className="text-[10px] text-muted-foreground">target: {benchmarkTarget}/day</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Last Run</div>
            <div className="font-mono text-sm">{lastRun ? lastRun.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'Never'}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Next Run</div>
            <div className="font-mono text-sm">{nextRun ? nextRun.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—'}</div>
          </div>
        </div>

        {/* Benchmark progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Daily Benchmark</span>
            <span className={benchmarkMet ? 'text-green-400 font-medium' : 'text-amber-400'}>{benchmarkPercent}%</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <motion.div className="h-full rounded-full" key={benchmarkPercent}
              initial={{ width: 0 }} animate={{ width: `${Math.min(benchmarkPercent, 100)}%` }} transition={{ duration: 0.5 }}
              style={{ background: benchmarkMet ? '#4ade80' : '#f59e0b' }} />
          </div>
        </div>
      </div>

      {/* Status breakdown */}
      <div className="rounded-2xl border border-border bg-card/50 p-5">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium">Pipeline Status (24h)</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {STATUSES.map(status => (
            <div key={status} className="p-3 rounded-xl border border-border bg-secondary/20 text-center">
              <div className={`text-lg font-bold ${STATUS_COLORS[status]}`}>{statusBreakdown[status] || 0}</div>
              <div className="text-[9px] text-muted-foreground mt-0.5 capitalize">{status}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top ideas */}
      {topIdeas.length > 0 && (
        <div className="rounded-2xl border border-border bg-card/50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium">Top Validated Ideas</span>
          </div>
          <div className="space-y-2">
            {topIdeas.map((idea, i) => (
              <div key={idea.id} className="flex items-start justify-between p-3 rounded-xl border border-border bg-secondary/20">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-accent">#{i + 1}</span>
                    <span className="text-sm font-medium truncate">{idea.title}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded border border-border">{idea.domain}</span>
                    <span>{idea.status}</span>
                  </div>
                </div>
                {idea.validation_score > 0 && (
                  <div className={`text-sm font-bold ${idea.validation_score >= 70 ? 'text-green-400' : idea.validation_score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                    {idea.validation_score}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="rounded-2xl border border-border bg-card/50 p-5">
        <button onClick={() => setShowSettings(o => !o)} className="flex items-center gap-2 text-sm font-medium w-full">
          <Settings className="w-4 h-4" />
          Configuration
          <span className="ml-auto text-xs text-muted-foreground">{showSettings ? '−' : '+'}</span>
        </button>
        <AnimatePresence>
          {showSettings && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="pt-4 space-y-4 border-t border-border/40 mt-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Generation Interval (minutes)</label>
                  <input type="number" min="5" max="1440" value={intervalInput}
                    onChange={e => setIntervalInput(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs outline-none focus:border-accent transition" />
                  <div className="text-[9px] text-muted-foreground mt-1">Current: {Math.round(interval / 60)} minutes</div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Daily Target (ideas/day)</label>
                  <input type="number" min="1" max="100" value={benchmarkTarget}
                    onChange={e => setBenchmarkTarget(Math.max(1, parseInt(e.target.value) || 10))}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs outline-none focus:border-accent transition" />
                </div>
                <button onClick={saveSettings} className="w-full px-4 py-2.5 rounded-xl btn-ivory text-sm">
                  Save Settings
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Manual trigger */}
      <button onClick={runGeneration} disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-green-500/30 text-green-400 bg-green-500/10 hover:bg-green-500/20 transition disabled:opacity-60 text-sm">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Running…</> : <><Cpu className="w-4 h-4" /> Generate Ideas Now</>}
      </button>
    </div>
  );
}