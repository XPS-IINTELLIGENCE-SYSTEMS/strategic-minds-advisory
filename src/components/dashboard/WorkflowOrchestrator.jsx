import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Workflow, Plus, Play, Pause, Trash2, Loader2, CheckCircle2,
  XCircle, Clock, ChevronDown, ChevronUp, GripVertical, Zap,
  PenTool, BarChart3, Bell, Timer, RefreshCw, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STEP_TYPES = [
  { type: 'simulation', icon: Zap, label: 'Run Simulation', color: 'text-amber-400', fields: [
    { key: 'simulationType', label: 'Simulation Type', type: 'select', options: ['Market Entry', 'Financial Model', 'Product Launch', 'Pricing Strategy'] },
    { key: 'topic', label: 'Topic Context', type: 'text', placeholder: 'e.g. SaaS market in healthcare' },
  ]},
  { type: 'content', icon: PenTool, label: 'Generate Content', color: 'text-blue-400', fields: [
    { key: 'contentType', label: 'Content Type', type: 'select', options: ['blog_post', 'linkedin', 'newsletter', 'email_draft'] },
    { key: 'topic', label: 'Topic', type: 'text', placeholder: 'e.g. AI Strategy trends' },
    { key: 'tone', label: 'Tone', type: 'select', options: ['Authoritative', 'Conversational', 'Educational'] },
  ]},
  { type: 'social_analysis', icon: BarChart3, label: 'Social Analysis', color: 'text-purple-400', fields: [
    { key: 'platform', label: 'Platform', type: 'select', options: ['linkedin', 'twitter', 'instagram', 'reddit', 'general'] },
    { key: 'topic', label: 'Topic / Niche', type: 'text', placeholder: 'e.g. enterprise AI consulting' },
  ]},
  { type: 'wait', icon: Timer, label: 'Wait / Delay', color: 'text-gray-400', fields: [
    { key: 'seconds', label: 'Delay (seconds)', type: 'number', placeholder: '5' },
  ]},
  { type: 'notify', icon: Bell, label: 'Log Notification', color: 'text-green-400', fields: [
    { key: 'message', label: 'Message', type: 'text', placeholder: 'Workflow milestone reached' },
  ]},
];

const SCHEDULE_OPTIONS = [
  'Manual only', 'Every day at 9AM', 'Every Monday at 9AM', 'Every Friday at 5PM',
  'First of month', 'Every 6 hours', 'Every Sunday night',
];

const STATUS_CONFIG = {
  pending:   { icon: Clock,         color: 'text-muted-foreground', bg: 'bg-secondary/60',      border: 'border-border' },
  running:   { icon: Loader2,       color: 'text-accent',           bg: 'bg-accent/10',          border: 'border-accent/30', spin: true },
  completed: { icon: CheckCircle2,  color: 'text-green-400',        bg: 'bg-green-400/10',       border: 'border-green-500/30' },
  failed:    { icon: XCircle,       color: 'text-red-400',          bg: 'bg-red-400/10',         border: 'border-red-500/30' },
  paused:    { icon: Pause,         color: 'text-yellow-400',       bg: 'bg-yellow-400/10',      border: 'border-yellow-500/30' },
};

