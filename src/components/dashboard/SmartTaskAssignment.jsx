import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Brain, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SmartTaskAssignment({ tasks, decisionId }) {
  const [teamMembers, setTeamMembers] = useState([]);
  const [suggestions, setSuggestions] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [assignments, setAssignments] = useState({});

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      const members = await base44.entities.TeamMember.list();
      setTeamMembers(members);
      
      // Auto-analyze if we have tasks
      if (tasks && tasks.length > 0) {
        generateSuggestions(members);
      }
    } catch (error) {
      console.error('Failed to load team:', error);
    }
  };

  const generateSuggestions = async (members) => {
    if (!tasks || tasks.length === 0) return;

    setAnalyzing(true);

    try {
      const res = await base44.functions.invoke('suggestTaskAssignments', {
        tasks,
        teamMembers: members,
        decisionId,
      });

      setSuggestions(res.data);
      setAssignments(res.data.assignments || {});
    } catch (error) {
      console.error('Analysis failed:', error);
    }

    setAnalyzing(false);
  };

  const applyAssignments = async () => {
    try {
      await base44.functions.invoke('applyTaskAssignments', {
        decisionId,
        assignments,
        suggestions,
      });

      alert('✓ Assignments applied successfully');
    } catch (error) {
      console.error('Failed to apply:', error);
    }
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="p-4 rounded-lg border border-border/50 bg-secondary/20 text-center text-xs text-muted-foreground">
        No tasks to assign yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-foreground flex items-center gap-2">
          <Brain className="w-4 h-4 text-accent" /> Smart Assignments
        </h4>
        <button
          onClick={() => generateSuggestions(teamMembers)}
          disabled={analyzing}
          className="px-3 py-1 rounded-lg border border-border bg-secondary/40 hover:bg-secondary text-xs transition disabled:opacity-40"
        >
          {analyzing ? 'Analyzing…' : 'Re-analyze'}
        </button>
      </div>

      <AnimatePresence>
        {suggestions ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {tasks.map((task, idx) => {
              const suggestion = suggestions.recommendations?.[idx];
              const assignedTo = assignments[task.title];

              return (
                <div key={idx} className="p-3 rounded-lg border border-border/50 bg-secondary/30 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-medium text-foreground">{task.title}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{task.description}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-accent/20 text-accent">
                      {task.estimated_hours}h
                    </span>
                  </div>

                  {suggestion && (
                    <div className="pt-2 border-t border-border/30 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-green-400" />
                        <span className="text-xs text-green-400 font-medium">
                          {suggestion.recommended_member}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {suggestion.match_percentage}% match
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        Reason: {suggestion.reason}
                      </p>
                      {suggestion.alternatives && suggestion.alternatives.length > 0 && (
                        <div className="text-[10px] text-muted-foreground mt-1">
                          Alternatives: {suggestion.alternatives.join(', ')}
                        </div>
                      )}
                    </div>
                  )}

                  {suggestion?.risks && suggestion.risks.length > 0 && (
                    <div className="flex items-start gap-1.5 pt-2 border-t border-border/30">
                      <AlertCircle className="w-3 h-3 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div className="text-[10px] text-yellow-400">
                        {suggestion.risks.join(', ')}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {suggestions.overallScore && (
              <div className="p-3 rounded-lg border border-accent/20 bg-accent/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Team Capacity</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 rounded-full bg-secondary/40 overflow-hidden">
                      <div
                        className="h-full bg-accent transition-all"
                        style={{ width: `${suggestions.overallScore}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-accent">{suggestions.overallScore}%</span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={applyAssignments}
              className="w-full py-2 rounded-lg bg-accent/15 text-accent border border-accent text-xs font-medium hover:bg-accent/25 transition"
            >
              Apply Assignments
            </button>
          </motion.div>
        ) : analyzing ? (
          <div className="py-4 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-accent" />
            <span className="text-xs text-muted-foreground">Analyzing team skills…</span>
          </div>
        ) : (
          <button
            onClick={() => generateSuggestions(teamMembers)}
            className="w-full py-2 rounded-lg border border-border bg-secondary/30 hover:bg-secondary text-xs font-medium transition"
          >
            Get AI Recommendations
          </button>
        )}
      </AnimatePresence>
    </div>
  );
}