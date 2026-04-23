import React, { useState } from 'react';
import VisionFeed from './VisionFeed';
import VisionIdeaBoard from './VisionIdeaBoard';
import VisionIdeaDetail from './VisionIdeaDetail';
import VisionLogs from './VisionLogs';
import AgentDebateChat from './AgentDebateChat';
import GlobalTrendsMap from './GlobalTrendsMap';
import ActiveSandbox from './ActiveSandbox';
import IdeaWhiteboard from './IdeaWhiteboard';
import IdeaAnalytics from './IdeaAnalytics';
import DeploymentEngine from './DeploymentEngine';
import AutoGenerationMonitor from './AutoGenerationMonitor';
import TaskQueue from './TaskQueue';
import IntelligenceLibraryBrowser from './IntelligenceLibraryBrowser';
import MultiAgentStressTest from './MultiAgentStressTest';
import { Brain, Rss, Lightbulb, ScrollText, MessageSquare, Globe, Terminal, StickyNote, BarChart3, Rocket, Cpu, CheckSquare, Library, Zap } from 'lucide-react';

const TABS = [
  { id: 'autogen',      icon: Cpu,            label: '24/7 Auto-Gen' },
  { id: 'feed',         icon: Rss,            label: 'Intelligence Feed' },
  { id: 'library',      icon: Library,        label: 'Intelligence Lib' },
  { id: 'map',          icon: Globe,          label: 'Global Trends' },
  { id: 'board',        icon: Lightbulb,      label: 'Idea Board' },
  { id: 'whiteboard',   icon: StickyNote,     label: 'Whiteboard' },
  { id: 'analytics',    icon: BarChart3,      label: 'Analytics' },
  { id: 'stress',       icon: Zap,            label: 'Stress Test' },
  { id: 'tasks',        icon: CheckSquare,    label: 'Task Queue' },
  { id: 'debate',       icon: MessageSquare,  label: 'Debate' },
  { id: 'sandbox',      icon: Terminal,       label: 'Sandbox' },
  { id: 'deploy',       icon: Rocket,         label: 'Deploy' },
  { id: 'logs',         icon: ScrollText,     label: 'Logs' },
];

const AGENTS = [
  { name: 'Analyzer',   emoji: '🔬', color: 'text-blue-400' },
  { name: 'Visionary',  emoji: '🌌', color: 'text-purple-400' },
  { name: 'Strategist', emoji: '♟️', color: 'text-amber-400' },
  { name: 'Inventor',   emoji: '⚗️', color: 'text-green-400' },
  { name: 'Predictor',  emoji: '📡', color: 'text-cyan-400' },
  { name: 'Coder',      emoji: '💻', color: 'text-orange-400' },
  { name: 'Marketer',   emoji: '📢', color: 'text-pink-400' },
  { name: 'Validator',  emoji: '✅', color: 'text-emerald-400' },
  { name: 'Documentor', emoji: '📋', color: 'text-yellow-400' },
];

export default function VisionCortexShell() {
  const [activeTab, setActiveTab] = useState('feed');
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [detailIdea, setDetailIdea] = useState(null);

  if (detailIdea) {
    return (
      <div className="h-full flex flex-col">
        <VisionIdeaDetail idea={detailIdea} onBack={() => setDetailIdea(null)} onUpdate={setDetailIdea} />
      </div>
    );
  }

  const handleSelectIdea = (idea) => {
    setSelectedIdea(idea);
    // If clicking from board, open detail; debate/sandbox use selected idea
  };

  const handleIdeaDetail = (idea) => {
    setDetailIdea(idea);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-6 pt-5 pb-0 border-b border-border bg-card/30">
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
            {selectedIdea && (
              <div className="hidden lg:flex items-center gap-1.5 ml-2 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/10">
                <span className="text-xs text-accent truncate max-w-36">💡 {selectedIdea.title}</span>
              </div>
            )}
          </div>
        </div>

        {/* Agent strip */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {AGENTS.map(a => (
            <div key={a.name} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-secondary/30 flex-shrink-0">
              <span className="text-xs">{a.emoji}</span>
              <span className={`text-xs ${a.color} hidden md:block`}>{a.name}</span>
              <span className={`text-xs ${a.color} md:hidden`}>{a.emoji}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-3 overflow-x-auto pb-0">
          {TABS.map(t => {
            const Icon = t.icon;
            const needsIdea = (t.id === 'debate' || t.id === 'sandbox' || t.id === 'deploy') && !selectedIdea;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs border-b-2 transition-all whitespace-nowrap flex-shrink-0 ${
                  activeTab === t.id
                    ? 'border-accent text-accent'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}>
                <Icon className="w-3.5 h-3.5" />
                {t.label}
                {needsIdea && !selectedIdea && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'autogen'      && <div className="h-full overflow-y-auto"><div className="max-w-5xl mx-auto p-6"><AutoGenerationMonitor /></div></div>}
        {activeTab === 'feed'         && <VisionFeed />}
        {activeTab === 'library'      && <IntelligenceLibraryBrowser />}
        {activeTab === 'map'          && <GlobalTrendsMap />}
        {activeTab === 'board'        && <VisionIdeaBoard onSelectIdea={(idea) => { setSelectedIdea(idea); setDetailIdea(idea); }} />}
        {activeTab === 'whiteboard'   && <IdeaWhiteboard />}
        {activeTab === 'analytics'    && <IdeaAnalytics />}
        {activeTab === 'stress'       && <MultiAgentStressTest idea={selectedIdea} />}
        {activeTab === 'tasks'        && <TaskQueue />}
        {activeTab === 'debate'       && <AgentDebateChat idea={selectedIdea} />}
        {activeTab === 'sandbox'      && <ActiveSandbox idea={selectedIdea} />}
        {activeTab === 'deploy'       && <DeploymentEngine />}
        {activeTab === 'logs'         && <VisionLogs />}
      </div>
    </div>
  );
}