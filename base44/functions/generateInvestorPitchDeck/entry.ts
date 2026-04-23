import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { modelId, investorName } = body;

    // Fetch model and related data
    const [model, allTests, allIntel] = await Promise.all([
      base44.entities.SavedModel.filter({ id: modelId }),
      base44.entities.StressTestResult.filter({ idea_id: modelId }),
      base44.entities.StrategicIntelligence.list(),
    ]);

    if (!model || model.length === 0) {
      return Response.json({ error: 'Model not found' }, { status: 404 });
    }

    const selectedModel = model[0];
    const financialData = JSON.parse(selectedModel.financial_model || '{}');

    // Use LLM to generate deck content
    const deckResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a concise, professional investor pitch deck outline for a business model. Format as JSON with the exact structure shown.

BUSINESS MODEL: ${selectedModel.name}
DESCRIPTION: ${selectedModel.description}
ANNUAL REVENUE POTENTIAL: $${(financialData.revenue_year_5 || 0).toLocaleString()}
GROSS MARGIN: ${(financialData.gross_margin || 0).toFixed(0)}%

STRESS TEST RISKS (${allTests.length} scenarios tested):
${allTests.slice(0, 3).map(t => `- ${t.scenario_name}: ${t.survived ? 'Survived' : 'Needs Pivot'} - ${t.recommendations}`).join('\n')}

