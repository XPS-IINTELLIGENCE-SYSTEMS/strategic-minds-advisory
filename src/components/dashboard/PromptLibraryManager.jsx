import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Plus, Copy, Trash2, Pin, Share2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MobileSelect from '@/components/common/MobileSelect';

const CATEGORIES = ['scraping', 'analysis', 'simulation', 'strategy', 'content', 'research'];

export default function PromptLibraryManager() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copied, setCopied] = useState(null);
  const [newPrompt, setNewPrompt] = useState({
    title: '',
    category: 'analysis',
    content: '',
    use_cases: '',
    system_prompt: '',
  });

  useEffect(() => {
    base44.entities.PromptLibrary.list('-created_date', 50).then(setPrompts);
  }, []);

  const createPrompt = async () => {
    if (!newPrompt.title || !newPrompt.content) return;

    setLoading(true);
    const created = await base44.entities.PromptLibrary.create({
      ...newPrompt,
      workspace_id: 'current',
      creator_email: 'user@example.com', // Replace with actual user
    });

    setPrompts(p => [created, ...p]);
    setNewPrompt({ title: '', category: 'analysis', content: '', use_cases: '', system_prompt: '' });
    setShowCreate(false);
    setLoading(false);
  };

  const copyPrompt = (content) => {
    navigator.clipboard.writeText(content);
    setCopied(content.substring(0, 30));
    setTimeout(() => setCopied(null), 2000);
  };

  const deletePrompt = async (id) => {
    setPrompts(p => p.filter(pr => pr.id !== id));
    await base44.entities.PromptLibrary.delete(id);
  };

  const togglePin = async (prompt) => {
    await base44.entities.PromptLibrary.update(prompt.id, {
      is_pinned: !prompt.is_pinned,
    });
    setPrompts(p => p.map(pr => pr.id === prompt.id ? { ...pr, is_pinned: !pr.is_pinned } : pr));
  };

  const filteredPrompts = selectedCategory === 'all' 
    ? prompts 
    : prompts.filter(p => p.category === selectedCategory);

  const pinnedPrompts = filteredPrompts.filter(p => p.is_pinned);
  const regularPrompts = filteredPrompts.filter(p => !p.is_pinned);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl text-gradient-ivory">Prompt Library</h2>
            <p className="text-sm text-muted-foreground mt-1">Reusable prompts for AI operations</p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="btn-ivory rounded-xl px-4 py-2.5 text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Prompt
          </button>
        </div>

        {/* Create form */}
        <AnimatePresence>
          {showCreate && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="p-5 rounded-2xl border border-accent/30 bg-accent/5 space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Prompt Title</label>
                <input
                  value={newPrompt.title}
                  onChange={e => setNewPrompt(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g., Competitive Analysis Brief"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Category</label>
                  <MobileSelect
                    value={newPrompt.category}
                    onChange={v => setNewPrompt(p => ({ ...p, category: v }))}
                    options={CATEGORIES.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))}
                    placeholder="Select category"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Use Cases (comma-separated)</label>
                  <input
                    value={newPrompt.use_cases}
                    onChange={e => setNewPrompt(p => ({ ...p, use_cases: e.target.value }))}
                    placeholder="e.g., competitive analysis, market research"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-2 block">System Prompt (optional)</label>
                <textarea
                  value={newPrompt.system_prompt}
                  onChange={e => setNewPrompt(p => ({ ...p, system_prompt: e.target.value }))}
                  placeholder="You are a strategic analyst..."
                  rows={2}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition resize-none"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Prompt Content *</label>
                <textarea
                  value={newPrompt.content}
                  onChange={e => setNewPrompt(p => ({ ...p, content: e.target.value }))}
                  placeholder="Write your prompt here..."
                  rows={5}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={createPrompt}
                  disabled={!newPrompt.title || !newPrompt.content || loading}
                  className="btn-ivory rounded-xl px-5 py-2.5 text-sm disabled:opacity-60"
                >
                  {loading ? 'Creating...' : 'Create Prompt'}
                </button>
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-5 py-2.5 text-sm border border-border rounded-xl hover:bg-secondary transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all border ${
              selectedCategory === 'all'
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-border bg-secondary/40 hover:bg-secondary text-muted-foreground'
            }`}
          >
            All ({prompts.length})
          </button>
          {CATEGORIES.map(cat => {
            const count = prompts.filter(p => p.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all border ${
                  selectedCategory === cat
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border bg-secondary/40 hover:bg-secondary text-muted-foreground'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)} ({count})
              </button>
            );
          })}
        </div>

        {/* Pinned prompts */}
        {pinnedPrompts.length > 0 && (
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Pin className="w-3 h-3" /> Pinned
            </div>
            {pinnedPrompts.map(prompt => (
              <PromptCard key={prompt.id} prompt={prompt} onCopy={copyPrompt} copied={copied}
                onPin={togglePin} onDelete={deletePrompt} />
            ))}
          </div>
        )}

        {/* Regular prompts */}
        {regularPrompts.length > 0 && (
          <div className="space-y-3">
            {pinnedPrompts.length > 0 && (
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">All Prompts</div>
            )}
            {regularPrompts.map(prompt => (
              <PromptCard key={prompt.id} prompt={prompt} onCopy={copyPrompt} copied={copied}
                onPin={togglePin} onDelete={deletePrompt} />
            ))}
          </div>
        )}

        {filteredPrompts.length === 0 && !showCreate && (
          <div className="text-center py-10 text-muted-foreground text-sm">No prompts in this category</div>
        )}
      </div>
    </div>
  );
}

function PromptCard({ prompt, onCopy, copied, onPin, onDelete }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl border border-border bg-card/50">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium">{prompt.title}</h3>
            <span className="text-[10px] uppercase px-2 py-1 rounded-full bg-accent/10 text-accent">
              {prompt.category}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">{prompt.use_cases}</div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => onCopy(prompt.content)} className="p-1.5 rounded-lg hover:bg-secondary transition">
            {copied === prompt.content.substring(0, 30) ? (
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          <button onClick={() => onPin(prompt)} className="p-1.5 rounded-lg hover:bg-secondary transition">
            <Pin className={`w-4 h-4 ${prompt.is_pinned ? 'text-accent' : 'text-muted-foreground'}`} />
          </button>
          <button onClick={() => onDelete(prompt.id)} className="p-1.5 rounded-lg hover:bg-secondary transition text-muted-foreground hover:text-red-400">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="text-xs text-foreground/70 leading-relaxed line-clamp-2">{prompt.content}</div>
    </motion.div>
  );
}