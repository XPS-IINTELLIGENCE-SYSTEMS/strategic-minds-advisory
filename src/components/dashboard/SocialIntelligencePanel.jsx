import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  TrendingUp, Loader2, Save, Trash2, RefreshCw, Hash,
  Users, BarChart3, Lightbulb, Target, AlertTriangle,
  CheckCircle2, ChevronDown, ChevronUp, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const PLATFORMS = [
  { id: 'linkedin', label: 'LinkedIn', color: 'text-sky-400' },
  { id: 'twitter', label: 'Twitter / X', color: 'text-blue-400' },
  { id: 'instagram', label: 'Instagram', color: 'text-pink-400' },
  { id: 'tiktok', label: 'TikTok', color: 'text-purple-400' },
  { id: 'reddit', label: 'Reddit', color: 'text-orange-400' },
  { id: 'general', label: 'All Platforms', color: 'text-accent' },
];

const SENTIMENT_CONFIG = {
  positive: { color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-500/30' },
  neutral:  { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-500/30' },
  negative: { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-500/30' },
  mixed:    { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-500/30' },
};

const EFFORT_COLOR = { low: 'text-green-400', medium: 'text-yellow-400', high: 'text-red-400' };

export default function SocialIntelligencePanel() {
  const [view, setView] = useState('analyze'); // 'analyze' | 'library'
  const [form, setForm] = useState({ topic: '', platform: 'linkedin', brandName: '', competitors: '', industry: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [library, setLibrary] = useState([]);
  const [loadingLib, setLoadingLib] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [expandedSection, setExpandedSection] = useState('hashtags');

  useEffect(() => { fetchLibrary(); }, []);

  const fetchLibrary = async () => {
    setLoadingLib(true);
    const data = await base44.entities.SocialIntelligence.list('-created_date', 50);
    setLibrary(data);
    setLoadingLib(false);
  };

  const analyze = async () => {
    if (!form.topic) return;
    setLoading(true);
    setResult(null);
    setSaved(false);

    const res = await base44.functions.invoke('analyzeSocial', {
      topic: form.topic,
      platform: form.platform,
      brandName: form.brandName,
      competitors: form.competitors,
      industry: form.industry,
    });
    setResult(res.data);
    setLoading(false);
  };

  const saveToLibrary = async () => {
    if (!result) return;
    setSaving(true);
    const sentiment = result.sentiment_analysis?.overall || 'neutral';
    await base44.entities.SocialIntelligence.create({
      topic: form.topic,
      platform: form.platform,
      hashtags: JSON.stringify(result.trending_hashtags || []),
      competitor_insights: JSON.stringify(result.competitor_insights || []),
      trending_content: JSON.stringify(result.trending_content_formats || []),
      benchmark_summary: JSON.stringify(result.benchmark_metrics || {}),
      sentiment,
      opportunity_score: result.opportunity_score || 0,
      raw_analysis: JSON.stringify(result),
    });
    await fetchLibrary();
    setSaved(true);
    setSaving(false);
  };

  const deleteItem = async (id) => {
    await base44.entities.SocialIntelligence.delete(id);
    setLibrary(prev => prev.filter(i => i.id !== id));
    if (selectedItem?.id === id) setSelectedItem(null);
  };

  const sentimentConf = result ? (SENTIMENT_CONFIG[result.sentiment_analysis?.overall] || SENTIMENT_CONFIG.neutral) : null;

  // Benchmark radar data
  const benchmarkData = result?.benchmark_metrics ? [
    { metric: 'Posting Freq', score: 75 },
    { metric: 'Engagement', score: Math.round((result.sentiment_analysis?.score || 6) * 10) },
    { metric: 'Content Mix', score: 65 },
    { metric: 'Hashtag Use', score: 80 },
    { metric: 'Visual Quality', score: 70 },
    { metric: 'Audience Fit', score: 85 },
  ] : [];

  const Section = ({ id, title, icon: Icon, children }) => (
    <div className="rounded-2xl border border-border bg-card/50 overflow-hidden">
      <button onClick={() => setExpandedSection(expandedSection === id ? null : id)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/20 transition">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium">{title}</span>
        </div>
        {expandedSection === id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {expandedSection === id && <div className="px-5 pb-5 border-t border-border/50">{children}</div>}
    </div>
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl text-gradient-ivory">Social Intelligence</h2>
            <p className="text-sm text-muted-foreground mt-1">AI-powered trend analysis and competitive benchmarking</p>
          </div>
          <div className="flex gap-2">
            {['analyze', 'library'].map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-4 py-2 rounded-full text-sm border transition-all capitalize ${v === view ? 'btn-ivory border-transparent' : 'border-border bg-secondary/30 text-muted-foreground hover:text-foreground'}`}>
                {v === 'library' ? `Library (${library.length})` : 'Analyze'}
              </button>
            ))}
          </div>
        </div>

        {/* ANALYZE VIEW */}
        {view === 'analyze' && (
          <>
            {/* Form */}
            <div className="p-5 rounded-2xl border border-border bg-card/50 space-y-4">
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Platform</label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map(p => (
                    <button key={p.id} onClick={() => setForm(f => ({ ...f, platform: p.id }))}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-all ${form.platform === p.id ? `border-accent bg-accent/10 text-accent` : 'border-border text-muted-foreground hover:text-foreground'}`}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Topic / Niche *</label>
                  <input value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                    placeholder="e.g. AI strategy consulting for enterprises"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Your Brand Name</label>
                  <input value={form.brandName} onChange={e => setForm(f => ({ ...f, brandName: e.target.value }))}
                    placeholder="Strategic Minds Advisory"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Competitors (comma-separated)</label>
                  <input value={form.competitors} onChange={e => setForm(f => ({ ...f, competitors: e.target.value }))}
                    placeholder="McKinsey, Bain, BCG, Accenture"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Industry</label>
                  <input value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}
                    placeholder="AI Consulting, B2B SaaS..."
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition" />
                </div>
              </div>
            </div>

            <button onClick={analyze} disabled={loading || !form.topic}
              className="btn-ivory rounded-full w-full py-3.5 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</> : <><TrendingUp className="w-4 h-4" /> Run Social Intelligence Analysis</>}
            </button>

            <AnimatePresence>
              {result && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  {/* Summary banner */}
                  <div className={`p-5 rounded-2xl border ${sentimentConf.border} ${sentimentConf.bg}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Executive Summary</div>
                        <p className="text-sm leading-relaxed">{result.executive_summary}</p>
                      </div>
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className="font-display text-3xl text-gradient-accent">{result.opportunity_score?.toFixed(1)}</div>
                        <div className="text-[10px] text-muted-foreground text-center mt-1">Opportunity<br />Score</div>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                      <button onClick={saveToLibrary} disabled={saving || saved}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl btn-ivory disabled:opacity-60">
                        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : saved ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : <Save className="w-3 h-3" />}
                        {saved ? 'Saved!' : 'Save to Library'}
                      </button>
                    </div>
                  </div>

                  {/* Benchmark + Radar */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl border border-border bg-card/50">
                      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Brand Score Radar</div>
                      <ResponsiveContainer width="100%" height={180}>
                        <RadarChart data={benchmarkData}>
                          <PolarGrid stroke="hsl(30 6% 15%)" />
                          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: 'hsl(30 10% 60%)' }} />
                          <Radar name="Score" dataKey="score" stroke="hsl(36 55% 62%)" fill="hsl(36 55% 62%)" fillOpacity={0.25} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="p-5 rounded-2xl border border-border bg-card/50">
                      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Benchmark Metrics</div>
                      {result.benchmark_metrics && Object.entries(result.benchmark_metrics).map(([k, v]) => (
                        <div key={k} className="flex items-start justify-between gap-2 py-2 border-b border-border/30 last:border-0">
                          <span className="text-xs text-muted-foreground capitalize">{k.replace(/_/g, ' ')}</span>
                          <span className="text-xs text-foreground/80 text-right max-w-[55%]">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Accordion sections */}
                  <Section id="hashtags" title={`Trending Hashtags (${result.trending_hashtags?.length || 0})`} icon={Hash}>
                    <div className="mt-4 space-y-2">
                      {(result.trending_hashtags || []).map((h, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-accent">{h.hashtag}</span>
                            <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full border ${
                              h.competition === 'low' ? 'border-green-500/30 text-green-400' :
                              h.competition === 'medium' ? 'border-yellow-500/30 text-yellow-400' :
                              'border-red-500/30 text-red-400'
                            }`}>{h.competition}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-foreground">{h.volume}</div>
                            <div className="text-xs text-green-400">{h.growth}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Section>

                  <Section id="competitors" title={`Competitor Insights (${result.competitor_insights?.length || 0})`} icon={Users}>
                    <div className="mt-4 space-y-4">
                      {(result.competitor_insights || []).map((c, i) => (
                        <div key={i} className="p-4 rounded-xl border border-border bg-secondary/20">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium">{c.name}</span>
                            <div className="flex gap-3 text-xs text-muted-foreground">
                              <span>{c.estimated_followers}</span>
                              <span className="text-green-400">{c.engagement_rate} eng.</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <div className="text-[10px] text-muted-foreground mb-1">Strengths</div>
                              {(c.strengths || []).map((s, j) => <div key={j} className="text-xs text-green-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />{s}</div>)}
                            </div>
                            <div>
                              <div className="text-[10px] text-muted-foreground mb-1">Weaknesses</div>
                              {(c.weaknesses || []).map((w, j) => <div key={j} className="text-xs text-red-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{w}</div>)}
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">Top content: <span className="text-foreground/70">{c.top_content_type}</span></div>
                        </div>
                      ))}
                    </div>
                  </Section>

                  <Section id="opportunities" title={`Content Opportunities (${result.content_opportunities?.length || 0})`} icon={Lightbulb}>
                    <div className="mt-4 space-y-3">
                      {(result.content_opportunities || []).map((o, i) => (
                        <div key={i} className="p-4 rounded-xl border border-border bg-secondary/20">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <span className="text-sm font-medium">{o.opportunity}</span>
                            <div className="flex gap-2 flex-shrink-0">
                              <span className={`text-[10px] ${EFFORT_COLOR[o.effort]}`}>Effort: {o.effort}</span>
                              <span className={`text-[10px] ${EFFORT_COLOR[o.impact]}`}>Impact: {o.impact}</span>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground italic">"{o.example_hook}"</div>
                        </div>
                      ))}
                    </div>
                  </Section>

                  <Section id="strategy" title="Recommended Hashtag Strategy" icon={Target}>
                    {result.recommended_hashtag_strategy && (
                      <div className="mt-4 space-y-3">
                        <div>
                          <div className="text-xs text-muted-foreground mb-2">Pillar Hashtags (broad reach)</div>
                          <div className="flex flex-wrap gap-2">
                            {(result.recommended_hashtag_strategy.pillar_hashtags || []).map(h => (
                              <span key={h} className="text-xs px-2.5 py-1 rounded-full border border-accent/30 text-accent bg-accent/10">{h}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-2">Niche Hashtags (targeted)</div>
                          <div className="flex flex-wrap gap-2">
                            {(result.recommended_hashtag_strategy.niche_hashtags || []).map(h => (
                              <span key={h} className="text-xs px-2.5 py-1 rounded-full border border-border text-muted-foreground">{h}</span>
                            ))}
                          </div>
                        </div>
                        {result.recommended_hashtag_strategy.branded_hashtag && (
                          <div>
                            <div className="text-xs text-muted-foreground mb-2">Branded Hashtag</div>
                            <span className="text-sm font-medium text-accent">{result.recommended_hashtag_strategy.branded_hashtag}</span>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground leading-relaxed">{result.recommended_hashtag_strategy.rationale}</p>
                      </div>
                    )}
                  </Section>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* LIBRARY VIEW */}
        {view === 'library' && (
          <div className="space-y-4">
            {loadingLib ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
            ) : library.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Globe className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No social intelligence saved yet. Run an analysis and save the results.</p>
              </div>
            ) : (
              <>
                {/* Summary bar chart */}
                {library.length > 1 && (
                  <div className="p-5 rounded-2xl border border-border bg-card/50">
                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Opportunity Scores Across Analyses</div>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={library.map(i => ({ name: i.topic?.substring(0, 15), score: i.opportunity_score || 0 }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(30 6% 15%)" />
                        <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(30 10% 60%)' }} />
                        <YAxis domain={[0, 10]} tick={{ fontSize: 9, fill: 'hsl(30 10% 60%)' }} />
                        <Tooltip contentStyle={{ background: 'hsl(30 8% 8%)', border: '1px solid hsl(30 6% 15%)', borderRadius: 10, fontSize: 11 }} />
                        <Bar dataKey="score" fill="hsl(36 55% 62%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="space-y-3">
                  {library.map(item => {
                    const sc = SENTIMENT_CONFIG[item.sentiment] || SENTIMENT_CONFIG.neutral;
                    return (
                      <div key={item.id} className={`p-4 rounded-2xl border ${sc.border} ${sc.bg}`}>
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium truncate">{item.topic}</span>
                              <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full border ${sc.border} ${sc.color}`}>{item.sentiment}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {item.platform} · Score: <span className="text-accent">{item.opportunity_score?.toFixed(1)}/10</span> · {new Date(item.created_date).toLocaleDateString()}
                            </div>
                            {item.benchmark_summary && (() => {
                              try {
                                const b = JSON.parse(item.benchmark_summary);
                                return <div className="text-xs text-muted-foreground mt-1">Avg engagement: {b.industry_avg_engagement || 'N/A'}</div>;
                              } catch { return null; }
                            })()}
                          </div>
                          <button onClick={() => deleteItem(item.id)}
                            className="w-7 h-7 rounded-xl border border-border/50 bg-background/40 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 flex items-center justify-center transition flex-shrink-0">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}