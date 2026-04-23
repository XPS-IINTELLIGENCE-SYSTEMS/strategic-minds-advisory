import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Send, Loader2, Plus, RotateCcw,
  Zap, ChevronDown, Lightbulb, Target
} from 'lucide-react';

const AGENT_STYLES = {
  Analyzer:  { color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/25',   emoji: '🔬' },
  Validator: { color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/25',    emoji: '⚔️' },
  Strategist:{ color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/25',  emoji: '♟️' },
  Inventor:  { color: 'text-green-400',   bg: 'bg-green-500/10',   border: 'border-green-500/25',  emoji: '⚗️' },
  Predictor: { color: 'text-cyan-400',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/25',   emoji: '📡' },
  Visionary: { color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/25', emoji: '🌌' },
  Synthesis: { color: 'text-accent',      bg: 'bg-accent/10',      border: 'border-accent/30',     emoji: '✨' },
  User:      { color: 'text-foreground',  bg: 'bg-secondary/50',   border: 'border-border',        emoji: '👤' },
};

const AGENT_OPTIONS = ['Analyzer', 'Validator', 'Strategist', 'Inventor', 'Predictor', 'Visionary'];

const DIRECTIVE_PRESETS = [
  'Focus on B2B SaaS revenue model',
  'Make it work with $500K seed budget',
  'Prioritize the AI/automation angle',
  'Target enterprise Fortune 500 clients',
  'Find the fastest path to $1M ARR',
  'Identify strategic acquisition targets',
];

function AgentBubble({ msg, index }) {
  const style = AGENT_STYLES[msg.agent] || AGENT_STYLES.Analyzer;
  const isUser = msg.agent === 'User';
  const isSynthesis = msg.isSynthesis;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: 'easeOut' }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-2xl border ${style.border} ${style.bg} flex items-center justify-center flex-shrink-0 text-base`}>
        {style.emoji}
      </div>

      {/* Bubble */}
      <div className={`flex-1 max-w-[85%] ${isUser ? 'items-end flex flex-col' : ''}`}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-xs font-semibold ${style.color}`}>{msg.agent}</span>
            {msg.round && (
              <span className="text-[10px] text-muted-foreground border border-border rounded-full px-1.5 py-0.5">
                Round {msg.round}
              </span>
            )}
            {isSynthesis && (
              <span className="text-[10px] text-accent border border-accent/30 rounded-full px-1.5 py-0.5 bg-accent/10">
                Synthesis
              </span>
            )}
          </div>
        )}
        <div className={`px-4 py-3 rounded-2xl border ${style.border} ${style.bg} text-sm leading-relaxed whitespace-pre-wrap ${
          isSynthesis ? 'border-accent/30 bg-accent/8 font-medium' : ''
        }`}>
          {msg.content}
        </div>
      </div>
    </motion.div>
  );
}

