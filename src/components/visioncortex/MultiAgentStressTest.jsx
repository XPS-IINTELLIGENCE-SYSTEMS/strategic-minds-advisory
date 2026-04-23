import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingDown, Shield, Brain, Play, Pause, RotateCcw, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

const BLACK_SWAN_SCENARIOS = [
  { id: 'recession', name: '🔴 Severe Recession', impact: 'CAC +40%, Churn +25%, Funding Freeze', severity: 'critical' },
  { id: 'competitor', name: '⚔️ Major Competitor Entry', impact: 'Price wars, CAC +50%, Market share loss', severity: 'critical' },
  { id: 'regulation', name: '⚖️ Regulatory Crackdown', impact: '+60% compliance costs, customer ban', severity: 'high' },
  { id: 'tech_shift', name: '⚡ Technology Disruption', impact: 'Product obsolescence risk, replatform required', severity: 'high' },
  { id: 'founder_exit', name: '👤 Key Founder Departure', impact: 'Leadership gap, investor confidence -40%', severity: 'high' },
  { id: 'supply_chain', name: '🚚 Supply Chain Collapse', impact: '+80% COGS, delivery delays 6 months', severity: 'critical' },
  { id: 'market_shift', name: '📉 Market Demand Shift', impact: 'TAM shrinks 50%, pivoting required', severity: 'high' },
];

