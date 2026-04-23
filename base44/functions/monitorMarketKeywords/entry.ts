import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all keyword alerts for this user
    const keywordAlerts = await base44.asServiceRole.entities.KeywordAlert.filter({
      user_email: user.email,
      is_active: true,
    });

    if (!keywordAlerts || keywordAlerts.length === 0) {
      return Response.json({ alerts_sent: 0, success: true });
    }

    // Fetch recent intelligence (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const allIntel = await base44.asServiceRole.entities.StrategicIntelligence.list();
    const recentIntel = allIntel.filter(i => 
      new Date(i.extracted_date).getTime() >= yesterday.getTime()
    );

    const alertsSent = [];

    // Check each keyword alert against recent intelligence
    for (const alert of keywordAlerts) {
      const keywords = alert.keywords.split(',').map(k => k.trim().toLowerCase());
      const matchedSignals = [];

      for (const intel of recentIntel) {
        // Calculate relevance and impact
        const titleLower = intel.title.toLowerCase();
        const contentLower = intel.content.toLowerCase();
        const keywordMatches = keywords.filter(k => 
          titleLower.includes(k) || contentLower.includes(k)
        ).length;

        if (keywordMatches > 0) {
          // Calculate impact score
          const baseRelevance = (keywordMatches / keywords.length) * 100;
          const intelValue = intel.value_score || 50;
          const typeBoost = ['competitive', 'market_trend', 'risk'].includes(intel.intelligence_type) ? 1.2 : 1;
          const impactScore = Math.min(baseRelevance * 0.4 + intelValue * 0.6, 100) * typeBoost;

          if (impactScore >= alert.minimum_impact_score) {
            matchedSignals.push({
              title: intel.title,
              content: intel.content.substring(0, 200),
              impact_score: Math.round(impactScore),
              type: intel.intelligence_type,
              matched_keywords: keywords.filter(k => titleLower.includes(k) || contentLower.includes(k)),
            });
          }
        }
      }

      // Send alert if signals matched
      if (matchedSignals.length > 0) {
        const sortedSignals = matchedSignals.sort((a, b) => b.impact_score - a.impact_score);
        const topSignals = sortedSignals.slice(0, 5);

        const emailBody = `
🚨 MARKET KEYWORD ALERT

Model: ${alert.model_name}
Keywords Monitored: ${alert.keywords}
Monitoring Level: ${alert.minimum_impact_score}% minimum impact

MATCHED SIGNALS (${matchedSignals.length} total):

${topSignals.map((signal, i) => `
${i + 1}. [${signal.impact_score}% IMPACT] ${signal.title}
   Type: ${signal.type}
   Keywords: ${signal.matched_keywords.join(', ')}
   Summary: ${signal.content}
`).join('\n')}

---
These signals may significantly impact your "${alert.model_name}" business model.

Review in dashboard: https://yourapp.com/dashboard
        `.trim();

        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: `🔴 MARKET ALERT: ${topSignals[0].title.substring(0, 50)}...`,
          body: emailBody,
        });

        // Update alert metadata
        await base44.asServiceRole.entities.KeywordAlert.update(alert.id, {
          last_alert_date: new Date().toISOString(),
          alert_count: (parseInt(alert.alert_count || 0) + 1).toString(),
        });

        alertsSent.push({
          alert_id: alert.id,
          model: alert.model_name,
          signals_matched: matchedSignals.length,
          top_signal: topSignals[0].title,
          impact: topSignals[0].impact_score,
        });
      }
    }

    return Response.json({
      success: true,
      alerts_checked: keywordAlerts.length,
      alerts_sent: alertsSent.length,
      details: alertsSent,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});