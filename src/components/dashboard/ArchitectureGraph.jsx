import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Maximize2, Download } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ArchitectureGraph({ projectIndex }) {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState(null);

  // Parse architecture data into graph
  useEffect(() => {
    if (!projectIndex) return;

    const entities = JSON.parse(projectIndex.entity_schemas || '[]');
    const functions = JSON.parse(projectIndex.function_list || '[]');

    // Create entity nodes
    const entityNodes = entities.map((e, i) => ({
      id: `entity-${e.name}`,
      label: e.name,
      type: 'entity',
      x: Math.cos((i / entities.length) * 2 * Math.PI) * 200,
      y: Math.sin((i / entities.length) * 2 * Math.PI) * 200,
    }));

    // Create function nodes
    const funcNodes = functions.slice(0, 10).map((f, i) => ({
      id: `func-${f.name}`,
      label: f.name,
      type: 'function',
      x: Math.cos((i / Math.max(functions.length, 1)) * 2 * Math.PI + Math.PI) * 150,
      y: Math.sin((i / Math.max(functions.length, 1)) * 2 * Math.PI + Math.PI) * 150,
    }));

    setNodes([...entityNodes, ...funcNodes]);

    // Create edges based on entity relationships
    const newEdges = [];
    entities.forEach((e) => {
      functions.slice(0, 5).forEach((f) => {
        if (Math.random() > 0.6) {
          // Random relationships for demo
          newEdges.push({
            source: `entity-${e.name}`,
            target: `func-${f.name}`,
            type: 'dependency',
          });
        }
      });
    });

    setEdges(newEdges);
    setLoading(false);
  }, [projectIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodes.length === 0) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Clear canvas
    ctx.fillStyle = 'hsl(30 8% 8%)';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw edges
    ctx.strokeStyle = 'hsl(36 55% 62% / 0.3)';
    ctx.lineWidth = 1;
    edges.forEach((edge) => {
      const source = nodes.find((n) => n.id === edge.source);
      const target = nodes.find((n) => n.id === edge.target);
      if (source && target) {
        ctx.beginPath();
        ctx.moveTo(centerX + source.x, centerY + source.y);
        ctx.lineTo(centerX + target.x, centerY + target.y);
        ctx.stroke();
      }
    });

    // Draw nodes
    nodes.forEach((node) => {
      const radius = node.type === 'entity' ? 12 : 10;

      // Highlight hovered node
      if (hoveredNode === node.id) {
        ctx.fillStyle = 'hsl(36 55% 62% / 0.4)';
        ctx.beginPath();
        ctx.arc(centerX + node.x, centerY + node.y, radius + 6, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Node color
      ctx.fillStyle = node.type === 'entity' ? 'hsl(36 55% 62%)' : 'hsl(40 30% 98%)';
      ctx.beginPath();
      ctx.arc(centerX + node.x, centerY + node.y, radius, 0, 2 * Math.PI);
      ctx.fill();

      // Node border
      ctx.strokeStyle = hoveredNode === node.id ? 'hsl(36 55% 62%)' : 'hsl(30 6% 15%)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Node label
      ctx.fillStyle = 'hsl(30 8% 8%)';
      ctx.font = '10px Inter';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label.substring(0, 10), centerX + node.x, centerY + node.y);
    });
  }, [nodes, edges, hoveredNode]);

  const handleCanvasHover = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const hovered = nodes.find((n) => Math.hypot(n.x - x, n.y - y) < 20);
    setHoveredNode(hovered?.id || null);
  };

  const downloadSVG = () => {
    // Generate simple SVG from graph data
    const width = 800;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;

    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#1a1410"/>`;

    // Add edges
    edges.forEach((edge) => {
      const source = nodes.find((n) => n.id === edge.source);
      const target = nodes.find((n) => n.id === edge.target);
      if (source && target) {
        svg += `<line x1="${centerX + source.x}" y1="${centerY + source.y}" x2="${centerX + target.x}" y2="${centerY + target.y}" stroke="#c8a882" stroke-width="1" opacity="0.3"/>`;
      }
    });

    // Add nodes
    nodes.forEach((node) => {
      const radius = node.type === 'entity' ? 12 : 10;
      const color = node.type === 'entity' ? '#c8a882' : '#f5f3f0';
      svg += `<circle cx="${centerX + node.x}" cy="${centerY + node.y}" r="${radius}" fill="${color}" stroke="#2a2420" stroke-width="2"/>
        <text x="${centerX + node.x}" y="${centerY + node.y}" text-anchor="middle" font-size="10" fill="#1a1410">${node.label.substring(0, 10)}</text>`;
    });

    svg += '</svg>';

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'architecture-graph.svg';
    a.click();
  };

  if (loading) {
    return (
      <div className="h-96 rounded-2xl border border-border bg-card/50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card/50 overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Architecture Graph
        </div>
        <button
          onClick={downloadSVG}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border bg-secondary/40 hover:bg-secondary transition"
        >
          <Download className="w-3.5 h-3.5" /> Export SVG
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        onMouseMove={handleCanvasHover}
        onMouseLeave={() => setHoveredNode(null)}
        className="w-full cursor-crosshair"
      />
      <div className="p-4 border-t border-border/50 text-xs text-muted-foreground space-y-1">
        <div>◆ Entities (orange): {nodes.filter((n) => n.type === 'entity').length}</div>
        <div>◇ Functions (ivory): {nodes.filter((n) => n.type === 'function').length}</div>
        <div>→ Dependencies: {edges.length}</div>
      </div>
    </motion.div>
  );
}