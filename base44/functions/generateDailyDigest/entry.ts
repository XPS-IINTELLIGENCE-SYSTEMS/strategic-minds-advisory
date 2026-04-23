import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch data from today
    const [intelligence, voiceLogs, stressTests, allLogs] = await Promise.all([
      base44.asServiceRole.entities.StrategicIntelligence.list(),
      base44.asServiceRole.entities.VisionLog.filter({ log_type: 'memory' }),
      base44.asServiceRole.entities.StressTestResult.list(),
      base44.asServiceRole.entities.VisionLog.list(),
    ]);

    // Filter for today's data
    const todayIntel = intelligence.filter(i => 
      new Date(i.extracted_date).getTime() >= today.getTime()
    );
    
    const todayLogs = allLogs.filter(l => 
      new Date(l.created_date).getTime() >= today.getTime()
    );

    const voiceInsights = todayLogs.filter(l => l.log_type === 'memory' && l.message.includes('Voice'));
    const todayStressTests = stressTests.filter(s => 
      new Date(s.test_duration_ms || 0).getTime() >= today.getTime()
    ).slice(0, 5);

    // Generate digest using LLM
    const digestResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an executive AI advisor. Create a concise morning strategic brief summarizing today's intelligence gathering and analysis.

TODAY'S DATA CAPTURED:
- New Intelligence Signals: ${todayIntel.length}
  ${todayIntel.slice(0, 3).map(i => `  • ${i.title} (${i.intelligence_type})`).join('\n')}

- Voice Insights Recorded: ${voiceInsights.length}
  ${voiceInsights.slice(0, 2).map(v => `  • ${v.message.substring(0, 50)}...`).join('\n')}

- Stress Tests Executed: ${todayStressTests.length}
  ${todayStressTests.slice(0, 2).map(s => `  • ${s.scenario_name}: ${s.survived ? 'Survived' : 'Needs Pivot'}`).join('\n')}

Generate a JSON response with:
{
  "executive_summary": "string (2-3 sentences of key highlights)",
  "critical_findings": ["string", "string", "string"] (top 3 urgent insights),
  "opportunities": ["string", "string"] (growth opportunities identified),
  "recommendations": "string (3-4 actionable next steps)",
  "confidence_level": "number (0-100 in recommendations)"
}`,
      response_json_schema: {
        type: 'object',
        properties: {
          executive_summary: { type: 'string' },
          critical_findings: { type: 'array', items: { type: 'string' } },
          opportunities: { type: 'array', items: { type: 'string' } },
          recommendations: { type: 'string' },
          confidence_level: { type: 'number' },
        },
      },
    });

    // Create digest record
    const digestRecord = await base44.asServiceRole.entities.DailyDigest.create({
      user_email: user.email,
      digest_date: today.toISOString().split('T')[0],
      summary: digestResponse.executive_summary,
      intelligence_count: todayIntel.length,
      voice_insights_count: voiceInsights.length,
      stress_tests_run: todayStressTests.length,
      critical_findings: digestResponse.critical_findings.join('\n'),
      recommendations: digestResponse.recommendations,
      sent: false,
    });

    // Send email with digest
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: `📊 Daily Strategic Digest - ${new Date().toLocaleDateString()}`,
      body: `
EXECUTIVE MORNING BRIEF

${digestResponse.executive_summary}

CRITICAL FINDINGS:
${digestResponse.critical_findings.map((f, i) => `${i + 1}. ${f}`).join('\n')}

OPPORTUNITIES IDENTIFIED:
${digestResponse.opportunities.map((o, i) => `${i + 1}. ${o}`).join('\n')}

STRATEGIC RECOMMENDATIONS:
${digestResponse.recommendations}

Confidence Level: ${digestResponse.confidence_level}%

---
Data captured today:
• ${todayIntel.length} new intelligence signals
• ${voiceInsights.length} voice insights
• ${todayStressTests.length} stress tests executed

View full dashboard: https://yourapp.com/dashboard
      `,
    });

    // Mark as sent
    await base44.asServiceRole.entities.DailyDigest.update(digestRecord.id, { sent: true });

    return Response.json({
      success: true,
      digest_id: digestRecord.id,
      summary: digestResponse.executive_summary,
      intel_count: todayIntel.length,
      voice_count: voiceInsights.length,
      tests_count: todayStressTests.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});