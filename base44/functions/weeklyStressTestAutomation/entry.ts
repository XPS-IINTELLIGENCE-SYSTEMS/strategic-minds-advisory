import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Top 3 global macro scenarios
const MACRO_SCENARIOS = [
  {
    id: 'recession',
    name: 'Global Recession',
    description: 'Sustained economic contraction, rising unemployment, credit freeze'
  },
  {
    id: 'geopolitical',
    name: 'Geopolitical Crisis',
    description: 'Major conflict disrupts supply chains, sanctions, capital flight'
  },
  {
    id: 'technology_disruption',
    name: 'Technology Disruption',
    description: 'Breakthrough technology obsoletes incumbent business models'
  }
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch all validated ideas
    const ideas = await base44.asServiceRole.entities.VisionIdea.filter({
      status: 'validated'
    });

    if (ideas.length === 0) {
      return Response.json({
        success: true,
        message: 'No validated ideas to stress test',
      });
    }

    // Run stress test on each idea against each scenario
    const results = [];

    for (const idea of ideas) {
      for (const scenario of MACRO_SCENARIOS) {
        try {
          // Invoke stress test function
          const stressTestResult = await base44.asServiceRole.functions.invoke('multiAgentStressTest', {
            ideaId: idea.id,
            ideaTitle: idea.title,
            ideaDomain: idea.domain,
            scenarioId: scenario.id,
            scenarioName: scenario.name,
            modelData: idea.simulation_result ? JSON.parse(idea.simulation_result) : {}
          });

          results.push({
            ideaId: idea.id,
            ideaTitle: idea.title,
            scenario: scenario.name,
            survived: stressTestResult.data.finalVerdict?.survived || false,
            recommendations: stressTestResult.data.finalVerdict?.recommendations || [],
          });

          // Save stress test result
          await base44.asServiceRole.entities.StressTestResult.create({
            idea_id: idea.id,
            scenario_id: scenario.id,
            scenario_name: scenario.name,
            survived: stressTestResult.data.finalVerdict?.survived || false,
            verdict: stressTestResult.data.finalVerdict?.reason || 'Stress test completed',
            recommendations: (stressTestResult.data.finalVerdict?.recommendations || []).join('; '),
            failure_points: (stressTestResult.data.finalVerdict?.failurePoints || []).join('; '),
            agent_states: JSON.stringify(stressTestResult.data),
            test_duration_ms: 5000,
          });
        } catch (e) {
          console.error(`Stress test failed for ${idea.title} on ${scenario.name}:`, e.message);
        }
      }
    }

    // Find best-performing ideas (survived most scenarios)
    const ideaSurvivalRates = {};
    for (const result of results) {
      if (!ideaSurvivalRates[result.ideaId]) {
        ideaSurvivalRates[result.ideaId] = {
          title: result.ideaTitle,
          survived: 0,
          total: 0,
          scenarios: []
        };
      }
      ideaSurvivalRates[result.ideaId].total++;
      if (result.survived) {
        ideaSurvivalRates[result.ideaId].survived++;
      }
      ideaSurvivalRates[result.ideaId].scenarios.push(result);
    }

    // Get best-performing idea and save pivot strategy
    let bestIdea = null;
    let maxSurvivalRate = 0;
    
    for (const [ideaId, data] of Object.entries(ideaSurvivalRates)) {
      const survivalRate = data.survived / data.total;
      if (survivalRate > maxSurvivalRate) {
        maxSurvivalRate = survivalRate;
        bestIdea = { ...data, ideaId };
      }
    }

    // Save winning pivot strategy to Idea Board
    if (bestIdea && bestIdea.scenarios.length > 0) {
      const topRecommendations = bestIdea.scenarios[0].recommendations.slice(0, 3);
      
      await base44.asServiceRole.entities.VisionIdea.update(bestIdea.ideaId, {
        status: 'validated',
        iteration: (await base44.asServiceRole.entities.VisionIdea.filter({ id: bestIdea.ideaId }))[0]?.iteration + 1 || 1,
        debug_log: `Weekly stress test: ${(maxSurvivalRate * 100).toFixed(0)}% survival rate. Top pivots: ${topRecommendations.join(' | ')}`
      });

      // Log to system
      await base44.asServiceRole.entities.VisionLog.create({
        session_id: `weekly_stress_test_${Date.now()}`,
        agent: 'StressTestAutomation',
        log_type: 'memory',
        message: `WEEKLY STRESS TEST: ${bestIdea.title} achieved ${(maxSurvivalRate * 100).toFixed(0)}% survival rate`,
        idea_id: bestIdea.ideaId,
        metadata: JSON.stringify({
          survivedScenarios: bestIdea.survived,
          totalScenarios: bestIdea.total,
          topPivots: topRecommendations
        })
      });
    }

    return Response.json({
      success: true,
      ideasTested: ideas.length,
      scenarioCount: MACRO_SCENARIOS.length,
      totalTests: results.length,
      bestPerformer: bestIdea?.title || 'None',
      survivalRate: maxSurvivalRate ? `${(maxSurvivalRate * 100).toFixed(0)}%` : '0%',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});