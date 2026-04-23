import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const userQuery = body.query || '';

    if (!userQuery) {
      return Response.json({ error: 'Query required' }, { status: 400 });
    }

    // Fetch Intelligence Library
    const intelligence = await base44.asServiceRole.entities.StrategicIntelligence.list();
    
    // Fetch Saved Models
    const savedModels = await base44.asServiceRole.entities.SavedModel.list();

    // Build context for LLM
    const intelligenceContext = intelligence
      .slice(0, 50)
      .map(i => `${i.title}: ${i.content.substring(0, 200)}`)
      .join('\n\n');

    const modelsContext = savedModels
      .slice(0, 20)
      .map(m => `${m.name}: ${m.description || 'No description'} (Financial Model: ${m.financial_model?.substring(0, 100)})`)
      .join('\n\n');

    // Query with LLM using available context
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a market intelligence assistant. Answer the user's query using the provided Intelligence Library and Saved Business Models.

USER QUERY: ${userQuery}

INTELLIGENCE LIBRARY (Recent Market Signals):
${intelligenceContext}

SAVED BUSINESS MODELS:
${modelsContext}

Based on this data, provide:
1. Direct answer to their query
2. Relevant market signals from the intelligence library
3. Impact on any saved business models (if applicable)
4. Risk assessment if relevant
5. Actionable recommendations

Be specific and cite data sources.`,
      model: 'gpt_5_mini',
    });

    return Response.json({
      success: true,
      query: userQuery,
      response: response,
      sourceCount: {
        intelligenceItems: intelligence.length,
        savedModels: savedModels.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});