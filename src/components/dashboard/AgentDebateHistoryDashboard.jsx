import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Search, Download, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AgentDebateHistoryDashboard() {
  const [debates, setDebates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDebate, setSelectedDebate] = useState(null);
  const [filteredDebates, setFilteredDebates] = useState([]);

  useEffect(() => {
    loadDebates();
  }, []);

  useEffect(() => {
    const filtered = debates.filter(d =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.participants.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.tags?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredDebates(filtered);
  }, [searchQuery, debates]);

  const loadDebates = async () => {
    try {
      const allDebates = await base44.entities.DebateHistory.list();
      setDebates(allDebates.sort((a, b) => 
        new Date(b.debate_date).getTime() - new Date(a.debate_date).getTime()
      ));
    } catch (error) {
      console.error('Failed to load debates:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportDebate = (debate) => {
    const content = `
DEBATE HISTORY - ${debate.title}
=====================================

Date: ${new Date(debate.debate_date).toLocaleString()}
Participants: ${debate.participants}
ID: ${debate.session_id}

DEBATE TRANSCRIPT:
${JSON.parse(debate.messages || '[]').map((m, i) => 
  `${i + 1}. [${m.agent}]: ${m.content}`
).join('\n')}

CONCLUSION:
${debate.conclusion}

DECISION MADE:
${debate.decision_made}

=====================================
Exported: ${new Date().toLocaleString()}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debate_${debate.session_id}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
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
      {/* Left Panel - Debate List */}
      <div className="w-96 flex-shrink-0 flex flex-col gap-4 overflow-hidden">
        <div>
          <h3 className="font-bold text-accent mb-3">Debate History</h3>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search debates, agents..."
              className="w-full bg-secondary/40 border border-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-accent transition"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {filteredDebates.map(debate => (
            <button
              key={debate.id}
              onClick={() => setSelectedDebate(debate)}
              className={`w-full text-left p-3 rounded-lg border transition ${
                selectedDebate?.id === debate.id
                  ? 'border-accent bg-accent/15'
                  : 'border-border hover:border-accent'
              }`}
            >
              <p className="text-xs font-bold text-foreground truncate">{debate.title}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{debate.participants}</p>
              <p className="text-[10px] text-muted-foreground">
                {new Date(debate.debate_date).toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Right Panel - Debate Details */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedDebate ? (
          <div className="flex flex-col gap-4 overflow-hidden">
            {/* Header */}
            <div className="glass-card rounded-2xl p-4 border border-border flex-shrink-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-bold text-foreground">{selectedDebate.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(selectedDebate.debate_date).toLocaleString()}
                  </p>
                </div>
                <Button
                  onClick={() => exportDebate(selectedDebate)}
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                >
                  <Download className="w-3 h-3" />
                </Button>
              </div>

              <div className="flex gap-2 flex-wrap">
                {selectedDebate.participants.split(',').map(p => (
                  <span key={p} className="text-[10px] px-2 py-1 rounded bg-secondary/40">
                    {p.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3">
              {JSON.parse(selectedDebate.messages || '[]').map((msg, idx) => (
                <div key={idx} className="glass-card rounded-2xl p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-accent">{msg.agent}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80">{msg.content}</p>
                </div>
              ))}
            </div>

            {/* Conclusion & Decision */}
            <div className="space-y-3 flex-shrink-0">
              {selectedDebate.conclusion && (
                <div className="glass-card rounded-2xl p-4 border border-border">
                  <p className="text-xs font-bold text-accent mb-2">Conclusion</p>
                  <p className="text-sm text-foreground/80">{selectedDebate.conclusion}</p>
                </div>
              )}

              {selectedDebate.decision_made && (
                <div className="glass-card rounded-2xl p-4 border border-border bg-green-500/10 border-green-500/20">
                  <p className="text-xs font-bold text-green-400 mb-2">Decision Made</p>
                  <p className="text-sm text-foreground/80">{selectedDebate.decision_made}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Select a debate to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}