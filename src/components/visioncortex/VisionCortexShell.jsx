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
import CustomStressTestBuilder from './CustomStressTestBuilder';
import IntelligenceMatrixDashboard from './IntelligenceMatrixDashboard';
import DebateArenaUI from './DebateArenaUI';
import MultiAgentStressTest from './MultiAgentStressTest';
import RiskScenarioMap from './RiskScenarioMap';
import NetworkVisualizationDashboard from './NetworkVisualizationDashboard';
import CustomAgentSimulator from './CustomAgentSimulator';
import { Brain, Rss, Lightbulb, ScrollText, MessageSquare, Globe, Terminal, StickyNote, BarChart3, Rocket, Cpu, CheckSquare, Library, Zap, TrendingDown } from 'lucide-react';

const TABS = [
  { id: 'autogen',      icon: Cpu,            label: '24/7 Auto-Gen' },
  { id: 'feed',         icon: Rss,            label: 'Intelligence Feed' },
  { id: 'library',      icon: Library,        label: 'Intelligence Lib' },
  { id: 'intel-matrix', icon: Globe,          label: 'Intel Matrix' },
  { id: 'map',          icon: Globe,          label: 'Global Trends' },
  { id: 'board',        icon: Lightbulb,      label: 'Idea Board' },
  { id: 'whiteboard',   icon: StickyNote,     label: 'Whiteboard' },
  { id: 'analytics',    icon: BarChart3,      label: 'Analytics' },
  { id: 'custom-stress',icon: Zap,            label: 'Custom Stress' },
  { id: 'stress',       icon: Zap,            label: 'Stress Test' },
  { id: 'risk-map',     icon: TrendingDown,   label: 'Risk Map' },
  { id: 'tasks',        icon: CheckSquare,    label: 'Task Queue' },
  { id: 'debate-arena', icon: MessageSquare,  label: 'Debate Arena' },
  { id: 'debate',       icon: MessageSquare,  label: 'Debate' },
  { id: 'sandbox',      icon: Terminal,       label: 'Sandbox' },
  { id: 'deploy',       icon: Rocket,         label: 'Deploy' },
  { id: 'network',      icon: Globe,          label: 'Network Map' },
  { id: 'agent-custom', icon: Brain,          label: 'Agent Studio' },
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
    <div className="h-full flex flex-col overflow-hidden bg-gradient-to-br from-background via-background to-background/80">
      {/* Header */}
      <div className="flex-shrink-0 px-4 md:px-6 pt-4 pb-4 border-b border-border bg-card/40 backdrop-blur-md">
        {/* Title Section */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500/25 to-accent/25 border border-accent/40 flex items-center justify-center flex-shrink-0 shadow-lg shadow-accent/20">
              <Brain className="w-6 h-6 text-accent" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-2xl text-gradient-accent leading-tight">Vision Cortex</h2>
              <p className="text-xs text-muted-foreground mt-1">AI Invention Collective • 24/7 Operation</p>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-green-500/30 bg-green-500/10 flex-shrink-0 ml-3">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400 font-medium hidden sm:block">Active</span>
          </div>
        </div>

        {/* Selected Idea Indicator */}
        {selectedIdea && (
          <div className="mb-4 p-2.5 rounded-lg border border-accent/20 bg-accent/5">
            <p className="text-xs text-muted-foreground">Current Idea:</p>
            <p className="text-sm text-accent font-medium truncate">💡 {selectedIdea.title}</p>
          </div>
        )}

        {/* Agent Grid - Compact & Responsive */}
        <div className="mb-4 p-3 rounded-lg border border-border/50 bg-secondary/20">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-2.5 font-semibold">Agent Collective</p>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-9 gap-2">
            {AGENTS.map(a => (
              <div
                key={a.name}
                className="flex flex-col items-center justify-center p-2 rounded-lg border border-border/50 bg-background/40 hover:bg-secondary/50 hover:border-accent/30 transition-all cursor-default group"
                title={a.name}
              >
                <span className="text-lg group-hover:scale-110 transition-transform">{a.emoji}</span>
                <span className="text-[9px] text-muted-foreground group-hover:text-accent transition-colors mt-0.5 hidden lg:block">
                  {a.name.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Navigation - Scrollable with gradient fade */}
        <div className="relative">
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
            {TABS.map(t => {
              const Icon = t.icon;
              const needsIdea = (t.id === 'debate' || t.id === 'sandbox' || t.id === 'deploy') && !selectedIdea;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all ${
                    activeTab === t.id
                      ? 'bg-accent/20 text-accent border border-accent/40 shadow-lg shadow-accent/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-transparent'
                  } ${needsIdea ? 'opacity-60 cursor-not-allowed' : ''}`}
                  disabled={needsIdea}
                  title={needsIdea ? 'Select an idea first' : t.label}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                  {needsIdea && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content - Rich & Interactive */}
      <div className="flex-1 overflow-hidden bg-gradient-to-b from-background/50 to-background">
        {/* Content wrapper with consistent padding */}
        <div className="h-full overflow-y-auto">
          <div className="px-4 md:px-6 py-6 space-y-6 max-w-7xl mx-auto">
            {activeTab === 'autogen'      && <AutoGenerationMonitor />}
            {activeTab === 'feed'         && <VisionFeed />}
            {activeTab === 'library'      && <IntelligenceLibraryBrowser />}
            {activeTab === 'intel-matrix' && <IntelligenceMatrixDashboard />}
            {activeTab === 'map'          && <GlobalTrendsMap />}
            {activeTab === 'board'        && <VisionIdeaBoard onSelectIdea={(idea) => { setSelectedIdea(idea); setDetailIdea(idea); }} />}
            {activeTab === 'whiteboard'   && <IdeaWhiteboard />}
            {activeTab === 'analytics'    && <IdeaAnalytics />}
            {activeTab === 'custom-stress' && <CustomStressTestBuilder onTestStart={() => setActiveTab('debate-arena')} />}
            {activeTab === 'stress'       && <MultiAgentStressTest idea={selectedIdea} />}
            {activeTab === 'risk-map'     && <RiskScenarioMap />}
            {activeTab === 'tasks'        && <TaskQueue />}
            {activeTab === 'debate-arena' && <DebateArenaUI idea={selectedIdea} />}
            {activeTab === 'debate'       && <AgentDebateChat idea={selectedIdea} />}
            {activeTab === 'sandbox'      && <ActiveSandbox idea={selectedIdea} />}
            {activeTab === 'deploy'       && <DeploymentEngine />}
            {activeTab === 'network'      && <NetworkVisualizationDashboard />}
            {activeTab === 'agent-custom' && <CustomAgentSimulator model={selectedIdea} />}
            {activeTab === 'logs'         && <VisionLogs />}
          </div>
        </div>
      </div>
    </div>
  );
}