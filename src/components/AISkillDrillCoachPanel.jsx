import React from 'react';
import { BookOpen, CheckCircle2, FlaskConical, Lightbulb, ShieldCheck } from 'lucide-react';

const checklist = [
  'Define the AI role.',
  'Give the business context.',
  'State the exact task.',
  'Add constraints and safety boundaries.',
  'Specify output format.',
  'Add success criteria or validation rules.',
];

const proofItems = [
  { label: 'Sandbox issue', value: '#26 created' },
  { label: 'Intake report', value: '#27 created' },
  { label: 'Validation pipeline', value: '#28 dispatched' },
  { label: 'Backend route', value: '/api/sandbox/skill-drill-coach' },
  { label: 'Status route', value: '/api/sandbox/status?slug=ai-skill-drill-coach' },
];

function Box({ icon: Icon, title, children }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
      <div className="mb-3 flex items-center gap-2 text-cyan-200"><Icon className="h-5 w-5" /><h4 className="font-black text-white">{title}</h4></div>
      {children}
    </div>
  );
}

export default function AISkillDrillCoachPanel() {
  return (
    <section id="ai-skill-drill-coach" className="space-y-6 rounded-[2rem] border border-cyan-400/20 bg-cyan-400/[0.04] p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">First sandbox invention</p>
          <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">AI Skill Drill Coach</h2>
          <p className="mt-3 max-w-4xl text-slate-400">
            A proof-of-theory learning system that teaches practical prompt engineering for small business automation. It shows the lesson, a drill, practice prompt, proof records, backend route, and validation path.
          </p>
        </div>
        <span className="w-fit rounded-full bg-emerald-400/10 px-4 py-2 text-xs font-black uppercase tracking-wide text-emerald-200">sandbox build</span>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Box icon={BookOpen} title="Lesson">
          <p className="text-sm leading-6 text-slate-300">
            Strong prompts turn vague work into precise instructions. For business automation, use this structure: role, context, task, constraints, output format, and success criteria.
          </p>
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-red-200">Weak prompt</p>
            <p className="mt-2 text-sm text-slate-300">Write a follow-up email for customers.</p>
          </div>
          <div className="mt-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-200">Strong prompt</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              Act as a service-business sales assistant. Write a polite follow-up email for leads who requested a quote but have not booked within 3 days. Keep it under 140 words, include one clear call to action, avoid pressure tactics, and output subject line plus email body.
            </p>
          </div>
        </Box>

        <Box icon={Lightbulb} title="Practice Drill">
          <p className="text-sm leading-6 text-slate-300">
            Pick one repetitive business task. Rewrite it as a strong AI prompt using the checklist below. The output should be specific enough that another person could test whether the AI succeeded.
          </p>
          <ul className="mt-4 space-y-2">
            {checklist.map((item) => (
              <li key={item} className="flex gap-2 rounded-2xl bg-white/[0.04] p-3 text-sm text-slate-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Box>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Box icon={FlaskConical} title="Proof Records">
          <div className="space-y-3">
            {proofItems.map((item) => (
              <div key={item.label} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-black/20 p-3">
                <span className="text-sm font-bold text-white">{item.label}</span>
                <span className="text-sm text-cyan-200">{item.value}</span>
              </div>
            ))}
          </div>
        </Box>

        <Box icon={ShieldCheck} title="Sandbox Rules">
          <ul className="space-y-3 text-sm leading-6 text-slate-300">
            <li>No public publishing from this test.</li>
            <li>No paid API activation.</li>
            <li>No secret values in frontend, issues, logs, or reports.</li>
            <li>Backend route must return transparent JSON status.</li>
            <li>Successful proof means the system can teach, log, and validate inside the sandbox.</li>
          </ul>
        </Box>
      </div>
    </section>
  );
}
