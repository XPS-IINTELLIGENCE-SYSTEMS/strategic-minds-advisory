import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  RefreshCw, Mail, Calendar, FileText, Loader2, CheckCircle2,
  AlertTriangle, Send, FolderOpen, Clock, Link as LinkIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CONNECTOR_IDS = {
  gmail: '69db200274332486fd28dd7e',
  googleDrive: '69db1e5e75a5f8c15c80cf34',
  googleCalendar: '69ddcb305a599e0b4a1b3cff',
  googleDocs: '69ddcb7e5d965b5605cd24b4',
};

const TABS = [
  { id: 'drive', icon: FolderOpen, label: 'Drive Files' },
  { id: 'calendar', icon: Calendar, label: 'Schedule Meeting' },
  { id: 'email', icon: Mail, label: 'Send Email' },
];

export default function SyncPanel() {
  const [activeTab, setActiveTab] = useState('drive');
  const [connected, setConnected] = useState({ gmail: false, googleDrive: false, googleCalendar: false, googleDocs: false });
  const [checking, setChecking] = useState(true);

  // Drive state
  const [driveFiles, setDriveFiles] = useState([]);
  const [driveLoading, setDriveLoading] = useState(false);
  const [driveQuery, setDriveQuery] = useState('');

  // Calendar state
  const [calendarForm, setCalendarForm] = useState({ title: '', date: '', time: '10:00', duration: '60', attendees: '', description: '' });
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarResult, setCalendarResult] = useState(null);

  // Email state
  const [emailForm, setEmailForm] = useState({ to: '', subject: '', body: '' });
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailResult, setEmailResult] = useState(null);
  const [sims, setSims] = useState([]);

  useEffect(() => {
    checkConnections();
    base44.entities.SimulationResult.list('-created_date', 20).then(setSims);
  }, []);

  const checkConnections = async () => {
    setChecking(true);
    const checks = await Promise.allSettled(
      Object.entries(CONNECTOR_IDS).map(async ([key, id]) => {
        try {
          const res = await base44.functions.invoke('checkConnector', { connectorId: id });
          return [key, !res.data?.error];
        } catch { return [key, false]; }
      })
    );
    const newConnected = {};
    checks.forEach(r => { if (r.status === 'fulfilled') newConnected[r.value[0]] = r.value[1]; });
    setConnected(newConnected);
    setChecking(false);
  };

  const connectService = async (connectorId) => {
    const url = await base44.connectors.connectAppUser(connectorId);
    const popup = window.open(url, '_blank');
    const timer = setInterval(() => {
      if (!popup || popup.closed) { clearInterval(timer); checkConnections(); }
    }, 500);
  };

  const fetchDriveFiles = async () => {
    setDriveLoading(true);
    setDriveFiles([]);
    const res = await base44.functions.invoke('syncGoogleDrive', { query: driveQuery || 'type:document', connectorId: CONNECTOR_IDS.googleDrive });
    if (res.data?.files) setDriveFiles(res.data.files);
    setDriveLoading(false);
  };

  const scheduleCalendar = async () => {
    if (!calendarForm.title || !calendarForm.date) return;
    setCalendarLoading(true);
    setCalendarResult(null);
    const res = await base44.functions.invoke('syncGoogleCalendar', { ...calendarForm, connectorId: CONNECTOR_IDS.googleCalendar });
    setCalendarResult(res.data);
    setCalendarLoading(false);
  };

  const sendEmail = async () => {
    if (!emailForm.to || !emailForm.subject || !emailForm.body) return;
    setEmailLoading(true);
    setEmailResult(null);
    const res = await base44.functions.invoke('syncGmail', { ...emailForm, connectorId: CONNECTOR_IDS.gmail });
    setEmailResult(res.data);
    setEmailLoading(false);
  };

  const prefillFromSim = (sim) => {
    const result = sim.result ? JSON.parse(sim.result) : {};
    const summary = sim.summary || result.summary || '';
    const insights = (result.insights || []).slice(0, 3).map(i => `• ${i}`).join('\n');
    const recs = (result.recommendations || []).slice(0, 3).map(r => `→ ${r}`).join('\n');

    setEmailForm({
      to: '',
      subject: `Strategic Insights: ${sim.title}`,
      body: `Dear [Name],\n\nI wanted to share some key insights from our recent ${sim.type} simulation.\n\n**Summary**\n${summary}\n\n**Key Insights**\n${insights}\n\n**Recommendations**\n${recs}\n\nLet's discuss these findings at your convenience.\n\nBest regards,\nStrategic Minds Advisory`,
    });
    setActiveTab('email');
  };

  const ConnectorStatus = ({ name, key: k, connectorId }) => (
    <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/30">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${connected[k] ? 'bg-green-400' : 'bg-muted-foreground'}`} />
        <span className="text-sm">{name}</span>
      </div>
      {!connected[k] && (
        <button onClick={() => connectService(connectorId)}
          className="text-xs px-3 py-1.5 rounded-lg border border-accent/40 text-accent hover:bg-accent/10 transition">
          Connect
        </button>
      )}
      {connected[k] && <CheckCircle2 className="w-4 h-4 text-green-400" />}
    </div>
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div>
          <h2 className="font-display text-2xl text-gradient-ivory">Google Workspace Sync</h2>
          <p className="text-sm text-muted-foreground mt-1">Pull files, schedule meetings, and send emails via Google connectors</p>
        </div>

        {/* Connector status */}
        <div className="p-5 rounded-2xl border border-border bg-card/50">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Connected Services</div>
            <button onClick={checkConnections} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition">
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-2">
            <ConnectorStatus name="Google Drive" k="googleDrive" connectorId={CONNECTOR_IDS.googleDrive} />
            <ConnectorStatus name="Gmail" k="gmail" connectorId={CONNECTOR_IDS.gmail} />
            <ConnectorStatus name="Google Calendar" k="googleCalendar" connectorId={CONNECTOR_IDS.googleCalendar} />
            <ConnectorStatus name="Google Docs" k="googleDocs" connectorId={CONNECTOR_IDS.googleDocs} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {TABS.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border transition-all ${
                activeTab === id ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-secondary/30 text-muted-foreground hover:text-foreground'
              }`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        {/* Drive */}
        {activeTab === 'drive' && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <input value={driveQuery} onChange={e => setDriveQuery(e.target.value)}
                placeholder="Search query (e.g. 'strategy docs', 'Q4 reports')"
                className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition" />
              <button onClick={fetchDriveFiles} disabled={driveLoading || !connected.googleDrive}
                className="btn-ivory rounded-xl px-5 py-3 text-sm flex items-center gap-2 disabled:opacity-50">
                {driveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderOpen className="w-4 h-4" />}
                Fetch
              </button>
            </div>

            {!connected.googleDrive && (
              <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 flex items-center gap-2 text-sm text-yellow-400">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                Connect Google Drive above to fetch files.
              </div>
            )}

            {driveFiles.length > 0 && (
              <div className="space-y-2">
                {driveFiles.map(f => (
                  <div key={f.id} className="p-4 rounded-xl border border-border bg-card/50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="w-4 h-4 text-accent flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{f.name}</div>
                        <div className="text-xs text-muted-foreground">{f.mimeType?.split('.').pop() || 'file'} · {f.modifiedTime ? new Date(f.modifiedTime).toLocaleDateString() : ''}</div>
                      </div>
                    </div>
                    {f.webViewLink && (
                      <a href={f.webViewLink} target="_blank" rel="noopener noreferrer"
                        className="w-8 h-8 rounded-xl border border-border bg-secondary/40 hover:bg-secondary flex items-center justify-center transition flex-shrink-0">
                        <LinkIcon className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Calendar */}
        {activeTab === 'calendar' && (
          <div className="space-y-4">
            {!connected.googleCalendar && (
              <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 flex items-center gap-2 text-sm text-yellow-400">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                Connect Google Calendar above to schedule meetings.
              </div>
            )}

            {sims.length > 0 && (
              <div className="p-4 rounded-2xl border border-border bg-card/50">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Auto-schedule from Simulation Milestone</div>
                <div className="flex flex-wrap gap-2">
                  {sims.slice(0, 5).map(s => (
                    <button key={s.id}
                      onClick={() => setCalendarForm(f => ({ ...f, title: `Review: ${s.title}`, description: s.summary || '' }))}
                      className="text-xs px-3 py-1.5 rounded-full border border-border bg-secondary/30 hover:bg-secondary transition">
                      {s.title?.substring(0, 25) || s.type}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <input value={calendarForm.title} onChange={e => setCalendarForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Meeting title"
                className="bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition" />
              <input value={calendarForm.attendees} onChange={e => setCalendarForm(f => ({ ...f, attendees: e.target.value }))}
                placeholder="Attendee emails (comma-separated)"
                className="bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition" />
              <input type="date" value={calendarForm.date} onChange={e => setCalendarForm(f => ({ ...f, date: e.target.value }))}
                className="bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition" />
              <div className="flex gap-3">
                <input type="time" value={calendarForm.time} onChange={e => setCalendarForm(f => ({ ...f, time: e.target.value }))}
                  className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition" />
                <select value={calendarForm.duration} onChange={e => setCalendarForm(f => ({ ...f, duration: e.target.value }))}
                  className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition">
                  {['30', '45', '60', '90', '120'].map(d => <option key={d} value={d}>{d} min</option>)}
                </select>
              </div>
              <textarea value={calendarForm.description} onChange={e => setCalendarForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Description / agenda"
                rows={3} className="md:col-span-2 bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition resize-none" />
            </div>

            <button onClick={scheduleCalendar} disabled={calendarLoading || !connected.googleCalendar || !calendarForm.title || !calendarForm.date}
              className="btn-ivory rounded-xl w-full py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50">
              {calendarLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Scheduling…</> : <><Calendar className="w-4 h-4" /> Schedule Meeting</>}
            </button>

            <AnimatePresence>
              {calendarResult && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border text-sm ${calendarResult.error ? 'border-red-500/30 bg-red-500/5 text-red-400' : 'border-green-500/30 bg-green-500/5 text-green-400'}`}>
                  {calendarResult.error ? `Error: ${calendarResult.error}` : `✓ Meeting scheduled! ${calendarResult.link ? <a href={calendarResult.link} target="_blank" className="underline">Open in Calendar</a> : ''}`}
                  {calendarResult.link && <a href={calendarResult.link} target="_blank" rel="noopener noreferrer" className="ml-2 underline text-xs">Open in Calendar</a>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Email */}
        {activeTab === 'email' && (
          <div className="space-y-4">
            {!connected.gmail && (
              <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 flex items-center gap-2 text-sm text-yellow-400">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                Connect Gmail above to send emails.
              </div>
            )}

            {sims.length > 0 && (
              <div className="p-4 rounded-2xl border border-border bg-card/50">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Pre-fill from Simulation</div>
                <div className="flex flex-wrap gap-2">
                  {sims.slice(0, 5).map(s => (
                    <button key={s.id} onClick={() => prefillFromSim(s)}
                      className="text-xs px-3 py-1.5 rounded-full border border-border bg-secondary/30 hover:bg-secondary transition">
                      {s.title?.substring(0, 25) || s.type}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <input value={emailForm.to} onChange={e => setEmailForm(f => ({ ...f, to: e.target.value }))}
                placeholder="To (email address)"
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition" />
              <input value={emailForm.subject} onChange={e => setEmailForm(f => ({ ...f, subject: e.target.value }))}
                placeholder="Subject"
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition" />
              <textarea value={emailForm.body} onChange={e => setEmailForm(f => ({ ...f, body: e.target.value }))}
                placeholder="Email body..."
                rows={10} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition resize-none" />
            </div>

            <button onClick={sendEmail} disabled={emailLoading || !connected.gmail || !emailForm.to || !emailForm.subject}
              className="btn-ivory rounded-xl w-full py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50">
              {emailLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <><Send className="w-4 h-4" /> Send via Gmail</>}
            </button>

            <AnimatePresence>
              {emailResult && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border text-sm ${emailResult.error ? 'border-red-500/30 bg-red-500/5 text-red-400' : 'border-green-500/30 bg-green-500/5 text-green-400'}`}>
                  {emailResult.error ? `Error: ${emailResult.error}` : '✓ Email sent successfully via Gmail.'}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}