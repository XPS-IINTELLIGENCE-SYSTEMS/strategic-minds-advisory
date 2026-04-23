import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  PenTool, Loader2, Copy, Trash2, CheckCircle2, RefreshCw,
  FileText, Linkedin, Mail, BookOpen, Save, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const CONTENT_TYPES = [
  { id: 'blog_post', label: 'Blog Post', icon: BookOpen, color: 'text-blue-400', desc: '800–2500 words, SEO-optimized' },
  { id: 'linkedin', label: 'LinkedIn Post', icon: Linkedin, color: 'text-sky-400', desc: '150–300 words, high engagement' },
  { id: 'newsletter', label: 'Newsletter', icon: Mail, color: 'text-purple-400', desc: 'Full edition with sections' },
  { id: 'email_draft', label: 'Email Draft', icon: FileText, color: 'text-amber-400', desc: 'Outreach or follow-up' },
];

const STRATEGY_TOPICS = [
  'The Future of AI in Enterprise: What Leaders Need to Know',
  'Building Competitive Moats in the Age of Generative AI',
  '5 Simulation Frameworks That Predict Market Success',
  'Why Most Digital Transformations Fail (And How to Avoid It)',
  'From Data to Decisions: AI Strategy for the C-Suite',
  'The Predictive Enterprise: Using AI to See 18 Months Ahead',
  'Go-to-Market in 2026: AI-Native Approaches That Actually Work',
  'How to Build an AI Automation Stack Without Technical Debt',
];

const LENGTH_OPTIONS = [
  { id: 'short', label: 'Short', desc: '400–600w' },
  { id: 'medium', label: 'Medium', desc: '800–1200w' },
  { id: 'long', label: 'Long', desc: '1500–2500w' },
];

const TONE_OPTIONS = ['Authoritative', 'Conversational', 'Provocative', 'Educational', 'Executive'];

