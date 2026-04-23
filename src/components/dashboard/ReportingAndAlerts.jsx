import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Download, Bell, AlertTriangle, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReportingAndAlerts() {
  const [reports, setReports] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [domain, setDomain] = useState('enterprise');
  const [loading, setLoading] = useState(false);
  const [alerts_loading, setAlertsLoading] = useState(false);

  const domains = ['enterprise', 'fintech', 'aitools', 'climate', 'biotech', 'consumer'];

  // Generate Market Pulse Report
  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('generateMarketPulseReport', {});
      // Download PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MarketPulse_${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      setReports(prev => [...prev, {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        status: 'generated',
      }]);
    } catch (error) {
      console.error('Report generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Run Black Swan Alert Monitor
  const scanForAlerts = async () => {
    setAlertsLoading(true);
    try {
      const response = await base44.functions.invoke('blackSwanAlertMonitor', { domain });
      setAlerts(response.data.alerts || []);
    } catch (error) {
      console.error('Alert scan failed:', error);
    } finally {
      setAlertsLoading(false);
    }
  };

  useEffect(() => {
    scanForAlerts();
  }, [domain]);

  return (
    <div className="h-full flex flex-col gap-6 p-6 overflow-y-auto">
      {/* Market Pulse Report Generator */}
      <div className="glass-card rounded-2xl p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center">
              <FileText className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Market Pulse Report</h3>
              <p className="text-xs text-muted-foreground">Bi-weekly PDF summary of trends & risks</p>
            </div>
          </div>
          <Button
            onClick={generateReport}
            disabled={loading}
            className="btn-ivory rounded-lg"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {loading ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>

        {reports.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Recent reports:</p>
            {reports.slice(-3).reverse().map(report => (
              <div key={report.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/30 border border-border">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-foreground">{report.date}</span>
                </div>
                <span className="text-xs text-accent">Ready</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Black Swan Alert Monitor */}
      <div className="glass-card rounded-2xl p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/15 flex items-center justify-center">
              <Bell className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Black Swan Alerts</h3>
              <p className="text-xs text-muted-foreground">Real-time critical market signals</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="text-xs px-2 py-1.5 rounded-lg bg-secondary/60 border border-border outline-none"
            >
              {domains.map(d => (
                <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
              ))}
            </select>
            <Button
              onClick={scanForAlerts}
              disabled={alerts_loading}
              variant="outline"
              className="rounded-lg"
              size="sm"
            >
              {alerts_loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Scan'}
            </Button>
          </div>
        </div>

        {alerts.length > 0 ? (
          <div className="space-y-2">
            {alerts.slice(0, 5).map((alert, idx) => (
              <div key={idx} className="px-3 py-2.5 rounded-lg border border-destructive/30 bg-destructive/10">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-destructive">{alert.indicator}</p>
                    <p className="text-xs text-foreground/70 mt-0.5 truncate">{alert.source}</p>
                  </div>
                  <span className="text-xs font-mono text-destructive flex-shrink-0">{alert.severity}/10</span>
                </div>
              </div>
            ))}
            {alerts.length > 5 && (
              <p className="text-xs text-muted-foreground text-center py-2">+{alerts.length - 5} more alerts</p>
            )}
          </div>
        ) : (
          <div className="px-3 py-4 text-center">
            <p className="text-xs text-muted-foreground">No critical signals detected for {domain}</p>
          </div>
        )}
      </div>
    </div>
  );
}