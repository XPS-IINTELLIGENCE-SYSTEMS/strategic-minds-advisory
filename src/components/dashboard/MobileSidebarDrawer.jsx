import React from 'react';
import { X, Brain, Rss, Lightbulb, ScrollText, MessageSquare, Globe, Terminal, StickyNote, BarChart3, Rocket, Cpu, CheckSquare, Library, Zap, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
      { id: 'prediction', icon: TrendingDown, label: 'Prediction' },
      { id: 'insights', icon: BarChart3, label: 'Insights' },
    ],
  },
  {
    label: 'Strategy',
    items: [
      { id: 'intelligence', icon: Brain, label: 'Intelligence' },
      { id: 'playbook-gen', icon: Library, label: 'Playbooks' },
      { id: 'alerts', icon: Zap, label: 'Alerts' },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { id: 'workspace', icon: MessageSquare, label: 'Team' },
      { id: 'investor-pipeline', icon: TrendingDown, label: 'Investors' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { id: 'account', icon: Zap, label: 'Account' },
    ],
  },
];

export default function MobileSidebarDrawer({ isOpen, onClose, activeTool, setActiveTool }) {
  const handleSelectTool = (id) => {
    setActiveTool(id);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="md:hidden fixed inset-0 bg-black/50 z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="md:hidden fixed left-0 top-0 h-screen w-72 bg-card border-r border-border flex flex-col z-50 safe-area-left"
          >
            {/* Header */}
            <div className="h-14 border-b border-border flex items-center justify-between px-4 flex-shrink-0">
              <span className="font-display text-lg text-gradient-accent">Strategic.AI</span>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-secondary transition"
              >
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
                    {group.items.map(({ id, icon: Icon, label }) => {
                      const active = activeTool === id;
                      return (
                        <button
                          key={id}
                          onClick={() => handleSelectTool(id)}
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}