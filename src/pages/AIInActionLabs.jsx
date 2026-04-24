import React, { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  AlertTriangle,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Clock,
  ExternalLink,
  Mail,
  PlayCircle,
  RefreshCw,
  Shield,
  Target,
  TrendingUp,
  Wallet,
} from 'lucide-react';

const COLORS = ['#22c55e', '#38bdf8', '#a78bfa', '#fb923c', '#f87171', '#2dd4bf', '#facc15', '#94a3b8'];

const portfolioSeed = [
  { symbol: 'CASH', name: 'Cash Reserve', category: 'Cash', allocation: 20, value: 10000, livePrice: 'Cash', source: 'Internal paper ledger' },
  { symbol: 'SPY', name: 'S&P 500 ETF', category: 'ETF', allocation: 18, value: 9000, livePrice: 'Fetch live', source: 'Verified market source required' },
  { symbol: 'QQQ', name: 'Nasdaq 100 ETF', category: 'ETF', allocation: 14, value: 7000, livePrice: 'Fetch live', source: 'Verified market source required' },
  { symbol: 'BTC', name: 'Bitcoin', category: 'Crypto', allocation: 14, value: 7000, livePrice: 'Fetch live', source: 'Verified market source required' },
  { symbol: 'ETH', name: 'Ethereum', category: 'Crypto', allocation: 10, value: 5000, livePrice: 'Fetch live', source: 'Verified market source required' },
  { symbol: 'NVDA', name: 'Large-Cap Momentum', category: 'Stock', allocation: 10, value: 5000, livePrice: 'Fetch live', source: 'Verified market source required' },
  { symbol: 'GLD', name: 'Gold ETF / Hedge', category: 'Hedge', allocation: 7, value: 3500, livePrice: 'Fetch live', source: 'Verified market source required' },
  { symbol: 'TACTICAL', name: 'Day Trading Bucket', category: 'Tactical', allocation: 7, value: 3500, livePrice: 'Paper only', source: 'Simulated trade ledger' },
];

const equitySeed = [
  { label: 'Start', value: 50000 },
  { label: 'W1', value: 50000 },
  { label: 'W2', value: 50000 },
  { label: 'W3', value: 50000 },
  { label: 'W4', value: 50000 },
];

const riskRules = [
  { rule: 'Max risk / trade', value: 1.25 },
  { rule: 'Daily stop', value: 2.5 },
  { rule: 'Weekly stop', value: 6 },
  { rule: 'Cash reserve', value: 20 },
];

const scheduleRows = [
  ['Every 15 minutes', 'Live paper-trading report', 'Check exact prices, source links, risk status, and trade/no-trade decision.'],
  ['Daily 9:00 AM EST', 'Daily summary', 'Market context, portfolio status, watchlist, and education lesson.'],
  ['Daily 5:00 PM EST', 'Content package', 'YouTube, Shorts, TikTok/Reels, X, LinkedIn, Instagram, newsletter, thumbnail prompts.'],
  ['Friday 4:00 PM EST', 'Weekly recap', 'Long-form video script, 5 clips, weekly lessons, dashboard improvements.'],
  ['Monday 10:00 AM EST', 'Platform optimizer', 'Fragility review, next experiments, monetization-safe education roadmap.'],
];

const labs = [
  'AI Paper Trading Lab',
  'AI Real Estate Deal Lab',
  'AI Side Hustle Builder Lab',
  'AI Local Lead Gen Lab',
  'AI Automation Agency Lab',
  'AI Personal Finance Lab',
  'AI Business Acquisition Lab',
  'AI Content Empire Lab',
];

function StatCard({ icon: Icon, label, value, helper }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur">
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
      {helper && <p className="mt-2 text-xs text-slate-500">{helper}</p>}
    </div>
  );
}

function SectionTitle({ eyebrow, title, children }) {
  return (
    <div className="mb-6">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-emerald-300">{eyebrow}</p>
      <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">{title}</h2>
      {children && <p className="mt-3 max-w-3xl text-slate-400">{children}</p>}
    </div>
  );
}

