import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Play, Trash2, CheckCircle2, XCircle, Globe, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MobileSelect from '@/components/common/MobileSelect';

export default function ScrapingDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [category, setCategory] = useState('competitive');
  const [extractionSchema, setExtractionSchema] = useState({ category: 'competitive' });

  useEffect(() => {
    base44.entities.ScrapingJob.list('-created_date', 20).then(setJobs);
  }, []);

  const startScraping = async () => {
    if (!urlInput.trim()) return;
    setLoading(true);

    const urls = urlInput.split('\n').filter(u => u.trim().startsWith('http'));
    const res = await base44.functions.invoke('parallelScraper', {
      urls,
      extractionSchema: { ...extractionSchema, category },
      workspaceId: 'current', // Replace with actual workspace
      jobId: `scrape-${Date.now()}`,
    });

    setJobs(prev => [res.data, ...prev]);
    setUrlInput('');
    setLoading(false);
  };

  const deleteJob = async (id) => {
    setJobs(prev => prev.filter(j => j.id !== id));
    await base44.entities.ScrapingJob.delete(id);
  };

  const statusColor = {
    queued: 'text-yellow-400 bg-yellow-400/10',
    running: 'text-blue-400 bg-blue-400/10',
    completed: 'text-green-400 bg-green-400/10',
    failed: 'text-red-400 bg-red-400/10',
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div>
          <h2 className="font-display text-2xl text-gradient-ivory">Scraping Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">Parallel URL scraping with AI extraction</p>
        </div>

        {/* Input form */}
        <div className="p-5 rounded-2xl border border-border bg-card/50 space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-accent" />
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">New Scraping Job</span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">URLs (one per line)</label>
              <textarea
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                placeholder="https://example.com/page1&#10;https://example.com/page2"
                rows={4}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition resize-none"
              />
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Category</label>
                <MobileSelect
                  value={category}
                  onChange={setCategory}
                  options={['competitive', 'market', 'trend', 'technology', 'funding'].map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))}
                  placeholder="Select category"
                />
              </div>
              <button
                onClick={startScraping}
                disabled={loading || !urlInput.trim()}
                className="btn-ivory rounded-full w-full py-3 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Scraping...</> : <><Zap className="w-4 h-4" /> Start Scraping</>}
              </button>
            </div>
          </div>
        </div>

        {/* Jobs list */}
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Recent Jobs ({jobs.length})</div>
          {jobs.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm">No scraping jobs yet</div>
          )}
          {jobs.map(job => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl border border-border bg-card/50"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    {job.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                    {job.status === 'running' && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
                    {job.status === 'failed' && <XCircle className="w-4 h-4 text-red-400" />}
                    <div>
                      <div className="text-sm font-medium">Job: {job.job_id}</div>
                      <div className="text-xs text-muted-foreground">{job.total_urls} URLs, {job.completed_urls} completed</div>
                    </div>
                  </div>
                  <div className="text-[10px] text-muted-foreground">{new Date(job.created_at).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] uppercase px-2.5 py-1 rounded-full border ${statusColor[job.status]}`}>
                    {job.status}
                  </span>
                  <button
                    onClick={() => deleteJob(job.id)}
                    className="w-8 h-8 rounded-lg border border-border bg-secondary/40 hover:bg-secondary flex items-center justify-center transition"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}