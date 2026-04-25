import React, { useEffect, useState } from 'react';
import { Bot, CalendarClock, CheckCircle2, Database, Film, ShieldAlert, Sparkles, Target } from 'lucide-react';
import { loadAIOperatingLoopData } from '@/lib/aiOperatingLoopData';

function MiniCard({ title, value, helper, icon: Icon }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-200">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
      {helper && <p className="mt-2 text-xs leading-5 text-slate-500">{helper}</p>}
    </div>
  );
}

function Pill({ children, tone = 'slate' }) {
  const styles = {
    slate: 'bg-white/10 text-slate-200',
    green: 'bg-emerald-400/10 text-emerald-200',
    amber: 'bg-amber-400/10 text-amber-200',
    red: 'bg-red-400/10 text-red-200',
    blue: 'bg-cyan-400/10 text-cyan-200',
  };
  return <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${styles[tone] || styles.slate}`}>{children}</span>;
}

export default function AIOperatingLoopPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    loadAIOperatingLoopData()
      .then((result) => mounted && setData(result))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const safe = data || { labs: [], schedules: [], runs: [], receipts: [], simulations: [], topics: [], personas: [], mediaJobs: [], riskFlags: [], mode: 'loading' };
  const latestRun = safe.runs?.[0];

  return (
    <section id="ai-operating-loop" className="space-y-6">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-emerald-300">AI operating loop</p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">Visible autonomous system spine</h2>
            <p className="mt-3 max-w-4xl text-slate-400">
              This panel reads the Supabase operating-loop tables when available and falls back safely while migrations are pending. It shows the labs, schedules, personas, topics, risk flags, and next human action that make AI work observable.
            </p>
          </div>
          <div className="flex gap-2">
            <Pill tone={safe.mode === 'live' ? 'green' : 'amber'}>{loading ? 'loading' : safe.mode}</Pill>
            <Pill tone="blue">Supabase-backed when migrated</Pill>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MiniCard icon={Target} title="Active labs" value={safe.labs.length} helper="Trading, business building, media studio." />
        <MiniCard icon={CalendarClock} title="Scheduled loops" value={safe.schedules.length} helper="Market checks, daily lessons, content packages." />
        <MiniCard icon={Bot} title="Avatar personas" value={safe.personas.length} helper="Risk manager, builder, skeptic, creator." />
        <MiniCard icon={ShieldAlert} title="Risk flags" value={safe.riskFlags.length} helper="Safety and compliance gates before publishing." />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 xl:col-span-2">
          <div className="mb-4 flex items-center gap-2 text-emerald-200"><Database className="h-5 w-5" /><h3 className="text-2xl font-black text-white">Latest AI work log</h3></div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-black text-white">{latestRun?.title || 'No AI run logged yet'}</p>
              <Pill tone={latestRun?.status === 'completed' ? 'green' : 'amber'}>{latestRun?.status || 'pending'}</Pill>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">{latestRun?.what_ai_did || 'Operating-loop migration must run before live logs appear.'}</p>
            <p className="mt-3 text-sm text-slate-500"><strong>Next action:</strong> {latestRun?.next_action || 'Run the Supabase migration workflow.'}</p>
          </div>

          <h4 className="mt-6 mb-3 font-black text-white">AI labs</h4>
          <div className="grid gap-3 md:grid-cols-3">
            {safe.labs.slice(0, 3).map((lab) => (
              <div key={lab.slug || lab.title} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <p className="font-bold text-white">{lab.title}</p>
                <p className="mt-1 text-xs text-slate-500">{lab.category}</p>
                <p className="mt-2 text-sm leading-5 text-slate-400">{lab.mission}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <div className="mb-4 flex items-center gap-2 text-purple-200"><Film className="h-5 w-5" /><h3 className="text-2xl font-black text-white">AI creator team</h3></div>
          <div className="space-y-3">
            {safe.personas.slice(0, 5).map((persona) => (
              <div key={persona.name} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-white">{persona.name}</p>
                  <Pill tone={persona.status === 'ready' ? 'green' : 'slate'}>{persona.status || 'draft'}</Pill>
                </div>
                <p className="mt-1 text-sm text-slate-400">{persona.role}</p>
                <p className="mt-1 text-xs text-slate-500">{persona.tone}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <div className="mb-4 flex items-center gap-2 text-cyan-200"><Sparkles className="h-5 w-5" /><h3 className="text-2xl font-black text-white">High-interest strategy topics</h3></div>
          <div className="space-y-3">
            {safe.topics.slice(0, 6).map((topic) => (
              <div key={topic.topic} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <div>
                  <p className="font-bold text-white">{topic.topic}</p>
                  <p className="text-xs text-slate-500">{topic.topic_family}</p>
                </div>
                <Pill tone="blue">{topic.priority_score || 50}</Pill>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <div className="mb-4 flex items-center gap-2 text-amber-200"><ShieldAlert className="h-5 w-5" /><h3 className="text-2xl font-black text-white">Control gates</h3></div>
          <div className="space-y-3">
            {safe.riskFlags.slice(0, 5).map((flag) => (
              <div key={flag.title} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-white">{flag.title}</p>
                  <Pill tone={flag.severity === 'high' ? 'red' : 'amber'}>{flag.severity || 'medium'}</Pill>
                </div>
                <p className="mt-2 text-sm leading-5 text-slate-400">{flag.mitigation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5 text-emerald-100">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-1 h-5 w-5 shrink-0" />
          <p className="text-sm leading-6">
            Accepted control rule: AI may observe, draft, simulate, log, explain, and propose continuously. Humans still control secrets, risky production writes, publishing approval, and financial-market claims.
          </p>
        </div>
      </div>
    </section>
  );
}
