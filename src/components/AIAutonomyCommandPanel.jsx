import React, { useEffect, useState } from 'react';
import { Bell, Bot, CheckSquare, Compass, FileText, Layers, ShieldCheck, Wrench } from 'lucide-react';
import { loadAIAutonomyData } from '@/lib/aiAutonomyData';

function Badge({ children, tone = 'slate' }) {
  const tones = {
    slate: 'bg-white/10 text-slate-200',
    green: 'bg-emerald-400/10 text-emerald-200',
    amber: 'bg-amber-400/10 text-amber-200',
    red: 'bg-red-400/10 text-red-200',
    blue: 'bg-cyan-400/10 text-cyan-200',
    purple: 'bg-purple-400/10 text-purple-200',
  };
  return <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${tones[tone] || tones.slate}`}>{children}</span>;
}

function Panel({ icon: Icon, title, children }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <div className="mb-4 flex items-center gap-2 text-cyan-200"><Icon className="h-5 w-5" /><h3 className="text-2xl font-black text-white">{title}</h3></div>
      {children}
    </div>
  );
}

function Row({ title, subtitle, badge, tone }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-bold text-white">{title}</p>
        {badge && <Badge tone={tone}>{badge}</Badge>}
      </div>
      {subtitle && <p className="mt-2 text-sm leading-5 text-slate-400">{subtitle}</p>}
    </div>
  );
}

export default function AIAutonomyCommandPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    loadAIAutonomyData()
      .then((result) => mounted && setData(result))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const safe = data || { receipts: [], agents: [], tools: [], signals: [], lifecycle: [], reviews: [], notifications: [], mode: 'loading' };

  return (
    <section id="ai-autonomy-command" className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-purple-300">Autonomy command layer</p>
          <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">Agents, receipts, reviews, tools, and lifecycle</h2>
          <p className="mt-3 max-w-4xl text-slate-400">
            This layer turns the operating doctrine into dashboard-visible systems: source receipts, agent registry, admin review queue, notifications, trend discovery, tool intelligence, and lab lifecycle state.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge tone={safe.mode === 'live' ? 'green' : 'amber'}>{loading ? 'loading' : safe.mode}</Badge>
          <Badge tone="purple">controlled autonomy</Badge>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel icon={Bot} title="Agent Registry">
          <div className="grid gap-3 md:grid-cols-2">
            {safe.agents.slice(0, 8).map((agent) => (
              <Row key={agent.name} title={agent.name} subtitle={agent.role} badge={agent.risk_level || agent.status} tone={agent.risk_level === 'high' ? 'red' : 'green'} />
            ))}
          </div>
        </Panel>

        <Panel icon={FileText} title="Source Receipts">
          <div className="space-y-3">
            {safe.receipts.slice(0, 5).map((receipt) => (
              <Row key={`${receipt.title}-${receipt.url}`} title={receipt.title} subtitle={`${receipt.source_type || 'source'} · ${receipt.url || 'no url'} · ${receipt.notes || ''}`} badge={receipt.verification_status || 'pending'} tone={receipt.verification_status === 'verified' ? 'green' : 'amber'} />
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel icon={Compass} title="Discovery Lab">
          <div className="space-y-3">
            {safe.signals.slice(0, 5).map((signal) => (
              <Row key={signal.topic} title={signal.topic} subtitle={signal.strategy_angle || signal.signal_summary} badge={signal.confidence || 50} tone="blue" />
            ))}
          </div>
        </Panel>

        <Panel icon={Wrench} title="Tool Intelligence">
          <div className="space-y-3">
            {safe.tools.slice(0, 6).map((tool) => (
              <Row key={`${tool.tool_name}-${tool.category}`} title={tool.tool_name} subtitle={`${tool.category}: ${tool.use_case || 'No use case recorded.'}`} badge={tool.recommendation_status || 'candidate'} tone={tool.recommendation_status === 'primary' ? 'green' : 'amber'} />
            ))}
          </div>
        </Panel>

        <Panel icon={Layers} title="Lab Lifecycle">
          <div className="space-y-3">
            {safe.lifecycle.slice(0, 5).map((item) => (
              <Row key={`${item.lab_slug}-${item.lifecycle_state}`} title={item.lab_slug || 'lab'} subtitle={item.blocker || item.next_ai_action || 'No blocker recorded.'} badge={item.lifecycle_state} tone={item.blocker ? 'amber' : 'green'} />
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel icon={ShieldCheck} title="Admin Review Queue">
          <div className="space-y-3">
            {safe.reviews.slice(0, 5).map((review) => (
              <Row key={review.review_title} title={review.review_title} subtitle={review.required_admin_action || review.reason} badge={review.risk_level || review.status} tone={review.risk_level === 'high' ? 'red' : 'amber'} />
            ))}
          </div>
        </Panel>

        <Panel icon={Bell} title="Notifications">
          <div className="space-y-3">
            {safe.notifications.slice(0, 5).map((note) => (
              <Row key={note.title} title={note.title} subtitle={note.message} badge={note.severity || note.status} tone={note.severity === 'high' ? 'red' : 'blue'} />
            ))}
          </div>
        </Panel>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-sm leading-6 text-slate-300">
        <strong className="text-white">Control rule:</strong> AI can run routine checks, drafts, simulations, source logs, and reports. Admin review remains required for publishing, paid services, destructive actions, and high-risk claims.
      </div>
    </section>
  );
}
