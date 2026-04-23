import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Play, Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CustomStressTestBuilder({ onTestStart }) {
  const [scenarios, setScenarios] = useState([]);
  const [newScenario, setNewScenario] = useState({
    name: '',
    probability: 0.3,
    duration: 12,
    impact: 0.7,
  });
  const [running, setRunning] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [ideas, setIdeas] = useState([]);

  React.useEffect(() => {
    loadIdeas();
  }, []);

  const loadIdeas = async () => {
    try {
      const allIdeas = await base44.entities.VisionIdea.filter({
        status: 'validated',
      });
      setIdeas(allIdeas);
    } catch (error) {
      console.error('Failed to load ideas:', error);
    }
  };

  const addScenario = () => {
    if (!newScenario.name.trim()) return;

    setScenarios([
      ...scenarios,
      { ...newScenario, id: Date.now() },
    ]);

    setNewScenario({
      name: '',
      probability: 0.3,
      duration: 12,
      impact: 0.7,
    });
  };

  const removeScenario = (id) => {
    setScenarios(scenarios.filter(s => s.id !== id));
  };

  const runCustomTest = async () => {
    if (!selectedIdea || scenarios.length === 0) return;

    setRunning(true);
    try {
      for (const scenario of scenarios) {
        await base44.functions.invoke('customStressTest', {
          ideaId: selectedIdea,
          scenarioName: scenario.name,
          probability: scenario.probability,
          duration: scenario.duration,
          impactScore: scenario.impact,
        });
      }
      onTestStart?.();
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 p-6 overflow-y-auto">
      {/* Idea Selection */}
      <div className="glass-card rounded-2xl p-6 border border-border">
        <h3 className="font-medium text-foreground mb-4">Select Idea to Test</h3>
        <div className="grid gap-2">
          {ideas.map(idea => (
            <button
              key={idea.id}
              onClick={() => setSelectedIdea(idea.id)}
              className={`p-3 rounded-lg text-left transition ${
                selectedIdea === idea.id
                  ? 'bg-accent/15 border border-accent text-accent'
                  : 'bg-secondary/30 border border-border hover:border-accent/50'
              }`}
            >
              <p className="font-medium text-sm">{idea.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{idea.domain}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Scenario Builder */}
      <div className="glass-card rounded-2xl p-6 border border-border">
        <h3 className="font-medium text-foreground mb-4">Build Custom Black Swan Scenario</h3>

        <div className="space-y-4 mb-4">
          {/* Name */}
          <div>
            <label className="text-xs font-medium text-foreground mb-2 block">Scenario Name</label>
            <input
              type="text"
              value={newScenario.name}
              onChange={(e) => setNewScenario({ ...newScenario, name: e.target.value })}
              placeholder="e.g., AI Singularity, Market Collapse..."
              className="w-full px-3 py-2 text-sm rounded-lg bg-secondary/40 border border-border outline-none focus:border-accent transition"
            />
          </div>

          {/* Probability Slider */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs font-medium text-foreground">Probability of Occurrence</label>
              <span className="text-xs font-bold text-accent">{(newScenario.probability * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={newScenario.probability}
              onChange={(e) => setNewScenario({ ...newScenario, probability: parseFloat(e.target.value) })}
              className="w-full h-2 bg-secondary/40 rounded-lg appearance-none cursor-pointer accent-accent"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>Unlikely</span>
              <span>Moderate</span>
              <span>Likely</span>
            </div>
          </div>

          {/* Duration Slider */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs font-medium text-foreground">Duration (Months)</label>
              <span className="text-xs font-bold text-accent">{newScenario.duration}mo</span>
            </div>
            <input
              type="range"
              min="1"
              max="36"
              step="1"
              value={newScenario.duration}
              onChange={(e) => setNewScenario({ ...newScenario, duration: parseInt(e.target.value) })}
              className="w-full h-2 bg-secondary/40 rounded-lg appearance-none cursor-pointer accent-accent"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>1 Month</span>
              <span>12 Months</span>
              <span>36 Months</span>
            </div>
          </div>

          {/* Impact Score */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs font-medium text-foreground">Impact Severity</label>
              <span className="text-xs font-bold text-destructive">{(newScenario.impact * 100).toFixed(0)}/100</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={newScenario.impact}
              onChange={(e) => setNewScenario({ ...newScenario, impact: parseFloat(e.target.value) })}
              className="w-full h-2 bg-secondary/40 rounded-lg appearance-none cursor-pointer accent-destructive"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>Minor</span>
              <span>Moderate</span>
              <span>Catastrophic</span>
            </div>
          </div>

          <Button
            onClick={addScenario}
            className="btn-ivory rounded-lg w-full"
          >
            <Plus className="w-4 h-4" />
            Add to Test Queue
          </Button>
        </div>
      </div>

      {/* Queued Scenarios */}
      {scenarios.length > 0 && (
        <div className="glass-card rounded-2xl p-6 border border-border">
          <h3 className="font-medium text-foreground mb-4">Test Queue ({scenarios.length})</h3>
          <div className="space-y-2">
            {scenarios.map(scenario => (
              <div key={scenario.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{scenario.name}</p>
                  <div className="flex gap-3 text-[10px] text-muted-foreground mt-1">
                    <span>P: {(scenario.probability * 100).toFixed(0)}%</span>
                    <span>D: {scenario.duration}mo</span>
                    <span>I: {(scenario.impact * 100).toFixed(0)}</span>
                  </div>
                </div>
                <button
                  onClick={() => removeScenario(scenario.id)}
                  className="text-muted-foreground hover:text-destructive transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <Button
            onClick={runCustomTest}
            disabled={running || !selectedIdea}
            className="btn-ivory rounded-lg w-full mt-4"
          >
            {running ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run All Tests
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}