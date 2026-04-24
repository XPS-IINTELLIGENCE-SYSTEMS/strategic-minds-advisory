import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, Loader2, Bot, User, Trash2, Sparkles, Code2, FileText, CheckCircle2, AlertCircle, Settings, Bug } from 'lucide-react';
import TypingMessage from './TypingMessage';
import MessageSuggestions from './MessageSuggestions';
import DebuggerMode from './DebuggerMode';
import { motion, AnimatePresence } from 'framer-motion';

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

const CODE_STARTERS = [
  'Create a new React component for user profile',
  'Build a backend function to sync Google Calendar',
  'Generate an entity schema for a product catalog',
  'Create a simulation engine for financial projections',
  'Build a webhook handler for Stripe payments',
];

export default function EnhancedChatPanel({ seed, onSeedConsumed, embedded }) {
  const [mode, setMode] = useState('strategy'); // 'strategy' or 'code'
  const [subMode, setSubMode] = useState('chat'); // 'chat' or 'debugger'
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [completedMessageIndex, setCompletedMessageIndex] = useState(null);
  const [codeOperations, setCodeOperations] = useState([]);
  const [projectConfig, setProjectConfig] = useState(null);
  const [showConfig, setShowConfig] = useState(false);
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
  }, [messages, loading, codeOperations]);

  const handleStrategyChat = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;
    setInput('');
    setLoading(true);

    const userMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(userMessages);

    const res = await base44.functions.invoke('groqChat', {
      messages: userMessages.map(m => ({ role: m.role, content: m.content })),
      systemPrompt: SYSTEM_PROMPT,
    });

    const allMessages = [...userMessages, { role: 'assistant', content: res.data.content }];
    setMessages(allMessages);
    setCompletedMessageIndex(allMessages.length - 1);
    setLoading(false);
  };

  const handleCodeGeneration = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || !projectConfig) {
      alert('Please configure Vercel project first');
      setShowConfig(true);
      return;
    }
    
    setInput('');
    setLoading(true);

    // Add user message to chat
    const userMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(userMessages);

    try {
      // Call the natural language code agent
      const res = await base44.functions.invoke('naturalLanguageCodeAgent', {
        prompt: userMsg,
        projectName: projectConfig.projectName,
        vercelProjectId: projectConfig.vercelProjectId,
      });

      // Track code operations
      setCodeOperations(prev => [...prev, ...res.data.operations]);

      // Add agent response to chat
      const assistantMsg = {
        role: 'assistant',
        content: `I've generated the following operations:\n\n${res.data.reasoning}\n\n${
          res.data.deployment_url 
            ? `✅ Deployed to: ${res.data.deployment_url}` 
            : 'Operations completed. Review in the Code Operations panel.'
        }`,
      };

      const allMessages = [...userMessages, assistantMsg];
      setMessages(allMessages);
      setCompletedMessageIndex(allMessages.length - 1);
    } catch (error) {
      const errorMsg = {
        role: 'assistant',
        content: `Error: ${error.message}`,
      };
      setMessages([...userMessages, errorMsg]);
    }

    setLoading(false);
  };

  const send = mode === 'strategy' ? handleStrategyChat : handleCodeGeneration;

  const handleSuggestionClick = (suggestion) => {
    send(`${suggestion}`);
  };

  const clear = () => {
    setMessages([]);
    setCodeOperations([]);
  };

  return (
    <div className={`flex flex-col h-full bg-background ${embedded ? '' : ''}`}>
      {/* Header with mode toggle */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-accent" />
          </div>
          <div>
            <div className="text-sm font-medium">
              {mode === 'strategy' ? 'Strategic AI' : 'Code Agent'}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {mode === 'strategy' ? 'Groq · llama-3.3-70b' : 'Natural Language Coding'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`p-1.5 rounded-lg transition ${showConfig ? 'bg-accent/15 text-accent' : 'hover:bg-secondary'}`}
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
          {mode === 'code' && (
            <button
              onClick={() => setSubMode(subMode === 'chat' ? 'debugger' : 'chat')}
              className={`p-1.5 rounded-lg transition ${subMode === 'debugger' ? 'bg-accent/15 text-accent' : 'hover:bg-secondary'}`}
              title="Toggle Debugger Mode"
            >
              <Bug className="w-3.5 h-3.5" />
            </button>
          )}
          {mode === 'code' && subMode === 'chat' && (
            <button
              onClick={() => setMode('strategy')}
              className="text-xs px-2.5 py-1 rounded-lg border border-border hover:bg-secondary transition"
            >
              Strategy Mode
            </button>
          )}
          {mode === 'strategy' && (
            <button
              onClick={() => setMode('code')}
              className="text-xs px-2.5 py-1 rounded-lg border border-accent/30 bg-accent/10 text-accent"
            >
              Code Mode
            </button>
          )}
          {messages.length > 0 && (
            <button onClick={clear} className="text-muted-foreground hover:text-foreground transition p-1">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Config Panel */}
      <AnimatePresence>
        {showConfig && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-3 border-b border-border bg-secondary/20 space-y-3"
          >
            <div className="text-xs font-medium">Project Configuration</div>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Vercel Project ID"
                value={projectConfig?.vercelProjectId || ''}
                onChange={e => setProjectConfig(p => ({ ...p, vercelProjectId: e.target.value }))}
                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-accent"
              />
              <input
                type="text"
                placeholder="Project Name"
                value={projectConfig?.projectName || ''}
                onChange={e => setProjectConfig(p => ({ ...p, projectName: e.target.value }))}
                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-accent"
              />
              <input
                type="text"
                placeholder="GitHub Repo (owner/repo)"
                value={projectConfig?.githubRepo || ''}
                onChange={e => setProjectConfig(p => ({ ...p, githubRepo: e.target.value }))}
                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-accent"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Debugger Mode */}
      {mode === 'code' && subMode === 'debugger' && (
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <DebuggerMode onApplyFix={() => setSubMode('chat')} />
        </div>
      )}

      {/* Messages */}
      {subMode === 'chat' && (
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-3">
                {mode === 'strategy' ? (
                  <Sparkles className="w-5 h-5 text-accent" />
                ) : (
                  <Code2 className="w-5 h-5 text-accent" />
                )}
              </div>
              <p className="text-sm font-medium">
                {mode === 'strategy' ? 'Strategic AI Assistant' : 'Code Generation Agent'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {mode === 'strategy'
                  ? 'Ask anything about strategy, markets, or AI systems'
                  : 'Describe features you want to build'}
              </p>
            </div>
            <div className="space-y-2">
              {(mode === 'strategy' ? STARTERS : CODE_STARTERS).map(s => (
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

        {messages.map((m, i) => {
          const isLastMessage = i === messages.length - 1 && !loading;
          const isTyping = completedMessageIndex !== i && m.role === 'assistant';

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
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
                  <div>
                    <TypingMessage content={m.content} isComplete={!isTyping} />
                    {isLastMessage && !isTyping && (
                      <MessageSuggestions onSelect={handleSuggestionClick} />
                    )}
                  </div>
                ) : (
                  <p>{m.content}</p>
                )}
              </div>
              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-secondary border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          );
        })}

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

        {/* Code Operations Log */}
        {codeOperations.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Generated Operations</div>
            {codeOperations.map((op, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
                  op.status === 'completed'
                    ? 'border-green-500/30 bg-green-500/5 text-green-400'
                    : op.status === 'failed'
                    ? 'border-red-500/30 bg-red-500/5 text-red-400'
                    : 'border-border bg-secondary/40'
                }`}
              >
                {op.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />}
                {op.status === 'failed' && <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />}
                {op.status === 'pending' && <Loader2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 animate-spin" />}
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{op.type}: {op.target}</div>
                  {op.error && <div className="text-[10px] mt-0.5 opacity-80">{op.error}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>
      )}

      {/* Input */}
      {subMode === 'chat' && (
      <div className="p-3 border-t border-border flex-shrink-0">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
            }}
            placeholder={mode === 'strategy' 
              ? 'Ask your strategic advisor...' 
              : 'Describe code you want to build...'}
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
      )}
    </div>
  );
}