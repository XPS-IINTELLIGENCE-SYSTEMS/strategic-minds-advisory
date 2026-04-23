import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const modelId = body.modelId;

    // Fetch the saved model
    const models = await base44.asServiceRole.entities.SavedModel.filter({ id: modelId });
    if (!models || models.length === 0) {
      return Response.json({ error: 'Model not found' }, { status: 404 });
    }

    const model = models[0];
    let modelData = {};
    try {
      modelData = JSON.parse(model.financial_model);
    } catch (e) {
      modelData = {};
    }

    // Fetch recent competitive intelligence
    const allIntelligence = await base44.asServiceRole.entities.StrategicIntelligence.list();
    const competitiveIntel = allIntelligence
      .filter(i => i.intelligence_type === 'competitive' || i.tags?.includes('funding'))
      .slice(0, 30)
      .map(i => `${i.title}: ${i.content.substring(0, 150)}`)
      .join('\n\n');

    // Generate battlecard using LLM
    const battlecardResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a competitive battlecard for our business model vs top competitors.

OUR MODEL: ${model.name}
DESCRIPTION: ${model.description}
FINANCIAL MODEL: Year 1: $${modelData.year1 || 'N/A'}, Year 2: $${modelData.year2 || 'N/A'}, Year 3: $${modelData.year3 || 'N/A'}

COMPETITIVE INTELLIGENCE:
${competitiveIntel}

Generate a JSON battlecard with:
1. Top 3 direct competitors (name, funding, key features)
2. Our competitive advantages (3 key differentiators)
3. Vulnerabilities (2-3 areas where we're weaker)
4. Pricing comparison vs competitors
5. Go-to-market positioning statement
6. Top 3 investor talking points vs competition

Format as structured JSON.`,
      response_json_schema: {
        type: 'object',
        properties: {
          competitors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                funding: { type: 'string' },
                key_features: { type: 'array', items: { type: 'string' } },
              },
            },
          },
          advantages: { type: 'array', items: { type: 'string' } },
          vulnerabilities: { type: 'array', items: { type: 'string' } },
          pricing_positioning: { type: 'string' },
          gtm_statement: { type: 'string' },
          investor_talking_points: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return Response.json({
      success: true,
      model_name: model.name,
      battlecard: battlecardResponse,
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});