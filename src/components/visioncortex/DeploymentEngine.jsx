import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket, Loader2, Copy, CheckCircle2, ChevronDown, ChevronRight,
  Github, Cloud, Server, Database, Zap, FileCode
} from 'lucide-react';

const DEPLOY_TARGETS = [
  { id: 'dockerfile', label: 'Dockerfile',     icon: FileCode, color: 'text-blue-400',   border: 'border-blue-500/30',   bg: 'bg-blue-500/10',   desc: 'Multi-stage production container' },
  { id: 'cicd',       label: 'GitHub Actions', icon: Github,   color: 'text-gray-300',   border: 'border-gray-500/30',   bg: 'bg-gray-500/10',   desc: 'Full CI/CD pipeline' },
  { id: 'terraform',  label: 'Terraform + GCP',icon: Cloud,    color: 'text-amber-400',  border: 'border-amber-500/30',  bg: 'bg-amber-500/10',  desc: 'Infrastructure as code' },
  { id: 'railway',    label: 'Railway',         icon: Server,   color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/10', desc: 'Zero-config deployment' },
  { id: 'vercel',     label: 'Vercel',          icon: Zap,      color: 'text-foreground', border: 'border-border',        bg: 'bg-secondary/30',  desc: 'Frontend & edge functions' },
  { id: 'supabase',   label: 'Supabase',        icon: Database, color: 'text-green-400',  border: 'border-green-500/30',  bg: 'bg-green-500/10',  desc: 'DB, Auth, Edge Functions' },
];

const PIPELINE_STAGES = [
  { id: 'build',    label: 'Build',    icon: '⚙️', desc: 'Compile & bundle' },
  { id: 'test',     label: 'Test',     icon: '🧪', desc: 'Run test suite' },
  { id: 'docker',   label: 'Docker',   icon: '🐳', desc: 'Build & push image' },
  { id: 'staging',  label: 'Staging',  icon: '🎭', desc: 'Deploy to staging' },
  { id: 'verify',   label: 'Verify',   icon: '✅', desc: 'Health checks' },
  { id: 'prod',     label: 'Prod',     icon: '🚀', desc: 'Deploy to production' },
];

function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="rounded-2xl border border-border bg-card/60 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary/20">
        <span className="text-xs text-muted-foreground font-mono">{language}</span>
        <button onClick={copy} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition">
          {copied ? <><CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
        </button>
      </div>
      <pre className="px-4 py-4 text-xs text-foreground/80 overflow-x-auto font-mono leading-relaxed whitespace-pre-wrap break-words max-h-96">
        {code}
      </pre>
    </div>
  );
}

