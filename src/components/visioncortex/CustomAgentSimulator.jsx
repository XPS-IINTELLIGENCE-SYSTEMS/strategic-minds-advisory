import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Play, MessageSquare, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

const AGENT_TYPES = [
  { name: 'Validator', emoji: '✅', color: 'text-green-400', bg: 'bg-green-500/10' },
  { name: 'Strategist', emoji: '♟️', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { name: 'Analyzer', emoji: '🔬', color: 'text-blue-400', bg: 'bg-blue-500/10' },
];

export default function CustomAgentSimulator({ model }) {
  const [agents, setAgents] = useState(
    AGENT_TYPES.map(a => ({
      ...a,
      risk_appetite: 0.5,
      skepticism: 0.5,
      aggressiveness: 0.5,
    }))
  );
  const [running, setRunning] = useState(false);
  const [simulation, setSimulation] = useState(null);
  const [debate, setDebate] = useState([]);

  const updateAgentParameter = (agentName, param, value) => {
    setAgents(prev =>
      prev.map(a => a.name === agentName ? { ...a, [param]: value } : a)
    );
  };

  const runSimulation = async () => {
    if (!model) return;

    setRunning(true);
    setDebate([]);

    try {
      // Generate simulation with custom agent personalities
      const simulationResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `Run a 3-round multi-agent debate on this business model with specific personality parameters:

BUSINESS MODEL: ${model.name}
DESCRIPTION: ${model.description}

AGENTS WITH CUSTOM PERSONALITIES:
${agents.map(a => `- ${a.name}: Risk Appetite=${(a.risk_appetite * 100).toFixed(0)}%, Skepticism=${(a.skepticism * 100).toFixed(0)}%, Aggressiveness=${(a.aggressiveness * 100).toFixed(0)}%`).join('\n')}

Simulate a 3-round debate where each agent responds with their personality applied. Higher risk_appetite = more bold, higher skepticism = more critical, higher aggressiveness = more assertive tone.

Provide the output as a JSON array with 3 messages (one per agent). Each message should include agent name, message content, and a brief sentiment/confidence.`,
        response_json_schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              agent: { type: 'string' },
              message: { type: 'string' },
              confidence: { type: 'number' },
              tone: { type: 'string' },
            },
          },
        },
      });

      setDebate(simulationResponse);

      // Log simulation
      await base44.entities.VisionLog.create({
        session_id: `custom_sim_${model.id}_${Date.now()}`,
        agent: 'CustomSimulator',
        log_type: 'debate',
        message: 'Custom agent personality simulation completed',
        idea_id: model.id,
        metadata: JSON.stringify({
          agent_config: agents,
          debate_length: simulationResponse.length,
        }),
      });
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 p-6 overflow-y-auto">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 border border-border">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-5 h-5 text-accent" />
          <div>
            <h3 className="font-medium text-foreground">Custom Agent Simulator</h3>
            <p className="text-xs text-muted-foreground">Configure agent personalities and run simulations</p>
          </div>
        </div>

        {!model && (
          <p className="text-sm text-muted-foreground">Select a business model to begin</p>
        )}
      </div>

      {/* Agent Configuration */}
      {model && (
        <>
          <div className="space-y-4">
            {agents.map(agent => (
              <div key={agent.name} className={`rounded-2xl p-5 border border-border ${agent.bg}`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{agent.emoji}</span>
                  <h4 className={`font-bold text-lg ${agent.color}`}>{agent.name}</h4>
                </div>

                <div className="space-y-4">
                  {/* Risk Appetite */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-xs font-medium text-foreground">Risk Appetite</label>
                      <span className="text-xs font-bold text-accent">{(agent.risk_appetite * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={agent.risk_appetite}
                      onChange={(e) => updateAgentParameter(agent.name, 'risk_appetite', parseFloat(e.target.value))}
                      className="w-full h-2 bg-secondary/40 rounded-lg appearance-none cursor-pointer accent-accent"
                    />
                    <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                      <span>Conservative</span>
                      <span>Moderate</span>
                      <span>Aggressive</span>
                    </div>
                  </div>

                  {/* Skepticism */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-xs font-medium text-foreground">Skepticism</label>
                      <span className="text-xs font-bold text-accent">{(agent.skepticism * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={agent.skepticism}
                      onChange={(e) => updateAgentParameter(agent.name, 'skepticism', parseFloat(e.target.value))}
                      className="w-full h-2 bg-secondary/40 rounded-lg appearance-none cursor-pointer accent-accent"
                    />
                    <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                      <span>Trusting</span>
                      <span>Balanced</span>
                      <span>Critical</span>
                    </div>
                  </div>

                  {/* Aggressiveness */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-xs font-medium text-foreground">Aggressiveness</label>
                      <span className="text-xs font-bold text-accent">{(agent.aggressiveness * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={agent.aggressiveness}
                      onChange={(e) => updateAgentParameter(agent.name, 'aggressiveness', parseFloat(e.target.value))}
                      className="w-full h-2 bg-secondary/40 rounded-lg appearance-none cursor-pointer accent-accent"
                    />
                    <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                      <span>Diplomatic</span>
                      <span>Assertive</span>
                      <span>Dominating</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Run Button */}
          <Button
            onClick={runSimulation}
            disabled={running}
            className="btn-ivory rounded-lg w-full"
          >
            {running ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running Simulation...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Simulation
              </>
            )}
          </Button>

          {/* Debate Output */}
          {debate.length > 0 && (
            <div className="glass-card rounded-2xl p-6 border border-border space-y-4">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-accent" />
                Simulation Debate
              </h4>

              <div className="space-y-4">
                {debate.map((msg, idx) => {
                  const agentInfo = AGENT_TYPES.find(a => a.name === msg.agent);
                  return (
                    <div key={idx} className={`rounded-2xl p-4 border border-border ${agentInfo?.bg || 'bg-secondary/30'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-bold ${agentInfo?.color}`}>
                          {agentInfo?.emoji} {msg.agent}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Confidence: {(msg.confidence * 100).toFixed(0)}%
                        </span>
                      </div>

                      <div className="prose prose-sm prose-invert max-w-none text-sm mb-2">
                        <ReactMarkdown className="text-foreground/90">
                          {msg.message}
                        </ReactMarkdown>
                      </div>

                      <div className="text-[10px] text-muted-foreground italic">
                        Tone: {msg.tone}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}