import React from 'react';
import { Brain, Lock, TrendingUp, Zap, BookOpen, Users, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const FEATURES = [
  {
    icon: Brain,
    title: 'Competitor Benchmark Overlay',
    desc: 'Real-world industry metrics on Analytics charts',
    details: [
      'Shows industry average CAC, growth rate, churn by domain + business model',
      'Compare your projected metrics vs. actual benchmarks (50+ companies per category)',
      'Confidence scoring on benchmark data (80%+ = highly reliable)',
      'Updated monthly from Pitchbook, Crunchbase, SEC filings',
    ],
  },
  {
    icon: Zap,
    title: 'Agent Task Queue with Dependencies',
    desc: 'Assign multi-step research tasks with trigger-based execution',
    details: [
      'Create tasks for any agent (Analyzer, Strategist, Coder, Validator, etc.)',
      'Define task types: research, analysis, strategy, build, validation, custom',
      'Trigger conditions: "If Validator flags high_risk, run Strategist pivot analysis"',
      'Async execution with status tracking (pending → in_progress → completed)',
      'Priority levels: low, medium, high with queue management',
    ],
  },
  {
    icon: BookOpen,
    title: 'Investor Pitch Deck Generator',
    desc: 'Professional 12-slide deck + executive summary',
    details: [
      'Automatically generates from Idea Analytics + Deployment Engine',
      'Slides: Title, Problem, Solution, Market, Business Model, Tech, Competitive, Traction, GTM, Financials, Team, Ask',
      'Includes 3-year financial projections with CAC analysis',
      'Executive summary optimized for 2-minute elevator pitch',
      'Download as text or copy to clipboard',
    ],
  },
  {
    icon: Lock,
    title: 'Elite Strategic Intelligence Library',
    desc: 'Top 50 curated intelligence sources (premium tier only)',
    details: [
      '50 sources: Pitchbook, McKinsey, Y Combinator, Sequoia, a16z, Ryan Holiday, Paul Graham, Cialdini, Kahneman, SEC Edgar, LinkedIn, Twitter/X, Product Hunt, Reddit',
      'Categories: Competitive, Market Trends, Psychology, Frameworks, Opportunities, Risk, Technology',
      'Auto-scraped daily at 11pm EST via Groq LLM + browser system',
      'Each insight scored: Value Score (0-100) + Rarity Score (0-100)',
      'Premium-only insights marked and segregated for elite clients',
      'Focuses on psychology (Cialdini, Kahneman, BJ Fogg), strategic frameworks (Wardley Maps, Jobs to be Done, Value Prop Canvas)',
    ],
  },
  {
    icon: TrendingUp,
    title: 'Smart Chat Auto-Suggestions',
    desc: 'Context-aware conversation starters enhanced by intelligence',
    details: [
      'Suggests: "Analyze [latest idea] using Jobs to be Done framework"',
      'References: "What emerging trends in [domain] are most relevant?"',
      'Psychology-focused: "What Cialdini principles convert users in this market?"',
      'GTM strategy: "Build Sequoia Capital go-to-market playbook for this SaaS"',
      'Automatically refreshes based on recent ideas and premium intelligence',
    ],
  },
  {
    icon: Users,
    title: 'Client Tier: Elite Only',
    desc: 'Positioned exclusively for C-suite, VCs, and strategic leaders',
    details: [
      'Premium pricing model — no budget-conscious clients',
      'Focus: Rare, hard-to-find strategic intelligence (Rarity Score ≥ 70)',
      'High-value insights sourced from elite institutional research',
      'Decision support for multi-million dollar ventures',
      'Access to Pitchbook, Crunchbase Premium, private founder networks',
      'Executive briefings + custom competitive intelligence reports',
    ],
  },
];

export default function EliteIntelligenceSystemGuide() {
  return (
    <div className="min-h-screen bg-background pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-accent" />
            <span className="text-xs uppercase tracking-[0.2em] text-accent font-medium">Elite Tier Only</span>
          </div>
          <h1 className="font-display text-5xl leading-[1.05] text-gradient-ivory mb-4">
            Strategic Intelligence System
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Strategic Minds Advisory now operates an exclusive intelligence platform designed for elite entrepreneurs, institutional investors, and C-suite strategists. Real-time competitive benchmarking, rare strategic frameworks, deep psychological insights, and task-driven agent collaboration.
          </p>
        </div>

        {/* Features */}
        <div className="space-y-12 mb-16">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className="rounded-2xl border border-border bg-card/50 p-8 space-y-4">
                <div className="flex items-start gap-3 mb-2">
                  <Icon className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-display text-2xl">{feature.title}</h3>
                    <p className="text-muted-foreground mt-1">{feature.desc}</p>
                  </div>
                </div>
                <ul className="space-y-2 pl-9">
                  {feature.details.map((detail, j) => (
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

        {/* Intelligence Sources */}
        <div className="rounded-2xl border border-accent/30 bg-accent/5 p-8 mb-16">
          <h2 className="font-display text-2xl text-accent mb-6">Top 50 Intelligence Sources</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {[
              { title: 'Institutional Research', items: ['Pitchbook', 'CBInsights', 'Crunchbase', 'Gartner Magic Quadrant', 'Forrester Wave', 'McKinsey Research'] },
              { title: 'Startup Ecosystems', items: ['Y Combinator Directory', 'AngelList Signals', 'Product Hunt', 'TechCrunch', 'The Information', 'Blind Glassdoor'] },
              { title: 'Elite Thinkers', items: ['Paul Graham Essays', 'Ben Horowitz', 'Reid Hoffman', 'Ryan Holiday', 'Robert Cialdini', 'Daniel Kahneman'] },
              { title: 'Strategy Frameworks', items: ['Sequoia Capital Playbook', 'Simon Wardley Mapping', 'Jobs to be Done', 'Value Prop Canvas', 'BJ Fogg Behavior Design', 'Wardley Maps'] },
              { title: 'Finance & Markets', items: ['SEC Edgar Filings', 'Bloomberg Terminal', 'Reuters Data', 'Preqin Hedge Fund Data', 'World Bank Data', 'UN SDG Data'] },
              { title: 'Psychology & Behavior', items: ['Cialdini Influence Principles', 'Kahneman Behavioral Economics', 'BJ Fogg Behavioral Model', 'Thaler Nudge Theory', 'Ariely Irrational Behavior', 'Sunstein Choice Architecture'] },
            ].map((category, i) => (
              <div key={i} className="space-y-2">
                <h3 className="text-sm font-medium text-accent mb-2">{category.title}</h3>
                <ul className="space-y-1">
                  {category.items.map((item, j) => (
                    <li key={j} className="text-xs text-foreground/70 flex items-center gap-2">
                      <span className="text-accent">◆</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* System Architecture */}
        <div className="rounded-2xl border border-border bg-card/50 p-8 mb-16">
          <h2 className="font-display text-2xl mb-6">Daily Intelligence Pipeline</h2>
          <div className="font-mono text-xs text-muted-foreground space-y-2">
            <div>
              <span className="text-accent">11:00 PM EST</span> → Automation trigger: <span className="text-cyan-400">intelligenceIngestPipeline</span>
            </div>
            <div className="ml-4 space-y-1">
              <div>↓ Scrape top 15 elite sources via Groq LLM + browser</div>
              <div>↓ Extract rare, high-value insights (psychology, strategy, competitive)</div>
              <div>↓ Score by Value (0-100) + Rarity (0-100)</div>
              <div>↓ Flag premium-only insights (Rarity ≥ 70)</div>
              <div>↓ Store in <span className="text-green-400">StrategicIntelligence</span> entity</div>
              <div>↓ Available for: Chat Auto-Suggestions, Analytics benchmarks, Task dependencies</div>
            </div>
            <div className="mt-3">
              <span className="text-accent">Result:</span> 15+ rare insights per day → 5,000+ premium insights/year
            </div>
          </div>
        </div>

        {/* Premium Positioning */}
        <div className="rounded-2xl border border-border bg-card/50 p-8 mb-16 space-y-6">
          <h2 className="font-display text-2xl mb-4">Premium Positioning</h2>
          
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-accent/20 bg-accent/5">
              <h3 className="text-sm font-medium text-accent mb-2">Target Market</h3>
              <p className="text-xs text-foreground/80">
                C-suite executives, venture capitalists (Series A+), institutional investors, family offices, strategic consultants making $10M+ decisions. Clients who don't negotiate on price.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/5">
              <h3 className="text-sm font-medium text-green-400 mb-2">Value Proposition</h3>
              <p className="text-xs text-foreground/80">
                Access to institutional-grade competitive intelligence, rare strategic frameworks, and psychological insights that most founders/investors never discover. Decision support for ventures that could generate 10-100x returns.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
              <h3 className="text-sm font-medium text-blue-400 mb-2">Pricing Model</h3>
              <p className="text-xs text-foreground/80">
                Tiered by access level: (1) Standard: $50K/year (core features), (2) Elite: $150K/year (intelligence library + task queue + pitch deck), (3) Enterprise: $500K+/year (custom intelligence, white-glove support, dedicated analyst).
              </p>
            </div>
          </div>
        </div>

        {/* Quick Access */}
        <div className="rounded-2xl border border-border bg-card/50 p-8 mb-16">
          <h2 className="font-display text-2xl mb-6">Quick Start — Elite Features</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: '📊', label: 'Competitor Benchmarks', desc: 'Real-time overlay on Analytics charts' },
              { icon: '⚡', label: 'Task Queue', desc: 'Assign agents multi-step research tasks' },
              { icon: '🧠', label: 'Intelligence Library', desc: '15+ daily insights from 50 elite sources' },
              { icon: '💼', label: 'Pitch Decks', desc: 'Auto-generate investor presentations' },
              { icon: '💡', label: 'Chat Suggestions', desc: 'Psychology + framework-driven prompts' },
              { icon: '🔐', label: 'Premium Only', desc: 'Segregated intelligence tier' },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-xl border border-border bg-secondary/20">
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="text-sm font-medium mb-1">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Implementation Checklist */}
        <div className="rounded-2xl border border-border bg-card/50 p-8 mb-16">
          <h2 className="font-display text-2xl mb-6">Implementation Status</h2>
          <div className="space-y-3">
            {[
              'CompetitorBenchmark entity + overlay on Analytics',
              'AgentTask entity with dependencies + Task Queue UI',
              'StrategicIntelligence entity + IntelligenceLibraryBrowser',
              'intelligenceIngestPipeline function (15 sources, Groq-powered)',
              'Daily 11pm EST automation refreshing intelligence library',
              'generatePitchDeck function (12-slide investor deck)',
              'PresentationGenerator UI in Analytics',
              'ChatAutoSuggestions with psychology/framework context',
              'Integration into Vision Cortex (9 new tabs)',
              'Elite client positioning + pricing model',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-green-500/20 bg-green-500/5">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-xs text-foreground/80">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Strategic Minds Advisory is now a premium intelligence platform for institutional decision-makers. Every feature is designed to support high-stakes, high-value venture creation.
          </p>
          <Link to="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full btn-ivory font-medium">
            <Brain className="w-5 h-5" />
            Access Elite Intelligence Platform
          </Link>
        </div>
      </div>
    </div>
  );
}