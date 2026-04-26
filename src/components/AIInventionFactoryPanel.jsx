import React, { useEffect, useState } from 'react';
import { Factory, FlaskConical, Mail, Rocket, ShieldCheck, TerminalSquare } from 'lucide-react';
import { loadAIInventionFactoryData } from '@/lib/aiInventionFactoryData';

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

function Card({ icon: Icon, title, children }) {
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

export default function AIInventionFactoryPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    loadAIInventionFactoryData()
      .then((result) => mounted && setData(result))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const safe = data || { requests: [], runs: [], proofs: [], mode: 'loading' };

  return (
    <section id="ai-invention-factory" className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">Sandbox invention factory</p>
          <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">Type “build X system” → prove it in sandbox</h2>
          <p className="mt-3 max-w-4xl text-slate-400">
            This layer is designed for controlled invention loops: capture a build request, create sandbox frontend/backend/Supabase proof, validate it with GitHub/Vercel, and report results without exposing secrets or publishing automatically.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge tone={safe.mode === 'live' ? 'green' : 'amber'}>{loading ? 'loading' : safe.mode}</Badge>
          <Badge tone="purple">factory mode</Badge>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card icon={Factory} title="Build Requests">
          <div className="space-y-3">
            {safe.requests.slice(0, 5).map((item) => (
              <Row key={item.system_slug || item.system_name} title={item.system_name} subtitle={item.proof_summary || item.build_prompt} badge={item.status} tone={item.status === 'active' ? 'green' : 'amber'} />
            ))}
          </div>
        </Card>

        <Card icon={FlaskConical} title="Validation Runs">
          <div className="space-y-3">
            {safe.runs.slice(0, 5).map((item, index) => (
              <Row key={`${item.invention_slug}-${item.run_type}-${index}`} title={item.run_type} subtitle={`Frontend: ${item.frontend_status} · Backend: ${item.backend_status} · Supabase: ${item.supabase_status} · Email: ${item.email_status}`} badge={item.status} tone={item.status === 'completed' ? 'green' : 'amber'} />
            ))}
          </div>
        </Card>

        <Card icon={ShieldCheck} title="Proof Records">
          <div className="space-y-3">
            {safe.proofs.slice(0, 5).map((item, index) => (
              <Row key={`${item.title}-${index}`} title={item.title} subtitle={item.notes || item.url || 'Proof pending.'} badge={item.status} tone={item.status === 'verified' ? 'green' : 'blue'} />
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-cyan-200"><TerminalSquare className="h-5 w-5" /><h4 className="font-black text-white">Command Pattern</h4></div>
          <p className="text-sm leading-6 text-slate-400">User request becomes a sandbox record, API route, dashboard proof, GitHub Actions validation, and report artifact.</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-emerald-200"><Rocket className="h-5 w-5" /><h4 className="font-black text-white">Promotion Gate</h4></div>
          <p className="text-sm leading-6 text-slate-400">Sandbox success does not equal production approval. Human review is required before public launch, paid APIs, or new repo creation.</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-purple-200"><Mail className="h-5 w-5" /><h4 className="font-black text-white">Report Delivery</h4></div>
          <p className="text-sm leading-6 text-slate-400">Reports email through Resend when configured; otherwise they are safely logged to Supabase notifications.</p>
        </div>
      </div>
    </section>
  );
}
