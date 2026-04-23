import React from 'react';
import { Cpu, Zap, TrendingUp, Rocket, BookOpen, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const SECTIONS = [
  {
    icon: Cpu,
    title: '24/7 Auto-Generation Engine',
    desc: 'Groq-powered system generates 3 novel business ideas every hour',
    details: [
      'Machine learning detects market gaps across 5+ domains',
      'Generates 72 ideas/day → 10+ validated MVPs weekly',
      'Automatic TAM estimation, revenue modeling, moat analysis',
      'Status: Currently OFF by default — toggle in Vision Cortex → 24/7 Auto-Gen tab',
      'Toggle "Start 24/7" to activate continuous generation',
    ],
  },
  {
    icon: TrendingUp,
    title: 'Idea Analytics Dashboard',
    desc: '6 interactive sliders simulate real-time viability metrics',
    details: [
      'Market Growth Rate: -20% to +60% (model expansion impact)',
      'Churn Rate: 1% to 80% (model sustainability)',
      'CAC (Customer Acquisition Cost): $10 to $5K',
      'Conversion Rate: 0.1% to 20%',
      'Virality Coefficient: 0 to 2 (network effects)',
      'Revenue/User: $1 to $1K (pricing power)',
      'Live charts: Revenue Growth, User Projection, LTV:CAC Ratio',
      'Viability Score: 0-100 composite metric',
    ],
  },
  {
    icon: Zap,
    title: 'Vision Whiteboard',
    desc: 'Drag-and-drop sticky notes with agent voting consensus',
    details: [
      'Create unlimited sticky notes + pull ideas from the board',
      '6 color options, double-click to edit, trash to remove',
      'Link ideas with connection lines (visual dependency mapping)',
      'All 9 agents vote on each card (Analyzer, Visionary, etc.)',
      'Live ranking sidebar scores by votes + validation score',
      'Megaproject grouping for strategic clusters',
    ],
  },
  {
    icon: Rocket,
    title: 'Deployment Engine',
    desc: 'Auto-generate production infrastructure for validated MVPs',
    details: [
      'Select any validated/documented idea',
      'Choose deployment targets:',
      '  • Dockerfile (multi-stage, production-ready)',
      '  • GitHub Actions CI/CD (test → build → deploy)',
      '  • Terraform + GCP (Cloud Run + Cloud SQL)',
      '  • Railway (backend auto-deploy)',
      '  • Vercel (frontend + edge functions)',
      '  • Supabase (PostgreSQL + auth + Edge Functions)',
      'Mock 6-stage pipeline visualization',
      'Copy-paste all configs or push directly to GitHub (when connected)',
    ],
  },
  {
    icon: BookOpen,
    title: 'Daily 9am EST Summary Email',
    desc: 'Automated email report of all ideas created in the last 24 hours',
    details: [
      'Sent every day at 9:00 AM Eastern Time',
      'Includes: total generated, breakdown by status, top by validation score',
      'Domain distribution (fintech, climate, biotech, consumer, etc.)',
      'Actionable next steps for promising ideas',
      'Direct link to Vision Cortex dashboard',
      'Tracks progress toward 10-ideas/day benchmark',
    ],
  },
];

export default function AutoInventionSystemGuide() {
  return (
    <div className="min-h-screen bg-background pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="mb-16">
          <h1 className="font-display text-5xl leading-[1.05] text-gradient-ivory mb-4">
            24/7 Auto-Invention Machine
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Strategic Minds Advisory now runs a fully autonomous venture generation system. Every hour, Groq generates 3 novel, viable business ideas. Every day, the system debates, simulates, validates, and documents MVPs. Every morning at 9am, you get a full report.
          </p>
        </div>

        {/* Quick start */}
        <div className="rounded-3xl border border-accent/30 bg-accent/5 p-8 mb-16">
          <h2 className="font-display text-2xl text-accent mb-4">Quick Start (3 steps)</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl font-bold text-accent mb-2">1.</div>
              <div className="font-medium mb-1">Open Vision Cortex</div>
              <p className="text-sm text-muted-foreground">Go to Dashboard → Vision Cortex</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-2">2.</div>
              <div className="font-medium mb-1">Click "24/7 Auto-Gen" Tab</div>
              <p className="text-sm text-muted-foreground">Toggle "Start 24/7" button</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-2">3.</div>
              <div className="font-medium mb-1">Watch Ideas Flow</div>
              <p className="text-sm text-muted-foreground">System generates ideas hourly, daily email at 9am</p>
            </div>
          </div>
        </div>

        {/* Modules */}
        <div className="space-y-12 mb-16">
          {SECTIONS.map((section, i) => {
            const Icon = section.icon;
            return (
              <div key={i} className="rounded-2xl border border-border bg-card/50 p-8 space-y-4">
                <div className="flex items-start gap-3 mb-2">
                  <Icon className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-display text-2xl">{section.title}</h3>
                    <p className="text-muted-foreground mt-1">{section.desc}</p>
                  </div>
                </div>
                <ul className="space-y-2 pl-9">
                  {section.details.map((detail, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-foreground/80">
                      <span className="text-accent mt-1.5">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Architecture diagram (text) */}
        <div className="rounded-2xl border border-border bg-card/50 p-8 mb-16">
          <h2 className="font-display text-2xl mb-6">System Architecture</h2>
          <div className="font-mono text-xs text-muted-foreground space-y-3 overflow-x-auto">
            <div className="flex items-center gap-2">
              <span className="text-accent">→</span> <span>visionAutoGenerate (hourly)</span>
            </div>
            <div className="flex items-center gap-4">
              <span>│</span>
              <span className="text-accent">├ Groq API (3 ideas/hour)</span>
            </div>
            <div className="flex items-center gap-4">
              <span>│</span>
              <span className="text-accent">├ Parse title, domain, description, TAM</span>
            </div>
            <div className="flex items-center gap-4">
              <span>│</span>
              <span className="text-accent">└ Create VisionIdea records (status: seeded)</span>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-accent">→</span> <span>AutoGenerationMonitor (UI)</span>
            </div>
            <div className="flex items-center gap-4">
              <span>│</span>
              <span className="text-accent">├ Toggle 24/7 on/off (affects hourly automation)</span>
            </div>
            <div className="flex items-center gap-4">
              <span>│</span>
              <span className="text-accent">├ Display today's stats, status breakdown</span>
            </div>
            <div className="flex items-center gap-4">
              <span>│</span>
              <span className="text-accent">└ Manual trigger "Generate Ideas Now"</span>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-accent">→</span> <span>visionDailySummary (9am EST)</span>
            </div>
            <div className="flex items-center gap-4">
              <span>│</span>
              <span className="text-accent">├ Fetch all ideas from last 24h</span>
            </div>
            <div className="flex items-center gap-4">
              <span>│</span>
              <span className="text-accent">├ Group by status, domain, validation score</span>
            </div>
            <div className="flex items-center gap-4">
              <span>│</span>
              <span className="text-accent">└ SendEmail summary report</span>
            </div>
          </div>
        </div>

        {/* Benchmarks */}
        <div className="rounded-2xl border border-border bg-card/50 p-8 mb-16 space-y-4">
          <h2 className="font-display text-2xl mb-4">Performance Benchmarks</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-4xl font-bold text-accent mb-2">72</div>
              <div className="font-medium">Ideas/Day</div>
              <p className="text-sm text-muted-foreground mt-1">3 ideas × 24 hours</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">~15%</div>
              <div className="font-medium">Validation Rate</div>
              <p className="text-sm text-muted-foreground mt-1">10-12 ideas/day reach ≥70 score</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-cyan-400 mb-2">48h</div>
              <div className="font-medium">Idea-to-MVP</div>
              <p className="text-sm text-muted-foreground mt-1">Validated ideas → deployable code</p>
            </div>
          </div>
        </div>

        {/* Setup checklist */}
        <div className="rounded-2xl border border-border bg-card/50 p-8">
          <h2 className="font-display text-2xl mb-6">Setup Checklist</h2>
          <div className="space-y-3">
            {[
              'Ensure GROQ_API_KEY is set in app secrets',
              'Navigate to Dashboard → Vision Cortex',
              'Click "24/7 Auto-Gen" tab to see AutoGenerationMonitor',
              'Click "Start 24/7" to activate hourly generation',
              '(Optional) Set up GitHub integration in Deployment Engine for auto-repo creation',
              'Check email for daily 9am EST summary reports',
              'Monitor Idea Analytics dashboard for viability trends',
              'Use Whiteboard for collaborative idea clustering with agents',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border/40 bg-secondary/20">
                <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-sm">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link to="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full btn-ivory font-medium">
            <Rocket className="w-5 h-5" />
            Open Vision Cortex Dashboard
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            The future of venture ideation is autonomous, rapid, and relentless.
          </p>
        </div>
      </div>
    </div>
  );
}