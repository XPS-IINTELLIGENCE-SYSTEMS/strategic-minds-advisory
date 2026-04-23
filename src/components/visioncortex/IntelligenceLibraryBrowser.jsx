import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, RefreshCw, Loader2, Filter, Star, Lock, ChevronDown, Copy, CheckCircle2 } from 'lucide-react';

const INTELLIGENCE_TYPES = ['competitive', 'market_trend', 'psychology', 'framework', 'opportunity', 'risk', 'technology'];
const CATEGORIES = ['fintech', 'aitools', 'climate', 'biotech', 'consumer', 'enterprise'];

export default function IntelligenceLibraryBrowser() {
  const [intelligence, setIntelligence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const [copied, setCopied] = useState(null);
  const [selectedIntel, setSelectedIntel] = useState(null);

  useEffect(() => {
    loadIntelligence();
  }, []);

  const loadIntelligence = async () => {
    setLoading(true);
    const data = await base44.entities.StrategicIntelligence.list('-value_score', 100);
    setIntelligence(data);
    setLoading(false);
  };

  const filtered = intelligence.filter(i => {
    if (showPremiumOnly && !i.is_premium_only) return false;
    if (filter !== 'all' && !i.intelligence_type.includes(filter)) return false;
    return true;
  });

  const triggerScrape = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('intelligenceIngestPipeline', {});
      if (res.data?.success) {
        await loadIntelligence();
      }
    } catch (error) {
      console.error('Intelligence scrape failed:', error);
    }
    setLoading(false);
  };

  const copyIntel = (intel) => {
    navigator.clipboard.writeText(`${intel.title}\n\n${intel.content}`);
    setCopied(intel.id);
    setTimeout(() => setCopied(null), 2000);
  };

  const valueColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-blue-400';
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-card/20 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-4 h-4 text-accent" />
            <span className="font-medium">Elite Intelligence Library</span>
            <span className="text-xs text-muted-foreground border border-border rounded-full px-2 py-0.5">{filtered.length} insights</span>
          </div>
          <button onClick={triggerScrape} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl btn-ivory text-sm disabled:opacity-60">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Scraping…</> : <><RefreshCw className="w-4 h-4" /> Refresh Library</>}
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs border transition-all ${filter === 'all' ? 'btn-ivory' : 'border-border bg-secondary/30 text-muted-foreground hover:text-foreground'}`}>
            All Types
          </button>
          {INTELLIGENCE_TYPES.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-xl text-xs border transition-all capitalize ${filter === t ? 'btn-ivory' : 'border-border bg-secondary/30 text-muted-foreground hover:text-foreground'}`}>
              {t.replace('_', ' ')}
            </button>
          ))}
          <button onClick={() => setShowPremiumOnly(!showPremiumOnly)}
            className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border transition-all ${showPremiumOnly ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-secondary/30'}`}>
            <Lock className="w-3 h-3" /> Premium Only
          </button>
        </div>
      </div>

      {/* Intelligence Grid */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Brain className="w-12 h-12 opacity-20 mb-3" />
            <p className="text-sm">No intelligence found for selected filters</p>
          </div>
        ) : (
          <div className="p-6 grid md:grid-cols-2 gap-4">
            {filtered.map(intel => (
              <motion.div key={intel.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl border border-border bg-card/50 hover:bg-card/80 transition cursor-pointer group"
                onClick={() => setSelectedIntel(intel)}>

                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium text-sm group-hover:text-accent transition line-clamp-2 flex-1">
                    {intel.title}
                  </h3>
                  {intel.is_premium_only && (
                    <Lock className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-1" />
                  )}
                </div>

                {/* Content preview */}
                <p className="text-xs text-muted-foreground line-clamp-3 mb-3">
                  {intel.content}
                </p>

                {/* Metadata */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-muted-foreground">Type:</span>
                    <span className="text-[9px] text-accent capitalize">{intel.intelligence_type.replace('_', ' ')}</span>
                  </div>

                  {/* Scores */}
                  <div className="flex gap-3">
                    <div>
                      <div className="text-[9px] text-muted-foreground mb-1">Value Score</div>
                      <div className={`text-lg font-bold ${valueColor(intel.value_score)}`}>
                        {intel.value_score}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-muted-foreground mb-1">Rarity</div>
                      <div className={`text-lg font-bold text-purple-400`}>
                        {intel.rarity_score}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <button onClick={(e) => { e.stopPropagation(); copyIntel(intel); }}
                    className="w-full flex items-center justify-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg border border-border hover:bg-secondary/50 transition text-xs">
                    {copied === intel.id ? <><CheckCircle2 className="w-3 h-3 text-green-400" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selectedIntel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={() => setSelectedIntel(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-96 overflow-y-auto p-6 space-y-4"
              onClick={e => e.stopPropagation()}>

              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h2 className="font-display text-xl mb-1">{selectedIntel.title}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase px-2 py-0.5 rounded-full border border-border bg-secondary/30 capitalize">
                      {selectedIntel.intelligence_type.replace('_', ' ')}
                    </span>
                    {selectedIntel.is_premium_only && (
                      <span className="text-[9px] uppercase px-2 py-0.5 rounded-full border border-accent/30 bg-accent/10 text-accent">Premium</span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-sm text-foreground/85">{selectedIntel.content}</p>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/40">
                <div>
                  <div className="text-[9px] text-muted-foreground uppercase mb-1">Value Score</div>
                  <div className={`text-2xl font-bold ${valueColor(selectedIntel.value_score)}`}>{selectedIntel.value_score}</div>
                </div>
                <div>
                  <div className="text-[9px] text-muted-foreground uppercase mb-1">Rarity Score</div>
                  <div className="text-2xl font-bold text-purple-400">{selectedIntel.rarity_score}</div>
                </div>
              </div>

              {selectedIntel.domains && (
                <div>
                  <div className="text-[9px] text-muted-foreground uppercase mb-1">Applies To</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedIntel.domains.split(',').map(d => (
                      <span key={d} className="text-[9px] px-2 py-1 rounded-full border border-border bg-secondary/30">
                        {d.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={() => { copyIntel(selectedIntel); setSelectedIntel(null); }}
                className="w-full px-4 py-2.5 rounded-xl btn-ivory text-sm">
                Copy & Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}