function PipelineVisual({ running, currentStage, completed }) {
  return (
    <div className="flex items-center gap-0">
      {PIPELINE_STAGES.map((stage, i) => {
        const isDone = completed.includes(stage.id);
        const isCurrent = currentStage === stage.id;
        const isPending = !isDone && !isCurrent;
        return (
          <React.Fragment key={stage.id}>
            <div className={`flex flex-col items-center gap-1 ${isPending ? 'opacity-30' : ''}`}>
              <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center text-lg transition-all ${
                isDone ? 'border-green-500/50 bg-green-500/15' :
                isCurrent ? 'border-accent/50 bg-accent/15 ring-2 ring-accent/30' :
                'border-border bg-secondary/30'
              }`}>
                {isCurrent && running ? <Loader2 className="w-4 h-4 animate-spin text-accent" /> : stage.icon}
              </div>
              <span className={`text-[9px] ${isCurrent ? 'text-accent font-medium' : isDone ? 'text-green-400' : 'text-muted-foreground'}`}>
                {stage.label}
              </span>
            </div>
            {i < PIPELINE_STAGES.length - 1 && (
              <div className={`w-8 h-0.5 mb-4 flex-shrink-0 transition-all ${isDone ? 'bg-green-500/40' : 'bg-border/40'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function DeploymentEngine() {
  const [ideas, setIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [selectedTargets, setSelectedTargets] = useState(['dockerfile', 'cicd', 'railway']);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [pipelineStage, setPipelineStage] = useState(null);
  const [pipelineCompleted, setPipelineCompleted] = useState([]);
  const [openResult, setOpenResult] = useState(null);

  useEffect(() => {
    base44.entities.VisionIdea.list('-created_date', 50).then(data => {
      const docs = data.filter(i => i.status === 'documented' || i.status === 'validated' || i.status === 'building');
      setIdeas(docs);
      if (docs.length > 0) setSelectedIdea(docs[0]);
    });
  }, []);

  const toggleTarget = (id) => setSelectedTargets(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );

  const runMockPipeline = async () => {
    setPipelineRunning(true);
    setPipelineCompleted([]);
    for (const stage of PIPELINE_STAGES) {
      setPipelineStage(stage.id);
      await new Promise(r => setTimeout(r, 800 + Math.random() * 600));
      setPipelineCompleted(prev => [...prev, stage.id]);
    }
    setPipelineStage(null);
    setPipelineRunning(false);
  };

  const generate = async () => {
    if (!selectedIdea) return;
    setLoading(true);
    setResults({});

    const simData = (() => { try { return JSON.parse(selectedIdea.simulation_result); } catch { return {}; } })();
    const ctx = `App: "${selectedIdea.title}". Concept: ${(selectedIdea.full_concept || selectedIdea.description || '').substring(0, 400)}. Stack: ${simData.techDesign?.substring(0, 200) || 'Node.js, React, PostgreSQL'}.`;

    const PROMPTS = {
      dockerfile: `Generate a production-ready multi-stage Dockerfile for: ${ctx}\nInclude: builder stage, non-root user, HEALTHCHECK, ENV vars, alpine base image. Output file content only with inline comments.`,
      cicd: `Generate a complete GitHub Actions CI/CD workflow YAML (.github/workflows/deploy.yml) for: ${ctx}\nInclude: test, docker build/push, deploy to Railway (backend) and Vercel (frontend), rollback on failure. Output YAML only.`,
      terraform: `Generate Terraform HCL (main.tf + variables.tf + outputs.tf) for GCP Cloud Run + Cloud SQL PostgreSQL for: ${ctx}. Output HCL only with comments.`,
      railway: `Generate Railway deployment config (railway.json + Procfile + nixpacks.toml) for: ${ctx}. Output file content only.`,
      vercel: `Generate vercel.json config for: ${ctx}\nInclude routes, headers, env vars list. Output JSON and setup notes only.`,
      supabase: `Generate Supabase migration SQL (migrations/001_schema.sql with full schema and RLS policies) and supabase/config.toml for: ${ctx}. Output SQL and TOML only.`,
    };

    for (const target of selectedTargets) {
      if (!PROMPTS[target]) continue;
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: PROMPTS[target],
        model: 'gpt_5_mini',
      });
      const content = typeof res === 'string' ? res : res?.response || res?.content || JSON.stringify(res);
      setResults(prev => ({ ...prev, [target === 'cicd' ? 'github_actions' : target]: content }));
    }
    setLoading(false);
  };

  const RESULT_LABEL_MAP = {
    dockerfile:      { label: 'Dockerfile', lang: 'dockerfile' },
    github_actions:  { label: 'GitHub Actions CI/CD', lang: 'yaml' },
    terraform:       { label: 'Terraform / GCP', lang: 'hcl' },
    railway:         { label: 'Railway Config', lang: 'toml' },
    vercel:          { label: 'Vercel Config', lang: 'json' },
    supabase:        { label: 'Supabase Setup', lang: 'sql' },
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-card/20 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">Deployment Engine</span>
            <span className="text-xs text-muted-foreground border border-border rounded-full px-2 py-0.5">
              💻 Coder Agent
            </span>
          </div>
        </div>

        {/* Idea selector */}
        <div className="flex items-center gap-3 flex-wrap">
          <select value={selectedIdea?.id || ''} onChange={e => setSelectedIdea(ideas.find(i => i.id === e.target.value) || null)}
            className="bg-background border border-border rounded-xl px-3 py-2 text-xs outline-none focus:border-accent transition flex-1 max-w-xs">
            {ideas.map(i => <option key={i.id} value={i.id}>{i.title} [{i.status}]</option>)}
            {ideas.length === 0 && <option value="">No documented ideas yet — build one first</option>}
          </select>

          <button onClick={generate} disabled={loading || !selectedIdea || selectedTargets.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl btn-ivory text-sm disabled:opacity-60">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : <><FileCode className="w-4 h-4" /> Generate Config</>}
          </button>

          {Object.keys(results).length > 0 && (
            <button onClick={runMockPipeline} disabled={pipelineRunning}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-green-500/30 text-green-400 bg-green-500/10 text-sm hover:bg-green-500/20 transition disabled:opacity-60">
              {pipelineRunning ? <><Loader2 className="w-4 h-4 animate-spin" /> Running…</> : <><Rocket className="w-4 h-4" /> Mock Deploy</>}
            </button>
          )}
        </div>

        {/* Target selector */}
        <div className="flex flex-wrap gap-2">
          {DEPLOY_TARGETS.map(t => {
            const Icon = t.icon;
            const sel = selectedTargets.includes(t.id);
            return (
              <button key={t.id} onClick={() => toggleTarget(t.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs transition-all ${
                  sel ? `${t.border} ${t.bg} ${t.color}` : 'border-border text-muted-foreground opacity-50 hover:opacity-80'
                }`}>
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pipeline visual */}
      {(pipelineRunning || pipelineCompleted.length > 0) && (
        <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-card/10">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Deployment Pipeline</div>
          <PipelineVisual running={pipelineRunning} currentStage={pipelineStage} completed={pipelineCompleted} />
          {!pipelineRunning && pipelineCompleted.length === PIPELINE_STAGES.length && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              Deployment simulation complete — production environment ready!
            </motion.div>
          )}
        </div>
      )}

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
        {!loading && Object.keys(results).length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Rocket className="w-9 h-9 text-accent" />
            </div>
            <div className="max-w-sm">
              <p className="font-display text-xl mb-2">Ready to Deploy</p>
              <p className="text-sm text-muted-foreground">
                Select deployment targets and click Generate Config. The Coder agent will produce production-ready Dockerfile, CI/CD pipelines, Terraform infrastructure, and platform configs.
              </p>
              {ideas.length === 0 && (
                <p className="text-xs text-amber-400 border border-amber-500/30 rounded-xl px-4 py-2 bg-amber-500/10 mt-3">
                  ⚠️ Ideas need to reach 'Documented' or 'Validated' status first
                </p>
              )}
            </div>
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            {selectedTargets.map(t => (
              <div key={t} className="rounded-2xl border border-border bg-card/40 p-5 flex items-center gap-3">
                <Loader2 className="w-4 h-4 animate-spin text-accent" />
                <span className="text-sm text-muted-foreground">Generating {DEPLOY_TARGETS.find(d => d.id === t)?.label}…</span>
              </div>
            ))}
          </div>
        )}

        {Object.entries(results).map(([key, content]) => {
          const meta = RESULT_LABEL_MAP[key] || { label: key, lang: 'bash' };
          const targetConfig = DEPLOY_TARGETS.find(t => t.id === key || (key === 'github_actions' && t.id === 'cicd'));
          const Icon = targetConfig?.icon || FileCode;
          const isOpen = openResult === key;

          return (
            <div key={key} className={`rounded-2xl border overflow-hidden ${targetConfig?.border || 'border-border'}`}>
              <button onClick={() => setOpenResult(isOpen ? null : key)}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-secondary/20 transition text-left">
                <Icon className={`w-4 h-4 flex-shrink-0 ${targetConfig?.color || 'text-muted-foreground'}`} />
                <span className="text-sm font-medium flex-1">{meta.label}</span>
                <span className="text-xs text-muted-foreground">{content?.length?.toLocaleString()} chars</span>
                {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-border/50">
                    <div className="p-4">
                      <CodeBlock code={content} language={meta.lang} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}