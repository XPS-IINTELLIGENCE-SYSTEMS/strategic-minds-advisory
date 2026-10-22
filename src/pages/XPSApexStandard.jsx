import React, { useEffect, useMemo, useState } from 'react'
import { ExternalLink, ShieldCheck, Target, Trophy } from 'lucide-react'
import { loadXpsApexData, xpsTrackerUrl } from '@/lib/xpsApexData'

const systemStamps = ['Contractor Success', 'AI Intelligence', 'The Holy Grail', 'Commercial Secrets', 'Residential Secrets', 'Government Secrets', 'Members Only', 'Training Systems']

function Card({ title, value, note }) {
  return <div className="rounded-3xl border border-border bg-card p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">{title}</p><p className="mt-2 text-3xl font-black text-foreground">{value}</p><p className="mt-2 text-sm text-muted-foreground">{note}</p></div>
}

function Section({ title, children }) {
  return <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm"><div className="border-b border-amber-500/60 bg-slate-950 px-6 py-4 text-white"><p className="text-xs font-black uppercase tracking-[0.22em] text-amber-300">XPS Apex Standard</p><h2 className="mt-1 text-2xl font-black tracking-tight">{title}</h2></div><div className="p-6">{children}</div></section>
}

export default function XPSApexStandard() {
  const [data, setData] = useState({ contractors: [], tasks: [], walkthroughs: [], signoffs: [], mode: 'loading' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    loadXpsApexData().then((result) => mounted && setData(result)).finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [])

  const metrics = useMemo(() => {
    const contractors = data.contractors || []
    const avgScore = contractors.length ? contractors.reduce((sum, c) => sum + Number(c.score || 0), 0) / contractors.length : 0
    return {
      avgScore: avgScore.toFixed(1),
      elite: contractors.filter((c) => ['Preferred', 'Elite'].includes(c.tier)).length,
      gates: (data.tasks || []).filter((task) => task.status === 'Needs Review').length,
      walkthroughs: data.walkthroughs?.length || 0,
    }
  }, [data])

  return <main className="min-h-screen bg-background text-foreground"><div className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-8">
    <header className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm"><div className="grid gap-6 bg-slate-950 p-8 text-white md:grid-cols-[1fr_auto]"><div><p className="text-xs font-black uppercase tracking-[0.3em] text-amber-300">Xtreme Polishing Systems · XPS Xpress · XPS Contractor Success</p><h1 className="mt-3 text-5xl font-black tracking-tight md:text-7xl">XPS APEX STANDARD</h1><p className="mt-4 max-w-4xl text-lg leading-7 text-slate-300">Phase 1 test module for contractor quality, customer walkthroughs, tier access, founder signoff, and XPS system readiness.</p></div><div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/10 p-4"><div className="rounded-2xl bg-white px-4 py-5 text-center text-black shadow-lg"><p className="text-xs font-black uppercase tracking-widest text-amber-700">Primary Stamp</p><p className="mt-1 text-2xl font-black">Contractor Success</p></div><span className="rounded-full bg-amber-300 px-3 py-2 text-center text-xs font-black uppercase tracking-wide text-black">{loading ? 'loading' : data.mode}</span><a href={xpsTrackerUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-black text-black">Open Google Tracker <ExternalLink className="h-4 w-4" /></a></div></div></header>

    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><Card title="Avg contractor score" value={metrics.avgScore} note="Target: 85+ preferred readiness." /><Card title="Preferred / Elite" value={metrics.elite} note="Upper-tier contractor count." /><Card title="Review gates" value={metrics.gates} note="Items awaiting owner decision." /><Card title="Walkthroughs" value={metrics.walkthroughs} note="Customer experience records." /></div>

    <Section title="System-Level Stamps"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{systemStamps.map((stamp) => <div key={stamp} className="rounded-2xl border border-border bg-background p-3"><div className="rounded-xl bg-amber-400 px-3 py-2 text-center text-xs font-black uppercase tracking-wide text-black">{stamp}</div></div>)}</div></Section>

    <Section title="Contractor Scorecard"><div className="overflow-x-auto"><table className="w-full min-w-[720px] border-collapse text-sm"><thead><tr className="bg-amber-400 text-left text-black"><th className="p-3">Contractor</th><th className="p-3">Score</th><th className="p-3">Tier</th><th className="p-3">Jobs</th><th className="p-3">Avg Rating</th><th className="p-3">Purchase Volume</th></tr></thead><tbody>{data.contractors.map((contractor) => <tr key={contractor.id} className="border-b border-border"><td className="p-3"><strong>{contractor.company_name}</strong><p className="text-xs text-muted-foreground">{contractor.owner_name}</p></td><td className="p-3 font-black">{contractor.score}</td><td className="p-3"><span className="rounded-full bg-secondary px-3 py-1 text-xs font-black">{contractor.tier}</span></td><td className="p-3">{contractor.jobs_rated}</td><td className="p-3">{Number(contractor.avg_rating || 0).toFixed(2)}</td><td className="p-3">${Number(contractor.purchase_volume_ytd || 0).toLocaleString()}</td></tr>)}</tbody></table></div></Section>

    <Section title="Implementation Board"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">{['Not Started','In Progress','Needs Review','Approved','Blocked'].map((status) => <div key={status} className="rounded-2xl border border-border bg-background p-4"><h3 className="mb-3 font-black">{status}</h3><div className="space-y-3">{data.tasks.filter((task) => task.status === status).map((task) => <div key={task.id} className="rounded-2xl border border-border bg-card p-3"><p className="font-black">{task.area}</p><p className="mt-1 text-sm text-muted-foreground">{task.task}</p><p className="mt-2 text-xs text-muted-foreground">{task.owner} · {task.due_date}</p></div>)}</div></div>)}</div></Section>

    <Section title="Founder + Participant Signoff"><div className="grid gap-4 md:grid-cols-3">{data.signoffs.map((signoff) => <div key={signoff.id} className="rounded-2xl border border-border bg-background p-4"><p className="font-black">{signoff.reviewer}</p><p className="text-sm text-muted-foreground">{signoff.role}</p><p className="mt-3 rounded-xl border border-dashed border-border p-3 text-sm text-muted-foreground">Decision: {signoff.decision}</p></div>)}</div></Section>

    <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-emerald-900 dark:text-emerald-100"><div className="flex items-start gap-3"><ShieldCheck className="mt-1 h-5 w-5 shrink-0" /><p className="text-sm leading-6">Control rule: XPS Apex can draft, score, log, and recommend. Humans approve pricing rules, customer data use, contractor status, and production launch.</p></div></div>
  </div></main>
}