export default function MultiAgentStressTest({ idea }) {
  const [running, setRunning] = useState(false);
  const [scenario, setScenario] = useState(null);
  const [agents, setAgents] = useState([
    { id: 'validator', name: 'Validator', emoji: '✅', status: 'idle', response: null },
    { id: 'strategist', name: 'Strategist', emoji: '♟️', status: 'idle', response: null },
    { id: 'analyzer', name: 'Analyzer', emoji: '🔬', status: 'idle', response: null },
  ]);
  const [round, setRound] = useState(0);
  const [verdict, setVerdict] = useState(null);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [agents, verdict]);

  const runStressTest = async () => {
    if (!idea || !scenario) return;
    setRunning(true);
    setLoading(true);
    setRound(0);
    setVerdict(null);
    setAgents(a => a.map(ag => ({ ...ag, status: 'idle', response: null })));

    try {
      const res = await base44.functions.invoke('multiAgentStressTest', {
        ideaId: idea.id,
        ideaTitle: idea.title,
        ideaDomain: idea.domain,
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        modelData: idea.simulation_result ? JSON.parse(idea.simulation_result) : null,
      });

      if (res.data.rounds) {
        for (const roundData of res.data.rounds) {
          setRound(roundData.roundNum);
          setAgents(roundData.agentResponses);
          await new Promise(r => setTimeout(r, 2000));
        }
      }

      setVerdict(res.data.finalVerdict);
    } catch (error) {
      console.error('Stress test failed:', error);
      setVerdict({ survived: false, reason: 'Test execution error', recommendations: [] });
    }

    setRunning(false);
    setLoading(false);
  };

  const handleReset = () => {
    setRound(0);
    setVerdict(null);
    setScenario(null);
    setAgents(a => a.map(ag => ({ ...ag, status: 'idle', response: null })));
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h2 className="font-display text-2xl text-gradient-ivory">Multi-Agent Stress Test</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Competitive agent loop stress-tests {idea?.title} against black swan scenarios
          </p>
        </div>

        {/* Scenario Selector */}
        <div className="p-5 rounded-2xl border border-border bg-card/50 space-y-4">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Black Swan Scenario</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {BLACK_SWAN_SCENARIOS.map(s => (
              <button
                key={s.id}
                onClick={() => setScenario(s)}
                disabled={running}
                className={`text-left p-4 rounded-xl border transition-all ${
                  scenario?.id === s.id
                    ? 'border-accent bg-accent/10'
                    : 'border-border bg-secondary/30 hover:bg-secondary'
                } disabled:opacity-40`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="text-sm font-medium">{s.name}</span>
                  <span className={`text-[10px] px-2 py-1 rounded border ${
                    s.severity === 'critical' ? 'border-red-500/30 bg-red-500/10 text-red-400' : 'border-orange-500/30 bg-orange-500/10 text-orange-400'
                  }`}>
                    {s.severity}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">{s.impact}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <button
            onClick={runStressTest}
            disabled={!scenario || running}
            className="flex-1 btn-ivory rounded-full px-6 py-3 flex items-center justify-center gap-2 disabled:opacity-40 transition"
          >
            {running ? (
              <>
                <Clock className="w-4 h-4 animate-spin" /> Running Test...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Start Stress Test
              </>
            )}
          </button>
          {(round > 0 || verdict) && (
            <button
              onClick={handleReset}
              className="border border-border rounded-full px-6 py-3 flex items-center gap-2 hover:bg-secondary transition"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          )}
        </div>

        {/* Agent Interaction Loop */}
        {(round > 0 || running) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-card/50 p-6 space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">
                Round <span className="text-accent">{round}</span> / 3
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Scenario: <span className="text-foreground">{scenario?.name}</span>
              </div>
            </div>

            {/* Agent Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {agents.map(agent => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    agent.status === 'thinking'
                      ? 'border-accent/50 bg-accent/5'
                      : agent.status === 'responded'
                      ? 'border-green-500/50 bg-green-500/5'
                      : 'border-border bg-secondary/30'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{agent.emoji}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{agent.name}</div>
                      <div className="text-[10px] text-muted-foreground">{agent.status}</div>
                    </div>
                    {agent.status === 'thinking' && <Zap className="w-3.5 h-3.5 text-accent animate-spin" />}
                    {agent.status === 'responded' && <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />}
                  </div>

                  {agent.response && (
                    <div className="p-3 rounded-lg bg-background/50 border border-border text-xs text-foreground/80 leading-relaxed max-h-32 overflow-y-auto">
                      {agent.response}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Debate Summary */}
            {round > 0 && (
              <div className="p-4 rounded-xl border border-accent/20 bg-accent/5 space-y-2">
                <div className="text-xs font-medium text-accent">Round {round} Summary</div>
                <div className="text-xs text-foreground/80">
                  Agents analyzing scenario impact on {idea?.title}. Validator flags risks, Strategist proposes pivots, Analyzer models outcomes.
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Final Verdict */}
        <AnimatePresence>
          {verdict && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border-2 p-6 space-y-4 ${
                verdict.survived
                  ? 'border-green-500/30 bg-green-500/5'
                  : 'border-red-500/30 bg-red-500/5'
              }`}
            >
              <div className="flex items-start gap-3">
                {verdict.survived ? (
                  <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                )}
                <div className="flex-1">
                  <h3 className={`text-lg font-display ${verdict.survived ? 'text-green-400' : 'text-red-400'}`}>
                    {verdict.survived ? '✓ Model Resilient' : '✗ Critical Vulnerabilities'}
                  </h3>
                  <p className="text-sm text-foreground/80 mt-2">{verdict.reason}</p>

                  {verdict.recommendations && verdict.recommendations.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <div className="text-xs font-medium text-accent">Agent Recommendations:</div>
                      <ul className="space-y-1">
                        {verdict.recommendations.map((rec, i) => (
                          <li key={i} className="text-xs text-foreground/70 flex items-start gap-2">
                            <span className="text-accent mt-1">→</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {verdict.failurePoints && (
                    <div className="mt-4 space-y-2 p-3 rounded-lg border border-red-500/20 bg-red-500/10">
                      <div className="text-xs font-medium text-red-400">Failure Points:</div>
                      <ul className="space-y-1">
                        {verdict.failurePoints.map((point, i) => (
                          <li key={i} className="text-xs text-red-300/80 flex items-start gap-2">
                            <span>•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={scrollRef} />
      </div>
    </div>
  );
}