import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all models and intelligence
    const [models, intelligence] = await Promise.all([
      base44.asServiceRole.entities.SavedModel.list(),
      base44.asServiceRole.entities.StrategicIntelligence.list(),
    ]);

    // Get recently added intelligence (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentIntel = intelligence.filter(i => 
      new Date(i.extracted_date).getTime() >= yesterday.getTime()
    );

    const alerts = [];

    // Check correlation for each recent intelligence signal
    for (const intel of recentIntel) {
      for (const model of models) {
        // Calculate correlation score
        const correlationResponse = await base44.integrations.Core.InvokeLLM({
          prompt: `Evaluate correlation between this intelligence signal and business model on a 0-100 scale.

INTELLIGENCE SIGNAL: ${intel.title}
TYPE: ${intel.intelligence_type}
CONTENT: ${intel.content.substring(0, 200)}
DOMAINS: ${intel.domains}

BUSINESS MODEL: ${model.name}
DESCRIPTION: ${model.description}

Return JSON: { "correlation_score": number (0-100), "impact_summary": "string" }`,
          response_json_schema: {
            type: 'object',
            properties: {
              correlation_score: { type: 'number' },
              impact_summary: { type: 'string' },
            },
          },
        });

        // Alert if correlation > 80%
        if (correlationResponse.correlation_score > 80) {
          alerts.push({
            model_id: model.id,
            model_name: model.name,
            intel_id: intel.id,
            intel_title: intel.title,
            correlation_score: correlationResponse.correlation_score,
            impact: correlationResponse.impact_summary,
          });
        }
      }
    }

    // Send alert emails for high-correlation signals
    if (alerts.length > 0) {
      const alertSummary = alerts
        .sort((a, b) => b.correlation_score - a.correlation_score)
        .slice(0, 5)
        .map(a => `
⚠️ HIGH-CORRELATION ALERT (${a.correlation_score}%)
Model: ${a.model_name}
Signal: ${a.intel_title}
Impact: ${a.impact}
`)
        .join('\n');

      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: `🚨 Strategic Intelligence Alert - ${alerts.length} High-Correlation Signal(s)`,
        body: `
INTELLIGENCE CORRELATION ALERTS

${alertSummary}

These signals have been detected as highly correlated (>80% confidence) with your business models.

RECOMMENDED ACTIONS:
1. Review the full intelligence in your dashboard
2. Consider running a stress test on affected models
3. Discuss impact with your strategic team

View in dashboard: https://yourapp.com/dashboard

---
${alerts.length} high-correlation signals detected
        `,
      });
    }

    return Response.json({
      success: true,
      alerts_generated: alerts.length,
      top_alerts: alerts.slice(0, 3),
      email_sent: alerts.length > 0,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});