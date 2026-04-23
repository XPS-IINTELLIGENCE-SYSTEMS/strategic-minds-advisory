import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import {
  ArrowLeft, Loader2, MessageSquare, Play, FileText, Star,
  ChevronDown, ChevronUp, Copy, CheckCircle2, Zap, TrendingUp,
  Brain, Code, BarChart3, Megaphone, Shield, BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const SECTION_ICONS = {
  concept: Brain,
  debate: MessageSquare,
  simulation: BarChart3,
  build: Code,
  brand: Megaphone,
  validation: Shield,
  documentation: BookOpen,
};

const SCORE_COLOR = (s) => s >= 75 ? 'text-green-400' : s >= 50 ? 'text-amber-400' : 'text-red-400';

function Section({ title, icon: Icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-border bg-card/50 overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/20 transition">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-border/50 pt-4">
          {children}
        </div>
      )}
    </div>
  );
}

export default function VisionIdeaDetail({ idea, onBack, onUpdate }) {
  const [running, setRunning] = useState(null);
  const [copied, setCopied] = useState(false);
  const [localIdea, setLocalIdea] = useState(idea);

  const run = async (mode) => {
    setRunning(mode);
    const res = await base44.functions.invoke('visionCortexRun', {
      mode,
      ideaId: localIdea.id,
      sessionId: `vc_${Date.now()}`,
    });

    // Refresh from DB
    const fresh = await base44.entities.VisionIdea.filter({ id: localIdea.id });
    if (fresh[0]) { setLocalIdea(fresh[0]); onUpdate(fresh[0]); }
    setRunning(null);
  };

  const copyDoc = () => {
    if (localIdea.documentation) {
      navigator.clipboard.writeText(localIdea.documentation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const STATUS_ACTIONS = {
    seeded:     ['debate', 'simulate'],
    debating:   ['simulate'],
    simulating: [],
    validated:  ['build'],
    building:   [],
    documented: [],
    failed:     ['debate', 'simulate'],
  };

  const actions = STATUS_ACTIONS[localIdea.status] || [];

  const simData = (() => {
    try { return JSON.parse(localIdea.simulation_result); } catch { return null; }
  })();

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-border flex items-center justify-between gap-4 bg-card/30">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onBack} className="w-8 h-8 rounded-xl border border-border bg-secondary/40 hover:bg-secondary flex items-center justify-center transition flex-shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg truncate">{localIdea.title}</h2>
              {localIdea.validation_score > 0 && (
                <span className={`text-sm font-medium flex-shrink-0 ${SCORE_COLOR(localIdea.validation_score)}`}>
                  {localIdea.validation_score}/100
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">{localIdea.domain} · v{localIdea.iteration || 0} · {localIdea.origin_agent}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions.includes('debate') && (
            <button onClick={() => run('debate')} disabled={!!running}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 text-xs transition disabled:opacity-50">
              {running === 'debate' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageSquare className="w-3.5 h-3.5" />}
              Debate
            </button>
          )}
          {actions.includes('simulate') && (
            <button onClick={() => run('simulate')} disabled={!!running}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-xs transition disabled:opacity-50">
              {running === 'simulate' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              Simulate
            </button>
          )}
          {actions.includes('build') && (
            <button onClick={() => run('build')} disabled={!!running}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl btn-ivory text-xs disabled:opacity-50">
              {running === 'build' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
              Build & Document
            </button>
          )}
        </div>
      </div>

      {/* Running indicator */}
      {running && (
        <div className="flex-shrink-0 px-6 py-3 bg-accent/10 border-b border-accent/20">
          <div className="flex items-center gap-3">
            <Loader2 className="w-4 h-4 text-accent animate-spin" />
            <div className="flex-1">
              <div className="text-xs text-accent font-medium capitalize">
                {running === 'debate' && '🔬 Analyzer → Validator → Strategist — Debate in progress…'}
                {running === 'simulate' && '♟️ Strategist → 📡 Predictor → ⚗️ Inventor → ✅ Validator — Simulation running…'}
                {running === 'build' && '💻 Coder → 📢 Marketer → 📋 Documentor — Building full documentation…'}
              </div>
            </div>
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-4">

          {/* Concept */}
          <Section title="Full Concept" icon={Brain} defaultOpen>
            <div className="prose prose-sm prose-invert max-w-none text-sm [&>p]:text-foreground/85 [&>ul]:text-foreground/80 whitespace-pre-wrap leading-relaxed">
              {localIdea.full_concept}
            </div>
          </Section>

          {/* Debate */}
          {localIdea.debate_log && (
            <Section title="Agent Debate Log" icon={MessageSquare}>
              <div className="space-y-3">
                {localIdea.debate_log.split('## ').filter(Boolean).map((section, i) => {
                  const [heading, ...rest] = section.split('\n');
                  const colors = ['border-red-500/20 bg-red-500/5', 'border-green-500/20 bg-green-500/5', 'border-accent/20 bg-accent/5'];
                  return (
                    <div key={i} className={`p-4 rounded-xl border ${colors[i % 3]}`}>
                      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">{heading}</div>
                      <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{rest.join('\n').trim()}</p>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {/* Simulation */}
          {simData && (
            <Section title="Simulation Results" icon={BarChart3}>
              {simData.validation && (
                <div className="mb-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Validation Scores</div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {Object.entries(simData.validation).filter(([k, v]) => typeof v === 'number').map(([k, v]) => (
                      <div key={k} className="text-center p-2 rounded-xl border border-border bg-secondary/30">
                        <div className={`font-display text-lg ${SCORE_COLOR(v)}`}>{v}</div>
                        <div className="text-[9px] text-muted-foreground mt-0.5 capitalize">{k.replace(/_/g, ' ')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {simData.strategy && (
                <div className="mb-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Strategy</div>
                  <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{simData.strategy}</p>
                </div>
              )}
              {simData.prediction && (
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Prediction Model</div>
                  <pre className="text-xs text-foreground/70 bg-secondary/30 rounded-xl p-3 overflow-x-auto">
                    {JSON.stringify(simData.prediction, null, 2)}
                  </pre>
                </div>
              )}
            </Section>
          )}

          {/* Documentation */}
          {localIdea.documentation && (
            <Section title="Full Documentation Package" icon={BookOpen} defaultOpen={localIdea.status === 'documented'}>
              <div className="flex justify-end mb-3">
                <button onClick={copyDoc} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border border-border bg-secondary/40 hover:bg-secondary transition">
                  {copied ? <><CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy All</>}
                </button>
              </div>
              <div className="prose prose-sm prose-invert max-w-none text-sm [&>h1]:text-lg [&>h2]:text-base [&>h3]:text-sm [&>p]:text-foreground/85 [&>ul]:text-foreground/80">
                <ReactMarkdown>{localIdea.documentation}</ReactMarkdown>
              </div>
            </Section>
          )}

          {/* Sources */}
          {localIdea.sources && (
            <div className="p-4 rounded-xl border border-border bg-secondary/20">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Source Signals</div>
              <p className="text-xs text-muted-foreground">{localIdea.sources}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}