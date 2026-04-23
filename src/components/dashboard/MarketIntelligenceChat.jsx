import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, Loader2, Brain, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const SAMPLE_QUERIES = [
  'What are the latest funding trends in AI?',
  'Analyze competitive threats to our SaaS model',
  'What market shifts could impact our business?',
  'Risk assessment for our current strategy',
  'Who are emerging competitors in fintech?',
];

export default function MarketIntelligenceChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendQuery = async (query) => {
    const userQuery = query || input.trim();
    if (!userQuery) return;

    setInput('');
    setLoading(true);

    const newMessages = [...messages, { role: 'user', content: userQuery }];
    setMessages(newMessages);

    try {
      const response = await base44.functions.invoke('marketIntelligenceAssistant', {
        query: userQuery,
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.response,
        sources: response.data.sourceCount,
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${error.message}`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center">
            <Brain className="w-4 h-4 text-accent" />
          </div>
          <div>
            <div className="text-sm font-medium">Market Intelligence AI</div>
            <div className="text-[10px] text-muted-foreground">Natural language queries on intelligence library</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-3">
                <Brain className="w-5 h-5 text-accent" />
              </div>
              <p className="text-sm font-medium">Market Intelligence Assistant</p>
              <p className="text-xs text-muted-foreground mt-1">Ask questions about markets, competitors, and risks</p>
            </div>

            <div className="space-y-2">
              {SAMPLE_QUERIES.map(q => (
                <button
                  key={q}
                  onClick={() => sendQuery(q)}
                  className="w-full text-left text-xs px-3 py-2.5 rounded-xl border border-border bg-secondary/30 hover:bg-secondary transition text-foreground/80"
                >
                  💡 {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-6 h-6 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Brain className="w-3.5 h-3.5 text-accent" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-accent/15 text-foreground border border-accent/20'
                : 'bg-secondary/60 text-foreground border border-border'
            }`}>
              {m.role === 'assistant' ? (
                <>
                  <ReactMarkdown
                    className="prose prose-sm prose-invert max-w-none text-sm [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:text-sm [&_ul]:text-sm [&_li]:text-sm"
                  >
                    {m.content}
                  </ReactMarkdown>
                  {m.sources && (
                    <p className="text-[10px] text-muted-foreground mt-2 pt-2 border-t border-border">
                      Sources: {m.sources.intelligenceItems} intelligence signals, {m.sources.savedModels} models
                    </p>
                  )}
                </>
              ) : (
                <p>{m.content}</p>
              )}
            </div>
            {m.role === 'user' && (
              <div className="w-6 h-6 rounded-lg bg-secondary border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0">
              <Brain className="w-3.5 h-3.5 text-accent" />
            </div>
            <div className="bg-secondary/60 border border-border rounded-2xl px-4 py-3">
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

      {/* Input */}
      <div className="p-4 border-t border-border flex-shrink-0">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendQuery(); }
            }}
            placeholder="Ask about markets, competitors, risks..."
            rows={2}
            className="flex-1 bg-secondary/40 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-accent transition resize-none"
          />
          <button
            onClick={() => sendQuery()}
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