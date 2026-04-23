import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Plus, Loader2, CheckCircle2, AlertCircle, Trash2,
  ChevronRight, Play, Pause, ChevronDown
} from 'lucide-react';

const AGENTS = ['Analyzer', 'Visionary', 'Strategist', 'Inventor', 'Predictor', 'Coder', 'Marketer', 'Validator', 'Documentor'];
const TASK_TYPES = ['research', 'analysis', 'strategy', 'build', 'validation', 'documentation', 'custom'];
const PRIORITIES = ['low', 'medium', 'high'];

const STATUS_COLORS = {
  pending: 'text-muted-foreground',
  in_progress: 'text-blue-400',
  completed: 'text-green-400',
  failed: 'text-red-400',
};

export default function TaskQueue() {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assigned_agent: AGENTS[0],
    task_type: TASK_TYPES[0],
    priority: 'medium',
    trigger_condition: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const data = await base44.entities.AgentTask.list('-created_date', 50);
    setTasks(data);
    setLoading(false);
  };

  const createTask = async () => {
    if (!newTask.title.trim()) return;
    
    // Optimistic update: add to UI immediately
    const optimisticTask = { ...newTask, id: `temp-${Date.now()}`, status: 'pending' };
    setTasks(prev => [optimisticTask, ...prev]);
    setShowForm(false);
    
    try {
      const created = await base44.entities.AgentTask.create(newTask);
      // Replace optimistic task with real one
      setTasks(prev => prev.map(t => t.id === optimisticTask.id ? created : t));
    } catch (error) {
      console.error('Failed to create task:', error);
      // Rollback optimistic update on error
      setTasks(prev => prev.filter(t => t.id !== optimisticTask.id));
    }
    
    setNewTask({
      title: '',
      description: '',
      assigned_agent: AGENTS[0],
      task_type: TASK_TYPES[0],
      priority: 'medium',
      trigger_condition: '',
    });
  };

  const executeTask = async (task) => {
    // Optimistic: update UI immediately
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'in_progress' } : t));
    
    try {
      await base44.entities.AgentTask.update(task.id, { status: 'in_progress' });
      
      // Simulate async execution
      setTimeout(async () => {
        try {
          await base44.entities.AgentTask.update(task.id, { 
            status: 'completed',
            result: `${task.assigned_agent} completed ${task.task_type} on "${task.title}"`
          });
          setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'completed', result: `${task.assigned_agent} completed ${task.task_type}` } : t));
        } catch (error) {
          console.error('Failed to complete task:', error);
          setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'failed' } : t));
        }
      }, 2000);
    } catch (error) {
      console.error('Failed to execute task:', error);
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'pending' } : t));
    }
  };

  const deleteTask = async (id) => {
    // Optimistic: remove from UI immediately
    setTasks(prev => prev.filter(t => t.id !== id));
    
    try {
      await base44.entities.AgentTask.delete(id);
    } catch (error) {
      console.error('Failed to delete task:', error);
      // On error, reload tasks
      loadTasks();
    }
  };

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const activeCount = tasks.filter(t => t.status === 'in_progress').length;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-card/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-4 h-4 text-accent" />
            <span className="font-medium">Agent Task Queue</span>
            <div className="flex items-center gap-2 ml-4">
              <span className="text-xs text-muted-foreground">Pending:</span>
              <span className="text-sm font-bold text-accent">{pendingCount}</span>
              <span className="text-xs text-muted-foreground ml-2">Active:</span>
              <span className="text-sm font-bold text-blue-400">{activeCount}</span>
            </div>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl btn-ivory text-sm">
            <Plus className="w-4 h-4" /> New Task
          </button>
        </div>

        {/* Create form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-border/40 pt-3">
              <div className="grid md:grid-cols-2 gap-3">
                <input value={newTask.title} onChange={e => setNewTask(t => ({ ...t, title: e.target.value }))}
                  placeholder="Task title" className="bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-accent transition" />
                
                <select value={newTask.assigned_agent} onChange={e => setNewTask(t => ({ ...t, assigned_agent: e.target.value }))}
                  className="bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-accent transition">
                  {AGENTS.map(a => <option key={a}>{a}</option>)}
                </select>

                <select value={newTask.task_type} onChange={e => setNewTask(t => ({ ...t, task_type: e.target.value }))}
                  className="bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-accent transition">
                  {TASK_TYPES.map(t => <option key={t} className="capitalize">{t}</option>)}
                </select>

                <select value={newTask.priority} onChange={e => setNewTask(t => ({ ...t, priority: e.target.value }))}
                  className="bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-accent transition">
                  {PRIORITIES.map(p => <option key={p} className="capitalize">{p}</option>)}
                </select>

                <textarea value={newTask.description} onChange={e => setNewTask(t => ({ ...t, description: e.target.value }))}
                  placeholder="Description (optional)" className="bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-accent transition md:col-span-2 resize-none h-16" />

                <textarea value={newTask.trigger_condition} onChange={e => setNewTask(t => ({ ...t, trigger_condition: e.target.value }))}
                  placeholder="Trigger condition (e.g. 'If Validator flags high_risk')" className="bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-accent transition md:col-span-2 resize-none h-16 text-xs" />
              </div>

              <div className="flex gap-2 mt-3">
                <button onClick={createTask} className="flex-1 px-4 py-2.5 rounded-xl btn-ivory text-sm">Create Task</button>
                <button onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl border border-border text-sm">Cancel</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Zap className="w-12 h-12 opacity-20 mb-3" />
            <p className="text-sm">No tasks yet. Create one to assign agents.</p>
          </div>
        ) : (
          <div className="p-6 space-y-3">
            {tasks.map(task => (
              <motion.div key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl border border-border bg-card/50 hover:bg-card/80 transition group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-lg ${STATUS_COLORS[task.status]}`}>
                        {task.status === 'completed' ? '✓' : task.status === 'failed' ? '✕' : task.status === 'in_progress' ? '⟳' : '○'}
                      </span>
                      <h3 className="font-medium truncate">{task.title}</h3>
                      <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded-full border border-border ${
                        task.priority === 'high' ? 'text-red-400' : task.priority === 'medium' ? 'text-amber-400' : 'text-muted-foreground'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>👤 {task.assigned_agent}</span>
                      <span>•</span>
                      <span>{task.task_type}</span>
                      <span className={`ml-auto ${STATUS_COLORS[task.status]}`}>{task.status}</span>
                    </div>
                  </div>

                  {task.status === 'pending' && (
                    <button onClick={() => executeTask(task)}
                      className="ml-2 p-2 rounded-lg hover:bg-secondary transition opacity-0 group-hover:opacity-100">
                      <Play className="w-4 h-4 text-accent" />
                    </button>
                  )}

                  <button onClick={() => deleteTask(task.id)}
                    className="ml-1 p-2 rounded-lg hover:bg-red-500/10 transition text-muted-foreground hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {task.description && (
                  <p className="text-xs text-muted-foreground mb-2 pl-6">{task.description}</p>
                )}

                {task.trigger_condition && (
                  <div className="text-[9px] text-blue-400/70 mb-2 pl-6 border-l border-blue-400/30 pl-3 italic">
                    Trigger: {task.trigger_condition}
                  </div>
                )}

                {task.result && (
                  <div className="text-[9px] text-green-400/70 mt-2 pl-6 border-l border-green-400/30 pl-3">
                    Result: {task.result}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}