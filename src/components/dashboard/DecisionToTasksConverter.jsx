import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Zap, CheckCircle2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DecisionToTasksConverter() {
  const [debates, setDebates] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDebate, setSelectedDebate] = useState(null);
  const [tasks, setTasks] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncConfig, setSyncConfig] = useState({
    pmTool: 'linear',
    projectKey: '',
    assignedMembers: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await base44.auth.me();
      const [allDebates, allMembers] = await Promise.all([
        base44.entities.DebateHistory.filter({ participants: { $exists: true } }),
        base44.entities.TeamMember.list(),
      ]);

      setDebates(allDebates.sort((a, b) => 
        new Date(b.debate_date).getTime() - new Date(a.debate_date).getTime()
      ));
      setTeamMembers(allMembers);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTasks = async (debate) => {
    if (!debate.decision_made) {
      alert('This debate does not have a final decision');
      return;
    }

    setGenerating(true);
    try {
      const response = await base44.functions.invoke('transformDecisionToTasks', {
        debateId: debate.id,
        ideaId: debate.idea_id,
        decision: debate.decision_made,
      });

      setSelectedDebate(debate);
      setTasks(response.data);
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const syncToProjectManagement = async () => {
    if (!tasks || syncConfig.assignedMembers.length === 0) {
      alert('Please select team members to assign tasks');
      return;
    }

    setSyncing(true);
    try {
      const response = await base44.functions.invoke('syncTasksToProjectManagement', {
        decisionTaskId: tasks.decision_task_id,
        pmTool: syncConfig.pmTool,
        projectKey: syncConfig.projectKey,
        assignedMembers: syncConfig.assignedMembers,
      });

      alert(`✓ ${response.data.tasks_created} tasks synced to ${syncConfig.pmTool}`);
      setTasks(null);
      setSelectedDebate(null);
      setSyncConfig({ pmTool: 'linear', projectKey: '', assignedMembers: [] });
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setSyncing(false);
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
    <div className="h-full flex gap-6 p-6 overflow-hidden">
      {/* Left Panel - Debate Selection */}
      <div className="w-80 flex-shrink-0 flex flex-col gap-4 overflow-hidden border-r border-border pr-4">
        <div>
          <h3 className="font-bold text-accent mb-3">Recent Debates</h3>
          <p className="text-xs text-muted-foreground">Select a debate with a final decision</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {debates.map(debate => (
            <button
              key={debate.id}
              onClick={() => !generating && generateTasks(debate)}
              disabled={!debate.decision_made || generating}
              className={`w-full text-left p-3 rounded-lg border transition ${
                selectedDebate?.id === debate.id
                  ? 'border-accent bg-accent/15'
                  : 'border-border hover:border-accent'
              } ${!debate.decision_made ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <p className="text-xs font-bold text-foreground truncate">{debate.title}</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {new Date(debate.debate_date).toLocaleDateString()}
              </p>
              {debate.decision_made && (
                <p className="text-[10px] text-green-400 mt-1">✓ Decision Made</p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Right Panel - Task Generation & Sync */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {tasks ? (
          <div className="flex flex-col gap-4 overflow-hidden">
            {/* Task Summary */}
            <div className="glass-card rounded-2xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <h4 className="font-bold text-foreground">Tasks Generated</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{tasks.summary}</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded bg-secondary/30">
                  <p className="text-xs font-bold text-accent">{tasks.task_count}</p>
                  <p className="text-[10px] text-muted-foreground">Tasks</p>
                </div>
                <div className="p-2 rounded bg-secondary/30">
                  <p className="text-xs font-bold text-accent">{tasks.timeline_weeks}w</p>
                  <p className="text-[10px] text-muted-foreground">Timeline</p>
                </div>
                <div className="p-2 rounded bg-secondary/30">
                  <p className="text-xs font-bold text-accent">{syncConfig.assignedMembers.length}</p>
                  <p className="text-[10px] text-muted-foreground">Assigned</p>
                </div>
              </div>
            </div>

            {/* Task List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {tasks.tasks.map((task, idx) => (
                <div key={idx} className="glass-card rounded-2xl p-4 border border-border">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="text-xs font-bold text-accent">{task.title}</h5>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${
                      task.priority === 'high' ? 'bg-destructive/20 text-destructive' :
                      task.priority === 'medium' ? 'bg-accent/20 text-accent' :
                      'bg-secondary/40'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-2">{task.description}</p>
                  <div className="flex gap-2 text-[10px]">
                    <span className="px-1.5 py-0.5 rounded bg-secondary/30">
                      {task.estimated_hours}h
                    </span>
                    {task.skill_requirements?.map(skill => (
                      <span key={skill} className="px-1.5 py-0.5 rounded bg-secondary/30">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Sync Configuration */}
            <div className="glass-card rounded-2xl p-4 border border-border space-y-3 flex-shrink-0">
              <h5 className="text-xs font-bold text-accent">Sync to Project Management</h5>

              {/* PM Tool Selection */}
              <select
                value={syncConfig.pmTool}
                onChange={(e) => setSyncConfig(prev => ({ ...prev, pmTool: e.target.value }))}
                className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-accent transition"
              >
                <option value="linear">Linear</option>
                <option value="jira">Jira</option>
                <option value="asana">Asana</option>
              </select>

              {/* Project Key */}
              <input
                type="text"
                value={syncConfig.projectKey}
                onChange={(e) => setSyncConfig(prev => ({ ...prev, projectKey: e.target.value }))}
                placeholder="Project key (e.g., PROJ)"
                className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-accent transition"
              />

              {/* Team Member Selection */}
              <div>
                <label className="text-[10px] font-bold text-accent mb-2 block">Assign to Team Members</label>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {teamMembers.map(member => (
                    <label key={member.id} className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={syncConfig.assignedMembers.includes(member.email)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSyncConfig(prev => ({
                              ...prev,
                              assignedMembers: [...prev.assignedMembers, member.email],
                            }));
                          } else {
                            setSyncConfig(prev => ({
                              ...prev,
                              assignedMembers: prev.assignedMembers.filter(em => em !== member.email),
                            }));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-foreground">{member.full_name}</span>
                      <span className="text-muted-foreground text-[9px]">({member.role})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sync Button */}
              <Button
                onClick={syncToProjectManagement}
                disabled={syncing || !syncConfig.projectKey}
                className="w-full btn-ivory rounded-lg"
              >
                {syncing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Sync Tasks
                  </>
                )}
              </Button>

              <Button
                onClick={() => {
                  setTasks(null);
                  setSelectedDebate(null);
                }}
                variant="outline"
                className="w-full rounded-lg"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Zap className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Select a debate to generate tasks</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}