export default function AgentDebateChat({ idea }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userDirective, setUserDirective] = useState('');
  const [round, setRound] = useState(1);
  const [selectedAgents, setSelectedAgents] = useState(['Analyzer', 'Validator', 'Strategist', 'Inventor', 'Predictor']);
  const [showAgentPicker, setShowAgentPicker] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleAgent = (a) => setSelectedAgents(prev =>
    prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]
  );

  const runDebate = async () => {
    if (!idea) return;
    setLoading(true);

    // Add user directive bubble if provided
    if (userDirective.trim()) {
      setMessages(prev => [...prev, { agent: 'User', content: userDirective, round }]);
    }

    const debateHistory = messages.filter(m => m.agent !== 'User').slice(-10);

    const res = await base44.functions.invoke('visionDebate', {
      ideaTitle: idea.title,
      ideaConcept: idea.full_concept || idea.description,
      userDirective: userDirective.trim() || null,
      round,
      debateHistory,
      agentSequence: selectedAgents,
    });

    if (res.data?.messages) {
      setMessages(prev => [...prev, ...res.data.messages]);
      setRound(r => r + 1);
      setUserDirective('');
    }
    setLoading(false);
  };

  const reset = () => { setMessages([]); setRound(1); setUserDirective(''); };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Config bar */}
      <div className="flex-shrink-0 px-5 py-3 border-b border-border bg-card/20 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs font-medium">Round {round}</span>
        </div>

        {/* Agent selector */}
        <div className="relative">
          <button onClick={() => setShowAgentPicker(o => !o)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border bg-secondary/30 hover:bg-secondary transition">
            Agents ({selectedAgents.length}) <ChevronDown className="w-3 h-3" />
          </button>
          <AnimatePresence>
            {showAgentPicker && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="absolute top-full left-0 mt-1 z-20 bg-card border border-border rounded-xl p-2 shadow-xl flex flex-col gap-1 min-w-[160px]">
                {AGENT_OPTIONS.map(a => {
                  const s = AGENT_STYLES[a];
                  return (
                    <button key={a} onClick={() => toggleAgent(a)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition ${
                        selectedAgents.includes(a) ? `${s.bg} ${s.color}` : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                      }`}>
                      <span>{s.emoji}</span> {a}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button onClick={reset} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground transition">
          <RotateCcw className="w-3 h-3" /> Reset
        </button>

        {idea && (
          <div className="text-xs text-muted-foreground ml-auto truncate max-w-48">
            💡 {idea.title}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-secondary/40 border border-border flex items-center justify-center">
              <MessageSquare className="w-7 h-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-sm">Start an Agent Debate</p>
              <p className="text-xs text-muted-foreground mt-1">Agents will debate the idea in real-time. Add a directive to steer them.</p>
            </div>
            {!idea && (
              <p className="text-xs text-amber-400 border border-amber-500/30 rounded-xl px-4 py-2 bg-amber-500/10">
                ⚠️ Select an idea from the Idea Board first
              </p>
            )}
          </div>
        )}

        {messages.map((msg, i) => (
          <AgentBubble key={i} msg={msg} index={i} />
        ))}

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            {selectedAgents.slice(0, 3).map((a, i) => {
              const s = AGENT_STYLES[a];
              return (
                <div key={a} className={`w-8 h-8 rounded-2xl border ${s.border} ${s.bg} flex items-center justify-center text-base`} style={{ animationDelay: `${i * 0.2}s` }}>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: s.color?.replace('text-', '') }} />
                </div>
              );
            })}
            <div className="px-4 py-3 rounded-2xl border border-border bg-card/50 text-sm text-muted-foreground flex items-center gap-2">
              <span>Agents deliberating</span>
              <span className="flex gap-1">
                {[0,1,2].map(i => <span key={i} className="w-1 h-1 rounded-full bg-accent animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />)}
              </span>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 p-4 border-t border-border bg-card/20">
        {/* Presets */}
        <div className="mb-2">
          <button onClick={() => setShowPresets(o => !o)}
            className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition">
            <Target className="w-3 h-3" /> Directive Presets <ChevronDown className="w-3 h-3" />
          </button>
          <AnimatePresence>
            {showPresets && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-1.5 mt-2 overflow-hidden">
                {DIRECTIVE_PRESETS.map(p => (
                  <button key={p} onClick={() => { setUserDirective(p); setShowPresets(false); }}
                    className="text-[10px] px-2.5 py-1 rounded-full border border-accent/30 text-accent bg-accent/5 hover:bg-accent/15 transition">
                    {p}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-2">
          <input
            value={userDirective}
            onChange={e => setUserDirective(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !loading && idea && runDebate()}
            placeholder="Steer the debate… e.g. 'Focus on the enterprise market'"
            className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition"
          />
          <button onClick={runDebate} disabled={loading || !idea}
            className="flex items-center gap-2 px-4 py-3 rounded-xl btn-ivory text-sm disabled:opacity-50 flex-shrink-0">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Zap className="w-4 h-4" /> Debate</>}
          </button>
        </div>
      </div>
    </div>
  );
}