export default function AIInActionLabs() {
  const [startingCapital, setStartingCapital] = useState(50000);
  const targetCapital = 1000000;

  const metrics = useMemo(() => {
    const multiple = targetCapital / startingCapital;
    const dailyCompound = Math.pow(multiple, 1 / 360) - 1;
    return {
      multiple,
      dailyCompound,
      riskPerTrade: startingCapital * 0.01,
      dailyStop: startingCapital * 0.025,
      weeklyStop: startingCapital * 0.06,
    };
  }, [startingCapital]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
      <section className="relative overflow-hidden px-6 py-20 md:px-10 lg:px-16">
        <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute right-0 top-32 h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200">
            <Activity className="h-4 w-4" /> AI in Action Labs command center
          </div>
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <h1 className="max-w-5xl text-5xl font-black leading-[0.95] tracking-tight text-white md:text-7xl">
                Watch AI use real data, simulated decisions, and transparent systems.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
                AI in Action Labs turns scheduled GPT workflows into an educational media platform. The first lab is a live-source, paper-only trading simulation that teaches risk control, decision quality, and content creation without representing simulated trades as real-money performance.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#paper-lab" className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-emerald-300">
                  <PlayCircle className="h-5 w-5" /> View Paper Trading Lab
                </a>
                <a href="#content-engine" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 font-bold text-white transition hover:bg-white/10">
                  <CalendarClock className="h-5 w-5" /> View Content Engine
                </a>
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Current mode</p>
                  <p className="text-xl font-black text-white">Educational simulation</p>
                </div>
                <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-200">Paper only</span>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={equitySeed}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="label" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" tickFormatter={(v) => `$${Math.round(v / 1000)}k`} />
                    <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
                    <Area type="monotone" dataKey="value" stroke="#22c55e" fill="#22c55e" fillOpacity={0.24} strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl space-y-16 px-6 pb-24 md:px-10 lg:px-16">
        <section id="paper-lab" className="space-y-6">
          <SectionTitle eyebrow="Lab 01" title="AI Paper Trading Lab">
            A $50,000 simulated account, exact-source live price checks, risk rules, and email-safe visual reports. No fake prices. No fake fills. No performance guarantees.
          </SectionTitle>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <StatCard icon={Wallet} label="Starting paper capital" value={`$${startingCapital.toLocaleString()}`} />
            <StatCard icon={Target} label="Case-study target" value="$1,000,000" helper="Aggressive educational scenario" />
            <StatCard icon={TrendingUp} label="Required multiple" value={`${metrics.multiple.toFixed(2)}x`} />
            <StatCard icon={Clock} label="Required daily compound" value={`${(metrics.dailyCompound * 100).toFixed(6)}%`} />
            <StatCard icon={Shield} label="1% risk unit" value={`$${metrics.riskPerTrade.toFixed(2)}`} />
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 xl:col-span-2">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-black text-white">Live Asset Table</h3>
                  <p className="text-sm text-slate-400">Live prices must be inserted only from verified sources during scheduled runs.</p>
                </div>
                <button className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 px-4 py-2 text-sm font-bold text-emerald-200">
                  <RefreshCw className="h-4 w-4" /> 15-minute check
                </button>
              </div>
              <div className="overflow-hidden rounded-2xl border border-white/10">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="bg-white/10 text-slate-300">
                    <tr>
                      <th className="p-3 text-left">Symbol</th>
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Category</th>
                      <th className="p-3 text-right">Allocation</th>
                      <th className="p-3 text-right">Value</th>
                      <th className="p-3 text-right">Live Price</th>
                      <th className="p-3 text-left">Source Rule</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolioSeed.map((row) => (
                      <tr key={row.symbol} className="border-t border-white/10 hover:bg-white/[0.03]">
                        <td className="p-3 font-black text-white">{row.symbol}</td>
                        <td className="p-3 text-slate-300">{row.name}</td>
                        <td className="p-3 text-slate-400">{row.category}</td>
                        <td className="p-3 text-right">{row.allocation}%</td>
                        <td className="p-3 text-right">${row.value.toLocaleString()}</td>
                        <td className="p-3 text-right text-amber-200">{row.livePrice}</td>
                        <td className="p-3 text-slate-400">{row.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h3 className="text-2xl font-black text-white">Allocation Map</h3>
              <p className="mb-4 text-sm text-slate-400">Diversified simulated starting mix.</p>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={portfolioSeed} dataKey="allocation" nameKey="symbol" innerRadius={58} outerRadius={105} paddingAngle={4}>
                      {portfolioSeed.map((item, index) => <Cell key={item.symbol} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h3 className="text-2xl font-black text-white">Risk Dashboard</h3>
              <p className="mb-4 text-sm text-slate-400">The platform teaches survival before speed.</p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskRules} layout="vertical" margin={{ left: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis type="number" stroke="#94a3b8" />
                    <YAxis dataKey="rule" type="category" stroke="#94a3b8" width={125} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Bar dataKey="value" fill="#38bdf8" radius={[0, 10, 10, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-3xl border border-amber-400/30 bg-amber-500/10 p-6">
              <div className="mb-4 flex items-start gap-3 text-amber-100">
                <AlertTriangle className="mt-1 h-6 w-6 shrink-0" />
                <div>
                  <h3 className="text-2xl font-black">Exact-price and compliance rule</h3>
                  <p className="mt-2 text-sm leading-6 text-amber-100/80">
                    Do not fabricate live prices, fills, source links, screenshots, or results. If a live number cannot be verified, the report must say: Price unavailable from verified source.
                  </p>
                </div>
              </div>
              <div className="grid gap-3 text-sm text-amber-50/90">
                <div className="rounded-2xl bg-black/20 p-4">Educational paper trading only. Not financial advice.</div>
                <div className="rounded-2xl bg-black/20 p-4">A $50K to $1M scenario is an extreme case study, not a normal expectation.</div>
                <div className="rounded-2xl bg-black/20 p-4">Every trade requires entry, stop, target, position size, thesis, and invalidation.</div>
              </div>
            </div>
          </div>
        </section>

        <section id="content-engine">
          <SectionTitle eyebrow="Scheduled media engine" title="From GPT Tasks to social video platform">
            The same scheduled reports become YouTube episodes, Shorts, Reels, newsletters, thumbnail prompts, and platform optimization briefs.
          </SectionTitle>
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-white/10 text-slate-300">
                <tr>
                  <th className="p-4 text-left">Cadence</th>
                  <th className="p-4 text-left">Output</th>
                  <th className="p-4 text-left">Purpose</th>
                </tr>
              </thead>
              <tbody>
                {scheduleRows.map(([cadence, output, purpose]) => (
                  <tr key={cadence} className="border-t border-white/10">
                    <td className="p-4 font-bold text-white">{cadence}</td>
                    <td className="p-4 text-emerald-200">{output}</td>
                    <td className="p-4 text-slate-400">{purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <SectionTitle eyebrow="Expansion roadmap" title="More AI-in-action labs">
            The trading lab is the first proof loop. The broader platform can teach many high-interest skills by showing AI working in public with sources, simulations, and transparent decisions.
          </SectionTitle>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {labs.map((lab, index) => (
              <div key={lab} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-sm font-black text-white">{index + 1}</div>
                <h3 className="text-lg font-black text-white">{lab}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">A source-backed education workflow that turns AI process into watchable lessons, reports, scripts, and dashboards.</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 md:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <SectionTitle eyebrow="Build controls" title="Operator inputs">
                Adjust the starting capital here for scenario modeling. Live market values still require verified source fetches during scheduled runs.
              </SectionTitle>
              <label className="text-sm font-bold text-slate-300">Starting paper capital</label>
              <input
                value={startingCapital}
                onChange={(event) => setStartingCapital(Number(event.target.value) || 0)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none ring-emerald-400/30 focus:ring-4"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                <p className="text-sm text-slate-400">Daily loss stop</p>
                <p className="mt-1 text-2xl font-black text-white">${metrics.dailyStop.toFixed(2)}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                <p className="text-sm text-slate-400">Weekly loss stop</p>
                <p className="mt-1 text-2xl font-black text-white">${metrics.weeklyStop.toFixed(2)}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 md:col-span-2">
                <p className="text-sm text-slate-400">Next deployment step</p>
                <p className="mt-1 text-xl font-black text-white">Connect Vercel, import this repository, and deploy the app.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-emerald-400/20 bg-emerald-400/10 p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 text-emerald-200">
                <CheckCircle2 className="h-5 w-5" /> Source-of-truth files created in Drive
              </div>
              <h2 className="text-3xl font-black text-white">AI in Action Labs is ready for Vercel deployment.</h2>
              <p className="mt-2 max-w-3xl text-slate-300">The GitHub app page, Drive operating files, and GPT schedule layer are now aligned around the same platform concept.</p>
            </div>
            <a href="https://docs.google.com/document/d/1BBMcNVri1OjBuWxupLeiR4JgwzV5GVu4CkBZWkHJuj4" target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-2 rounded-full border border-emerald-300/30 px-5 py-3 font-bold text-emerald-100 hover:bg-emerald-300/10">
              Open Master OS <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
