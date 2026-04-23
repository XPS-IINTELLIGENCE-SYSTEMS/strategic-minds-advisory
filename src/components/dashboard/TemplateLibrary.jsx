import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Layout, Loader2, Copy, Download, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TEMPLATES = [
  // MVP Templates
  { id: 1, category: 'MVP', name: 'SaaS Landing Page', icon: '🚀', description: 'Hero, features, pricing, testimonials, FAQ, CTA', tags: ['landing', 'saas', 'conversion'] },
  { id: 2, category: 'MVP', name: 'AI Tool MVP', icon: '🤖', description: 'Input → AI processing → Output with history', tags: ['ai', 'tool', 'mvp'] },
  { id: 3, category: 'MVP', name: 'Marketplace MVP', icon: '🛒', description: 'Buyer/seller flow, listings, payments, reviews', tags: ['marketplace', 'two-sided'] },
  { id: 4, category: 'MVP', name: 'B2B Dashboard MVP', icon: '📊', description: 'Analytics dashboard with team management', tags: ['dashboard', 'b2b', 'saas'] },
  { id: 5, category: 'MVP', name: 'Mobile App Landing', icon: '📱', description: 'App store style landing with screenshots', tags: ['mobile', 'app', 'landing'] },
  { id: 6, category: 'MVP', name: 'Agency Portfolio', icon: '💼', description: 'Services, case studies, team, contact form', tags: ['agency', 'portfolio'] },
  // Investor Presentations
  { id: 7, category: 'Investor', name: 'Seed Pitch Deck', icon: '🌱', description: '10-slide seed stage pitch with narrative', tags: ['pitch', 'seed', 'fundraising'] },
  { id: 8, category: 'Investor', name: 'Series A Deck', icon: '📈', description: 'Growth metrics, market leadership, team', tags: ['pitch', 'series-a'] },
  { id: 9, category: 'Investor', name: 'Executive One-Pager', icon: '📄', description: 'Single page company overview for investors', tags: ['one-pager', 'investor'] },
  { id: 10, category: 'Investor', name: 'Data Room Index', icon: '📁', description: 'Complete due diligence document structure', tags: ['due-diligence', 'data-room'] },
  // Branding
  { id: 11, category: 'Branding', name: 'Brand Identity Brief', icon: '🎨', description: 'Mission, vision, values, personality, voice', tags: ['brand', 'identity'] },
  { id: 12, category: 'Branding', name: 'Naming Framework', icon: '✍️', description: 'Name candidates with scoring matrix', tags: ['naming', 'brand'] },
  { id: 13, category: 'Branding', name: 'Social Media Kit', icon: '📸', description: 'Profile templates, post formats, guidelines', tags: ['social', 'design'] },
  // Strategy
  { id: 14, category: 'Strategy', name: '90-Day Plan', icon: '🗓️', description: 'Milestone-based 90-day execution plan', tags: ['planning', 'execution'] },
  { id: 15, category: 'Strategy', name: 'OKR Template', icon: '🎯', description: 'Company, team, and individual OKRs', tags: ['okr', 'strategy'] },
  { id: 16, category: 'Strategy', name: 'Go-to-Market Plan', icon: '🗺️', description: 'Full GTM with channels, timeline, budget', tags: ['gtm', 'marketing'] },
  { id: 17, category: 'Strategy', name: 'Competitive Matrix', icon: '⚔️', description: 'Feature and positioning comparison table', tags: ['competitive', 'analysis'] },
  // Pricing
  { id: 18, category: 'Pricing', name: 'SaaS Pricing Page', icon: '💲', description: '3-tier pricing with feature comparison', tags: ['pricing', 'saas'] },
  { id: 19, category: 'Pricing', name: 'Enterprise Proposal', icon: '🏢', description: 'Custom enterprise quote with ROI model', tags: ['enterprise', 'proposal'] },
  { id: 20, category: 'Pricing', name: 'Productized Service', icon: '📦', description: 'Fixed-scope service packages with deliverables', tags: ['service', 'productized'] },
];

