import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, Zap, TrendingUp, BookOpen, Bot, 
  Layout, TestTube, Home, ChevronRight, BarChart3, RefreshCw, PenTool,
  Workflow, Video, Globe, Brain, Users, TrendingDown, Network, Send, Settings
} from 'lucide-react';

const NAV_GROUPS = [
  {
    label: 'Vision Cortex',
    items: [
      { id: 'visioncortex', icon: Brain, label: 'Vision Cortex' },
    ],
  },
  {
    label: 'Core AI',
    items: [
      { id: 'chat', icon: MessageSquare, label: 'AI Chat' },
      { id: 'simulation', icon: Zap, label: 'Simulation' },
      { id: 'prediction', icon: TrendingUp, label: 'Prediction' },
      { id: 'insights', icon: BarChart3, label: 'Insights' },
    ],
  },
  {
    label: 'Automation',
    items: [
      { id: 'workflow', icon: Workflow, label: 'Workflows' },
      { id: 'automation', icon: Bot, label: 'Automations' },
    ],
  },
  {
    label: 'Content',
    items: [
      { id: 'content', icon: PenTool, label: 'Content Engine' },
      { id: 'branding', icon: Video, label: 'Branding Studio' },
      { id: 'social', icon: Globe, label: 'Social Intel' },
    ],
  },
  {
    label: 'Collaboration',
    items: [
      { id: 'workspace', icon: Users, label: 'Workspace' },
      { id: 'pitch', icon: PenTool, label: 'Pitch Decks' },
      { id: 'alerts', icon: Bot, label: 'Real-Time Alerts' },
      { id: 'investor-pipeline', icon: Users, label: 'Investor Pipeline' },
      { id: 'battlecard', icon: Zap, label: 'Battlecard' },
      { id: 'intelligence', icon: Brain, label: 'Market Intelligence' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { id: 'prompts', icon: BookOpen, label: 'Prompt Library' },
      { id: 'templates', icon: Layout, label: 'Templates' },
      { id: 'sync', icon: RefreshCw, label: 'Google Sync' },
      { id: 'test', icon: TestTube, label: 'Test Module' },
      { id: 'reports', icon: BookOpen, label: 'Reports & Alerts' },
      { id: 'workflows', icon: Bot, label: 'Workflows' },
      { id: 'predict', icon: TrendingUp, label: 'Predictions' },
      { id: 'deploy', icon: Send, label: 'Deploy Tasks' },
      { id: 'pitch', icon: Zap, label: 'Pitch Decks' },
      { id: 'voice', icon: Zap, label: 'Voice Input' },
      { id: 'whiteboard', icon: Zap, label: 'Whiteboard' },
      { id: 'digest', icon: Zap, label: 'Daily Digest' },
      { id: 'portfolio', icon: Zap, label: 'Portfolio' },
      { id: 'debate-history', icon: Zap, label: 'Debate History' },
      { id: 'integrations', icon: Zap, label: 'Integrations' },
      { id: 'playbooks', icon: Zap, label: 'Playbooks' },
      { id: 'keywords', icon: Zap, label: 'Keyword Alerts' },
      { id: 'execution', icon: Zap, label: 'Decision → Tasks' },
    ],
  },
  {
    label: 'User',
    items: [
      { id: 'account', icon: Settings, label: 'Account Settings' },
    ],
  },
];

export default function DashboardSidebar({ activeTool, setActiveTool }) {
  return (
    <div className="w-16 xl:w-56 flex-shrink-0 border-r border-border flex flex-col bg-card/50">
      {/* Logo */}
      <div className="h-14 border-b border-border flex items-center justify-center xl:justify-start xl:px-4 flex-shrink-0">
        <span className="font-display text-base hidden xl:block">
          Strategic<span className="text-accent">.</span>AI
        </span>
        <span className="font-display text-accent text-lg xl:hidden">S</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto px-2 space-y-4">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <div className="hidden xl:block text-[9px] uppercase tracking-[0.25em] text-muted-foreground/50 px-3 mb-1">{group.label}</div>
            <div className="space-y-0.5">
              {group.items.map(({ id, icon: Icon, label }) => {
                const active = activeTool === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTool(id)}
                    onDoubleClick={() => {
                      const element = document.querySelector('[data-tool-content]');
                      if (element) element.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all group ${
                      active
                        ? 'bg-accent/15 text-accent'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden xl:block text-sm">{label}</span>
                    {active && <ChevronRight className="w-3 h-3 ml-auto hidden xl:block" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-border">
        <Link
          to="/"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition text-sm"
        >
          <Home className="w-4 h-4 flex-shrink-0" />
          <span className="hidden xl:block">Back to Site</span>
        </Link>
      </div>
    </div>
  );
}