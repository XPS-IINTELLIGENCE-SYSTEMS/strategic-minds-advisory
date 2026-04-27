import React, { useEffect, useRef, useState } from 'react';
import { Bot, Bug, CheckCircle2, Code2, Globe2, Loader2, Send, Settings, Sparkles, Trash2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TypingMessage from './TypingMessage';
import MessageSuggestions from './MessageSuggestions';
import DebuggerMode from './DebuggerMode';

const STARTERS = [
  'Check AI In Action system status',
  'Validate the dashboard and tell me what is missing',
  'Create the next highest ROI queue task',
  'Draft a Million-Dollar Challenge content post',
  'Create a browser validation task for this page',
];

const BUILD_STARTERS = [
  'Create a dashboard panel for AI work queue status',
  'Create a validation workflow for /dashboard',
  'Patch a broken dashboard component safely',
  'Generate a Supabase migration for proof logs',
  'Create a browser evidence packet template',
];

const defaultProjectConfig = {
  projectName: 'strategic-minds-advisory',
  githubRepo: 'XPS-IINTELLIGENCE-SYSTEMS/strategic-minds-advisory',
  baseUrl: 'https://strategicmindsadvisory.com',
};

function formatAgentReply(data) {
  const text = data?.reply || data?.message || data?.error || 'No response text returned.';
  const next = data?.suggested_action ? `\n\nNext: ${data.suggested_action}` : '';
  const mode = data?.mode ? `\n\nMode: ${data.mode}` : '';
  return `${text}${next}${mode}`;
}

export default function EnhancedChatPanel({ seed, onSeedConsumed, embedded }) {
  const [mode, setMode] = useState('strategy');
  const [subMode, setSubMode] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [completedMessageIndex, setCompletedMessageIndex] = useState(null);
  const [operations, setOperations] = useState([]);
  const [projectConfig, setProjectConfig] = useState(defaultProjectConfig);
  const [showConfig, setShowConfig] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (seed?.prompt) {
      setInput(seed.prompt);
      onSeedConsumed?.();
      inputRef.current?.focus();
    }
  }, [seed, onSeedConsumed]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, operations]);

  async function callAgent(message) {
    const response = await fetch('/api/agent/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        context: {
          mode,
          projectConfig,
          page: typeof window !== 'undefined' ? window.location.pathname : '/dashboard',
          system: 'AI In Action',
        },
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || `Agent route failed with ${response.status}`);
    return data;
  }

  async function send(text) {
    const userMsg = (text || input).trim();
    if (!userMsg || loading) return;
    setInput('');
    setLoading(true);

    const userMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(userMessages);

    try {
      const prefix = mode === 'build' ? 'Build/planning request: ' : '';
      const data = await callAgent(`${prefix}${userMsg}`);
      const allMessages = [...userMessages, { role: 'assistant', content: formatAgentReply(data) }];
      setMessages(allMessages);
      setCompletedMessageIndex(allMessages.length - 1);
      if (mode === 'build') {
        setOperations((prev) => [...prev, { type: 'agent-plan', target: projectConfig.githubRepo, status: 'completed' }]);
      }
    } catch (error) {
      const allMessages = [...userMessages, {
        role: 'assistant',
        content: `Agent route failed. Check /api/agent/chat.\n\n${error.message}`,
      }];
      setMessages(allMessages);
      setCompletedMessageIndex(allMessages.length - 1);
      setOperations((prev) => [...prev, { type: 'agent-route', target: '/api/agent/chat', status: 'failed', error: error.message }]);
    } finally {
      setLoading(false);
    }
  }

  async function createBrowserTask() {
    const objective = input.trim() || 'Visually validate the dashboard, hamburger menu, sidebar, AI chat panel, and API health routes. Capture screenshot evidence and report failures.';
    setInput('');
    setLoading(true);
    const userMessages = [...messages, { role: 'user', content: `Prepare browser task: ${objective}` }];
    setMessages(userMessages);

    try {
      const response = await fetch('/api/browser/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'headful',
          target_url: `${projectConfig.baseUrl}/dashboard`,
          objective,
          steps: [
            'open target URL',
            'confirm dashboard loads',
            'click hamburger or menu controls',
            'open chat panel',
            'confirm sidebar appears',
            'scroll dashboard',
            'capture screenshot evidence',
            'report pass/fail and visible errors'
          ],
          evidence: ['screenshot', 'final_url', 'visible_text_summary', 'dashboard_status', 'menu_status', 'chat_status', 'failure_reason'],
        }),
      });
      const data = await response.json();
      const content = data.ok
        ? `Browser task packet prepared: ${data.task?.task_id}\n\nStatus: ${data.task?.status}\nRuntime: external Playwright/headful worker\nReason: ${data.task?.risk_reason}`
        : `Browser task blocked: ${data.message || data.error || 'unknown blocker'}`;
      const allMessages = [...userMessages, { role: 'assistant', content }];
      setMessages(allMessages);
      setCompletedMessageIndex(allMessages.length - 1);
      setOperations((prev) => [...prev, { type: 'browser-task', target: data.task?.target_url || '/api/browser/task', status: data.ok ? 'completed' : 'failed', error: data.ok ? null : data.message }]);
    } catch (error) {
      const allMessages = [...userMessages, { role: 'assistant', content: `Browser task route failed. Check /api/browser/task.\n\n${error.message}` }];
      setMessages(allMessages);
      setCompletedMessageIndex(allMessages.length - 1);
      setOperations((prev) => [...prev, { type: 'browser-task', target: '/api/browser/task', status: 'failed', error: error.message }]);
    } finally {
      setLoading(false);
    }
  }

  function handleSuggestionClick(suggestion) {
    send(suggestion);
  }

  function clear() {
    setMessages([]);
    setOperations([]);
  }

  const starters = mode === 'strategy' ? STARTERS : BUILD_STARTERS;

  return (
    <div className={`flex flex-col h-full bg-background ${embedded ? '' : ''}`}>
      <div className="px-4 py-3 border-b border-border flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-accent" />
          </div>
          <div>
            <div className="text-sm font-medium">{mode === 'strategy' ? 'AI In Action Agent' : 'Build Agent'}</div>
            <div className="text-[10px] text-muted-foreground">REST API · synthetic fallback · browser task planner</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={createBrowserTask} className="text-xs px-2.5 py-1 rounded-lg border border-border hover:bg-secondary transition flex items-center gap-1" title="Prepare browser task">
            <Globe2 className="w-3.5 h-3.5" /> Browser
          </button>
          <button onClick={() => setShowConfig(!showConfig)} className={`p-1.5 rounded-lg transition ${showConfig ? 'bg-accent/15 text-accent' : 'hover:bg-secondary'}`} title="Configuration">
            <Settings className="w-3.5 h-3.5" />
          </button>
          {mode === 'build' && (
            <button onClick={() => setSubMode(subMode === 'chat' ? 'debugger' : 'chat')} className={`p-1.5 rounded-lg transition ${subMode === 'debugger' ? 'bg-accent/15 text-accent' : 'hover:bg-secondary'}`} title="Toggle Debugger Mode">
              <Bug className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={() => setMode(mode === 'strategy' ? 'build' : 'strategy')} className="text-xs px-2.5 py-1 rounded-lg border border-accent/30 bg-accent/10 text-accent">
            {mode === 'strategy' ? 'Build' : 'Strategy'}
          </button>
          {messages.length > 0 && (
            <button onClick={clear} className="text-muted-foreground hover:text-foreground transition p-1" title="Clear chat">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showConfig && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="px-4 py-3 border-b border-border bg-secondary/20 space-y-3">
            <div className="text-xs font-medium">Agent Configuration</div>
            <div className="grid gap-2 md:grid-cols-3">
              <input type="text" placeholder="Base URL" value={projectConfig.baseUrl || ''} onChange={(e) => setProjectConfig((p) => ({ ...p, baseUrl: e.target.value }))} className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-accent" />
              <input type="text" placeholder="Project Name" value={projectConfig.projectName || ''} onChange={(e) => setProjectConfig((p) => ({ ...p, projectName: e.target.value }))} className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-accent" />
              <input type="text" placeholder="GitHub Repo" value={projectConfig.githubRepo || ''} onChange={(e) => setProjectConfig((p) => ({ ...p, githubRepo: e.target.value }))} className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-accent" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {mode === 'build' && subMode === 'debugger' && (
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <DebuggerMode onApplyFix={() => setSubMode('chat')} />
        </div>
      )}

      {subMode === 'chat' && (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-3">
                  {mode === 'strategy' ? <Sparkles className="w-5 h-5 text-accent" /> : <Code2 className="w-5 h-5 text-accent" />}
                </div>
                <p className="text-sm font-medium">{mode === 'strategy' ? 'AI In Action Operator' : 'Build Planning Agent'}</p>
                <p className="text-xs text-muted-foreground mt-1">Ask for status, queue actions, validation, content, products, or browser task packets.</p>
              </div>
              <div className="space-y-2">
                {starters.map((starter) => (
                  <button key={starter} onClick={() => send(starter)} className="w-full text-left text-xs px-3 py-2.5 rounded-xl border border-border bg-secondary/30 hover:bg-secondary transition text-foreground/80">
                    {starter}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, index) => {
            const isLastMessage = index === messages.length - 1 && !loading;
            const isTyping = completedMessageIndex !== index && message.role === 'assistant';
            return (
              <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-2.5 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'assistant' && <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0 mt-0.5"><Bot className="w-3.5 h-3.5 text-accent" /></div>}
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${message.role === 'user' ? 'bg-accent/15 text-foreground border border-accent/20' : 'bg-secondary/60 text-foreground border border-border'}`}>
                  {message.role === 'assistant' ? (
                    <div>
                      <TypingMessage content={message.content} isComplete={!isTyping} />
                      {isLastMessage && !isTyping && <MessageSuggestions onSelect={handleSuggestionClick} />}
                    </div>
                  ) : <p>{message.content}</p>}
                </div>
                {message.role === 'user' && <div className="w-7 h-7 rounded-lg bg-secondary border border-border flex items-center justify-center flex-shrink-0 mt-0.5"><User className="w-3.5 h-3.5 text-muted-foreground" /></div>}
              </motion.div>
            );
          })}

          {loading && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0"><Bot className="w-3.5 h-3.5 text-accent" /></div>
              <div className="bg-secondary/60 border border-border rounded-2xl px-3.5 py-3"><div className="flex gap-1"><div className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" /><div className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} /><div className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} /></div></div>
            </div>
          )}

          {operations.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Agent Operations</div>
              {operations.map((operation, index) => (
                <div key={index} className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${operation.status === 'completed' ? 'border-green-500/30 bg-green-500/5 text-green-400' : operation.status === 'failed' ? 'border-red-500/30 bg-red-500/5 text-red-400' : 'border-border bg-secondary/40'}`}>
                  {operation.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />}
                  {operation.status === 'failed' && <Bug className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />}
                  {operation.status === 'pending' && <Loader2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 animate-spin" />}
                  <div className="min-w-0 flex-1"><div className="font-medium truncate">{operation.type}: {operation.target}</div>{operation.error && <div className="text-[10px] mt-0.5 opacity-80">{operation.error}</div>}</div>
                </div>
              ))}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {subMode === 'chat' && (
        <div className="p-3 border-t border-border flex-shrink-0">
          <div className="flex gap-2">
            <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder={mode === 'strategy' ? 'Ask AI In Action operator...' : 'Describe build or validation task...'} rows={2} className="flex-1 bg-secondary/40 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-accent transition resize-none" />
            <button onClick={() => send()} disabled={loading || !input.trim()} className="btn-ivory rounded-xl px-3 flex items-center justify-center disabled:opacity-40 transition">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
