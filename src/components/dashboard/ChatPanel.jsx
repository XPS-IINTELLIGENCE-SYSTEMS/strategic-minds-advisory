import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, Loader2, Bot, User, Trash2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ChatAutoSuggestions from './ChatAutoSuggestions';

const SYSTEM_PROMPT = `You are an elite AI consultant and strategist at Strategic Minds Advisory. 
You have deep expertise in: market analysis, business strategy, AI systems, simulation & prediction modeling, 
growth strategy, product development, go-to-market strategy, fundraising, and organizational design.
Be direct, insightful, and strategic. Use frameworks when helpful. Be concise but comprehensive.
Format responses clearly with headers and bullet points when appropriate.`;

const STARTERS = [
  'Analyze my market opportunity',
  'Help me build a go-to-market strategy',
  'Run a competitive analysis',
  'Design an AI system architecture',
  'Create a financial model',
];

export default function ChatPanel({ seed, onSeedConsumed, embedded }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (seed && seed.prompt) {
      setInput(seed.prompt);
      onSeedConsumed?.();
      inputRef.current?.focus();
    }
  }, [seed]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;
    setInput('');
    setLoading(true);

    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);

    const res = await base44.functions.invoke('groqChat', {
      messages: newMessages.map(m => ({ role: m.role, content: m.content })),
      systemPrompt: SYSTEM_PROMPT,
    });

    setMessages(prev => [...prev, { role: 'assistant', content: res.data.content }]);
    setLoading(false);
  };

  const clear = () => setMessages([]);

  return (
    <div className={`flex flex-col h-full bg-background ${embedded ? '' : ''}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-accent" />
          </div>
          <div>
            <div className="text-sm font-medium">Strategic AI</div>
            <div className="text-[10px] text-muted-foreground">Groq · llama-3.3-70b</div>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={clear} className="text-muted-foreground hover:text-foreground transition p-1">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-5 h-5 text-accent" />
              </div>
              <p className="text-sm font-medium">Strategic AI Assistant</p>
              <p className="text-xs text-muted-foreground mt-1">Ask anything about strategy, markets, or AI systems</p>
            </div>
            <div className="space-y-2">
              {STARTERS.map(s => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="w-full text-left text-xs px-3 py-2.5 rounded-xl border border-border bg-secondary/30 hover:bg-secondary transition text-foreground/80"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-accent" />
              </div>
            )}
            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-accent/15 text-foreground border border-accent/20'
                : 'bg-secondary/60 text-foreground border border-border'
            }`}>
              {m.role === 'assistant' ? (
                <ReactMarkdown
                  className="prose prose-sm prose-invert max-w-none text-sm [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:text-sm [&_ul]:text-sm [&_ol]:text-sm [&_li]:text-sm [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm"
                >
                  {m.content}
                </ReactMarkdown>
              ) : (
                <p>{m.content}</p>
              )}
            </div>
            {m.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-secondary border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-accent" />
            </div>
            <div className="bg-secondary/60 border border-border rounded-2xl px-3.5 py-3">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Auto Suggestions */}
      {messages.length === 0 && <ChatAutoSuggestions onSelectSuggestion={send} />}

      {/* Input */}
      <div className="p-3 border-t border-border flex-shrink-0">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
            }}
            placeholder="Ask your strategic advisor..."
            rows={2}
            className="flex-1 bg-secondary/40 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-accent transition resize-none"
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="btn-ivory rounded-xl px-3 flex items-center justify-center disabled:opacity-40 transition"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}