function StepEditor({ step, index, onChange, onRemove }) {
  const def = STEP_TYPES.find(t => t.type === step.type) || STEP_TYPES[0];
  const Icon = def.icon;
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <GripVertical className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${def.color.replace('text-', 'bg-').replace('400', '400/15')}`}>
          <Icon className={`w-3.5 h-3.5 ${def.color}`} />
        </div>
        <span className="text-sm font-medium flex-1">{step.label || def.label}</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{`Step ${index + 1}`}</span>
        <button onClick={e => { e.stopPropagation(); onRemove(); }} className="text-muted-foreground hover:text-red-400 transition p-1">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </div>
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 block">Step Type</label>
            <select value={step.type}
              onChange={e => { const d = STEP_TYPES.find(t => t.type === e.target.value); onChange({ ...step, type: e.target.value, label: d?.label || '', config: {} }); }}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent transition">
              {STEP_TYPES.map(t => <option key={t.type} value={t.type}>{t.label}</option>)}
            </select>
          </div>
          {def.fields.map(field => (
            <div key={field.key}>
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1 block">{field.label}</label>
              {field.type === 'select' ? (
                <select value={step.config?.[field.key] || ''}
                  onChange={e => onChange({ ...step, config: { ...step.config, [field.key]: e.target.value } })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent transition">
                  {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input type={field.type || 'text'} value={step.config?.[field.key] || ''} placeholder={field.placeholder}
                  onChange={e => onChange({ ...step, config: { ...step.config, [field.key]: e.target.value } })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent transition" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function WorkflowOrchestrator() {
  const [jobs, setJobs] = useState([]);
  const [view, setView] = useState('monitor'); // 'monitor' | 'create'
  const [form, setForm] = useState({ name: '', schedule: 'Manual only', steps: [] });
  const [running, setRunning] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [runResult, setRunResult] = useState(null);

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    const data = await base44.entities.WorkflowJob.list('-created_date', 50);
    setJobs(data);
  };

  const addStep = () => {
    setForm(f => ({ ...f, steps: [...f.steps, { type: 'simulation', label: 'Run Simulation', config: {} }] }));
  };

  const updateStep = (i, updated) => {
    setForm(f => { const steps = [...f.steps]; steps[i] = updated; return { ...f, steps }; });
  };

  const removeStep = (i) => {
    setForm(f => ({ ...f, steps: f.steps.filter((_, idx) => idx !== i) }));
  };

  const saveJob = async () => {
    if (!form.name || form.steps.length === 0) return;
    const created = await base44.entities.WorkflowJob.create({
      name: form.name,
      schedule: form.schedule,
      steps: JSON.stringify(form.steps),
      status: 'pending',
      enabled: true,
      run_count: 0,
    });
    setJobs(prev => [created, ...prev]);
    setForm({ name: '', schedule: 'Manual only', steps: [] });
    setView('monitor');
  };

  const runJob = async (job) => {
    setRunning(job.id);
    setRunResult(null);

    await base44.entities.WorkflowJob.update(job.id, { status: 'running', last_run: new Date().toISOString() });
    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'running' } : j));

    const steps = JSON.parse(job.steps || '[]');
    const res = await base44.functions.invoke('runWorkflow', { jobId: job.id, steps, jobName: job.name });

    const finalStatus = res.data?.status === 'completed' ? 'completed' : 'failed';
    const runCount = (job.run_count || 0) + 1;

    await base44.entities.WorkflowJob.update(job.id, {
      status: finalStatus,
      run_count: runCount,
      last_result: JSON.stringify(res.data),
      error_log: finalStatus === 'failed' ? res.data?.logs?.filter(l => l.level === 'error').map(l => l.message).join('\n') : '',
    });

    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: finalStatus, run_count: runCount } : j));
    setRunResult({ job, data: res.data });
    setRunning(null);
  };

  const deleteJob = async (id) => {
    await base44.entities.WorkflowJob.delete(id);
    setJobs(prev => prev.filter(j => j.id !== id));
    if (runResult?.job?.id === id) setRunResult(null);
  };

  const toggleJob = async (job) => {
    const updated = await base44.entities.WorkflowJob.update(job.id, { enabled: !job.enabled });
    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, enabled: !j.enabled } : j));
  };

  const quickTemplates = [
    { name: 'Weekly Market Brief', schedule: 'Every Monday at 9AM', steps: [
      { type: 'simulation', label: 'Run Simulation', config: { simulationType: 'Market Entry', topic: 'AI consulting market' } },
      { type: 'content', label: 'Generate Content', config: { contentType: 'newsletter', topic: 'Weekly AI market intelligence brief', tone: 'Authoritative' } },
      { type: 'notify', label: 'Log Notification', config: { message: 'Weekly brief generated and saved' } },
    ]},
    { name: 'Monthly Social Intelligence', schedule: 'First of month', steps: [
      { type: 'social_analysis', label: 'Social Analysis', config: { platform: 'linkedin', topic: 'AI strategy consulting' } },
      { type: 'content', label: 'Generate Content', config: { contentType: 'blog_post', topic: 'Monthly social media insights for AI consultants', tone: 'Educational' } },
    ]},
    { name: 'Daily Content Pipeline', schedule: 'Every day at 9AM', steps: [
      { type: 'content', label: 'Generate Content', config: { contentType: 'linkedin', topic: 'AI strategy insight of the day', tone: 'Conversational' } },
      { type: 'wait', label: 'Wait', config: { seconds: 2 } },
      { type: 'notify', label: 'Log Notification', config: { message: 'Daily LinkedIn post ready for review' } },
    ]},
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl text-gradient-ivory">Workflow Orchestrator</h2>
            <p className="text-sm text-muted-foreground mt-1">Schedule and monitor complex multi-step AI workflows</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setView(v => v === 'monitor' ? 'create' : 'monitor')}
              className={`btn-ivory rounded-xl px-4 py-2.5 text-sm flex items-center gap-2`}>
              {view === 'monitor' ? <><Plus className="w-4 h-4" /> New Workflow</> : <><Workflow className="w-4 h-4" /> Monitor Jobs</>}
            </button>
          </div>
        </div>

        {/* MONITOR VIEW */}
        {view === 'monitor' && (
          <div className="space-y-5">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Jobs', value: jobs.length },
                { label: 'Running', value: jobs.filter(j => j.status === 'running').length },
                { label: 'Completed', value: jobs.filter(j => j.status === 'completed').length },
                { label: 'Failed', value: jobs.filter(j => j.status === 'failed').length },
              ].map(({ label, value }) => (
                <div key={label} className="p-4 rounded-2xl border border-border bg-card/50">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">{label}</div>
                  <div className="font-display text-3xl text-gradient-accent">{value}</div>
                </div>
              ))}
            </div>

            {/* Quick Templates */}
            {jobs.length === 0 && (
              <div className="p-5 rounded-2xl border border-border bg-card/50">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Quick Start Templates</div>
                <div className="grid md:grid-cols-3 gap-3">
                  {quickTemplates.map(t => (
                    <button key={t.name} onClick={async () => {
                      const created = await base44.entities.WorkflowJob.create({ name: t.name, schedule: t.schedule, steps: JSON.stringify(t.steps), status: 'pending', enabled: true, run_count: 0 });
                      setJobs(prev => [created, ...prev]);
                    }} className="text-left p-4 rounded-xl border border-border bg-secondary/30 hover:bg-secondary transition group">
                      <div className="text-sm font-medium mb-1 group-hover:text-accent transition">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.schedule}</div>
                      <div className="text-xs text-accent/70 mt-2">{t.steps.length} steps</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Job list */}
            <div className="space-y-3">
              {jobs.map(job => {
                const sc = STATUS_CONFIG[job.status] || STATUS_CONFIG.pending;
                const StatusIcon = sc.icon;
                const steps = JSON.parse(job.steps || '[]');
                const isExpanded = expanded === job.id;

                return (
                  <div key={job.id} className={`rounded-2xl border ${sc.border} ${sc.bg} overflow-hidden`}>
                    <div className="p-4 flex items-center gap-4">
                      <StatusIcon className={`w-5 h-5 flex-shrink-0 ${sc.color} ${sc.spin ? 'animate-spin' : ''}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{job.name}</span>
                          {!job.enabled && <span className="text-[10px] text-muted-foreground border border-border rounded-full px-2 py-0.5">paused</span>}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {job.schedule || 'Manual'} · {steps.length} step{steps.length !== 1 ? 's' : ''} · {job.run_count || 0} run{job.run_count !== 1 ? 's' : ''}
                          {job.last_run && ` · Last: ${new Date(job.last_run).toLocaleDateString()}`}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => setExpanded(isExpanded ? null : job.id)}
                          className="w-7 h-7 rounded-lg border border-border/50 bg-background/40 flex items-center justify-center transition hover:bg-background">
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => toggleJob(job)}
                          className="w-7 h-7 rounded-lg border border-border/50 bg-background/40 flex items-center justify-center transition hover:bg-background">
                          <Pause className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button onClick={() => runJob(job)} disabled={running === job.id || job.status === 'running'}
                          className="w-7 h-7 rounded-lg border border-border/50 bg-background/40 flex items-center justify-center transition hover:bg-background disabled:opacity-40">
                          {running === job.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 text-accent" />}
                        </button>
                        <button onClick={() => deleteJob(job.id)}
                          className="w-7 h-7 rounded-lg border border-border/50 bg-background/40 flex items-center justify-center transition hover:bg-red-500/10 hover:text-red-400">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded: steps + logs */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                          <div className="px-4 pb-4 pt-1 border-t border-border/30 space-y-3">
                            <div className="flex gap-2 flex-wrap">
                              {steps.map((s, i) => {
                                const def = STEP_TYPES.find(t => t.type === s.type);
                                const SIcon = def?.icon || Zap;
                                return (
                                  <div key={i} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border border-border bg-background/40">
                                    <SIcon className={`w-3 h-3 ${def?.color || 'text-muted-foreground'}`} />
                                    {s.label || def?.label}
                                  </div>
                                );
                              })}
                            </div>

                            {job.last_result && (() => {
                              try {
                                const r = JSON.parse(job.last_result);
                                return (
                                  <div className="space-y-2">
                                    <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Last Run Logs</div>
                                    <div className="max-h-32 overflow-y-auto space-y-1">
                                      {(r.logs || []).map((l, i) => (
                                        <div key={i} className={`text-xs flex gap-2 ${l.level === 'error' ? 'text-red-400' : l.level === 'success' ? 'text-green-400' : 'text-muted-foreground'}`}>
                                          <span className="opacity-50 flex-shrink-0">{new Date(l.timestamp).toLocaleTimeString()}</span>
                                          <span>{l.message}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              } catch { return null; }
                            })()}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {jobs.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Workflow className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No workflows yet. Use the templates above or create a new one.</p>
                </div>
              )}
            </div>

            {/* Run result */}
            <AnimatePresence>
              {runResult && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`p-5 rounded-2xl border ${runResult.data?.status === 'completed' ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`text-sm font-medium ${runResult.data?.status === 'completed' ? 'text-green-400' : 'text-red-400'}`}>
                      {runResult.data?.status === 'completed' ? '✓' : '✗'} {runResult.job.name} — {runResult.data?.summary}
                    </div>
                    <button onClick={() => setRunResult(null)} className="text-xs text-muted-foreground hover:text-foreground">Dismiss</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(runResult.data?.steps || []).map((s, i) => (
                      <div key={i} className={`text-xs px-2.5 py-1.5 rounded-full border ${s.status === 'completed' ? 'border-green-500/30 text-green-400' : 'border-red-500/30 text-red-400'}`}>
                        {s.status === 'completed' ? '✓' : '✗'} {s.step}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* CREATE VIEW */}
        {view === 'create' && (
          <div className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Workflow Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Weekly Market Intelligence Pipeline"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Schedule</label>
                <select value={form.schedule} onChange={e => setForm(f => ({ ...f, schedule: e.target.value }))}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition">
                  {SCHEDULE_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Steps ({form.steps.length})</label>
                <button onClick={addStep} className="text-xs flex items-center gap-1.5 text-accent hover:text-accent/80 transition">
                  <Plus className="w-3.5 h-3.5" /> Add Step
                </button>
              </div>
              {form.steps.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-border rounded-2xl text-muted-foreground text-sm">
                  Click "Add Step" to build your workflow pipeline
                </div>
              ) : (
                <div className="space-y-3">
                  {form.steps.map((step, i) => (
                    <div key={i} className="relative">
                      {i > 0 && <div className="absolute -top-2 left-6 w-px h-4 bg-border" />}
                      <StepEditor step={step} index={i} onChange={u => updateStep(i, u)} onRemove={() => removeStep(i)} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={saveJob} disabled={!form.name || form.steps.length === 0}
                className="btn-ivory rounded-xl px-6 py-3 text-sm disabled:opacity-50 flex items-center gap-2">
                <Workflow className="w-4 h-4" /> Save Workflow
              </button>
              <button onClick={() => { setForm({ name: '', schedule: 'Manual only', steps: [] }); setView('monitor'); }}
                className="px-6 py-3 text-sm border border-border rounded-xl hover:bg-secondary transition">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}