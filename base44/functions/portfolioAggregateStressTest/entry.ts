import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { portfolioId } = body;

    // Fetch portfolio
    const portfolios = await base44.asServiceRole.entities.Portfolio.filter({
      id: portfolioId,
    });

    if (!portfolios || portfolios.length === 0) {
      return Response.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    const portfolio = portfolios[0];
    const modelIds = portfolio.model_ids.split(',');

    // Fetch all models in portfolio
    const allModels = await base44.asServiceRole.entities.SavedModel.list();
    const portfolioModels = allModels.filter(m => modelIds.includes(m.id));

    // Fetch stress tests for portfolio models
    const allTests = await base44.asServiceRole.entities.StressTestResult.list();
    const portfolioTests = allTests.filter(t => modelIds.includes(t.idea_id));

    // Generate aggregate analysis
    const aggregateResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze the collective resilience of a portfolio of ${portfolioModels.length} business models against global economic shifts.

PORTFOLIO MODELS:
${portfolioModels.map(m => `- ${m.name}: ${m.description?.substring(0, 60)}`).join('\n')}

STRESS TEST RESULTS (sample):
${portfolioTests.slice(0, 5).map(t => `- ${t.scenario_name}: ${t.survived ? '✓ Survived' : '✗ Needs Pivot'} - ${t.verdict}`).join('\n')}

Generate JSON: {
  "portfolio_resilience_score": number (0-100),
  "collective_risk_assessment": "string",
  "diversification_analysis": "string",
  "correlated_risks": ["string", "string"],
  "portfolio_recommendations": "string",
  "critical_dependencies": ["string"],
  "survival_probability": number (0-100)
}`,
      response_json_schema: {
        type: 'object',
        properties: {
          portfolio_resilience_score: { type: 'number' },
          collective_risk_assessment: { type: 'string' },
          diversification_analysis: { type: 'string' },
          correlated_risks: { type: 'array', items: { type: 'string' } },
          portfolio_recommendations: { type: 'string' },
          critical_dependencies: { type: 'array', items: { type: 'string' } },
          survival_probability: { type: 'number' },
        },
      },
    });

    // Update portfolio risk score
    await base44.asServiceRole.entities.Portfolio.update(portfolioId, {
      collective_risk_score: 100 - aggregateResponse.portfolio_resilience_score,
      last_stress_test_date: new Date().toISOString(),
    });

    // Log the analysis
    await base44.asServiceRole.entities.VisionLog.create({
      session_id: `portfolio_${portfolioId}_${Date.now()}`,
      agent: 'PortfolioAnalyzer',
      log_type: 'simulation',
      message: `Portfolio aggregate stress test completed for ${portfolio.name}`,
      metadata: JSON.stringify({
        portfolio_id: portfolioId,
        model_count: portfolioModels.length,
        resilience_score: aggregateResponse.portfolio_resilience_score,
      }),
    });

    return Response.json({
      success: true,
      portfolio_name: portfolio.name,
      model_count: portfolioModels.length,
      test_count: portfolioTests.length,
      resilience_score: aggregateResponse.portfolio_resilience_score,
      collective_risk_assessment: aggregateResponse.collective_risk_assessment,
      diversification_analysis: aggregateResponse.diversification_analysis,
      correlated_risks: aggregateResponse.correlated_risks,
      recommendations: aggregateResponse.portfolio_recommendations,
      survival_probability: aggregateResponse.survival_probability,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});