Create a JSON object with these exact sections:
{
  "title": "string (catchy title)",
  "tagline": "string (one-liner value prop)",
  "market_opportunity": { "tam": "string", "cagr": "string", "why_now": "string" },
  "product_solution": "string (2-3 sentences)",
  "business_model": "string (revenue model)",
  "go_to_market": "string (launch strategy)",
  "financial_projections": { "year_1": "string", "year_3": "string", "year_5": "string" },
  "risk_mitigation": ["string", "string", "string"] (from stress tests),
  "competitive_advantage": ["string", "string"],
  "funding_ask": "string (suggested raise)",
  "use_of_funds": ["string", "string", "string"],
  "team_requirements": ["string", "string"],
  "key_metrics": ["string (metric and target)", "string"]
}`,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          tagline: { type: 'string' },
          market_opportunity: {
            type: 'object',
            properties: {
              tam: { type: 'string' },
              cagr: { type: 'string' },
              why_now: { type: 'string' },
            },
          },
          product_solution: { type: 'string' },
          business_model: { type: 'string' },
          go_to_market: { type: 'string' },
          financial_projections: {
            type: 'object',
            properties: {
              year_1: { type: 'string' },
              year_3: { type: 'string' },
              year_5: { type: 'string' },
            },
          },
          risk_mitigation: { type: 'array', items: { type: 'string' } },
          competitive_advantage: { type: 'array', items: { type: 'string' } },
          funding_ask: { type: 'string' },
          use_of_funds: { type: 'array', items: { type: 'string' } },
          team_requirements: { type: 'array', items: { type: 'string' } },
          key_metrics: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    // Get Google Docs connector
    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection('69ddcb7e5d965b5605cd24b4');

    // Create Google Slides presentation
    const slidesResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `${deckResponse.title} - Investor Pitch (${new Date().toLocaleDateString()})`,
        mimeType: 'application/vnd.google-apps.presentation',
      }),
    });

    const presentationData = await slidesResponse.json();
    const presentationId = presentationData.id;

    // Add slides to presentation
    const slidesRequests = [
      // Cover slide
      {
        createSlide: {
          objectId: 'slide1',
          slideLayout: 'TITLE_SLIDE',
          placeholderIdMappings: [
            { layoutPlaceholder: { type: 'CENTERED_TITLE' }, objectId: 'title1' },
            { layoutPlaceholder: { type: 'SUBTITLE' }, objectId: 'subtitle1' },
          ],
        },
      },
      {
        insertText: {
          objectId: 'title1',
          text: deckResponse.title,
        },
      },
      {
        insertText: {
          objectId: 'subtitle1',
          text: deckResponse.tagline,
        },
      },
      // Market Opportunity slide
      {
        createSlide: {
          objectId: 'slide2',
          slideLayout: 'TITLE_BODY_LAYOUT',
          placeholderIdMappings: [
            { layoutPlaceholder: { type: 'TITLE' }, objectId: 'title2' },
            { layoutPlaceholder: { type: 'BODY' }, objectId: 'body2' },
          ],
        },
      },
      {
        insertText: {
          objectId: 'title2',
          text: 'Market Opportunity',
        },
      },
      {
        insertText: {
          objectId: 'body2',
          text: `TAM: ${deckResponse.market_opportunity.tam}\nCAGR: ${deckResponse.market_opportunity.cagr}\nWhy Now: ${deckResponse.market_opportunity.why_now}`,
        },
      },
      // Financial Projections slide
      {
        createSlide: {
          objectId: 'slide3',
          slideLayout: 'TITLE_BODY_LAYOUT',
          placeholderIdMappings: [
            { layoutPlaceholder: { type: 'TITLE' }, objectId: 'title3' },
            { layoutPlaceholder: { type: 'BODY' }, objectId: 'body3' },
          ],
        },
      },
      {
        insertText: {
          objectId: 'title3',
          text: 'Financial Projections',
        },
      },
      {
        insertText: {
          objectId: 'body3',
          text: `Year 1: ${deckResponse.financial_projections.year_1}\nYear 3: ${deckResponse.financial_projections.year_3}\nYear 5: ${deckResponse.financial_projections.year_5}`,
        },
      },
      // Risk Mitigation slide
      {
        createSlide: {
          objectId: 'slide4',
          slideLayout: 'TITLE_BODY_LAYOUT',
          placeholderIdMappings: [
            { layoutPlaceholder: { type: 'TITLE' }, objectId: 'title4' },
            { layoutPlaceholder: { type: 'BODY' }, objectId: 'body4' },
          ],
        },
      },
      {
        insertText: {
          objectId: 'title4',
          text: 'Risk Mitigation',
        },
      },
      {
        insertText: {
          objectId: 'body4',
          text: deckResponse.risk_mitigation.join('\n• '),
        },
      },
      // Funding Ask slide
      {
        createSlide: {
          objectId: 'slide5',
          slideLayout: 'TITLE_BODY_LAYOUT',
          placeholderIdMappings: [
            { layoutPlaceholder: { type: 'TITLE' }, objectId: 'title5' },
            { layoutPlaceholder: { type: 'BODY' }, objectId: 'body5' },
          ],
        },
      },
      {
        insertText: {
          objectId: 'title5',
          text: 'Funding Ask',
        },
      },
      {
        insertText: {
          objectId: 'body5',
          text: `${deckResponse.funding_ask}\n\nUse of Funds:\n• ${deckResponse.use_of_funds.join('\n• ')}`,
        },
      },
    ];

    const batchUpdateResponse = await fetch(
      `https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests: slidesRequests }),
      }
    );

    const updateResult = await batchUpdateResponse.json();

    // Log deck generation
    await base44.asServiceRole.entities.VisionLog.create({
      session_id: `pitch_deck_${modelId}_${Date.now()}`,
      agent: 'PitchDeckGenerator',
      log_type: 'memory',
      message: `Generated investor pitch deck for ${selectedModel.name}`,
      idea_id: modelId,
      metadata: JSON.stringify({
        presentation_id: presentationId,
        slides_created: slidesRequests.filter(r => r.createSlide).length,
        investor_name: investorName,
      }),
    });

    return Response.json({
      success: true,
      presentation_id: presentationId,
      presentation_url: `https://docs.google.com/presentation/d/${presentationId}/edit`,
      title: deckResponse.title,
      slides_created: slidesRequests.filter(r => r.createSlide).length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});