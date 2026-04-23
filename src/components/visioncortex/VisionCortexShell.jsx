import React, { useState } from 'react';
import VisionFeed from './VisionFeed';
import VisionIdeaBoard from './VisionIdeaBoard';
import VisionIdeaDetail from './VisionIdeaDetail';
import VisionLogs from './VisionLogs';
import { Brain, Rss, Lightbulb, ScrollText, Cpu } from 'lucide-react';

const TABS = [
  { id: 'feed', icon: Rss, label: 'Intelligence Feed' },
  { id: 'board', icon: Lightbulb, label: 'Idea Board' },
  { id: 'logs', icon: ScrollText, label: 'Agent Logs' },
];

const AGENTS = [
  { name: 'Analyzer', emoji: '🔬', color: 'text-blue-400' },
  { name: 'Visionary', emoji: '🌌', color: 'text-purple-400' },
  { name: 'Strategist', emoji: '♟️', color: 'text-amber-400' },
  { name: 'Inventor', emoji: '⚗️', color: 'text-green-400' },
  { name: 'Predictor', emoji: '📡', color: 'text-cyan-400' },
  { name: 'Coder', emoji: '💻', color: 'text-orange-400' },
  { name: 'Marketer', emoji: '📢', color: 'text-pink-400' },
  { name: 'Validator', emoji: '✅', color: 'text-emerald-400' },
  { name: 'Documentor', emoji: '📋', color: 'text-yellow-400' },
];

export default function VisionCortexShell() {
  const [activeTab, setActiveTab] = useState('feed');
  const [selectedIdea, setSelectedIdea] = useState(null);

  if (selectedIdea) {
    return (
      <div className="h-full flex flex-col">
        <VisionIdeaDetail idea={selectedIdea} onBack={() => setSelectedIdea(null)} onUpdate={setSelectedIdea} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-6 pt-5 pb-4 border-b border-border bg-card/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500/20 to-accent/20 border border-accent/30 flex items-center justify-center">
              <Brain className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="font-display text-xl text-gradient-ivory">Vision Cortex</h2>
              <p className="text-xs text-muted-foreground mt-0.5">9-Agent AI Invention Collective · Operating 24/7</p>
            </div>
            <div className="hidden md:flex items-center gap-1.5 ml-4 px-3 py-1.5 rounded-full border border-green-500/30 bg-green-500/10">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-400">All Agents Active</span>
            </div>
          </div>
        </div>

        {/* Agent strip */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {AGENTS.map(a => (
            <div key={a.name} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-secondary/30 flex-shrink-0">
              <span className="text-xs">{a.emoji}</span>
              <span className={`text-xs ${a.color}`}>{a.name}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm border transition-all ${
                  activeTab === t.id ? 'btn-ivory border-transparent' : 'border-border bg-secondary/30 text-muted-foreground hover:text-foreground'
                }`}>
                <Icon className="w-4 h-4" />{t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'feed' && <VisionFeed />}
        {activeTab === 'board' && <VisionIdeaBoard onSelectIdea={setSelectedIdea} />}
        {activeTab === 'logs' && <VisionLogs />}
      </div>
    </div>
  );
}