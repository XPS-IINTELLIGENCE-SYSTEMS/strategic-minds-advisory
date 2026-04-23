import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Rss, Loader2, Zap, TrendingUp, AlertCircle, RefreshCw, Globe, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PullToRefresh from '@/components/common/PullToRefresh';

const SIGNAL_CATEGORIES = [
  'AI & LLM Research', 'Crypto & DeFi', 'Finance & Markets',
  'Geopolitics & Economy', 'Science & Biotech', 'Philosophy & Consciousness',
  'Social Media Trends', 'Invention & Patents', 'Climate & Energy',
];

const URGENCY_CONFIG = {
  high:   { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-500/30' },
  medium: { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-500/30' },
  low:    { color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-500/30' },
};

export default function VisionFeed() {
  const [feed, setFeed] = useState(null);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(null);
  const [selectedCats, setSelectedCats] = useState(SIGNAL_CATEGORIES.slice(0, 5));
  const [customSeed, setCustomSeed] = useState('');
  const [seedDomain, setSeedDomain] = useState('AI & Machine Learning');

  const toggleCat = (cat) => {
    setSelectedCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const loadFeed = async () => {
    setLoading(true);
    const res = await base44.functions.invoke('visionCortexFeed', { categories: selectedCats });
    setFeed(res.data);
    setLoading(false);
  };

  const seedIdea = async (seed) => {
    setSeeding(seed);
    await base44.functions.invoke('visionCortexRun', {
      mode: 'seed',
      customSeed: seed || customSeed,
      domain: seedDomain,
      sessionId: `vc_${Date.now()}`,
    });
    setSeeding(null);
  };

  return (
    <PullToRefresh onRefresh={loadFeed}>
      <div className="h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">

        {/* Category selector */}
        <div className="p-5 rounded-2xl border border-border bg-card/50 space-y-3">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Intelligence Domains to Monitor</div>
          <div className="flex flex-wrap gap-2">
            {SIGNAL_CATEGORIES.map(cat => (
              <button key={cat} onClick={() => toggleCat(cat)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  selectedCats.includes(cat) ? 'border-accent text-accent bg-accent/10' : 'border-border text-muted-foreground hover:text-foreground'
                }`}>{cat}</button>
            ))}
          </div>
          <button onClick={loadFeed} disabled={loading}
            className="btn-ivory rounded-xl px-5 py-2.5 text-sm flex items-center gap-2 disabled:opacity-60">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Ingesting signals…</> : <><Rss className="w-4 h-4" /> Pull Intelligence Feed</>}
          </button>
        </div>

        {/* Manual seed */}
        <div className="p-5 rounded-2xl border border-border bg-card/50 space-y-3">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Manual Seed Injection</div>
          <div className="flex gap-3">
            <input value={customSeed} onChange={e => setCustomSeed(e.target.value)}
              placeholder="Enter a seed idea or signal to explore..."
              className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition" />
            <button onClick={() => seedIdea(customSeed)} disabled={!!seeding || !customSeed}
              className="btn-ivory rounded-xl px-4 py-2.5 text-sm flex items-center gap-2 disabled:opacity-60 flex-shrink-0">
              {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Seed
            </button>
          </div>
        </div>

        {/* Feed output */}
        <AnimatePresence>
          {feed && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              {/* Top seed */}
              {feed.top_seed_for_today && (
                <div className="p-5 rounded-2xl border border-accent/40 bg-accent/8 relative overflow-hidden">
                  <div className="absolute inset-0 ambient-glow opacity-30 pointer-events-none" />
                  <div className="relative">
                    <div className="text-xs uppercase tracking-[0.2em] text-accent mb-2">🌟 Top Signal of the Day</div>
                    <p className="text-sm leading-relaxed font-medium">{feed.top_seed_for_today}</p>
                    <button onClick={() => seedIdea(feed.top_seed_for_today)} disabled={!!seeding}
                      className="mt-3 btn-ivory rounded-xl px-4 py-2 text-xs flex items-center gap-2 disabled:opacity-60">
                      {seeding === feed.top_seed_for_today ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                      Seed This Idea
                    </button>
                  </div>
                </div>
              )}

              {/* Cross-domain opportunities */}
              {feed.cross_domain_opportunities?.length > 0 && (
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Cross-Domain Opportunities</div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {feed.cross_domain_opportunities.map((opp, i) => (
                      <div key={i} className="p-4 rounded-2xl border border-purple-500/20 bg-purple-500/5">
                        <div className="flex gap-1.5 mb-2">
                          {(opp.domains_intersecting || []).map(d => (
                            <span key={d} className="text-[10px] px-2 py-0.5 rounded-full border border-purple-500/30 text-purple-400">{d}</span>
                          ))}
                        </div>
                        <p className="text-sm font-medium mb-1">{opp.opportunity}</p>
                        <p className="text-xs text-muted-foreground mb-2">{opp.why_now}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-accent">{opp.potential_value}</span>
                          <button onClick={() => seedIdea(opp.opportunity)} disabled={!!seeding}
                            className="text-xs px-2.5 py-1 rounded-lg border border-border hover:bg-secondary transition flex items-center gap-1 disabled:opacity-40">
                            {seeding === opp.opportunity ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                            Seed
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Intelligence signals */}
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Domain Intelligence Signals</div>
                <div className="space-y-3">
                  {(feed.intelligence_brief || []).map((item, i) => {
                    const uc = URGENCY_CONFIG[item.urgency] || URGENCY_CONFIG.medium;
                    return (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        className={`p-4 rounded-2xl border ${uc.border} ${uc.bg}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{item.domain}</span>
                              <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full border ${uc.border} ${uc.color}`}>{item.urgency}</span>
                            </div>
                            <p className="text-sm font-medium mb-1">{item.signal}</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">{item.implication}</p>
                            {item.idea_seed && (
                              <div className="mt-2 pt-2 border-t border-border/40 text-xs text-accent/80">
                                💡 Seed: {item.idea_seed}
                              </div>
                            )}
                          </div>
                          {item.idea_seed && (
                            <button onClick={() => seedIdea(item.idea_seed)} disabled={!!seeding}
                              className="w-7 h-7 rounded-xl border border-border bg-background/40 hover:bg-secondary flex items-center justify-center transition flex-shrink-0 disabled:opacity-40">
                              {seeding === item.idea_seed ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3 text-accent" />}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!feed && !loading && (
          <div className="text-center py-16 text-muted-foreground">
            <Rss className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm">Pull the intelligence feed to see cross-domain signals and idea seeds.</p>
          </div>
        )}
      </div>
      </div>
    </PullToRefresh>
  );
}