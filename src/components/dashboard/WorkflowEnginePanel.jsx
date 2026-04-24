import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Power, Loader2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TRIGGERS = ['competitive_threat', 'market_signal', 'idea_update', 'stress_test_result', 'scheduled'];
const ACTIONS = ['run_stress_test', 'update_strategy', 'notify_team', 'generate_report', 'update_pitch'];

export default function WorkflowEnginePanel() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [workspace, setWorkspace] = useState(null);
  const [executing, setExecuting] = useState(null);
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    trigger_type: 'competitive_threat',
    action_type: 'run_stress_test',
  });

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      const user = await base44.auth.me();
      const workspaces = await base44.entities.Workspace.filter({
        owner_email: user.email,
      });

      if (workspaces.length > 0) {
        setWorkspace(workspaces[0]);
        const wfs = await base44.entities.Workflow.filter({
          workspace_id: workspaces[0].id,
        });
        setWorkflows(wfs);
      }
    } catch (error) {
      console.error('Failed to load workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const addWorkflow = async () => {
    if (!newWorkflow.name || !workspace) return;

    try {
      const wf = await base44.entities.Workflow.create({
        ...newWorkflow,
        workspace_id: workspace.id,
      });

      setWorkflows(prev => [...prev, wf]);
      setNewWorkflow({
        name: '',
        trigger_type: 'competitive_threat',
        action_type: 'run_stress_test',
      });
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create workflow:', error);
    }
  };

  const toggleWorkflow = async (wfId, isActive) => {
    try {
      await base44.entities.Workflow.update(wfId, {
        is_active: !isActive,
      });

      setWorkflows(prev =>
        prev.map(w => w.id === wfId ? { ...w, is_active: !isActive } : w)
      );
    } catch (error) {
      console.error('Failed to toggle workflow:', error);
    }
  };

  const deleteWorkflow = async (wfId) => {
    try {
      await base44.entities.Workflow.delete(wfId);
      setWorkflows(prev => prev.filter(w => w.id !== wfId));
    } catch (error) {
      console.error('Failed to delete workflow:', error);
    }
  };

  const testTrigger = async (workflow) => {
    setExecuting(workflow.id);
    try {
      await base44.functions.invoke('triggerActionEngine', {
        triggerEvent: workflow.trigger_type,
        triggerData: { test: true },
      });

      alert(`✓ Workflow "${workflow.name}" executed successfully`);
    } catch (error) {
      alert(`✗ Workflow failed: ${error.message}`);
    } finally {
      setExecuting(null);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 p-6 overflow-y-auto">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium text-foreground">Trigger-Action Workflows</h3>
            <p className="text-xs text-muted-foreground mt-1">Automate decision-making cycles</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="btn-ivory rounded-lg"
          >
            <Plus className="w-4 h-4" />
            New Workflow
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="space-y-3 pt-4 border-t border-border">
            <input
              type="text"
              placeholder="Workflow name (e.g., Threat Response)"
              value={newWorkflow.name}
              onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg bg-secondary/40 border border-border outline-none focus:border-accent transition"
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground mb-2 block">If (Trigger)</label>
                <select
                  value={newWorkflow.trigger_type}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, trigger_type: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-secondary/40 border border-border outline-none focus:border-accent transition"
                >
                  {TRIGGERS.map(t => (
                    <option key={t} value={t}>{t.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-2 block">Then (Action)</label>
                <select
                  value={newWorkflow.action_type}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, action_type: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-secondary/40 border border-border outline-none focus:border-accent transition"
                >
                  {ACTIONS.map(a => (
                    <option key={a} value={a}>{a.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
            </div>

            <Button onClick={addWorkflow} className="btn-ivory rounded-lg w-full">
              Create Workflow
            </Button>
          </div>
        )}
      </div>

      {/* Workflows List */}
      <div className="grid gap-3">
        {workflows.map(wf => (
          <div key={wf.id} className="glass-card rounded-2xl p-4 border border-border">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-medium text-foreground">{wf.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  If <span className="text-accent">{wf.trigger_type.replace('_', ' ')}</span> then{' '}
                  <span className="text-green-400">{wf.action_type.replace('_', ' ')}</span>
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => toggleWorkflow(wf.id, wf.is_active)}
                  className={`p-2 rounded-lg transition ${
                    wf.is_active ? 'bg-green-500/15 text-green-400' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Power className="w-4 h-4" />
                </button>

                <button
                  onClick={() => testTrigger(wf)}
                  disabled={executing === wf.id}
                  className="p-2 rounded-lg hover:bg-accent/15 transition text-accent"
                >
                  {executing === wf.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </button>

                <button
                  onClick={() => deleteWorkflow(wf.id)}
                  className="p-2 rounded-lg hover:bg-destructive/15 transition text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-4 pt-3 border-t border-border text-xs text-muted-foreground">
              <span>{wf.execution_count || 0} executions</span>
              {wf.last_triggered && (
                <span>Last: {new Date(wf.last_triggered).toLocaleDateString()}</span>
              )}
              <span className={wf.is_active ? 'text-green-400' : 'text-muted-foreground'}>
                {wf.is_active ? '✓ Active' : '○ Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}