export default function ContentEngine() {
  const [contentType, setContentType] = useState('blog_post');
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [tone, setTone] = useState('Authoritative');
  const [length, setLength] = useState('medium');
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [library, setLibrary] = useState([]);
  const [loadingLibrary, setLoadingLibrary] = useState(true);
  const [view, setView] = useState('create'); // 'create' | 'library'
  const [selectedItem, setSelectedItem] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => { fetchLibrary(); }, []);

  const fetchLibrary = async () => {
    setLoadingLibrary(true);
    const items = await base44.entities.ContentItem.list('-created_date', 50);
    setLibrary(items);
    setLoadingLibrary(false);
  };

  const generate = async () => {
    if (!topic) return;
    setGenerating(true);
    setPreview(null);
    setSaved(false);

    const res = await base44.functions.invoke('generateContent', { contentType, topic, context, tone, length });
    if (res.data?.body) {
      setPreview({ body: res.data.body, wordCount: res.data.wordCount });
    }
    setGenerating(false);
  };

  const saveToLibrary = async () => {
    if (!preview) return;
    setSaving(true);
    await base44.entities.ContentItem.create({
      title: topic,
      content_type: contentType,
      topic,
      body: preview.body,
      status: 'draft',
      word_count: preview.wordCount,
      tags: tone,
    });
    await fetchLibrary();
    setSaved(true);
    setSaving(false);
  };

  const deleteItem = async (id) => {
    await base44.entities.ContentItem.delete(id);
    setLibrary(prev => prev.filter(i => i.id !== id));
    if (selectedItem?.id === id) setSelectedItem(null);
  };

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const typeIcon = (type) => CONTENT_TYPES.find(t => t.id === type)?.icon || FileText;

  return (
    <div className="h-full overflow-hidden flex flex-col">
      {/* Top tabs */}
      <div className="flex items-center gap-2 px-6 pt-4 flex-shrink-0">
        {['create', 'library'].map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`px-4 py-2 rounded-full text-sm border transition-all capitalize ${
              view === v ? 'btn-ivory border-transparent' : 'border-border bg-secondary/30 text-muted-foreground hover:text-foreground'
            }`}>
            {v === 'library' ? `Library (${library.length})` : 'Create Content'}
          </button>
        ))}
      </div>

      {/* CREATE VIEW */}
      {view === 'create' && (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-6 space-y-6">
            {/* Content Type */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {CONTENT_TYPES.map(ct => {
                const Icon = ct.icon;
                return (
                  <button key={ct.id} onClick={() => setContentType(ct.id)}
                    className={`text-left p-4 rounded-2xl border transition-all ${
                      contentType === ct.id ? 'border-accent bg-accent/10' : 'border-border bg-card/50 hover:bg-card/80'
                    }`}>
                    <Icon className={`w-5 h-5 ${ct.color} mb-2`} />
                    <div className="text-sm font-medium">{ct.label}</div>
                    <div className="text-[10px] text-muted-foreground mt-1">{ct.desc}</div>
                  </button>
                );
              })}
            </div>

            {/* Config */}
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Topic / Headline *</label>
                  <input value={topic} onChange={e => setTopic(e.target.value)}
                    placeholder="What should this content be about?"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Quick Topic Ideas</label>
                  <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {STRATEGY_TOPICS.map(t => (
                      <button key={t} onClick={() => setTopic(t)}
                        className="text-left text-xs px-3 py-2 rounded-lg border border-border bg-secondary/30 hover:bg-secondary transition text-foreground/70">
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Additional Context</label>
                  <textarea value={context} onChange={e => setContext(e.target.value)} rows={3}
                    placeholder="Audience, specific angle, company details, data points to include..."
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition resize-none" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Tone</label>
                  <div className="flex flex-wrap gap-2">
                    {TONE_OPTIONS.map(t => (
                      <button key={t} onClick={() => setTone(t)}
                        className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                          tone === t ? 'border-accent text-accent bg-accent/10' : 'border-border text-muted-foreground hover:text-foreground'
                        }`}>{t}</button>
                    ))}
                  </div>
                </div>
                {contentType !== 'linkedin' && contentType !== 'email_draft' && (
                  <div>
                    <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Length</label>
                    <div className="flex gap-2">
                      {LENGTH_OPTIONS.map(l => (
                        <button key={l.id} onClick={() => setLength(l.id)}
                          className={`flex-1 py-2 rounded-xl text-xs border transition-all ${
                            length === l.id ? 'border-accent text-accent bg-accent/10' : 'border-border text-muted-foreground hover:text-foreground'
                          }`}>
                          <div>{l.label}</div>
                          <div className="text-[10px] text-muted-foreground">{l.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button onClick={generate} disabled={generating || !topic}
              className="btn-ivory rounded-full w-full py-3.5 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60">
              {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating {CONTENT_TYPES.find(c => c.id === contentType)?.label}…</> : <><PenTool className="w-4 h-4" /> Generate Content</>}
            </button>

            <AnimatePresence>
              {preview && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Generated</div>
                      <span className="text-xs text-muted-foreground border border-border rounded-full px-2.5 py-1">{preview.wordCount} words</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => copy(preview.body)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border border-border bg-secondary/40 hover:bg-secondary transition">
                        {copied ? <><CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                      </button>
                      <button onClick={saveToLibrary} disabled={saving || saved}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl btn-ivory disabled:opacity-60">
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Save className="w-3.5 h-3.5" />}
                        {saved ? 'Saved!' : 'Save to Library'}
                      </button>
                    </div>
                  </div>
                  <div className="p-5 rounded-2xl border border-border bg-card/50 max-h-[50vh] overflow-y-auto">
                    <ReactMarkdown className="prose prose-sm prose-invert max-w-none text-sm [&>h1]:text-lg [&>h2]:text-base [&>h3]:text-sm [&>p]:text-foreground/85 [&>ul]:text-foreground/80 [&>ol]:text-foreground/80">
                      {preview.body}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* LIBRARY VIEW */}
      {view === 'library' && (
        <div className="flex-1 overflow-hidden flex">
          {/* List */}
          <div className="w-72 flex-shrink-0 border-r border-border overflow-y-auto">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{library.length} items</span>
              <button onClick={fetchLibrary} className="text-muted-foreground hover:text-foreground transition">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            {loadingLibrary ? (
              <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-accent" /></div>
            ) : library.length === 0 ? (
              <div className="text-center py-10 text-sm text-muted-foreground px-4">No content saved yet. Generate content and save it.</div>
            ) : (
              library.map(item => {
                const Icon = typeIcon(item.content_type);
                return (
                  <button key={item.id} onClick={() => setSelectedItem(item)}
                    className={`w-full text-left p-4 border-b border-border/50 transition-all hover:bg-secondary/40 ${selectedItem?.id === item.id ? 'bg-secondary/60 border-l-2 border-l-accent' : ''}`}>
                    <div className="flex items-start gap-2.5">
                      <Icon className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="text-xs font-medium line-clamp-2">{item.title}</div>
                        <div className="text-[10px] text-muted-foreground mt-1 capitalize">{item.content_type?.replace('_', ' ')} · {item.word_count || '?'} words</div>
                        <div className="text-[10px] text-muted-foreground">{new Date(item.created_date).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Detail */}
          <div className="flex-1 flex flex-col min-w-0">
            {selectedItem ? (
              <>
                <div className="p-5 border-b border-border flex items-center justify-between flex-shrink-0">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-accent mb-1 capitalize">{selectedItem.content_type?.replace('_', ' ')}</div>
                    <h3 className="font-display text-lg">{selectedItem.title}</h3>
                    <div className="text-xs text-muted-foreground mt-1">{selectedItem.word_count} words · {new Date(selectedItem.created_date).toLocaleDateString()}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => copy(selectedItem.body)}
                      className="w-8 h-8 rounded-xl border border-border bg-secondary/40 hover:bg-secondary flex items-center justify-center transition">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteItem(selectedItem.id)}
                      className="w-8 h-8 rounded-xl border border-border bg-secondary/40 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 flex items-center justify-center transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-5">
                  <ReactMarkdown className="prose prose-sm prose-invert max-w-none text-sm [&>h1]:text-lg [&>h2]:text-base [&>p]:text-foreground/85 [&>ul]:text-foreground/80">
                    {selectedItem.body}
                  </ReactMarkdown>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <PenTool className="w-10 h-10 mx-auto mb-3 text-accent/30" />
                  <h3 className="font-display text-xl text-gradient-ivory mb-2">Content Library</h3>
                  <p className="text-sm text-muted-foreground">Select a piece to read and manage it.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}