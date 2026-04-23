import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart,
  Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell
} from 'recharts';
import { BarChart3, TrendingUp, Download, Trash2, Loader2, RefreshCw, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';

const ACCENT = 'hsl(36 55% 62%)';
const MUTED = 'hsl(30 10% 60%)';

export default function InsightsPanel() {
  const [sims, setSims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('simulations');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [simData] = await Promise.all([
      base44.entities.SimulationResult.list('-created_date', 50),
    ]);
    setSims(simData);
    setLoading(false);
  };

  const deleteItem = async (id) => {
    await base44.entities.SimulationResult.delete(id);
    setSims(prev => prev.filter(s => s.id !== id));
  };

  const exportPDF = async () => {
    setExporting(true);
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210, margin = 18;

    // Cover page
    doc.setFillColor(13, 11, 9);
    doc.rect(0, 0, W, 297, 'F');

    doc.setFillColor(180, 130, 80);
    doc.rect(0, 0, 4, 297, 'F');

    doc.setTextColor(240, 225, 200);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('Strategic Minds', margin, 60);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(180, 130, 80);
    doc.text('AI Insights Report', margin, 75);

    doc.setTextColor(140, 120, 100);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, 90);
    doc.text(`Total Simulations: ${sims.length}`, margin, 100);

    // Divider
    doc.setDrawColor(60, 50, 40);
    doc.setLineWidth(0.5);
    doc.line(margin, 110, W - margin, 110);

    // Summary stats
    doc.setTextColor(240, 225, 200);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', margin, 125);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(180, 160, 140);

    const avgConf = sims.length > 0
      ? Math.round(sims.reduce((a, s) => a + (s.confidence || 0), 0) / sims.length * 100)
      : 0;

    doc.text(`• ${sims.length} simulation${sims.length !== 1 ? 's' : ''} recorded across all strategy types`, margin, 138);
    doc.text(`• Average model confidence: ${avgConf}%`, margin, 148);
    doc.text(`• Simulation types: ${[...new Set(sims.map(s => s.type))].join(', ') || 'N/A'}`, margin, 158);

    // Simulation pages
    sims.forEach((sim, idx) => {
      doc.addPage();
      doc.setFillColor(13, 11, 9);
      doc.rect(0, 0, W, 297, 'F');
      doc.setFillColor(180, 130, 80);
      doc.rect(0, 0, 4, 297, 'F');

      let y = 25;

      // Header
      doc.setTextColor(180, 130, 80);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`SIMULATION ${idx + 1} OF ${sims.length}`, margin, y);
      y += 10;

      doc.setTextColor(240, 225, 200);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      const title = sim.title || `${sim.type} Simulation`;
      doc.text(title.length > 50 ? title.substring(0, 47) + '...' : title, margin, y);
      y += 8;

      doc.setTextColor(140, 120, 100);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Type: ${sim.type || 'N/A'}  ·  Confidence: ${Math.round((sim.confidence || 0) * 100)}%  ·  Saved: ${new Date(sim.created_date).toLocaleDateString()}`, margin, y);
      y += 8;

      doc.setDrawColor(60, 50, 40);
      doc.line(margin, y, W - margin, y);
      y += 10;

      // Summary
      if (sim.summary) {
        doc.setTextColor(240, 225, 200);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Summary', margin, y);
        y += 7;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(180, 160, 140);
        const lines = doc.splitTextToSize(sim.summary, W - margin * 2);
        lines.slice(0, 5).forEach(line => { doc.text(line, margin, y); y += 5.5; });
        y += 4;
      }

      // Result JSON
      if (sim.result) {
        try {
          const parsed = JSON.parse(sim.result);
          if (parsed.insights?.length) {
            doc.setTextColor(240, 225, 200);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('Key Insights', margin, y);
            y += 7;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(180, 160, 140);
            parsed.insights.slice(0, 5).forEach(ins => {
              if (y > 270) return;
              const lines = doc.splitTextToSize(`• ${ins}`, W - margin * 2 - 5);
              lines.slice(0, 2).forEach(l => { doc.text(l, margin + 2, y); y += 5.5; });
            });
            y += 4;
          }

          if (parsed.recommendations?.length) {
            doc.setTextColor(240, 225, 200);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('Recommendations', margin, y);
            y += 7;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(180, 130, 80);
            parsed.recommendations.slice(0, 3).forEach(rec => {
              if (y > 270) return;
              const lines = doc.splitTextToSize(`→ ${rec}`, W - margin * 2 - 5);
              lines.slice(0, 2).forEach(l => { doc.text(l, margin + 2, y); y += 5.5; });
            });
          }
        } catch {}
      }

      // Footer
      doc.setTextColor(80, 70, 60);
      doc.setFontSize(8);
      doc.text('Strategic Minds Advisory · Confidential', margin, 287);
      doc.text(`Page ${idx + 2}`, W - margin - 10, 287);
    });

    doc.save(`Strategic_Minds_Insights_${Date.now()}.pdf`);
    setExporting(false);
  };

  // Build chart data
  const confidenceData = sims.map(s => ({
    name: (s.title || s.type || 'Sim').substring(0, 18),
    confidence: Math.round((s.confidence || 0) * 100),
  }));

  const typeDistribution = Object.entries(
    sims.reduce((acc, s) => { acc[s.type || 'Unknown'] = (acc[s.type || 'Unknown'] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const timelineData = [...sims].reverse().map((s, i) => ({
    name: `#${i + 1}`,
    confidence: Math.round((s.confidence || 0) * 100),
    date: new Date(s.created_date).toLocaleDateString(),
  }));

  const parsedProjections = sims
    .filter(s => s.result)
    .map(s => {
      try {
        const r = JSON.parse(s.result);
        return r.projections?.[0] ? { name: (s.title || s.type).substring(0, 15), ...r.projections[0] } : null;
      } catch { return null; }
    })
    .filter(Boolean)
    .slice(0, 8);

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-accent" />
    </div>
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl text-gradient-ivory">Insights Dashboard</h2>
            <p className="text-sm text-muted-foreground mt-1">{sims.length} saved simulation{sims.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchData} className="w-9 h-9 rounded-xl border border-border bg-secondary/40 hover:bg-secondary flex items-center justify-center transition">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={exportPDF}
              disabled={exporting || sims.length === 0}
              className="btn-ivory rounded-xl px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-50"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Export PDF Report
            </button>
          </div>
        </div>

        {sims.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <BarChart3 className="w-10 h-10 mx-auto mb-4 opacity-30" />
            <p className="text-sm">No saved simulations yet. Run simulations and save them to see insights.</p>
          </div>
        ) : (
          <>
            {/* KPI Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Simulations', value: sims.length },
                { label: 'Avg Confidence', value: `${sims.length ? Math.round(sims.reduce((a, s) => a + (s.confidence || 0), 0) / sims.length * 100) : 0}%` },
                { label: 'Unique Types', value: new Set(sims.map(s => s.type)).size },
                { label: 'This Month', value: sims.filter(s => new Date(s.created_date) > new Date(Date.now() - 30 * 86400000)).length },
              ].map(({ label, value }) => (
                <div key={label} className="p-4 rounded-2xl border border-border bg-card/50">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">{label}</div>
                  <div className="font-display text-3xl text-gradient-accent">{value}</div>
                </div>
              ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid md:grid-cols-2 gap-5">
              <div className="p-5 rounded-2xl border border-border bg-card/50">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Confidence by Simulation</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={confidenceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(30 6% 15%)" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: MUTED }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: MUTED }} />
                    <Tooltip contentStyle={{ background: 'hsl(30 8% 8%)', border: '1px solid hsl(30 6% 15%)', borderRadius: 10, fontSize: 11 }} />
                    <Bar dataKey="confidence" fill={ACCENT} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-5 rounded-2xl border border-border bg-card/50">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Confidence Trend Over Time</div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={timelineData}>
                    <defs>
                      <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={ACCENT} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(30 6% 15%)" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: MUTED }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: MUTED }} />
                    <Tooltip contentStyle={{ background: 'hsl(30 8% 8%)', border: '1px solid hsl(30 6% 15%)', borderRadius: 10, fontSize: 11 }} />
                    <Area type="monotone" dataKey="confidence" stroke={ACCENT} fill="url(#confGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Charts Row 2 */}
            {parsedProjections.length > 0 && (
              <div className="p-5 rounded-2xl border border-border bg-card/50">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">First-Period Projections Comparison (Base / Optimistic / Pessimistic)</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={parsedProjections}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(30 6% 15%)" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: MUTED }} />
                    <YAxis tick={{ fontSize: 9, fill: MUTED }} />
                    <Tooltip contentStyle={{ background: 'hsl(30 8% 8%)', border: '1px solid hsl(30 6% 15%)', borderRadius: 10, fontSize: 11 }} />
                    <Bar dataKey="value" fill={ACCENT} radius={[4, 4, 0, 0]} name="Base" />
                    <Bar dataKey="optimistic" fill="#4ade80" radius={[4, 4, 0, 0]} name="Optimistic" />
                    <Bar dataKey="pessimistic" fill="#f87171" radius={[4, 4, 0, 0]} name="Pessimistic" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Saved Simulations List */}
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Saved Simulations</div>
              <div className="space-y-3">
                {sims.map(sim => (
                  <motion.div key={sim.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="p-4 rounded-2xl border border-border bg-card/50 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-accent" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{sim.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{sim.type} · {new Date(sim.created_date).toLocaleDateString()} · {Math.round((sim.confidence || 0) * 100)}% confidence</div>
                        {sim.summary && <p className="text-xs text-foreground/60 mt-1 line-clamp-1">{sim.summary}</p>}
                      </div>
                    </div>
                    <button onClick={() => deleteItem(sim.id)} className="w-7 h-7 rounded-lg border border-border bg-secondary/40 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 flex items-center justify-center transition flex-shrink-0">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}