import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, MessageSquare, Settings, ThumbsUp, ThumbsDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const AGENTS = {
  Validator: { emoji: '✅', color: 'text-green-400', bg: 'bg-green-500/10' },
  Strategist: { emoji: '♟️', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  Analyzer: { emoji: '🔬', color: 'text-blue-400', bg: 'bg-blue-500/10' },
};

export default function DebateArenaUI({ idea }) {
  const [debateLog, setDebateLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRound, setSelectedRound] = useState(null);
  const [overrides, setOverrides] = useState({});
  const bottomRef = useRef(null);

  useEffect(() => {
    if (idea) {
      loadDebateLog();
    }
  }, [idea]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [debateLog]);

  const loadDebateLog = async () => {
    try {
      setLoading(true);
      const logs = await base44.entities.VisionLog.filter({
        idea_id: idea.id,
        log_type: 'debate',
      });
      
      // Parse and organize logs by round
      const organized = logs.sort((a, b) => 
        new Date(a.created_date) - new Date(b.created_date)
      ).map(log => {
        try {
          return {
            ...log,
            metadata: typeof log.metadata === 'string' ? JSON.parse(log.metadata) : log.metadata,
          };
        } catch {
          return log;
        }
      });

      setDebateLog(organized);
    } catch (error) {
      console.error('Failed to load debate log:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyOverride = (logId, overrideData) => {
    setOverrides(prev => ({
      ...prev,
      [logId]: overrideData,
    }));
  };

  if (!idea) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Select an idea to view debate arena</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  const rounds = {};
  debateLog.forEach(log => {
    const round = log.metadata?.round || 'general';
    if (!rounds[round]) rounds[round] = [];
    rounds[round].push(log);
  });

  return (
    <div className="h-full flex flex-col gap-6 p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h3 className="font-medium text-foreground">{idea.title}</h3>
          <p className="text-xs text-muted-foreground mt-1">Real-time agent debate & reasoning</p>
        </div>
        <button className="p-2 rounded-lg hover:bg-secondary transition">
          <Settings className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Debate Viewer */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Message Feed */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {debateLog.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No debate logs yet. Run a stress test to begin.</p>
                </div>
              </div>
            ) : (
              debateLog.map(log => {
                const agent = AGENTS[log.agent];
                const hasOverride = overrides[log.id];

                return (
                  <div key={log.id} className={`rounded-2xl p-4 border border-border ${agent?.bg || 'bg-secondary/30'}`}>
                    {/* Agent Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{agent?.emoji}</span>
                        <span className={`text-sm font-bold ${agent?.color}`}>{log.agent}</span>
                        {log.metadata?.round && (
                          <span className="text-[10px] text-muted-foreground ml-2 px-2 py-0.5 rounded bg-secondary/40">
                            Round {log.metadata.round}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(log.created_date).toLocaleTimeString()}
                      </span>
                    </div>

                    {/* Message Content */}
                    <div className="prose prose-sm prose-invert max-w-none mb-2">
                      <ReactMarkdown className="text-sm text-foreground/90">
                        {log.message}
                      </ReactMarkdown>
                    </div>

                    {/* Override Status */}
                    {hasOverride && (
                      <div className="mt-2 p-2 rounded text-xs bg-accent/10 border border-accent/20 text-accent">
                        ⚡ Override Applied: {hasOverride.reason}
                      </div>
                    )}

                    {/* Override Controls */}
                    {log.agent !== 'general' && !hasOverride && (
                      <div className="flex gap-2 mt-2 pt-2 border-t border-border/30">
                        <button
                          onClick={() => applyOverride(log.id, { reason: 'Accepted recommendation' })}
                          className="flex-1 px-2 py-1 text-[10px] rounded flex items-center justify-center gap-1 bg-green-500/15 hover:bg-green-500/25 transition text-green-400 border border-green-500/20"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          Accept
                        </button>
                        <button
                          onClick={() => applyOverride(log.id, { reason: 'Overridden by user' })}
                          className="flex-1 px-2 py-1 text-[10px] rounded flex items-center justify-center gap-1 bg-destructive/15 hover:bg-destructive/25 transition text-destructive border border-destructive/20"
                        >
                          <ThumbsDown className="w-3 h-3" />
                          Override
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Rounds Summary */}
        <div className="w-72 flex flex-col gap-3">
          {Object.entries(rounds).map(([roundName, logs]) => (
            <div
              key={roundName}
              onClick={() => setSelectedRound(roundName)}
              className={`glass-card rounded-2xl p-3 border transition cursor-pointer ${
                selectedRound === roundName
                  ? 'border-accent bg-accent/10'
                  : 'border-border hover:border-accent/50'
              }`}
            >
              <p className="text-sm font-medium text-foreground">{roundName}</p>
              <p className="text-xs text-muted-foreground mt-1">{logs.length} messages</p>

              {/* Agent Badges */}
              <div className="flex gap-1.5 mt-2">
                {Array.from(new Set(logs.map(l => l.agent))).map(agent => {
                  const agentInfo = AGENTS[agent];
                  return (
                    <div key={agent} className={`px-2 py-1 rounded text-[10px] font-bold ${agentInfo?.color}`}>
                      {agentInfo?.emoji}
                    </div>
                  );
                })}
              </div>

              {/* Override Count */}
              {Object.keys(overrides).length > 0 && (
                <div className="mt-2 text-[10px] text-accent">
                  ⚡ {Object.keys(overrides).length} override(s) applied
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}