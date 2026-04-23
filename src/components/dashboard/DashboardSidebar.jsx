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
      { id: 'simulation', icon: Zap, label: 'Simulation' },
      { id: 'prediction', icon: TrendingUp, label: 'Prediction' },
      { id: 'insights', icon: BarChart3, label: 'Insights' },
    ],
  },
  {
    label: 'Strategy',
    items: [
      { id: 'intelligence', icon: Brain, label: 'Intelligence' },
      { id: 'playbooks', icon: BookOpen, label: 'Playbooks' },
      { id: 'playbook-gen', icon: BookOpen, label: 'Playbook Gen' },
      { id: 'alerts', icon: Zap, label: 'Alerts' },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { id: 'workspace', icon: Users, label: 'Team' },
      { id: 'investor-pipeline', icon: TrendingUp, label: 'Investors' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { id: 'account', icon: Settings, label: 'Account' },
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
                    title={label}
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