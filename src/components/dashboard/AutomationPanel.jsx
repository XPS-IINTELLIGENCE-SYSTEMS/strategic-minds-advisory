import React, { useState, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';
import { Bot, Play, Loader2, Plus, Trash2, CheckCircle2, XCircle, Clock, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MobileSelect from '@/components/common/MobileSelect';

const AUTOMATION_TYPES = [
  'Content Generation', 'Market Research', 'Competitor Analysis',
  'Lead Scoring', 'Report Generation', 'Social Media Drafts',
  'Email Campaign', 'SEO Audit', 'Financial Summary', 'Customer Insights',
];

const QUICK_AUTOMATIONS = [
  {
    name: 'Weekly Market Brief',
    automation_type: 'Market Research',
    config: JSON.stringify({ frequency: 'weekly', depth: 'comprehensive', format: 'executive brief' }),
    schedule: 'Every Monday 9AM',
  },
  {
    name: 'Competitor Intelligence Scan',
    automation_type: 'Competitor Analysis',
    config: JSON.stringify({ scope: 'top 5 competitors', signals: ['pricing', 'product', 'hiring', 'content'] }),
    schedule: 'Daily 7AM',
  },
  {
    name: 'Content Ideas Generator',
    automation_type: 'Content Generation',
    config: JSON.stringify({ count: 20, formats: ['LinkedIn', 'blog', 'email'], tone: 'thought leadership' }),
    schedule: 'Weekly',
  },
];

export default function AutomationPanel() {
  const [tasks, setTasks] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newTask, setNewTask] = useState({ name: '', automation_type: AUTOMATION_TYPES[0], config: '', schedule: '' });
  const [running, setRunning] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const loadTasks = async () => {
      const { data, error } = await supabase.from('automation_task').select('*');
      if (!error) setTasks(data || []);
    };
    loadTasks();
  }, []);

  const createTask = async (taskData) => {
    // Optimistic: add to UI immediately
    const optimisticTask = { ...taskData, id: `temp-${Date.now()}`, status: 'idle', enabled: true };
    setTasks(prev => [optimisticTask, ...prev]);
    setShowCreate(false);
    
    try {
      const { data: created, error } = await supabase
        .from('automation_task')
        .insert([{ ...taskData, status: 'idle', enabled: true }])
        .select();
      if (error) throw error;
      // Replace optimistic task with real one
      setTasks(prev => prev.map(t => t.id === optimisticTask.id ? created?.[0] : t));
    } catch (error) {
      console.error('Failed to create automation task:', error);
      // Rollback on error
      setTasks(prev => prev.filter(t => t.id !== optimisticTask.id));
    }
    
    setNewTask({ name: '', automation_type: AUTOMATION_TYPES[0], config: '', schedule: '' });
  };

  const runTask = async (task) => {
    setRunning(task.id);
    setResult(null);

    await supabase
      .from('automation_task')
      .update({ status: 'running', last_run: new Date().toISOString() })
      .eq('id', task.id);
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'running' } : t));

    const { data: res, error: fnError } = await supabase.functions.invoke('runAutomation', {
      automationType: task.automation_type,
      config: task.config ? JSON.parse(task.config) : {},
      targetData: { taskName: task.name },
    });
    if (fnError) throw fnError;

    const { data: updated, error: updateError } = await supabase
      .from('automation_task')
      .update({
        status: res.status === 'completed' ? 'completed' : 'failed',
        result: JSON.stringify(res),
      })
      .eq('id', task.id)
      .select();
    if (updateError) throw updateError;
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: updated.status } : t));
    setResult({ task, data: res.data });
    setRunning(null);
  };

  const deleteTask = async (id) => {
    // Optimistic: remove from UI immediately
    setTasks(prev => prev.filter(t => t.id !== id));
    
    try {
      await supabase.from('automation_task').delete().eq('id', id);
    } catch (error) {
      console.error('Failed to delete automation task:', error);
      // Reload tasks on error
      const { data } = await supabase.from('automation_task').select('*');
      setTasks(data || []);
    }
  };

  const statusIcon = (status) => {
    if (status === 'completed') return <CheckCircle2 className="w-4 h-4 text-green-400" />;
    if (status === 'failed') return <XCircle className="w-4 h-4 text-red-400" />;
    if (status === 'running') return <Loader2 className="w-4 h-4 text-accent animate-spin" />;
    return <Clock className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl text-gradient-ivory">Automation Engine</h2>
            <p className="text-sm text-muted-foreground mt-1">Configure and run AI automation workflows</p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="btn-ivory rounded-xl px-4 py-2.5 text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Automation
          </button>
        </div>

        {/* Quick start */}
        <div className="p-5 rounded-2xl border border-border bg-card/50">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Quick Start Templates</div>
          <div className="grid md:grid-cols-3 gap-3">
            {QUICK_AUTOMATIONS.map(qa => (
              <button
                key={qa.name}
                onClick={() => createTask(qa)}
                className="text-left p-4 rounded-xl border border-border bg-secondary/30 hover:bg-secondary transition group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{qa.name}</span>
                  <Zap className="w-3.5 h-3.5 text-accent opacity-0 group-hover:opacity-100 transition" />
                </div>
                <div className="text-xs text-muted-foreground">{qa.automation_type}</div>
                <div className="text-[10px] text-accent/70 mt-1.5">{qa.schedule}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Create form */}
        <AnimatePresence>
          {showCreate && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="p-5 rounded-2xl border border-accent/30 bg-accent/5 space-y-4">
              <div className="text-sm font-medium">New Automation Task</div>
              <div className="grid md:grid-cols-2 gap-4">
                <input value={newTask.name} onChange={e => setNewTask(t => ({ ...t, name: e.target.value }))}
                  placeholder="Task name"
                  className="bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition" />
                <MobileSelect value={newTask.automation_type} onChange={v => setNewTask(t => ({ ...t, automation_type: v }))}
                  options={AUTOMATION_TYPES.map(t => ({ value: t, label: t }))} placeholder="Select type" />
                <input value={newTask.schedule} onChange={e => setNewTask(t => ({ ...t, schedule: e.target.value }))}
                  placeholder="Schedule (e.g. Daily 9AM, Weekly Monday)"
                  className="bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition" />
                <textarea value={newTask.config} onChange={e => setNewTask(t => ({ ...t, config: e.target.value }))}
                  placeholder='Config JSON (e.g. {"depth": "comprehensive"})'
                  className="bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition resize-none" rows={2} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => createTask(newTask)} disabled={!newTask.name}
                  className="btn-ivory rounded-xl px-5 py-2.5 text-sm disabled:opacity-40">Create</button>
                <button onClick={() => setShowCreate(false)} className="px-5 py-2.5 text-sm border border-border rounded-xl hover:bg-secondary transition">Cancel</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Task list */}
        <div className="space-y-3">
          {tasks.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm">
              <Bot className="w-8 h-8 mx-auto mb-3 opacity-40" />
              No automations yet. Add one above.
            </div>
          )}
          {tasks.map(task => (
            <div key={task.id} className="p-5 rounded-2xl border border-border bg-card/50 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {statusIcon(task.status)}
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{task.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{task.automation_type} · {task.schedule || 'Manual'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-[10px] uppercase px-2.5 py-1 rounded-full border ${
                  task.status === 'completed' ? 'border-green-500/30 text-green-400 bg-green-400/10' :
                  task.status === 'failed' ? 'border-red-500/30 text-red-400 bg-red-400/10' :
                  task.status === 'running' ? 'border-accent/30 text-accent bg-accent/10' :
                  'border-border text-muted-foreground'
                }`}>{task.status}</span>
                <button
                  onClick={() => runTask(task)}
                  disabled={running === task.id}
                  className="w-8 h-8 rounded-xl border border-border bg-secondary/40 hover:bg-secondary flex items-center justify-center transition disabled:opacity-40"
                >
                  {running === task.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => deleteTask(task.id)} className="w-8 h-8 rounded-xl border border-border bg-secondary/40 hover:bg-secondary flex items-center justify-center transition text-muted-foreground hover:text-red-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl border border-green-500/20 bg-green-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-green-400">✓ {result.task.name} — Complete</div>
                <button onClick={() => setResult(null)} className="text-muted-foreground hover:text-foreground text-xs">Dismiss</button>
              </div>
              <p className="text-sm text-foreground/80">{result.data.output?.summary}</p>
              <div className="space-y-1">
                {(result.data.output?.results || []).map((r, i) => (
                  <div key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />{r}
                  </div>
                ))}
              </div>
              {result.data.output?.generatedContent && (
                <div className="p-3 rounded-xl bg-secondary/40 border border-border text-xs text-foreground/80 leading-relaxed max-h-40 overflow-y-auto">
                  {result.data.output.generatedContent}
                </div>
              )}
              <div className="pt-2 border-t border-border/50">
                <div className="text-xs text-muted-foreground mb-1">Suggested Next Steps:</div>
                {(result.data.nextActions || []).map((a, i) => (
                  <div key={i} className="text-xs text-foreground/70 flex items-center gap-2 mt-1">
                    <span className="text-accent">→</span> {a}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}