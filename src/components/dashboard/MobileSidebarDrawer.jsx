import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X, Brain, BarChart3, Library, Zap, TrendingUp, TrendingDown, MessageSquare,
  Globe, Network, Database, FileText, Mic, Activity, Settings, Home,
  PenTool, Users, BookOpen, Lightbulb, Rocket
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_GROUPS = [
  {
    label: 'Guides',
    items: [
      { id: 'auto-invention', icon: Lightbulb, label: 'Auto Invention System', action: 'navigate', to: '/auto-invention' },
      { id: 'elite-intelligence', icon: Rocket, label: 'Elite Intelligence', action: 'navigate', to: '/elite-intelligence' },
      { id: 'projects', icon: Network, label: 'Project Dashboard', action: 'navigate', to: '/projects' },
    ],
  },
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
      { id: 'scraping', icon: Globe, label: 'Scraping' },
      { id: 'scrape-simulate', icon: Network, label: 'Scrape & Simulate' },
      { id: 'insights', icon: BarChart3, label: 'Insights' },
    ],
  },
  {
    label: 'Strategy',
    items: [
      { id: 'intelligence', icon: Brain, label: 'Intelligence' },
      { id: 'playbook-gen', icon: BookOpen, label: 'Playbooks' },
      { id: 'prompt-library', icon: PenTool, label: 'Prompts' },
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
    label: 'Reporting',
    items: [
      { id: 'reports', icon: FileText, label: 'Executive Summary' },
      { id: 'financials', icon: TrendingUp, label: 'Financial Models' },
      { id: 'voice', icon: Mic, label: 'Voice to Strategy' },
    ],
  },
  {
    label: 'Dev & Admin',
    items: [
      { id: 'schema-editor', icon: Database, label: 'Schema Editor' },
      { id: 'audit', icon: Activity, label: 'System Audit' },
      { id: 'supabase', icon: Database, label: 'Supabase Status' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { id: 'account', icon: Settings, label: 'Account' },
    ],
  },
];

export default function MobileSidebarDrawer({ isOpen, onClose, activeTool, setActiveTool }) {
  const navigate = useNavigate();

  const handleSelectTool = (item) => {
    if (item.action === 'navigate' && item.to) {
      navigate(item.to);
    } else {
      setActiveTool(item.id);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="md:hidden fixed inset-0 bg-black/60 z-40"
          />

          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="md:hidden fixed left-0 top-0 h-screen w-72 bg-card border-r border-border flex flex-col z-50"
          >
            {/* Header */}
            <div className="h-14 border-b border-border flex items-center justify-between px-4 flex-shrink-0">
              <span className="font-display text-lg text-gradient-accent">Strategic.AI</span>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 py-4 overflow-y-auto px-2 space-y-4">
              {NAV_GROUPS.map(group => (
                <div key={group.label}>
                  <div className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground/50 px-3 mb-2">
                    {group.label}
                  </div>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const { id, icon: Icon, label } = item;
                      const active = activeTool === id;
                      return (
                        <button
                          key={id}
                          onClick={() => handleSelectTool(item)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                            active
                              ? 'bg-accent/15 text-accent'
                              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                          }`}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span>{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-border">
              <Link
                to="/"
                onClick={onClose}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition"
              >
                <Home className="w-4 h-4 flex-shrink-0" />
                <span>Back to Site</span>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}