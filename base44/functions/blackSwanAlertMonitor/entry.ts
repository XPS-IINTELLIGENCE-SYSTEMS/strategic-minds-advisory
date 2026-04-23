import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Black Swan Alert Thresholds by Domain
const BLACK_SWAN_INDICATORS = {
  fintech: {
    keywords: ['regulatory crackdown', 'banking crisis', 'credit freeze', 'currency collapse', 'payment processor shutdown'],
    riskScore: 8,
    description: 'Financial system disruption detected',
  },
  aitools: {
    keywords: ['AI regulation ban', 'model collapse', 'training data breach', 'compute shortage', 'API shutdown'],
    riskScore: 8,
    description: 'AI infrastructure disruption detected',
  },
  enterprise: {
    keywords: ['supply chain collapse', 'recession', 'enterprise spending freeze', 'major customer bankruptcy', 'tech layoffs'],
    riskScore: 8,
    description: 'Enterprise market contraction detected',
  },
  climate: {
    keywords: ['climate tipping point', 'extreme weather cascade', 'carbon pricing reversal', 'fossil fuel mandate', 'net-zero policy rollback'],
    riskScore: 8,
    description: 'Climate policy disruption detected',
  },
  biotech: {
    keywords: ['drug approval ban', 'clinical trial shutdown', 'funding freeze', 'regulatory rejection', 'supply chain disruption'],
    riskScore: 8,
    description: 'Biotech sector disruption detected',
  },
  consumer: {
    keywords: ['consumer spending collapse', 'retail bankruptcy wave', 'supply chain breakdown', 'inflation spike', 'unemployment surge'],
    riskScore: 8,
    description: 'Consumer market shock detected',
  },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const userDomain = body.domain || 'enterprise'; // Default domain

    // Fetch all recent intelligence
    const allIntelligence = await base44.asServiceRole.entities.StrategicIntelligence.list();
    
    // Get last 24 hours of data
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentData = allIntelligence.filter(item => {
      const itemDate = new Date(item.extracted_date);
      return itemDate >= oneDayAgo;
    });

    const alerts = [];
    const indicators = BLACK_SWAN_INDICATORS[userDomain] || BLACK_SWAN_INDICATORS.enterprise;

    // Scan recent intelligence for black swan indicators
    for (const item of recentData) {
      const contentLower = `${item.title} ${item.content}`.toLowerCase();
      
      for (const keyword of indicators.keywords) {
        if (contentLower.includes(keyword.toLowerCase())) {
          // High-confidence black swan alert
          alerts.push({
            domain: userDomain,
            indicator: keyword,
            source: item.title,
            severity: indicators.riskScore,
            description: indicators.description,
            fullContent: item.content,
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    // If black swan alerts detected, send email notification
    if (alerts.length > 0) {
      const user = await base44.auth.me();
      if (user && user.email) {
        const alertSummary = alerts.slice(0, 5).map(a => `• ${a.indicator}: ${a.source}`).join('\n');
        
        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: `⚠️ BLACK SWAN ALERT: ${indicators.description}`,
          body: `Critical market signals detected for your ${userDomain} business:

${alertSummary}

${alerts.length > 5 ? `\n+${alerts.length - 5} additional signals...\n` : ''}

Review full analysis in the Alerts dashboard immediately.

Stay vigilant.
Strategic Minds Intelligence System`,
        });
      }
    }

    // Store alerts in database
    for (const alert of alerts) {
      try {
        await base44.asServiceRole.entities.VisionLog.create({
          session_id: `alert_${Date.now()}`,
          agent: 'BlackSwanMonitor',
          log_type: 'error',
          message: `${alert.severity}/10 - ${alert.indicator}: ${alert.source}`,
          metadata: JSON.stringify(alert),
        });
      } catch (e) {
        console.error('Failed to log alert:', e.message);
      }
    }

    return Response.json({
      success: true,
      domain: userDomain,
      alertCount: alerts.length,
      alerts: alerts.slice(0, 10), // Return top 10
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});