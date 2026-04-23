import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, BookOpen, Play, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StrategyPlaybookLibrary() {
  const [playbooks, setPlaybooks] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [selectedPlaybook, setSelectedPlaybook] = useState(null);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [newPlaybook, setNewPlaybook] = useState({
    title: '',
    description: '',
    pivot_strategy: '',
    implementation_steps: [],
    applicable_domains: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await base44.auth.me();
      const [allPlaybooks, allModels] = await Promise.all([
        base44.entities.StrategyPlaybook.filter({ creator_email: user.email }),
        base44.entities.SavedModel.list(),
      ]);
      
      setPlaybooks(allPlaybooks);
      setModels(allModels);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePlaybook = async () => {
    if (!newPlaybook.title || !newPlaybook.pivot_strategy) {
      alert('Please fill in title and strategy');
      return;
    }

    try {
      const user = await base44.auth.me();
      
      const playbook = await base44.entities.StrategyPlaybook.create({
        title: newPlaybook.title,
        description: newPlaybook.description,
        creator_email: user.email,
        pivot_strategy: newPlaybook.pivot_strategy,
        implementation_steps: JSON.stringify(newPlaybook.implementation_steps || []),
        applicable_domains: newPlaybook.applicable_domains,
        success_rate: 85,
      });

      setPlaybooks(prev => [...prev, playbook]);
      setNewPlaybook({
        title: '',
        description: '',
        pivot_strategy: '',
        implementation_steps: [],
        applicable_domains: '',
      });
      setShowSaveForm(false);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const applyPlaybook = async (playbookId, modelId) => {
    setApplying(`${playbookId}_${modelId}`);
    try {
      const response = await base44.functions.invoke('applyStrategyPlaybook', {
        playbookId,
        modelId,
      });

      alert(`✓ Applied "${response.data.playbook}" to ${response.data.model}\nTimeline: ${response.data.timeline_weeks} weeks`);
      
      // Reload playbooks to update times_applied
      await loadData();
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setApplying(null);
    }
  };

  const deletePlaybook = async (playbookId) => {
    if (!confirm('Delete this playbook?')) return;

    try {
      await base44.entities.StrategyPlaybook.delete(playbookId);
      setPlaybooks(prev => prev.filter(p => p.id !== playbookId));
      setSelectedPlaybook(null);
    } catch (error) {
      alert(`Error: ${error.message}`);
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
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-accent" />
            <div>
              <h3 className="font-medium text-foreground">Strategy Playbook Library</h3>
              <p className="text-xs text-muted-foreground">Save and reuse proven pivot strategies</p>
            </div>
          </div>
          {!showSaveForm && (
            <Button onClick={() => setShowSaveForm(true)} variant="outline" className="rounded-lg">
              <Plus className="w-4 h-4" />
              New Playbook
            </Button>
          )}
        </div>
      </div>

      {/* Save Playbook Form */}
      {showSaveForm && (
        <div className="glass-card rounded-2xl p-6 border border-border">
          <h4 className="font-bold text-accent mb-4">Create New Playbook</h4>

          <div className="space-y-4">
            <input
              type="text"
              value={newPlaybook.title}
              onChange={(e) => setNewPlaybook(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Playbook title (e.g., Market Downturn Response)"
              className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent transition"
            />

            <textarea
              value={newPlaybook.description}
              onChange={(e) => setNewPlaybook(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description and context"
              rows={2}
              className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent transition resize-none"
            />

            <textarea
              value={newPlaybook.pivot_strategy}
              onChange={(e) => setNewPlaybook(prev => ({ ...prev, pivot_strategy: e.target.value }))}
              placeholder="Proven pivot strategy and approach"
              rows={3}
              className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent transition resize-none"
            />

            <input
              type="text"
              value={newPlaybook.applicable_domains}
              onChange={(e) => setNewPlaybook(prev => ({ ...prev, applicable_domains: e.target.value }))}
              placeholder="Applicable domains (comma-separated)"
              className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent transition"
            />

            <div className="flex gap-2">
              <Button
                onClick={savePlaybook}
                className="flex-1 btn-ivory rounded-lg"
              >
                <Plus className="w-4 h-4" />
                Save Playbook
              </Button>
              <Button
                onClick={() => setShowSaveForm(false)}
                variant="outline"
                className="flex-1 rounded-lg"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Playbooks Grid */}
      <div className="grid grid-cols-2 gap-4">
        {playbooks.map(playbook => (
          <div key={playbook.id} className="glass-card rounded-2xl p-5 border border-border flex flex-col">
            <div className="flex-1">
              <h4 className="font-bold text-foreground truncate">{playbook.title}</h4>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{playbook.description}</p>
              <div className="flex items-center gap-2 mt-3 text-[10px]">
                <span className="px-2 py-1 rounded bg-secondary/40">
                  Applied {playbook.times_applied || 0}x
                </span>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => setSelectedPlaybook(playbook)}
                variant="outline"
                size="sm"
                className="flex-1 rounded-lg text-xs"
              >
                View
              </Button>
              <Button
                onClick={() => deletePlaybook(playbook.id)}
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Playbook Details Modal */}
      {selectedPlaybook && (
        <div className="glass-card rounded-2xl p-6 border border-border space-y-4">
          <div className="flex items-start justify-between mb-4">
            <h4 className="font-bold text-foreground">{selectedPlaybook.title}</h4>
            <Button
              onClick={() => setSelectedPlaybook(null)}
              variant="ghost"
              className="text-xs"
            >
              Close
            </Button>
          </div>

          <div>
            <p className="text-xs font-bold text-accent mb-2">Strategy</p>
            <p className="text-sm text-foreground/80">{selectedPlaybook.pivot_strategy}</p>
          </div>

          {selectedPlaybook.applicable_domains && (
            <div>
              <p className="text-xs font-bold text-accent mb-2">Applicable Domains</p>
              <div className="flex flex-wrap gap-2">
                {selectedPlaybook.applicable_domains.split(',').map((domain, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded bg-secondary/40">
                    {domain.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-bold text-accent mb-3">Apply to Model</p>
            <select className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent transition">
              <option value="">Select a model...</option>
              {models.map(model => (
                <option key={model.id} value={model.id}>{model.name}</option>
              ))}
            </select
            >
            <Button
              onClick={(e) => {
                const select = e.target.parentElement.querySelector('select');
                if (select.value) {
                  applyPlaybook(selectedPlaybook.id, select.value);
                }
              }}
              disabled={applying?.startsWith(selectedPlaybook.id)}
              className="w-full mt-2 btn-ivory rounded-lg"
            >
              {applying?.startsWith(selectedPlaybook.id) ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Apply Playbook
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {playbooks.length === 0 && !showSaveForm && (
        <div className="glass-card rounded-2xl p-12 border border-border text-center">
          <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">No playbooks created yet</p>
          <Button onClick={() => setShowSaveForm(true)} className="btn-ivory rounded-lg">
            <Plus className="w-4 h-4" />
            Create Your First Playbook
          </Button>
        </div>
      )}
    </div>
  );
}