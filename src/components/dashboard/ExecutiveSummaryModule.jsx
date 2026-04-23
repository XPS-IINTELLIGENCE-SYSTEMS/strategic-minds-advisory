import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { FileText, Download, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ExecutiveSummaryModule() {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState(null);
  const [summary, setSummary] = useState(null);
  const [email, setEmail] = useState('');
  const [sendEmail, setSendEmail] = useState(false);

  useEffect(() => {
    loadLastSummary();
  }, []);

  const loadLastSummary = async () => {
    setLoading(true);
    try {
      const reports = await base44.entities.ContentItem.filter(
        { content_type: 'executive_summary' },
        '-created_date',
        1
      );
      if (reports.length > 0) {
        setLastGenerated(reports[0]);
      }
    } catch (error) {
      console.error('Failed to load summary:', error);
    }
    setLoading(false);
  };

  const generateSummary = async () => {
    setGenerating(true);

    try {
      // Fetch context data
      const [intelligence, stressTests, playbooks] = await Promise.all([
        base44.entities.StrategicIntelligence.list('-created_date', 10),
        base44.entities.StressTestResult.list('-created_date', 5),
        base44.entities.StrategyPlaybook.list('-created_date', 5),
      ]);

      const res = await base44.functions.invoke('generateExecutiveSummary', {
        intelligence,
        stressTests,
        playbooks,
        sendEmail: sendEmail && email,
        recipientEmail: email,
      });

      setSummary(res.data);
      setLastGenerated(res.data);

      if (sendEmail && email) {
        alert('✓ Summary sent to ' + email);
      } else {
        alert('✓ Summary ready for download');
      }
    } catch (error) {
      console.error('Generation failed:', error);
    }

    setGenerating(false);
  };

  const downloadPDF = () => {
    if (summary?.pdfUrl) {
      window.open(summary.pdfUrl, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-gradient-ivory">Executive Summary</h2>
        <p className="text-sm text-muted-foreground mt-1">Weekly intelligence & strategy report</p>
      </div>

      {/* Generation Options */}
      <div className="p-5 rounded-2xl border border-border bg-card/50 space-y-4">
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3 block font-medium">
            Delivery Method
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setSendEmail(false)}
              className={`flex-1 py-2.5 rounded-lg border transition text-sm font-medium ${
                !sendEmail
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border bg-secondary/30 text-foreground hover:bg-secondary'
              }`}
            >
              <Download className="w-4 h-4 inline mr-2" /> Download
            </button>
            <button
              onClick={() => setSendEmail(true)}
              className={`flex-1 py-2.5 rounded-lg border transition text-sm font-medium ${
                sendEmail
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border bg-secondary/30 text-foreground hover:bg-secondary'
              }`}
            >
              <Mail className="w-4 h-4 inline mr-2" /> Email
            </button>
          </div>
        </div>

        {sendEmail && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground block font-medium">
              Recipient Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent transition"
            />
          </motion.div>
        )}

        <button
          onClick={generateSummary}
          disabled={generating || (sendEmail && !email)}
          className="w-full py-3 rounded-xl bg-accent/15 text-accent border border-accent font-medium text-sm hover:bg-accent/25 transition disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Generating…
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" /> Generate & {sendEmail ? 'Send' : 'Download'}
            </>
          )}
        </button>
      </div>

      {/* Summary Preview */}
      <AnimatePresence>
        {summary && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-5 rounded-2xl border border-border bg-card/50 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <div>
                  <div className="font-medium text-foreground">Summary Generated</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
              {!sendEmail && (
                <button
                  onClick={downloadPDF}
                  className="px-3 py-1.5 rounded-lg bg-accent/15 text-accent border border-accent text-xs font-medium hover:bg-accent/25 transition"
                >
                  Download PDF
                </button>
              )}
            </div>

            <div className="space-y-3 pt-3 border-t border-border/50">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-accent mb-2 font-medium">
                  Report Includes
                </div>
                <ul className="space-y-1">
                  {[
                    `${summary.intelligenceCount || 0} intelligence signals`,
                    `${summary.stressTestCount || 0} stress test results`,
                    `${summary.playbookCount || 0} strategy playbooks`,
                    'Key insights & recommendations',
                  ].map((item, i) => (
                    <li key={i} className="text-xs text-foreground/80 flex items-center gap-2">
                      <span className="text-accent">✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>

              {summary.keyInsights && (
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-accent mb-2 font-medium">
                    Top Insight
                  </div>
                  <p className="text-xs text-foreground/80 leading-relaxed">{summary.keyInsights}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Last Generated */}
      {lastGenerated && !summary && (
        <div className="p-4 rounded-xl border border-border/50 bg-secondary/20 space-y-2">
          <div className="text-xs font-medium text-foreground">Last Report</div>
          <div className="text-[10px] text-muted-foreground">
            Generated {new Date(lastGenerated.created_date).toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  );
}