import React, { useState, useRef, useEffect } from 'react';
import { Menu, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTabState } from '@/hooks/useTabState';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import MobileSidebarDrawer from '@/components/dashboard/MobileSidebarDrawer';
import ChatPanel from '@/components/dashboard/EnhancedChatPanel';
import AccountSettings from '@/components/dashboard/AccountSettings';
import SystemAuditDashboard from '@/components/dashboard/SystemAuditDashboard';
import SupabaseStatusDashboard from '@/components/dashboard/SupabaseStatusDashboard';
import SchemaEditor from '@/components/dashboard/SchemaEditor';
import VoiceInputButton from '@/components/mobile/VoiceInputButton';
import SimulationTool from '@/components/dashboard/SimulationTool';
import PredictionTool from '@/components/dashboard/PredictionTool';
import PromptLibraryPanel from '@/components/dashboard/PromptLibraryPanel';
import ScrapingDashboard from '@/components/dashboard/ScrapingDashboard';
import SimulationWithScraping from '@/components/dashboard/SimulationWithScraping';
import PromptLibraryManager from '@/components/dashboard/PromptLibraryManager';
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
import InvestorOutreachDashboard from '@/components/dashboard/InvestorOutreachDashboard';
import MarketIntelligenceChat from '@/components/dashboard/MarketIntelligenceChat';
import CompetitorBattlecard from '@/components/dashboard/CompetitorBattlecard';
import WorkflowEnginePanel from '@/components/dashboard/WorkflowEnginePanel';
import PredictiveModelingDashboard from '@/components/dashboard/PredictiveModelingDashboard';
import DeploymentPanel from '@/components/dashboard/DeploymentPanel';
import PitchDeckGeneratorModule from '@/components/dashboard/PitchDeckGeneratorModule';
import VoiceToStrategyModule from '@/components/dashboard/VoiceToStrategyModule';
import CompetitiveAnalysisTool from '@/components/dashboard/CompetitiveAnalysisTool';
import DataHealthDashboard from '@/components/dashboard/DataHealthDashboard';
import ExecutiveSummaryModule from '@/components/dashboard/ExecutiveSummaryModule';
import FinancialModelingDashboard from '@/components/dashboard/FinancialModelingDashboard';
import CollaborativeWhiteboardModule from '@/components/dashboard/CollaborativeWhiteboardModule';
import DailyDigestModule from '@/components/dashboard/DailyDigestModule';
import PortfolioManagementModule from '@/components/dashboard/PortfolioManagementModule';
import AgentDebateHistoryDashboard from '@/components/dashboard/AgentDebateHistoryDashboard';
import ExternalIntelligenceIntegrator from '@/components/dashboard/ExternalIntelligenceIntegrator';
import StrategyPlaybookLibrary from '@/components/dashboard/StrategyPlaybookLibrary';
import MarketKeywordMonitor from '@/components/dashboard/MarketKeywordMonitor';
import DecisionToTasksConverter from '@/components/dashboard/DecisionToTasksConverter';
import InteractivePlaybookGenerator from '@/components/dashboard/InteractivePlaybookGenerator';

