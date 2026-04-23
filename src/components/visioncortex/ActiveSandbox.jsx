import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code, Database, Zap, Play, CheckCircle2, XCircle,
  Loader2, Copy, ChevronDown, ChevronRight, Terminal,
  Table, Server, AlertCircle, RefreshCw
} from 'lucide-react';

const TABS = [
  { id: 'schema', label: 'DB Schema', icon: Database },
  { id: 'api', label: 'API Explorer', icon: Server },
  { id: 'code', label: 'Code Samples', icon: Code },
  { id: 'tests', label: 'Test Runner', icon: Play },
];

const METHOD_COLORS = {
  GET:    'text-green-400 bg-green-400/10 border-green-500/30',
  POST:   'text-blue-400 bg-blue-400/10 border-blue-500/30',
  PUT:    'text-amber-400 bg-amber-400/10 border-amber-500/30',
  DELETE: 'text-red-400 bg-red-400/10 border-red-500/30',
};

const LANG_COLORS = {
  javascript: 'text-yellow-400', python: 'text-blue-400',
  sql: 'text-cyan-400', typescript: 'text-blue-300',
};

function SchemaView({ schema }) {
  const [openTable, setOpenTable] = useState(null);
  if (!schema?.length) return <p className="text-muted-foreground text-sm text-center py-8">No schema generated yet.</p>;

  return (
    <div className="space-y-3">
      {schema.map((table, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card/50 overflow-hidden">
          <button onClick={() => setOpenTable(openTable === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-secondary/20 transition">
            <div className="flex items-center gap-2">
              <Table className="w-4 h-4 text-cyan-400" />
              <span className="font-mono text-sm text-cyan-400">{table.table}</span>
              <span className="text-xs text-muted-foreground">({table.columns?.length} cols)</span>
            </div>
            {openTable === i ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          </button>
          {openTable === i && (
            <div className="border-t border-border px-5 pb-4 pt-3">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted-foreground font-medium pr-6">Column</th>
                      <th className="text-left py-2 text-muted-foreground font-medium pr-6">Type</th>
                      <th className="text-left py-2 text-muted-foreground font-medium pr-6">PK</th>
                      <th className="text-left py-2 text-muted-foreground font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(table.columns || []).map((col, j) => (
                      <tr key={j} className="border-b border-border/30 last:border-0">
                        <td className="py-2 pr-6 font-mono text-amber-400">{col.name}</td>
                        <td className="py-2 pr-6 font-mono text-blue-400">{col.type}</td>
                        <td className="py-2 pr-6">{col.primary_key ? <span className="text-accent">PK</span> : '—'}</td>
                        <td className="py-2 text-muted-foreground leading-relaxed">{col.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ApiExplorer({ endpoints, sandbox }) {
  const [selected, setSelected] = useState(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  const runEndpoint = async (ep) => {
    setRunning(true);
    setResult(null);
    const res = await base44.functions.invoke('visionSandbox', {
      mode: 'run_test',
      testCase: { name: `Test ${ep.method} ${ep.path}`, input: ep.request_body || {}, expected_output: ep.response_example || {} },
      endpoint: ep,
      schema: sandbox?.database_schema || [],
    });
    setResult(res.data?.result);
    setRunning(false);
  };

  if (!endpoints?.length) return <p className="text-muted-foreground text-sm text-center py-8">No endpoints generated yet.</p>;

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-2">
        {endpoints.map((ep, i) => {
          const mc = METHOD_COLORS[ep.method] || METHOD_COLORS.GET;
          return (
            <button key={i} onClick={() => { setSelected(ep); setResult(null); }}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                selected === ep ? 'border-accent bg-accent/10' : 'border-border bg-card/40 hover:bg-secondary/30'
              }`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border font-mono ${mc}`}>{ep.method}</span>
                <span className="font-mono text-xs text-foreground">{ep.path}</span>
              </div>
              <p className="text-xs text-muted-foreground">{ep.description}</p>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="rounded-2xl border border-border bg-card/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded border font-mono ${METHOD_COLORS[selected.method] || ''}`}>{selected.method}</span>
              <span className="font-mono text-xs">{selected.path}</span>
            </div>
            <button onClick={() => runEndpoint(selected)} disabled={running}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl btn-ivory text-xs disabled:opacity-60">
              {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              Run
            </button>
          </div>

          {selected.request_body && Object.keys(selected.request_body).length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Request Body</div>
              <pre className="text-xs bg-secondary/30 rounded-xl p-3 overflow-x-auto font-mono text-amber-300">
                {JSON.stringify(selected.request_body, null, 2)}
              </pre>
            </div>
          )}

          {selected.response_example && (
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Expected Response</div>
              <pre className="text-xs bg-secondary/30 rounded-xl p-3 overflow-x-auto font-mono text-green-300">
                {JSON.stringify(selected.response_example, null, 2)}
              </pre>
            </div>
          )}

          {running && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Simulating request…
            </div>
          )}

          {result && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border p-3 ${result.passed ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
              <div className="flex items-center gap-2 mb-2">
                {result.passed ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <XCircle className="w-3.5 h-3.5 text-red-400" />}
                <span className="text-xs font-medium">{result.passed ? 'PASS' : 'FAIL'}</span>
                {result.execution_time_ms && <span className="text-xs text-muted-foreground ml-auto">{result.execution_time_ms}ms</span>}
              </div>
              <pre className="text-xs text-foreground/80 overflow-x-auto">
                {JSON.stringify(result.response, null, 2)}
              </pre>
              {result.logs?.length > 0 && (
                <div className="mt-2 space-y-0.5">
                  {result.logs.map((l, i) => <div key={i} className="text-[10px] text-muted-foreground font-mono">{l}</div>)}
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

function CodeView({ samples }) {
  const [copied, setCopied] = useState(null);
  if (!samples?.length) return <p className="text-muted-foreground text-sm text-center py-8">No code samples generated yet.</p>;

  const copy = (code, i) => { navigator.clipboard.writeText(code); setCopied(i); setTimeout(() => setCopied(null), 2000); };

  return (
    <div className="space-y-4">
      {samples.map((s, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card/50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/20">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="font-mono text-sm">{s.filename}</span>
              <span className={`text-xs ${LANG_COLORS[s.language] || 'text-muted-foreground'}`}>{s.language}</span>
            </div>
            <button onClick={() => copy(s.code, i)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition">
              {copied === i ? <><CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
            </button>
          </div>
          {s.description && <p className="text-xs text-muted-foreground px-4 py-2">{s.description}</p>}
          <pre className="px-4 pb-4 text-xs text-foreground/80 overflow-x-auto leading-relaxed font-mono whitespace-pre-wrap break-words">
            {s.code}
          </pre>
        </div>
      ))}
    </div>
  );
}

function TestRunner({ tests, sandbox }) {
  const [results, setResults] = useState({});
  const [running, setRunning] = useState(null);

  const runTest = async (test, i) => {
    setRunning(i);
    const res = await base44.functions.invoke('visionSandbox', {
      mode: 'run_test',
      testCase: test,
      schema: sandbox?.database_schema || [],
    });
    setResults(prev => ({ ...prev, [i]: res.data?.result }));
    setRunning(null);
  };

  const runAll = async () => {
    for (let i = 0; i < (tests || []).length; i++) await runTest(tests[i], i);
  };

  if (!tests?.length) return <p className="text-muted-foreground text-sm text-center py-8">No test cases generated yet.</p>;

  const passed = Object.values(results).filter(r => r?.passed).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Object.keys(results).length > 0 && (
            <div className={`text-sm font-medium ${passed === Object.keys(results).length ? 'text-green-400' : 'text-amber-400'}`}>
              {passed}/{Object.keys(results).length} passed
            </div>
          )}
        </div>
        <button onClick={runAll} disabled={running !== null}
          className="flex items-center gap-2 px-4 py-2 rounded-xl btn-ivory text-xs disabled:opacity-60">
          {running !== null ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
          Run All Tests
        </button>
      </div>

      <div className="space-y-2">
        {tests.map((test, i) => {
          const r = results[i];
          return (
            <div key={i} className={`rounded-2xl border p-4 transition-all ${
              r ? (r.passed ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5') : 'border-border bg-card/40'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {r ? (r.passed ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <XCircle className="w-3.5 h-3.5 text-red-400" />) :
                      <div className="w-3.5 h-3.5 rounded-full border border-border" />}
                    <span className="text-sm font-medium">{test.name}</span>
                    {r?.execution_time_ms && <span className="text-xs text-muted-foreground">{r.execution_time_ms}ms</span>}
                  </div>
                  <p className="text-xs text-muted-foreground ml-5">{test.description}</p>
                  {r?.errors?.length > 0 && (
                    <div className="mt-2 ml-5 text-xs text-red-400">{r.errors.join(', ')}</div>
                  )}
                </div>
                <button onClick={() => runTest(test, i)} disabled={running === i}
                  className="flex-shrink-0 flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl border border-border hover:bg-secondary transition disabled:opacity-50">
                  {running === i ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                  Run
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ActiveSandbox({ idea }) {
  const [sandbox, setSandbox] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('schema');

  const provision = async () => {
    if (!idea) return;
    setLoading(true);
    const simData = (() => { try { return JSON.parse(idea.simulation_result); } catch { return {}; } })();
    const res = await base44.functions.invoke('visionSandbox', {
      mode: 'provision',
      ideaTitle: idea.title,
      ideaConcept: idea.full_concept || idea.description,
      mvpSpec: simData.techDesign || idea.documentation || '',
    });
    if (res.data?.sandbox) setSandbox(res.data.sandbox);
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-card/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium">Active Sandbox</span>
            {sandbox && (
              <span className="text-xs text-green-400 border border-green-500/30 bg-green-500/10 rounded-full px-2 py-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Provisioned
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {idea && (
              <span className="text-xs text-muted-foreground truncate max-w-40">💡 {idea.title}</span>
            )}
            <button onClick={provision} disabled={loading || !idea}
              className="flex items-center gap-2 px-4 py-2 rounded-xl btn-ivory text-xs disabled:opacity-60">
              {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Provisioning…</> : <><Zap className="w-3.5 h-3.5" /> {sandbox ? 'Re-Provision' : 'Provision Sandbox'}</>}
            </button>
          </div>
        </div>

        {sandbox && (
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="text-amber-400">⚡</span> {sandbox.tech_stack?.frontend}
            </span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="text-green-400">🔗</span> {sandbox.tech_stack?.backend}
            </span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="text-cyan-400">🗄</span> {sandbox.tech_stack?.database}
            </span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="text-purple-400">🤖</span> {sandbox.tech_stack?.ai}
            </span>
          </div>
        )}

        {sandbox && (
          <div className="flex gap-2 mt-3">
            {TABS.map(t => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs border transition-all ${
                    activeTab === t.id ? 'btn-ivory border-transparent' : 'border-border bg-secondary/30 text-muted-foreground hover:text-foreground'
                  }`}>
                  <Icon className="w-3.5 h-3.5" />{t.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {!idea && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4">
            <Terminal className="w-14 h-14 opacity-10" />
            <div>
              <p className="font-medium text-sm">No Idea Selected</p>
              <p className="text-xs text-muted-foreground mt-1">Select an idea from the Idea Board to provision its sandbox environment.</p>
            </div>
          </div>
        )}

        {idea && !sandbox && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Server className="w-9 h-9 text-orange-400" />
            </div>
            <div>
              <p className="font-display text-xl mb-2">Ready to Provision</p>
              <p className="text-sm text-muted-foreground max-w-sm">
                The Coder and Inventor agents will design a complete sandbox environment including database schema, API endpoints, code samples, and test cases for <strong>{idea.title}</strong>.
              </p>
            </div>
            <button onClick={provision} className="btn-ivory rounded-2xl px-8 py-4 text-sm flex items-center gap-2">
              <Zap className="w-4 h-4" /> Provision Sandbox Environment
            </button>
          </div>
        )}

        {sandbox && (
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {activeTab === 'schema' && <SchemaView schema={sandbox.database_schema} />}
              {activeTab === 'api' && <ApiExplorer endpoints={sandbox.api_endpoints} sandbox={sandbox} />}
              {activeTab === 'code' && <CodeView samples={sandbox.sample_code} />}
              {activeTab === 'tests' && <TestRunner tests={sandbox.test_cases} sandbox={sandbox} />}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}