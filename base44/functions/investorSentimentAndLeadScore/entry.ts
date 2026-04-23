import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const investorId = body.investorId;

    // Fetch investor and their contact logs
    const investors = await base44.asServiceRole.entities.Investor.filter({ id: investorId });
    if (!investors || investors.length === 0) {
      return Response.json({ error: 'Investor not found' }, { status: 404 });
    }

    const investor = investors[0];
    const contactLogs = await base44.asServiceRole.entities.InvestorContactLog.filter({
      investor_id: investorId,
    });

    // Build interaction history
    const interactionSummary = contactLogs
      .slice(-10)
      .map(log => `${log.contact_type}: ${log.notes || 'No notes'} (${log.sentiment || 'neutral'})`)
      .join(' | ');

    // Use LLM for sentiment analysis and lead scoring
    const analysisResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this investor interaction history and provide:
1. Overall sentiment score (1-10, where 10 is most positive)
2. Lead score (0-100 based on engagement level and interest signals)
3. Recommended next action

INVESTOR: ${investor.name} from ${investor.company}
FOCUS AREAS: ${investor.domains}
INTERACTION HISTORY: ${interactionSummary || 'No interactions yet'}

Provide JSON response with: { sentiment_score: number, lead_score: number, recommendation: string }`,
      response_json_schema: {
        type: 'object',
        properties: {
          sentiment_score: { type: 'number' },
          lead_score: { type: 'number' },
          recommendation: { type: 'string' },
        },
      },
    });

    // Save scores back to investor record
    await base44.asServiceRole.entities.Investor.update(investorId, {
      notes: `Sentiment: ${analysisResponse.sentiment_score}/10 | Lead Score: ${analysisResponse.lead_score}/100 | Last: ${new Date().toLocaleDateString()}`,
    });

    return Response.json({
      success: true,
      investor_name: investor.name,
      sentiment_score: analysisResponse.sentiment_score,
      lead_score: analysisResponse.lead_score,
      recommendation: analysisResponse.recommendation,
      interaction_count: contactLogs.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});