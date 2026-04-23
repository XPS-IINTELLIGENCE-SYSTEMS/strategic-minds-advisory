import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { TestTube, Play, CheckCircle2, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TESTS = [
  {
    id: 'groq_chat',
    name: 'Groq Chat API',
    description: 'Tests AI chat with llama-3.3-70b',
    fn: () => base44.functions.invoke('groqChat', {
      messages: [{ role: 'user', content: 'Reply with exactly: TEST_OK' }],
      systemPrompt: 'You are a test responder. Reply only with what is asked.',
    }),
    validate: (res) => res.data?.content?.includes('TEST_OK'),
  },
  {
    id: 'simulation',
    name: 'Simulation Engine',
    description: 'Tests market simulation with Groq',
    fn: () => base44.functions.invoke('runSimulation', {
      variables: { market_size: '100', target_share: '5', budget: '10' },
      simulationType: 'Market Entry',
      periods: 3,
    }),
    validate: (res) => Array.isArray(res.data?.projections) && res.data.projections.length > 0,
  },
  {
    id: 'prediction',
    name: 'Prediction Engine',
    description: 'Tests predictive analysis with Groq',
    fn: () => base44.functions.invoke('runPrediction', {
      topic: 'AI SaaS market growth',
      context: 'Test scenario',
      horizon: '6 months',
      predictionType: 'Market Trends',
    }),
    validate: (res) => Array.isArray(res.data?.scenarios) && res.data.scenarios.length >= 2,
  },
  {
    id: 'automation',
    name: 'Automation Engine',
    description: 'Tests automation task execution',
    fn: () => base44.functions.invoke('runAutomation', {
      automationType: 'Content Generation',
      config: { count: 3, format: 'LinkedIn posts' },
      targetData: { test: true },
    }),
    validate: (res) => res.data?.status === 'completed' && res.data?.output?.summary,
  },
  {
    id: 'entity_chat',
    name: 'ChatMemory Entity',
    description: 'Tests database read/write for chat memory',
    fn: async () => {
      const created = await base44.entities.ChatMemory.create({
        session_id: 'test_' + Date.now(),
        role: 'user',
        content: 'test message',
      });
      await base44.entities.ChatMemory.delete(created.id);
      return { data: { ok: true } };
    },
    validate: (res) => res.data?.ok === true,
  },
  {
    id: 'entity_sim',
    name: 'SimulationResult Entity',
    description: 'Tests database read/write for simulations',
    fn: async () => {
      const created = await base44.entities.SimulationResult.create({
        title: 'Test Simulation',
        type: 'test',
        result: '{}',
      });
      await base44.entities.SimulationResult.delete(created.id);
      return { data: { ok: true } };
    },
    validate: (res) => res.data?.ok === true,
  },
  {
    id: 'entity_automation',
    name: 'AutomationTask Entity',
    description: 'Tests database for automation tasks',
    fn: async () => {
      const created = await base44.entities.AutomationTask.create({
        name: 'Test Task',
        automation_type: 'test',
        status: 'idle',
      });
      await base44.entities.AutomationTask.delete(created.id);
      return { data: { ok: true } };
    },
    validate: (res) => res.data?.ok === true,
  },
];

export default function TestModule() {
  const [results, setResults] = useState({});
  const [running, setRunning] = useState(false);
  const [runningId, setRunningId] = useState(null);

  const runSingle = async (test) => {
    setRunningId(test.id);
    setResults(prev => ({ ...prev, [test.id]: { status: 'running' } }));
    const start = Date.now();
    try {
      const res = await test.fn();
      const pass = test.validate(res);
      setResults(prev => ({
        ...prev,
        [test.id]: { status: pass ? 'pass' : 'fail', duration: Date.now() - start, detail: pass ? 'Validation passed' : 'Validation failed — unexpected response' }
      }));
    } catch (e) {
      setResults(prev => ({
        ...prev,
        [test.id]: { status: 'error', duration: Date.now() - start, detail: e.message }
      }));
    }
    setRunningId(null);
  };

  const runAll = async () => {
    setRunning(true);
    setResults({});
    for (const test of TESTS) {
      await runSingle(test);
    }
    setRunning(false);
  };

  const passCount = Object.values(results).filter(r => r.status === 'pass').length;
  const failCount = Object.values(results).filter(r => r.status === 'fail' || r.status === 'error').length;
  const total = Object.values(results).length;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl text-gradient-ivory">System Test Module</h2>
            <p className="text-sm text-muted-foreground mt-1">Validate all AI systems end-to-end</p>
          </div>
          <button
            onClick={runAll}
            disabled={running}
            className="btn-ivory rounded-xl px-5 py-2.5 text-sm flex items-center gap-2 disabled:opacity-60"
          >
            {running ? <><Loader2 className="w-4 h-4 animate-spin" /> Running All…</> : <><Play className="w-4 h-4" /> Run All Tests</>}
          </button>
        </div>

        {/* Summary bar */}
        {total > 0 && (
          <div className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card/50">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-sm"><span className="font-medium text-green-400">{passCount}</span> passed</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm"><span className="font-medium text-red-400">{failCount}</span> failed</span>
            </div>
            <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent to-green-400 transition-all duration-700"
                style={{ width: `${total > 0 ? (passCount / total * 100) : 0}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{total}/{TESTS.length} tested</span>
          </div>
        )}

        {/* Tests */}
        <div className="space-y-3">
          {TESTS.map(test => {
            const r = results[test.id];
            const isRunning = runningId === test.id;
            return (
              <div key={test.id} className={`p-5 rounded-2xl border transition-all ${
                r?.status === 'pass' ? 'border-green-500/30 bg-green-500/5' :
                r?.status === 'fail' || r?.status === 'error' ? 'border-red-500/30 bg-red-500/5' :
                'border-border bg-card/50'
              }`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center">
                      {isRunning ? <Loader2 className="w-5 h-5 text-accent animate-spin" /> :
                       r?.status === 'pass' ? <CheckCircle2 className="w-5 h-5 text-green-400" /> :
                       r?.status === 'fail' || r?.status === 'error' ? <XCircle className="w-5 h-5 text-red-400" /> :
                       <TestTube className="w-5 h-5 text-muted-foreground" />}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{test.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{test.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {r?.duration && <span className="text-xs text-muted-foreground">{r.duration}ms</span>}
                    <button
                      onClick={() => runSingle(test)}
                      disabled={isRunning || running}
                      className="w-8 h-8 rounded-xl border border-border bg-secondary/40 hover:bg-secondary flex items-center justify-center transition disabled:opacity-40"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {r?.detail && r.status !== 'pass' && (
                  <div className="mt-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    {r.detail}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}