import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { ScrollText, Loader2, RefreshCw, Filter, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AGENT_COLORS = {
  Analyzer:   'text-blue-400 border-blue-500/30 bg-blue-500/10',
  Visionary:  'text-purple-400 border-purple-500/30 bg-purple-500/10',
  Strategist: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  Inventor:   'text-green-400 border-green-500/30 bg-green-500/10',
  Predictor:  'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
  Coder:      'text-orange-400 border-orange-500/30 bg-orange-500/10',
  Marketer:   'text-pink-400 border-pink-500/30 bg-pink-500/10',
  Validator:  'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  Documentor: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
};

const LOG_TYPE_ICONS = {
  thought:    '💭',
  debate:     '⚔️',
  invention:  '💡',
  validation: '✅',
  simulation: '📊',
  build:      '🔨',
  memory:     '🧠',
  source:     '📡',
  error:      '❌',
};

const LOG_TYPES = ['all', 'thought', 'debate', 'invention', 'validation', 'simulation', 'build', 'source'];
const AGENTS = ['All Agents', 'Analyzer', 'Visionary', 'Strategist', 'Inventor', 'Predictor', 'Coder', 'Marketer', 'Validator', 'Documentor'];

export default function VisionLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agentFilter, setAgentFilter] = useState('All Agents');
  const [typeFilter, setTypeFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const data = await base44.entities.VisionLog.list('-created_date', 200);
    setLogs(data);
    setLoading(false);
  };

  const filtered = logs.filter(l => {
    const matchAgent = agentFilter === 'All Agents' || l.agent === agentFilter;
    const matchType = typeFilter === 'all' || l.log_type === typeFilter;
    return matchAgent && matchType;
  });

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Filters */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-card/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">{filtered.length} log entries</span>
          </div>
          <button onClick={fetchLogs} className="w-8 h-8 rounded-xl border border-border bg-secondary/40 hover:bg-secondary flex items-center justify-center transition">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {LOG_TYPES.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-full text-xs border transition-all capitalize ${
                typeFilter === t ? 'btn-ivory border-transparent' : 'border-border bg-secondary/30 text-muted-foreground hover:text-foreground'
              }`}>
              {LOG_TYPE_ICONS[t] || ''} {t}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {AGENTS.map(a => (
            <button key={a} onClick={() => setAgentFilter(a)}
              className={`px-2.5 py-1 rounded-full text-[10px] border transition-all ${
                agentFilter === a ? `${AGENT_COLORS[a] || 'text-accent border-accent/30 bg-accent/10'}` : 'border-border text-muted-foreground hover:text-foreground'
              }`}>{a}</button>
          ))}
        </div>
      </div>

      {/* Log stream */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2 font-mono">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-accent" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">No logs yet. Seed an idea to start the agent pipeline.</div>
        ) : (
          filtered.map((log, i) => {
            const agentColor = AGENT_COLORS[log.agent] || 'text-muted-foreground border-border bg-secondary/30';
            const isExpanded = expanded === log.id;
            const isLong = log.message?.length > 300;

            return (
              <motion.div key={log.id} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i * 0.01, 0.3) }}
                className="rounded-xl border border-border/50 bg-card/30 overflow-hidden">
                <div className="flex items-start gap-3 px-4 py-3">
                  {/* Agent badge */}
                  <div className={`text-[10px] px-2 py-0.5 rounded-full border flex-shrink-0 mt-0.5 ${agentColor}`}>
                    {log.agent}
                  </div>

                  {/* Type */}
                  <span className="text-sm flex-shrink-0 mt-0.5">{LOG_TYPE_ICONS[log.log_type] || '📝'}</span>

                  {/* Message */}
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs text-foreground/80 leading-relaxed ${!isExpanded && isLong ? 'line-clamp-2' : ''} whitespace-pre-wrap break-words`}>
                      {log.message}
                    </div>
                    {isLong && (
                      <button onClick={() => setExpanded(isExpanded ? null : log.id)}
                        className="text-[10px] text-accent mt-1 hover:text-accent/80 transition">
                        {isExpanded ? 'Show less ↑' : 'Show more ↓'}
                      </button>
                    )}
                  </div>

                  {/* Timestamp */}
                  <span className="text-[10px] text-muted-foreground flex-shrink-0">
                    {new Date(log.created_date).toLocaleTimeString()}
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}