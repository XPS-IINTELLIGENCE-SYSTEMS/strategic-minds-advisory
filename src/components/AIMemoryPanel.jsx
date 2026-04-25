import React, { useEffect, useState } from 'react';
import { AlertTriangle, Archive, Brain, GitBranch, ListChecks, MessageSquareText } from 'lucide-react';
import { loadAIMemoryData, stateValue } from '@/lib/aiMemoryData';

function Badge({ children, tone = 'slate' }) {
  const tones = {
    slate: 'bg-white/10 text-slate-200',
    green: 'bg-emerald-400/10 text-emerald-200',
    amber: 'bg-amber-400/10 text-amber-200',
    red: 'bg-red-400/10 text-red-200',
    blue: 'bg-cyan-400/10 text-cyan-200',
  };
  return <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${tones[tone] || tones.slate}`}>{children}</span>;
}

function MemoryCard({ icon: Icon, title, children }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-200">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-xl font-black text-white">{title}</h3>
      <div className="mt-3 text-sm leading-6 text-slate-400">{children}</div>
    </div>
  );
}

export default function AIMemoryPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    loadAIMemoryData()
      .then((result) => mounted && setData(result))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const safe = data || { systemState: [], snapshots: [], decisions: [], blockers: [], repos: [], mode: 'loading' };
  const currentObjective = stateValue(safe.systemState, 'current_objective', safe.snapshots?.[0]?.current_objective || 'Current objective pending.');
  const currentBlocker = stateValue(safe.systemState, 'current_blocker', safe.snapshots?.[0]?.current_blocker || 'No blocker recorded.');
  const nextHumanAction = stateValue(safe.systemState, 'next_human_action', safe.snapshots?.[0]?.next_human_action || 'No human action recorded.');
  const nextAiAction = stateValue(safe.systemState, 'next_ai_action', safe.snapshots?.[0]?.next_ai_action || 'No AI action recorded.');

  return (
    <section id="ai-memory" className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">Persistent AI memory</p>
          <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">System state that survives the chat</h2>
          <p className="mt-3 max-w-4xl text-slate-400">
            This panel turns the uploaded memory/rehydration systems into a Supabase-backed operating memory: objective, blockers, decisions, repo registry, and next actions.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge tone={safe.mode === 'live' ? 'green' : 'amber'}>{loading ? 'loading' : safe.mode}</Badge>
          <Badge tone="blue">memory backend</Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MemoryCard icon={Brain} title="Current objective">{currentObjective}</MemoryCard>
        <MemoryCard icon={AlertTriangle} title="Current blocker">{currentBlocker}</MemoryCard>
        <MemoryCard icon={MessageSquareText} title="Next human action">{nextHumanAction}</MemoryCard>
        <MemoryCard icon={ListChecks} title="Next AI action">{nextAiAction}</MemoryCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 xl:col-span-2">
          <div className="mb-4 flex items-center gap-2 text-cyan-200"><Archive className="h-5 w-5" /><h3 className="text-2xl font-black text-white">Decision log</h3></div>
          <div className="space-y-3">
            {safe.decisions.slice(0, 5).map((decision) => (
              <div key={decision.decision_title} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-white">{decision.decision_title}</p>
                  <Badge tone={decision.risk_level === 'high' ? 'red' : decision.risk_level === 'medium' ? 'amber' : 'green'}>{decision.risk_level || 'low'}</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-300">{decision.decision}</p>
                {decision.rationale && <p className="mt-2 text-xs text-slate-500">{decision.rationale}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <div className="mb-4 flex items-center gap-2 text-amber-200"><AlertTriangle className="h-5 w-5" /><h3 className="text-2xl font-black text-white">Open blockers</h3></div>
          <div className="space-y-3">
            {safe.blockers.slice(0, 5).map((blocker) => (
              <div key={blocker.blocker_title} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-white">{blocker.blocker_title}</p>
                  <Badge tone={blocker.severity === 'high' ? 'red' : 'amber'}>{blocker.severity || 'medium'}</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-400">{blocker.impact || blocker.description}</p>
                <p className="mt-2 text-xs text-slate-500"><strong>Human:</strong> {blocker.required_human_action || 'No human action recorded.'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <div className="mb-4 flex items-center gap-2 text-emerald-200"><GitBranch className="h-5 w-5" /><h3 className="text-2xl font-black text-white">Repo registry</h3></div>
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-white/10 text-slate-300">
              <tr>
                <th className="p-3 text-left">Repo</th>
                <th className="p-3 text-left">Classification</th>
                <th className="p-3 text-left">Decision</th>
                <th className="p-3 text-left">Purpose</th>
              </tr>
            </thead>
            <tbody>
              {safe.repos.slice(0, 8).map((repo) => (
                <tr key={repo.repo_full_name} className="border-t border-white/10 hover:bg-white/[0.03]">
                  <td className="p-3 font-bold text-white">{repo.repo_full_name}</td>
                  <td className="p-3 text-slate-300">{repo.classification}</td>
                  <td className="p-3 text-emerald-200">{repo.ai_use_decision}</td>
                  <td className="p-3 text-slate-400">{repo.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
