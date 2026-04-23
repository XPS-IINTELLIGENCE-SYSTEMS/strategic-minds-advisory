import React, { useState } from 'react';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import ChatPanel from '@/components/dashboard/ChatPanel';
import SimulationTool from '@/components/dashboard/SimulationTool';
import PredictionTool from '@/components/dashboard/PredictionTool';
import PromptLibraryPanel from '@/components/dashboard/PromptLibraryPanel';
import AutomationPanel from '@/components/dashboard/AutomationPanel';
import TemplateLibrary from '@/components/dashboard/TemplateLibrary';
import TestModule from '@/components/dashboard/TestModule';
import InsightsPanel from '@/components/dashboard/InsightsPanel';
import SyncPanel from '@/components/dashboard/SyncPanel';
import ContentEngine from '@/components/dashboard/ContentEngine';
import WorkflowOrchestrator from '@/components/dashboard/WorkflowOrchestrator';
import BrandingStudio from '@/components/dashboard/BrandingStudio';
import SocialIntelligencePanel from '@/components/dashboard/SocialIntelligencePanel';
import VisionCortexShell from '@/components/visioncortex/VisionCortexShell';
import ReportingAndAlerts from '@/components/dashboard/ReportingAndAlerts';
import CollaborativeWorkspace from '@/components/dashboard/CollaborativeWorkspace';
import PitchDeckGenerator from '@/components/dashboard/PitchDeckGenerator';
import RealTimeAlertsDashboard from '@/components/dashboard/RealTimeAlertsDashboard';

export default function Dashboard() {
  const [activeTool, setActiveTool] = useState('simulation');
  const [chatSeed, setChatSeed] = useState(null);

  const handlePromptSelect = (prompt) => {
    setChatSeed(prompt);
  };

  const renderTool = () => {
    switch (activeTool) {
      case 'simulation': return <SimulationTool />;
      case 'prediction': return <PredictionTool />;
      case 'prompts': return <PromptLibraryPanel onSelectPrompt={handlePromptSelect} />;
      case 'automation': return <AutomationPanel />;
      case 'templates': return <TemplateLibrary />;
      case 'insights': return <InsightsPanel />;
      case 'content': return <ContentEngine />;
      case 'sync': return <SyncPanel />;
      case 'visioncortex': return <VisionCortexShell />;
      case 'workflow': return <WorkflowOrchestrator />;
      case 'branding': return <BrandingStudio />;
      case 'social': return <SocialIntelligencePanel />;
      case 'test': return <TestModule />;
      case 'reports': return <ReportingAndAlerts />;
      case 'workspace': return <CollaborativeWorkspace />;
      case 'pitch': return <PitchDeckGenerator />;
      case 'alerts': return <RealTimeAlertsDashboard />;
      default: return <SimulationTool />;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Left sidebar nav */}
      <DashboardSidebar activeTool={activeTool} setActiveTool={setActiveTool} />

      {/* Chat panel - always on left */}
      <div className="w-80 xl:w-96 flex-shrink-0 border-r border-border flex flex-col">
        <ChatPanel seed={chatSeed} onSeedConsumed={() => setChatSeed(null)} />
      </div>

      {/* Main tool panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <div className="h-14 border-b border-border flex items-center justify-between px-6 flex-shrink-0 bg-card/40 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-lg capitalize text-gradient-ivory">
              {activeTool === 'prompts' ? 'Prompt Library' :
               activeTool === 'test' ? 'System Tests' :
               activeTool === 'insights' ? 'Insights' :
               activeTool === 'content' ? 'Content Engine' :
               activeTool === 'sync' ? 'Google Sync' :
               activeTool === 'visioncortex' ? 'Vision Cortex' :
               activeTool === 'workflow' ? 'Workflow Orchestrator' :
               activeTool === 'branding' ? 'Branding Studio' :
               activeTool === 'social' ? 'Social Intelligence' :
               activeTool === 'reports' ? 'Reports & Alerts' :
               activeTool === 'workspace' ? 'Team Workspace' :
               activeTool === 'pitch' ? 'Pitch Deck Generator' :
               activeTool === 'alerts' ? 'Real-Time Alerts' :
               activeTool.charAt(0).toUpperCase() + activeTool.slice(1)}
            </h1>
            <span className="hidden md:block text-xs text-muted-foreground border border-border rounded-full px-2.5 py-1">
              Groq · llama-3.3-70b-versatile
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-muted-foreground hidden sm:block">All Systems Online</span>
          </div>
        </div>

        {/* Tool content */}
        <div className="flex-1 overflow-hidden">
          {renderTool()}
        </div>
      </div>
    </div>
  );
}