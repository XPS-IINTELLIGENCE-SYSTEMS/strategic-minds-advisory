import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, CheckCircle2, Circle, Flag, Calendar, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function PlaybookBuilder({ playbook, onBack }) {
  const [steps, setSteps] = useState(() => {
    try {
      return JSON.parse(playbook.implementation_steps || '[]');
    } catch {
      return [];
    }
  });
  
  const [metrics, setMetrics] = useState(() => {
    try {
      return JSON.parse(playbook.success_metrics || '[]');
    } catch {
      return [];
    }
  });
  
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [expandedStep, setExpandedStep] = useState(null);

  const toggleStep = (stepIndex) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepIndex)) {
      newCompleted.delete(stepIndex);
    } else {
      newCompleted.add(stepIndex);
    }
    setCompletedSteps(newCompleted);
  };

  const saveProgress = async () => {
    setSaving(true);
    try {
      await base44.entities.StrategyPlaybook.update(playbook.id, {
        times_applied: (playbook.times_applied || 0) + 1,
      });
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const completionRate = Math.round((completedSteps.size / steps.length) * 100) || 0;

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex-shrink-0 bg-card/40 backdrop-blur-sm">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-secondary transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <h2 className="font-display text-lg text-gradient-ivory">{playbook.title}</h2>
            <p className="text-xs text-muted-foreground">From: {playbook.source_scenario}</p>
          </div>
          <Button onClick={saveProgress} disabled={saving} className="btn-ivory rounded-lg">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Execution Progress</span>
            <span className="text-xs font-bold text-accent">{completionRate}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-amber-400 transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
          {/* Strategy Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6 border border-border"
          >
            <h3 className="font-medium text-foreground mb-3">Strategy Overview</h3>
            <p className="text-sm text-foreground/80 leading-relaxed">{playbook.pivot_strategy}</p>
            {playbook.expected_outcomes && (
              <div className="mt-4 pt-4 border-t border-border">
                <h4 className="text-xs font-bold text-accent mb-2">Expected Outcomes</h4>
                <p className="text-sm text-muted-foreground">{playbook.expected_outcomes}</p>
              </div>
            )}
          </motion.div>

          {/* Implementation Steps */}
          <div>
            <h3 className="font-medium text-foreground mb-3">Implementation Steps</h3>
            <div className="space-y-3">
              {steps.map((step, idx) => {
                const isCompleted = completedSteps.has(idx);
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass-card rounded-2xl border border-border overflow-hidden"
                  >
                    {/* Step Header */}
                    <button
                      onClick={() => setExpandedStep(expandedStep === idx ? null : idx)}
                      className="w-full px-6 py-4 flex items-start gap-4 hover:bg-secondary/30 transition"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStep(idx);
                        }}
                        className="flex-shrink-0 mt-0.5"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground hover:text-accent transition" />
                        )}
                      </button>
                      <div className="flex-1 text-left">
                        <h4 className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {step.title || `Step ${idx + 1}`}
                        </h4>
                        {step.duration && (
                          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {step.duration}
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Step Details */}
                    {expandedStep === idx && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="px-6 py-4 border-t border-border bg-secondary/20 space-y-3"
                      >
                        {step.description && (
                          <div>
                            <h5 className="text-xs font-bold text-accent mb-2">Description</h5>
                            <p className="text-sm text-foreground/80">{step.description}</p>
                          </div>
                        )}

                        {step.checklist && step.checklist.length > 0 && (
                          <div>
                            <h5 className="text-xs font-bold text-accent mb-2">Checklist</h5>
                            <ul className="space-y-1.5">
                              {step.checklist.map((item, itemIdx) => (
                                <li key={itemIdx} className="flex items-center gap-2 text-sm text-foreground/80">
                                  <div className="w-3 h-3 rounded border border-accent/50 flex items-center justify-center flex-shrink-0">
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent opacity-0 group-hover:opacity-100" />
                                  </div>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {step.owner && (
                          <div>
                            <h5 className="text-xs font-bold text-muted-foreground mb-1">Owner</h5>
                            <p className="text-sm text-foreground/80">{step.owner}</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Success Metrics */}
          {metrics.length > 0 && (
            <div>
              <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <Flag className="w-4 h-4 text-accent" />
                Success Metrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {metrics.map((metric, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass-card rounded-xl p-4 border border-border"
                  >
                    <h5 className="text-sm font-medium text-foreground mb-1">{metric.name}</h5>
                    <p className="text-xs text-muted-foreground">{metric.target}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}