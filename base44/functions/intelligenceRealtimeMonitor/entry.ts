import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Real-time monitoring of intelligence library for critical signals
const CRITICAL_KEYWORDS = [
  'competitor funding',
  'series a',
  'series b',
  'acquisition',
  'IPO',
  'market disruption',
  'regulatory change',
  'partnership announcement',
  'product launch',
  'breakthrough technology',
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const watchedModelIds = body.watchedModelIds || [];

    // Fetch all watched models
    const watchedModels = await Promise.all(
      watchedModelIds.map(id =>
        base44.asServiceRole.entities.SavedModel.filter({ id })
          .then(results => results.length > 0 ? results[0] : null)
      )
    );

    const activeWatches = watchedModels.filter(m => m && m.watched_for_alerts);

    if (activeWatches.length === 0) {
      return Response.json({
        success: true,
        alerts: [],
        message: 'No models being actively monitored',
      });
    }

    // Fetch recent intelligence (last 24 hours)
    const allIntelligence = await base44.asServiceRole.entities.StrategicIntelligence.list();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentIntelligence = allIntelligence.filter(item => {
      const itemDate = new Date(item.extracted_date);
      return itemDate >= oneDayAgo;
    });

    // Detect critical signals
    const alerts = [];
    for (const intelligence of recentIntelligence) {
      const contentLower = `${intelligence.title} ${intelligence.content}`.toLowerCase();
      
      for (const keyword of CRITICAL_KEYWORDS) {
        if (contentLower.includes(keyword.toLowerCase())) {
          alerts.push({
            id: intelligence.id,
            title: intelligence.title,
            content: intelligence.content.substring(0, 200),
            type: intelligence.intelligence_type,
            keyword: keyword,
            severity: intelligence.value_score || 70,
            timestamp: intelligence.extracted_date,
          });
        }
      }
    }

    // Send email notification for high-severity alerts
    if (alerts.length > 0) {
      const topAlerts = alerts.slice(0, 5);
      const alertSummary = topAlerts.map(a => `• ${a.keyword.toUpperCase()}: ${a.title}`).join('\n');

      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: `🚨 URGENT: ${alerts.length} Critical Intelligence Signals Detected`,
        body: `Your monitored business models have been impacted by critical market signals:

${alertSummary}

${alerts.length > 5 ? `\n+${alerts.length - 5} additional signals...\n` : ''}

Log in to your dashboard immediately to review and respond.

This is automated real-time monitoring.
Strategic Minds Intelligence System`,
      });
    }

    // Store notifications in system log
    if (alerts.length > 0) {
      for (const alert of alerts.slice(0, 3)) {
        try {
          await base44.asServiceRole.entities.VisionLog.create({
            session_id: `realtime_alert_${Date.now()}`,
            agent: 'IntelligenceMonitor',
            log_type: 'memory',
            message: `CRITICAL: ${alert.keyword} - ${alert.title}`,
            metadata: JSON.stringify({
              alert_id: alert.id,
              severity: alert.severity,
              models_affected: watchedModelIds.length,
            }),
          });
        } catch (e) {
          console.error('Failed to log alert:', e.message);
        }
      }
    }

    return Response.json({
      success: true,
      alertCount: alerts.length,
      alerts: alerts.slice(0, 10),
      modelsWatched: activeWatches.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});