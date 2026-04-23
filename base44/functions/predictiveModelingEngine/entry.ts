import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const modelId = body.modelId;

    // Fetch saved model
    const models = await base44.asServiceRole.entities.SavedModel.filter({ id: modelId });
    if (!models || models.length === 0) {
      return Response.json({ error: 'Model not found' }, { status: 404 });
    }

    const model = models[0];
    let financialData = {};
    try {
      financialData = JSON.parse(model.financial_model || '{}');
    } catch (e) {
      financialData = {};
    }

    // Fetch recent market intelligence for context
    const allIntel = await base44.asServiceRole.entities.StrategicIntelligence.list();
    const contextualIntel = allIntel
      .slice(0, 20)
      .map(i => `${i.title}: ${i.content.substring(0, 100)}`)
      .join('\n');

    // Generate predictions using LLM
    const predictionResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a financial analyst. Provide revenue and growth projections for this business model over 5 years.

BUSINESS MODEL: ${model.name}
DESCRIPTION: ${model.description}
CURRENT FINANCIALS (Year 1): Revenue: $${financialData.year1 || 100}k, Growth: ${financialData.growth_rate || 20}%

MARKET CONTEXT:
${contextualIntel}

Generate a JSON response with:
1. year_by_year_revenue: [yr1, yr2, yr3, yr4, yr5] in thousands
2. growth_rates: [rate1, rate2, rate3, rate4, rate5] as percentages
3. market_assumptions: string explaining key assumptions
4. risk_factors: array of top 3 risks
5. upside_scenario: best case revenue in year 5
6. downside_scenario: worst case revenue in year 5
7. confidence_score: 0-100

Format as JSON only.`,
      response_json_schema: {
        type: 'object',
        properties: {
          year_by_year_revenue: { type: 'array', items: { type: 'number' } },
          growth_rates: { type: 'array', items: { type: 'number' } },
          market_assumptions: { type: 'string' },
          risk_factors: { type: 'array', items: { type: 'string' } },
          upside_scenario: { type: 'number' },
          downside_scenario: { type: 'number' },
          confidence_score: { type: 'number' },
        },
      },
    });

    return Response.json({
      success: true,
      model_name: model.name,
      predictions: predictionResponse,
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});