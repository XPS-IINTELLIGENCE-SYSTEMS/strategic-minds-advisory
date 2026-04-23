import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, Zap, TrendingUp, BookOpen, Bot, 
  Layout, TestTube, Home, ChevronRight, BarChart3, RefreshCw, PenTool
} from 'lucide-react';

const NAV = [
  { id: 'chat', icon: MessageSquare, label: 'AI Chat' },
  { id: 'simulation', icon: Zap, label: 'Simulation' },
  { id: 'prediction', icon: TrendingUp, label: 'Prediction' },
  { id: 'insights', icon: BarChart3, label: 'Insights' },
  { id: 'content', icon: PenTool, label: 'Content Engine' },
  { id: 'sync', icon: RefreshCw, label: 'Google Sync' },
  { id: 'prompts', icon: BookOpen, label: 'Prompt Library' },
  { id: 'automation', icon: Bot, label: 'Automation' },
  { id: 'templates', icon: Layout, label: 'Templates' },
  { id: 'test', icon: TestTube, label: 'Test Module' },
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
      <nav className="flex-1 py-4 space-y-1 px-2">
        {NAV.map(({ id, icon: Icon, label }) => {
          const active = activeTool === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTool(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group ${
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