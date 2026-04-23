import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Zap, MessageSquare, Calendar } from 'lucide-react';

const STAGES = ['new', 'contacted', 'interested', 'pitching', 'invested'];
const STAGE_LABELS = {
  new: 'New Leads',
  contacted: 'Contacted',
  interested: 'Interested',
  pitching: 'Pitching',
  invested: 'Invested',
};

export default function InvestorKanbanBoard() {
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scoredInvestors, setScoredInvestors] = useState({});

  useEffect(() => {
    loadInvestors();
  }, []);

  const loadInvestors = async () => {
    try {
      const user = await base44.auth.me();
      const workspaces = await base44.entities.Workspace.filter({
        owner_email: user.email,
      });

      if (workspaces.length > 0) {
        const allInvestors = await base44.entities.Investor.filter({
          workspace_id: workspaces[0].id,
        });
        setInvestors(allInvestors);

        // Score each investor
        const scores = {};
        for (const inv of allInvestors) {
          try {
            const scoreResp = await base44.functions.invoke('investorSentimentAndLeadScore', {
              investorId: inv.id,
            });
            scores[inv.id] = scoreResp.data;
          } catch (e) {
            console.error('Failed to score investor:', e);
          }
        }
        setScoredInvestors(scores);
      }
    } catch (error) {
      console.error('Failed to load investors:', error);
    } finally {
      setLoading(false);
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
    <div className="h-full overflow-x-auto p-6">
      <div className="flex gap-6 min-w-full">
        {STAGES.map(stage => {
          const stageInvestors = investors.filter(inv => inv.status === stage);
          
          return (
            <div key={stage} className="flex-shrink-0 w-72">
              {/* Stage Header */}
              <div className="px-4 py-3 rounded-xl bg-secondary/30 border border-border mb-3">
                <h3 className="font-medium text-foreground">{STAGE_LABELS[stage]}</h3>
                <p className="text-xs text-muted-foreground mt-1">{stageInvestors.length} investors</p>
              </div>

              {/* Cards */}
              <div className="space-y-3">
                {stageInvestors.map(investor => {
                  const score = scoredInvestors[investor.id];
                  const leadScoreColor = score?.lead_score >= 70 ? 'text-green-400' : 
                                        score?.lead_score >= 50 ? 'text-accent' : 'text-muted-foreground';

                  return (
                    <div key={investor.id} className="glass-card rounded-xl p-4 border border-border hover:border-accent/50 transition cursor-move">
                      {/* Header */}
                      <div className="mb-3">
                        <h4 className="font-medium text-foreground text-sm">{investor.name}</h4>
                        <p className="text-xs text-muted-foreground truncate">{investor.company}</p>
                      </div>

                      {/* Scores */}
                      {score && (
                        <div className="space-y-2 mb-3 pb-3 border-b border-border">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Lead Score</span>
                            <span className={`text-xs font-bold ${leadScoreColor}`}>
                              {score.lead_score}/100
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Sentiment</span>
                            <span className="text-xs font-bold text-accent">
                              {score.sentiment_score}/10
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Meta */}
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span className="px-2 py-1 rounded bg-secondary/40 truncate">
                          {investor.stage?.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                        <button className="flex-1 px-2 py-1.5 text-xs rounded-lg bg-accent/15 hover:bg-accent/25 transition flex items-center justify-center gap-1 text-accent">
                          <MessageSquare className="w-3 h-3" />
                          Contact
                        </button>
                        <button className="flex-1 px-2 py-1.5 text-xs rounded-lg bg-secondary/40 hover:bg-secondary transition flex items-center justify-center gap-1 text-foreground">
                          <Calendar className="w-3 h-3" />
                          Meet
                        </button>
                      </div>

                      {/* Recommendation */}
                      {score?.recommendation && (
                        <p className="text-[10px] text-muted-foreground mt-2 italic line-clamp-2">
                          💡 {score.recommendation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}