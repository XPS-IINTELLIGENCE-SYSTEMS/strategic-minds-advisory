import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Zap, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AGENTS = [
  { name: 'Validator', emoji: '✅', color: '#10b981', feedback_style: 'critical' },
  { name: 'Strategist', emoji: '♟️', color: '#f59e0b', feedback_style: 'strategic' },
  { name: 'Analyzer', emoji: '🔬', color: '#3b82f6', feedback_style: 'analytical' },
];

export default function CollaborativeWhiteboardModule() {
  const [intelligence, setIntelligence] = useState([]);
  const [canvas, setCanvas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [clusterFeedback, setClusterFeedback] = useState({});
  const [draggedNode, setDraggedNode] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    loadIntelligence();
  }, []);

  const loadIntelligence = async () => {
    try {
      const data = await base44.entities.StrategicIntelligence.list();
      setIntelligence(data.slice(0, 20));
    } catch (error) {
      console.error('Failed to load intelligence:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e, intel) => {
    setDraggedNode(intel);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDropOnCanvas = (e) => {
    e.preventDefault();
    if (!draggedNode || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const nodeId = `node_${Date.now()}`;
    setCanvas(prev => [...prev, {
      id: nodeId,
      intel_id: draggedNode.id,
      title: draggedNode.title,
      type: draggedNode.intelligence_type,
      x,
      y,
      agents: [],
    }]);

    setDraggedNode(null);
  };

  const addAgentAnchor = async (nodeId, agentName) => {
    const node = canvas.find(n => n.id === nodeId);
    if (!node) return;

    // Get AI feedback from agent
    const feedbackResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a ${agentName} AI providing strategic feedback on this intelligence signal:

SIGNAL: ${node.title}
TYPE: ${node.type}

As a ${agentName}, provide a ${AGENTS.find(a => a.name === agentName).feedback_style} assessment in 2-3 sentences.`,
    });

    // Update node with agent feedback
    setCanvas(prev => prev.map(n => 
      n.id === nodeId 
        ? { 
            ...n, 
            agents: [...(n.agents || []), {
              name: agentName,
              feedback: feedbackResponse,
            }]
          }
        : n
    ));

    setSelectedCluster(nodeId);
  };

  const removeNode = (nodeId) => {
    setCanvas(prev => prev.filter(n => n.id !== nodeId));
    setSelectedCluster(null);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="h-full flex gap-6 p-6 overflow-hidden">
      {/* Left Panel - Intelligence Nodes */}
      <div className="w-64 flex-shrink-0 flex flex-col gap-4 overflow-y-auto">
        <div>
          <h4 className="font-bold text-accent mb-2">Intelligence Nodes</h4>
          <p className="text-xs text-muted-foreground mb-3">Drag onto canvas</p>
        </div>

        <div className="space-y-2">
          {intelligence.map(intel => (
            <div
              key={intel.id}
              draggable
              onDragStart={(e) => handleDragStart(e, intel)}
              className="p-3 rounded-lg bg-secondary/40 border border-border cursor-move hover:border-accent transition"
            >
              <p className="text-xs font-medium text-foreground truncate">{intel.title}</p>
              <p className="text-[10px] text-muted-foreground mt-1 capitalize">{intel.intelligence_type}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex flex-col">
        <div
          ref={canvasRef}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropOnCanvas}
          className="flex-1 bg-secondary/20 rounded-2xl border border-border relative overflow-auto"
        >
          {canvas.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Drag intelligence nodes here to start brainstorming</p>
            </div>
          )}

          {/* Canvas Nodes */}
          {canvas.map(node => (
            <div
              key={node.id}
              onClick={() => setSelectedCluster(node.id)}
              className={`absolute p-3 rounded-lg border-2 cursor-pointer transition ${
                selectedCluster === node.id
                  ? 'border-accent bg-accent/15'
                  : 'border-border bg-card hover:border-accent'
              }`}
              style={{ left: `${node.x}px`, top: `${node.y}px`, width: '180px' }}
            >
              <p className="text-xs font-medium text-foreground truncate">{node.title}</p>
              {node.agents.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {node.agents.map(a => (
                    <span key={a.name} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/60">
                      {AGENTS.find(ag => ag.name === a.name)?.emoji}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Agent Anchors & Feedback */}
      {selectedCluster && (
        <div className="w-72 flex flex-col gap-4 overflow-y-auto">
          <div>
            <h4 className="font-bold text-accent mb-2">Agent Anchors</h4>
            <p className="text-xs text-muted-foreground mb-3">Add agents for focused feedback</p>
          </div>

          {/* Agent Buttons */}
          <div className="space-y-2">
            {AGENTS.map(agent => {
              const node = canvas.find(n => n.id === selectedCluster);
              const hasAgent = node?.agents?.some(a => a.name === agent.name);

              return (
                <Button
                  key={agent.name}
                  onClick={() => addAgentAnchor(selectedCluster, agent.name)}
                  disabled={hasAgent}
                  className={`w-full rounded-lg ${hasAgent ? 'opacity-40' : ''}`}
                  variant={hasAgent ? 'outline' : 'default'}
                >
                  <span>{agent.emoji}</span>
                  {agent.name}
                </Button>
              );
            })}
          </div>

          {/* Feedback Display */}
          {selectedCluster && canvas.find(n => n.id === selectedCluster)?.agents && (
            <div className="space-y-3 pt-4 border-t border-border">
              {canvas.find(n => n.id === selectedCluster)?.agents.map(agent => (
                <div key={agent.name} className="p-3 rounded-lg bg-secondary/30 border border-border">
                  <p className="text-xs font-bold text-accent mb-2">
                    {AGENTS.find(a => a.name === agent.name)?.emoji} {agent.name}
                  </p>
                  <p className="text-xs text-foreground/80 leading-relaxed">{agent.feedback}</p>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-border">
            <Button
              onClick={() => removeNode(selectedCluster)}
              variant="destructive"
              className="flex-1 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}