import React, { useState, useMemo } from 'react';
import { BookOpen, Search, Copy, Send, Star, ChevronRight } from 'lucide-react';
import { PROMPT_LIBRARY, PROMPT_CATEGORIES } from '@/lib/promptLibrary';
import { motion, AnimatePresence } from 'framer-motion';

export default function PromptLibraryPanel({ onSelectPrompt }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selected, setSelected] = useState(null);
  const [copied, setCopied] = useState(null);

  const filtered = useMemo(() => {
    return PROMPT_LIBRARY.filter(p => {
      const matchCat = activeCategory === 'All' || p.category === activeCategory;
      const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [search, activeCategory]);

  const copy = (prompt) => {
    navigator.clipboard.writeText(prompt.prompt);
    setCopied(prompt.id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-48 flex-shrink-0 border-r border-border flex flex-col bg-card/30">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 text-sm font-medium">
            <BookOpen className="w-4 h-4 text-accent" />
            <span>100 Prompts</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {['All', ...PROMPT_CATEGORIES].map(cat => {
            const count = cat === 'All' ? PROMPT_LIBRARY.length : PROMPT_LIBRARY.filter(p => p.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between transition-all ${
                  activeCategory === cat ? 'text-accent bg-accent/10' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                }`}
              >
                <span className="truncate">{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeCategory === cat ? 'bg-accent/20 text-accent' : 'bg-secondary text-muted-foreground'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div className="w-72 flex-shrink-0 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search prompts..."
              className="w-full bg-secondary/40 border border-border rounded-xl pl-8 pr-3 py-2 text-xs outline-none focus:border-accent transition"
            />
          </div>
          <div className="text-[10px] text-muted-foreground mt-2">{filtered.length} prompts</div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map(p => (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              className={`w-full text-left px-4 py-3.5 border-b border-border/50 transition-all hover:bg-secondary/40 ${
                selected?.id === p.id ? 'bg-secondary/60 border-l-2 border-l-accent' : ''
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span className="text-lg flex-shrink-0 mt-0.5">{p.icon}</span>
                <div className="min-w-0">
                  <div className="text-xs font-medium truncate">{p.title}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{p.description}</div>
                  <div className="text-[10px] text-accent mt-1.5 uppercase tracking-wider">{p.category}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail */}
      <div className="flex-1 flex flex-col min-w-0">
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div key={selected.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col h-full">
              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{selected.icon}</span>
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-accent">{selected.category} · #{selected.id}</div>
                    <h3 className="font-display text-xl mt-1">{selected.title}</h3>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{selected.description}</p>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Prompt Template</div>
                <div className="p-4 rounded-xl border border-border bg-secondary/30 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap font-mono text-xs">
                  {selected.prompt}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Replace <code className="text-accent">[BRACKETED]</code> values with your specific details before sending.
                </p>
              </div>

              <div className="p-4 border-t border-border flex gap-3">
                <button
                  onClick={() => copy(selected)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border bg-secondary/40 hover:bg-secondary text-sm transition"
                >
                  {copied === selected.id ? <><Star className="w-4 h-4 text-accent" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Prompt</>}
                </button>
                {onSelectPrompt && (
                  <button
                    onClick={() => onSelectPrompt(selected)}
                    className="flex-1 btn-ivory rounded-xl flex items-center justify-center gap-2 py-2.5 text-sm"
                  >
                    <Send className="w-4 h-4" /> Send to Chat
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <div className="text-4xl mb-4">📚</div>
                <h3 className="font-display text-xl text-gradient-ivory mb-2">100 Expert Prompts</h3>
                <p className="text-sm text-muted-foreground max-w-xs">Select a prompt to preview and send to the AI chat, or copy it for use anywhere.</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}