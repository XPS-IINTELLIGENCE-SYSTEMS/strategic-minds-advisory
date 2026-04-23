import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { BookOpen, Zap, Loader2, Plus, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PlaybookBuilder from './PlaybookBuilder';
import { motion } from 'framer-motion';

export default function InteractivePlaybookGenerator() {
  const [intelligence, setIntelligence] = useState([]);
  const [playbooks, setPlaybooks] = useState([]);
  const [selectedIntel, setSelectedIntel] = useState(null);
  const [viewingPlaybook, setViewingPlaybook] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [playbookTitle, setPlaybookTitle] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const user = await base44.auth.me();
      const [intelData, playbooksData] = await Promise.all([
        base44.entities.StrategicIntelligence.filter({ created_by: user.email }, '-created_date', 20),
        base44.entities.StrategyPlaybook.filter({ creator_email: user.email }, '-created_date', 10),
      ]);
      setIntelligence(intelData);
      setPlaybooks(playbooksData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePlaybook = async () => {
    if (!selectedIntel || !playbookTitle) return;
    setGenerating(true);

    try {
      const response = await base44.functions.invoke('generateStrategyPlaybook', {
        intelligenceId: selectedIntel.id,
        intelligenceTitle: selectedIntel.title,
        intelligenceData: selectedIntel.description,
        playbookTitle,
      });

      const newPlaybook = await base44.entities.StrategyPlaybook.create({
        title: playbookTitle,
        creator_email: (await base44.auth.me()).email,
        source_scenario: selectedIntel.title,
        pivot_strategy: response.data.strategy,
        implementation_steps: JSON.stringify(response.data.steps),
        expected_outcomes: response.data.outcomes,
        success_metrics: JSON.stringify(response.data.metrics),
        applicable_domains: selectedIntel.domain || 'general',
      });

      setPlaybooks(prev => [newPlaybook, ...prev]);
      setPlaybookTitle('');
      setSelectedIntel(null);
      setViewingPlaybook(newPlaybook);
    } catch (error) {
      console.error('Failed to generate playbook:', error);
    } finally {
      setGenerating(false);
    }
  };

  const deletePlaybook = async (id) => {
    try {
      await base44.entities.StrategyPlaybook.delete(id);
      setPlaybooks(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  if (viewingPlaybook) {
    return <PlaybookBuilder playbook={viewingPlaybook} onBack={() => setViewingPlaybook(null)} />;
  }

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
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Strategy Playbook Generator</h3>
            <p className="text-xs text-muted-foreground">Transform intelligence into actionable strategy</p>
          </div>
        </div>
      </div>

      {/* Generation Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6 border border-border space-y-4"
      >
        <h4 className="font-medium text-foreground">Generate New Playbook</h4>

        {/* Intelligence Selection */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Select Intelligence Source</label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {intelligence.length > 0 ? (
              intelligence.map(intel => (
                <button
                  key={intel.id}
                  onClick={() => setSelectedIntel(intel)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border transition ${
                    selectedIntel?.id === intel.id
                      ? 'bg-accent/15 border-accent/50'
                      : 'bg-secondary/30 border-border hover:border-accent/30'
                  }`}
                >
                  <div className="text-sm font-medium text-foreground">{intel.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{intel.domain || 'general'}</div>
                </button>
              ))
            ) : (
              <div className="text-xs text-muted-foreground text-center py-4">No intelligence found</div>
            )}
          </div>
        </div>

        {/* Playbook Title */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Playbook Title</label>
          <input
            type="text"
            value={playbookTitle}
            onChange={(e) => setPlaybookTitle(e.target.value)}
            placeholder="e.g., Q2 Market Expansion Playbook"
            className="w-full px-3 py-2.5 text-sm rounded-lg bg-secondary/40 border border-border outline-none focus:border-accent transition"
          />
        </div>

        {/* Generate Button */}
        <Button
          onClick={generatePlaybook}
          disabled={!selectedIntel || !playbookTitle || generating}
          className="btn-ivory rounded-lg w-full"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Generate Playbook
            </>
          )}
        </Button>
      </motion.div>

      {/* Existing Playbooks */}
      <div>
        <h4 className="font-medium text-foreground mb-3">My Playbooks ({playbooks.length})</h4>
        <div className="grid gap-3">
          {playbooks.length > 0 ? (
            playbooks.map(playbook => (
              <motion.div
                key={playbook.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-4 border border-border"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h5 className="font-medium text-foreground">{playbook.title}</h5>
                    <p className="text-xs text-muted-foreground mt-1">Source: {playbook.source_scenario}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewingPlaybook(playbook)}
                      className="p-2 rounded-lg bg-accent/15 hover:bg-accent/25 transition text-accent"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deletePlaybook(playbook.id)}
                      className="p-2 rounded-lg bg-destructive/15 hover:bg-destructive/25 transition text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span className="px-2 py-1 rounded bg-secondary/30">{playbook.applicable_domains}</span>
                  <span className="px-2 py-1 rounded bg-secondary/30">
                    {playbook.success_rate ? `${playbook.success_rate}% success` : 'New'}
                  </span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No playbooks yet. Create one to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}