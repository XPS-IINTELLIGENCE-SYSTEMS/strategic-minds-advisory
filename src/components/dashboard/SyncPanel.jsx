import React, { useState, useEffect } from 'react';
import { nativeData } from '@/lib/nativeDataClient';
import { nativeFunctions } from '@/lib/nativeFunctionClient';
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
  const [driveFiles, setDriveFiles] = useState([]);
  const [driveLoading, setDriveLoading] = useState(false);
  const [driveQuery, setDriveQuery] = useState('');
  const [calendarForm, setCalendarForm] = useState({ title: '', date: '', time: '10:00', duration: '60', attendees: '', description: '' });
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarResult, setCalendarResult] = useState(null);
  const [emailForm, setEmailForm] = useState({ to: '', subject: '', body: '' });
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailResult, setEmailResult] = useState(null);
  const [sims, setSims] = useState([]);

  useEffect(() => {
    checkConnections();
    nativeData.entity('SimulationResult').list('created_date', false).then((rows) => setSims((rows || []).slice(0, 20)));
  }, []);

  const checkConnections = async () => {
    setChecking(true);
    const checks = await Promise.allSettled(
      Object.entries(CONNECTOR_IDS).map(async ([key, id]) => {
        const res = await nativeFunctions.invoke('checkConnector', { connectorId: id });
        return [key, !res.data?.error && res.ok];
      })
    );
    const next = {};
    checks.forEach((result) => { if (result.status === 'fulfilled') next[result.value[0]] = result.value[1]; });
    setConnected(next);
    setChecking(false);
  };

  const connectService = async (connectorId) => {
    const res = await nativeFunctions.invoke('connectAppUser', { connectorId });
    const url = res.data?.url || res.data;
    if (!url) return;
    const popup = window.open(url, '_blank');
    const timer = setInterval(() => {
      if (!popup || popup.closed) { clearInterval(timer); checkConnections(); }
    }, 500);
  };

  const fetchDriveFiles = async () => {
    setDriveLoading(true);
    setDriveFiles([]);
    const res = await nativeFunctions.invoke('syncGoogleDrive', { query: driveQuery || 'type:document', connectorId: CONNECTOR_IDS.googleDrive });
    if (res.data?.files) setDriveFiles(res.data.files);
    setDriveLoading(false);
  };

  const scheduleCalendar = async () => {
    if (!calendarForm.title || !calendarForm.date) return;
    setCalendarLoading(true);
    setCalendarResult(null);
    const res = await nativeFunctions.invoke('syncGoogleCalendar', { ...calendarForm, connectorId: CONNECTOR_IDS.googleCalendar });
    setCalendarResult(res.data || { error: res.error });
    setCalendarLoading(false);
  };

  const sendEmail = async () => {
    if (!emailForm.to || !emailForm.subject || !emailForm.body) return;
    setEmailLoading(true);
    setEmailResult(null);
    const res = await nativeFunctions.invoke('syncGmail', { ...emailForm, connectorId: CONNECTOR_IDS.gmail });
    setEmailResult(res.data || { error: res.error });
    setEmailLoading(false);
  };

  const prefillFromSim = (sim) => {
    const result = sim.result ? JSON.parse(sim.result) : {};
    const summary = sim.summary || result.summary || '';
    const insights = (result.insights || []).slice(0, 3).map(i => `• ${i}`).join('\n');
    const recs = (result.recommendations || []).slice(0, 3).map(r => `→ ${r}`).join('\n');
    setEmailForm({ to: '', subject: `Strategic Insights: ${sim.title}`, body: `Dear [Name],\n\nI wanted to share key insights from our recent ${sim.type} simulation.\n\nSummary\n${summary}\n\nKey Insights\n${insights}\n\nRecommendations\n${recs}\n\nBest regards,\nStrategic Minds Advisory` });
    setActiveTab('email');
  };

  const ConnectorStatus = ({ name, k, connectorId }) => (
    <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/30">
      <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${connected[k] ? 'bg-green-400' : 'bg-muted-foreground'}`} /><span className="text-sm">{name}</span></div>
      {!connected[k] && <button onClick={() => connectService(connectorId)} className="text-xs px-3 py-1.5 rounded-lg border border-accent/40 text-accent hover:bg-accent/10 transition">Connect</button>}
      {connected[k] && <CheckCircle2 className="w-4 h-4 text-green-400" />}
    </div>
  );

  return (
    <div className="h-full overflow-y-auto bg-background text-foreground">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div><h2 className="font-display text-2xl text-foreground">Google Workspace Sync</h2><p className="text-sm text-muted-foreground mt-1">Pull files, schedule meetings, and send emails via Google connectors</p></div>
        <div className="p-5 rounded-2xl border border-border bg-card/50"><div className="flex items-center justify-between mb-3"><div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Connected Services</div><button onClick={checkConnections} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition"><RefreshCw className={`w-3 h-3 ${checking ? 'animate-spin' : ''}`} /> Refresh</button></div><div className="grid md:grid-cols-2 gap-2"><ConnectorStatus name="Google Drive" k="googleDrive" connectorId={CONNECTOR_IDS.googleDrive} /><ConnectorStatus name="Gmail" k="gmail" connectorId={CONNECTOR_IDS.gmail} /><ConnectorStatus name="Google Calendar" k="googleCalendar" connectorId={CONNECTOR_IDS.googleCalendar} /><ConnectorStatus name="Google Docs" k="googleDocs" connectorId={CONNECTOR_IDS.googleDocs} /></div></div>
        <div className="flex gap-2">{TABS.map(({ id, icon: Icon, label }) => <button key={id} onClick={() => setActiveTab(id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border transition-all ${activeTab === id ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-secondary/30 text-muted-foreground hover:text-foreground'}`}><Icon className="w-4 h-4" />{label}</button>)}</div>
        {activeTab === 'drive' && <div className="space-y-4"><div className="flex gap-3"><input value={driveQuery} onChange={e => setDriveQuery(e.target.value)} placeholder="Search query" className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition" /><button onClick={fetchDriveFiles} disabled={driveLoading || !connected.googleDrive} className="btn-ivory rounded-xl px-5 py-3 text-sm flex items-center gap-2 disabled:opacity-50">{driveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderOpen className="w-4 h-4" />} Fetch</button></div>{!connected.googleDrive && <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400"><AlertTriangle className="w-4 h-4 flex-shrink-0" />Connect Google Drive above to fetch files.</div>}{driveFiles.map(f => <div key={f.id} className="p-4 rounded-xl border border-border bg-card/50 flex items-center justify-between gap-3"><div className="flex items-center gap-3 min-w-0"><FileText className="w-4 h-4 text-accent flex-shrink-0" /><div className="min-w-0"><div className="text-sm font-medium truncate">{f.name}</div><div className="text-xs text-muted-foreground">{f.mimeType?.split('.').pop() || 'file'}</div></div></div>{f.webViewLink && <a href={f.webViewLink} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-xl border border-border bg-secondary/40 hover:bg-secondary flex items-center justify-center transition flex-shrink-0"><LinkIcon className="w-3.5 h-3.5" /></a>}</div>)}</div>}
        {activeTab === 'calendar' && <div className="space-y-4"><input value={calendarForm.title} onChange={e => setCalendarForm(f => ({ ...f, title: e.target.value }))} placeholder="Meeting title" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition" /><button onClick={scheduleCalendar} disabled={calendarLoading || !connected.googleCalendar || !calendarForm.title || !calendarForm.date} className="btn-ivory rounded-xl w-full py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50">{calendarLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />} Schedule Meeting</button>{calendarResult && <div className="p-4 rounded-xl border border-border bg-card/50 text-sm">{calendarResult.error || 'Meeting scheduled.'}</div>}</div>}
        {activeTab === 'email' && <div className="space-y-4"><input value={emailForm.to} onChange={e => setEmailForm(f => ({ ...f, to: e.target.value }))} placeholder="To" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition" /><input value={emailForm.subject} onChange={e => setEmailForm(f => ({ ...f, subject: e.target.value }))} placeholder="Subject" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition" /><textarea value={emailForm.body} onChange={e => setEmailForm(f => ({ ...f, body: e.target.value }))} placeholder="Email body" rows={10} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition resize-none" />{sims.length > 0 && <div className="flex flex-wrap gap-2">{sims.slice(0, 5).map(s => <button key={s.id} onClick={() => prefillFromSim(s)} className="text-xs px-3 py-1.5 rounded-full border border-border bg-secondary/30 hover:bg-secondary transition">{s.title?.substring(0, 25) || s.type}</button>)}</div>}<button onClick={sendEmail} disabled={emailLoading || !connected.gmail || !emailForm.to || !emailForm.subject} className="btn-ivory rounded-xl w-full py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50">{emailLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send via Gmail</button>{emailResult && <div className="p-4 rounded-xl border border-border bg-card/50 text-sm">{emailResult.error || 'Email sent successfully.'}</div>}</div>}
      </div>
    </div>
  );
}
