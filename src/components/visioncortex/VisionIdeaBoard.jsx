import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Lightbulb, Loader2, RefreshCw, ChevronRight, Zap,
  MessageSquare, Play, FileText, Star, TrendingUp, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_CONFIG = {
  seeded:     { label: 'Seeded',      color: 'text-blue-400',    border: 'border-blue-500/30',    bg: 'bg-blue-500/10' },
  debating:   { label: 'Debating',    color: 'text-purple-400',  border: 'border-purple-500/30',  bg: 'bg-purple-500/10' },
  simulating: { label: 'Simulating',  color: 'text-amber-400',   border: 'border-amber-500/30',   bg: 'bg-amber-500/10' },
  validated:  { label: 'Validated',   color: 'text-green-400',   border: 'border-green-500/30',   bg: 'bg-green-500/10' },
  building:   { label: 'Building',    color: 'text-cyan-400',    border: 'border-cyan-500/30',    bg: 'bg-cyan-500/10' },
  documented: { label: 'Documented',  color: 'text-accent',      border: 'border-accent/30',      bg: 'bg-accent/10' },
  failed:     { label: 'Failed',      color: 'text-red-400',     border: 'border-red-500/30',     bg: 'bg-red-500/10' },
};

const FILTERS = ['All', 'seeded', 'debating', 'simulating', 'validated', 'building', 'documented'];

export default function VisionIdeaBoard({ onSelectIdea, onSelectForDebate }) {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningId, setRunningId] = useState(null);
  const [filter, setFilter] = useState('All');

  useEffect(() => { fetchIdeas(); }, []);

  const fetchIdeas = async () => {
    setLoading(true);
    const data = await base44.entities.VisionIdea.list('-created_date', 100);
    setIdeas(data);
    setLoading(false);
  };

  const runAction = async (idea, mode, e) => {
    e.stopPropagation();
    setRunningId(`${idea.id}_${mode}`);
    await base44.functions.invoke('visionCortexRun', {
      mode,
      ideaId: idea.id,
      sessionId: `vc_${Date.now()}`,
    });
    await fetchIdeas();
    setRunningId(null);
  };

  const filtered = filter === 'All' ? ideas : ideas.filter(i => i.status === filter);

  const scoreBg = (score) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 75) return 'text-green-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{filtered.length} ideas</div>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-all capitalize ${
                    filter === f ? 'btn-ivory border-transparent' : 'border-border bg-secondary/30 text-muted-foreground hover:text-foreground'
                  }`}>{f === 'All' ? `All (${ideas.length})` : f}</button>
              ))}
            </div>
          </div>
          <button onClick={fetchIdeas} className="w-8 h-8 rounded-xl border border-border bg-secondary/40 hover:bg-secondary flex items-center justify-center transition">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Lightbulb className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No ideas yet. Pull the intelligence feed and seed an idea.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(idea => {
              const sc = STATUS_CONFIG[idea.status] || STATUS_CONFIG.seeded;
              return (
                <motion.div key={idea.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`p-5 rounded-2xl border ${sc.border} bg-card/60 hover:bg-card/90 transition-all group`}>
                  
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${sc.border} ${sc.color} ${sc.bg}`}>
                      {sc.label}
                    </div>
                    {idea.validation_score > 0 && (
                      <div className={`font-display text-lg ${scoreBg(idea.validation_score)}`}>
                        {idea.validation_score}
                        <span className="text-xs text-muted-foreground">/100</span>
                      </div>
                    )}
                  </div>

                  <h3 className="font-display text-base leading-snug mb-2 group-hover:text-accent transition">{idea.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{idea.description}</p>

                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-[10px] text-muted-foreground border border-border rounded-full px-2 py-0.5">{idea.domain}</span>
                    <span className="text-[10px] text-muted-foreground">v{idea.iteration || 0}</span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-1.5 mt-4 pt-3 border-t border-border/40" onClick={e => e.stopPropagation()}>
                    {idea.status === 'seeded' && (
                      <button onClick={e => runAction(idea, 'debate', e)} disabled={!!runningId}
                        className="flex-1 text-xs py-1.5 rounded-lg border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 transition flex items-center justify-center gap-1 disabled:opacity-40">
                        {runningId === `${idea.id}_debate` ? <Loader2 className="w-3 h-3 animate-spin" /> : <MessageSquare className="w-3 h-3" />}
                        Debate
                      </button>
                    )}
                    {(idea.status === 'debating' || idea.status === 'seeded') && (
                      <button onClick={e => runAction(idea, 'simulate', e)} disabled={!!runningId}
                        className="flex-1 text-xs py-1.5 rounded-lg border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition flex items-center justify-center gap-1 disabled:opacity-40">
                        {runningId === `${idea.id}_simulate` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                        Simulate
                      </button>
                    )}
                    {idea.status === 'validated' && (
                      <button onClick={e => runAction(idea, 'build', e)} disabled={!!runningId}
                        className="flex-1 text-xs py-1.5 rounded-lg border border-accent/30 text-accent hover:bg-accent/10 transition flex items-center justify-center gap-1 disabled:opacity-40">
                        {runningId === `${idea.id}_build` ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
                        Build & Document
                      </button>
                    )}
                    <button onClick={() => onSelectIdea(idea)}
                      className="w-7 h-7 rounded-lg border border-border bg-background/40 hover:bg-secondary flex items-center justify-center transition flex-shrink-0" title="View Detail">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}