export default function Dashboard() {
  const [activeTool, setActiveTool] = useState('simulation');
  const [chatSeed, setChatSeed] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // Tab state preservation: store scroll position and component state per tab
  const tabStatesRef = useRef({});
  const contentScrollRef = useRef(null);
  const { saveScrollPosition } = useTabState(activeTool);

  const handlePromptSelect = (prompt) => {
    setChatSeed(prompt);
  };

  const handleToolChange = (tool) => {
    // Save scroll position of current tool before switching
    if (contentScrollRef.current) {
      if (!tabStatesRef.current[activeTool]) {
        tabStatesRef.current[activeTool] = {};
      }
      tabStatesRef.current[activeTool].scrollPosition = contentScrollRef.current.scrollTop;
    }
    
    setActiveTool(tool);
  };

  // Restore scroll position when tab changes
  useEffect(() => {
    if (contentScrollRef.current && tabStatesRef.current[activeTool]?.scrollPosition !== undefined) {
      setTimeout(() => {
        if (contentScrollRef.current) {
          contentScrollRef.current.scrollTop = tabStatesRef.current[activeTool].scrollPosition;
        }
      }, 0);
    }
  }, [activeTool]);

  // Integrate saveScrollPosition into scroll event
  const handleScroll = () => {
    saveScrollPosition();
    if (contentScrollRef.current && !tabStatesRef.current[activeTool]) {
      tabStatesRef.current[activeTool] = {};
    }
    if (contentScrollRef.current) {
      tabStatesRef.current[activeTool].scrollPosition = contentScrollRef.current.scrollTop;
    }
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
      case 'investor-pipeline': return <InvestorOutreachDashboard />;
      case 'battlecard': return <CompetitorBattlecard />;
      case 'intelligence': return <MarketIntelligenceChat />;
      case 'workflows': return <WorkflowEnginePanel />;
      case 'predict': return <PredictiveModelingDashboard />;
      case 'deploy': return <DeploymentPanel />;
      case 'pitch': return <PitchDeckGeneratorModule />;
      case 'voice': return <VoiceToStrategyModule />;
      case 'whiteboard': return <CollaborativeWhiteboardModule />;
      case 'digest': return <DailyDigestModule />;
      case 'portfolio': return <PortfolioManagementModule />;
      case 'debate-history': return <AgentDebateHistoryDashboard />;
      case 'integrations': return <ExternalIntelligenceIntegrator />;
      case 'playbooks': return <StrategyPlaybookLibrary />;
      case 'keywords': return <MarketKeywordMonitor />;
      case 'execution': return <DecisionToTasksConverter />;
      case 'playbook-gen': return <InteractivePlaybookGenerator />;
      case 'scraping': return <ScrapingDashboard />;
      case 'scrape-simulate': return <SimulationWithScraping />;
      case 'prompt-library': return <PromptLibraryManager />;
      case 'account': return <AccountSettings />;
      case 'schema-editor': return <SchemaEditor />;
      case 'competitive-analysis': return <CompetitiveAnalysisTool />;
      case 'data-health': return <DataHealthDashboard />;
      case 'voice': return <VoiceToStrategyModule />;
      case 'reports': return <ExecutiveSummaryModule />;
      case 'financials': return <FinancialModelingDashboard />;
      case 'audit': return <SystemAuditDashboard />;
      case 'supabase': return <SupabaseStatusDashboard />;
      default: return <SimulationTool />;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden" style={{ paddingLeft: 'env(safe-area-inset-left)', paddingRight: 'env(safe-area-inset-right)' }}>
      <VoiceInputButton />
      <MobileSidebarDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        activeTool={activeTool}
        setActiveTool={handleToolChange}
      />

      {/* Left sidebar nav - hidden on mobile */}
      <div className="hidden md:flex">
        <DashboardSidebar activeTool={activeTool} setActiveTool={handleToolChange} />
      </div>

      {/* Chat panel - slide in/out */}
      <motion.div
        animate={{ width: chatOpen ? 384 : 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
        className="hidden xl:flex overflow-hidden border-r border-border flex-col bg-background"
      >
        <ChatPanel seed={chatSeed} onSeedConsumed={() => setChatSeed(null)} />
      </motion.div>

      {/* Main tool panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <div className="h-14 border-b border-border flex items-center justify-between px-4 md:px-6 flex-shrink-0 bg-card/40 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden p-1.5 rounded-lg hover:bg-secondary transition"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className="hidden xl:flex p-1.5 rounded-lg hover:bg-secondary transition"
              title={chatOpen ? 'Close chat' : 'Open chat'}
            >
              <MessageCircle className="w-5 h-5" />
            </button>
            <h1 className="font-display text-lg capitalize text-gradient-ivory">
              {activeTool === 'scraping' ? 'Scraping Dashboard' :
               activeTool === 'scrape-simulate' ? 'Scrape → Simulate' :
               activeTool === 'prompt-library' ? 'Prompt Library Manager' :
               activeTool === 'prompts' ? 'Prompt Library' :
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
               activeTool === 'investors' ? 'Investor Outreach' :
               activeTool === 'intelligence' ? 'Market Intelligence AI' :
               activeTool === 'investor-pipeline' ? 'Investor Pipeline' :
               activeTool === 'battlecard' ? 'Competitor Battlecard' :
               activeTool === 'workflows' ? 'Trigger-Action Workflows' :
               activeTool === 'predict' ? 'Predictive Modeling' :
               activeTool === 'deploy' ? 'Deploy to Google Tasks' :
               activeTool === 'pitch' ? 'Investor Pitch Decks' :
               activeTool === 'voice' ? 'Voice-to-Strategy Intelligence' :
               activeTool === 'whiteboard' ? 'Collaborative Whiteboard' :
               activeTool === 'digest' ? 'Daily Strategic Digest' :
               activeTool === 'portfolio' ? 'Portfolio Management' :
               activeTool === 'debate-history' ? 'Agent Debate History' :
               activeTool === 'integrations' ? 'External Intelligence Integrator' :
               activeTool === 'playbooks' ? 'Strategy Playbook Library' :
               activeTool === 'keywords' ? 'Market Keyword Monitor' :
               activeTool === 'execution' ? 'Decision to Tasks Converter' :
               activeTool === 'playbook-gen' ? 'Strategy Playbooks' :
               activeTool === 'account' ? 'Account Settings' :
               activeTool === 'reports' ? 'Executive Summary Report' :
               activeTool === 'financials' ? 'Financial Modeling' :
               activeTool === 'voice' ? 'Voice to Strategy Intelligence' :
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
        <div 
          ref={contentScrollRef}
          className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-secondary scrollbar-track-background" 
          data-tool-content
          onScroll={handleScroll}
        >
          <div className="px-4 md:px-6">
            {renderTool()}
          </div>
        </div>
      </div>
    </div>
  );
}