const TEMPLATE_CATEGORIES = ['All', 'MVP', 'Investor', 'Branding', 'Strategy', 'Pricing'];

export default function TemplateLibrary() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selected, setSelected] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState(null);
  const [customInput, setCustomInput] = useState('');

  const filtered = activeCategory === 'All' ? TEMPLATES : TEMPLATES.filter(t => t.category === activeCategory);

  const generate = async () => {
    if (!selected) return;
    setGenerating(true);
    setOutput(null);

    const res = await base44.functions.invoke('groqChat', {
      messages: [{
        role: 'user',
        content: `Generate a complete, production-ready ${selected.name} template for: ${customInput || 'a B2B SaaS startup in the AI space'}.
        
Template type: ${selected.description}
Include all sections, specific content, and make it immediately usable. Be comprehensive and detailed.
Format with clear headers and structure.`,
      }],
      systemPrompt: 'You are an expert business template designer. Generate complete, specific, actionable templates that can be used immediately. Include all sections with real example content.',
    });

    setOutput(res.data.content);
    setGenerating(false);
  };

  const copy = () => {
    if (output) navigator.clipboard.writeText(output);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div>
          <h2 className="font-display text-2xl text-gradient-ivory">Template Library</h2>
          <p className="text-sm text-muted-foreground mt-1">20 AI-powered templates for rapid MVP and business development</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {TEMPLATE_CATEGORIES.map(c => (
            <button key={c} onClick={() => setActiveCategory(c)}
              className={`px-4 py-2 rounded-full text-xs border transition-all ${
                activeCategory === c ? 'btn-ivory border-transparent' : 'border-border bg-secondary/40 text-muted-foreground hover:text-foreground'
              }`}>{c}</button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Template grid */}
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(t => (
              <button
                key={t.id}
                onClick={() => { setSelected(t); setOutput(null); }}
                className={`text-left p-4 rounded-2xl border transition-all group ${
                  selected?.id === t.id ? 'border-accent bg-accent/10' : 'border-border bg-card/50 hover:bg-card/80'
                }`}
              >
                <div className="text-2xl mb-2">{t.icon}</div>
                <div className="text-xs font-medium">{t.name}</div>
                <div className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{t.description}</div>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {t.tags.slice(0,2).map(tag => (
                    <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full border border-border text-muted-foreground">{tag}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>

          {/* Detail + generate */}
          <div className="flex flex-col gap-4">
            {selected ? (
              <>
                <div className="p-5 rounded-2xl border border-accent/30 bg-accent/5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{selected.icon}</span>
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-accent">{selected.category}</div>
                      <h3 className="font-display text-xl mt-0.5">{selected.name}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{selected.description}</p>
                  <div className="mt-4">
                    <label className="text-xs text-muted-foreground mb-2 block">Customize for your business (optional):</label>
                    <input
                      value={customInput}
                      onChange={e => setCustomInput(e.target.value)}
                      placeholder="e.g. HR tech startup for enterprise, Series A stage, $2M ARR"
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition"
                    />
                  </div>
                  <button
                    onClick={generate}
                    disabled={generating}
                    className="btn-ivory rounded-xl w-full mt-4 py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : <><Sparkles className="w-4 h-4" /> Generate Template</>}
                  </button>
                </div>

                <AnimatePresence>
                  {output && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Generated Template</div>
                        <button onClick={copy} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition">
                          <Copy className="w-3.5 h-3.5" /> Copy All
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto max-h-96 p-4 rounded-2xl border border-border bg-card/50 text-sm leading-relaxed text-foreground/90 prose prose-sm prose-invert max-w-none whitespace-pre-wrap">
                        {output}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8 border border-border rounded-2xl bg-card/30">
                <div>
                  <Layout className="w-10 h-10 mx-auto mb-3 text-accent/40" />
                  <h3 className="font-display text-xl text-gradient-ivory mb-2">Select a Template</h3>
                  <p className="text-sm text-muted-foreground">Choose any template to generate AI-powered content instantly.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}