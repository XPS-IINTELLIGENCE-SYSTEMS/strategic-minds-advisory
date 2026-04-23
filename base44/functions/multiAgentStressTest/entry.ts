import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { ideaId, ideaTitle, ideaDomain, scenarioId, scenarioName, modelData } = await req.json();

    const rounds = [];
    const agentStates = {
      validator: { risks: [], flags: [] },
      strategist: { pivots: [], strategies: [] },
      analyzer: { projections: [], outcomes: [] },
    };

    // 3-round competitive loop
    for (let roundNum = 1; roundNum <= 3; roundNum++) {
      const agentResponses = [];

      // Round 1: Validator identifies risks
      if (roundNum === 1) {
        const validatorRes = await base44.functions.invoke('groqChat', {
          messages: [{
            role: 'user',
            content: `You are a Risk Validator. Analyze "${ideaTitle}" (${ideaDomain}) against this black swan: "${scenarioName}".

Identify:
1. Top 3 critical risks if this scenario occurs
2. Survival probability (0-100%)
3. What assumptions break first

Be brutal and concise.`,
          }],
          systemPrompt: 'You are an elite risk validator. Be extremely critical and identify failure modes.',
        });

        agentStates.validator.risks = validatorRes.data.content;
        agentResponses.push({
          id: 'validator',
          name: 'Validator',
          emoji: '✅',
          status: 'responded',
          response: validatorRes.data.content,
        });
      }

      // Round 2: Strategist proposes pivots
      if (roundNum === 2) {
        const strategistRes = await base44.functions.invoke('groqChat', {
          messages: [{
            role: 'user',
            content: `You are a Strategist. Given "${ideaTitle}" facing "${scenarioName}":

Validator flagged these risks:
${agentStates.validator.risks}

Propose:
1. 3 pivot strategies to survive the scenario
2. Timeline for execution (days)
3. What capabilities need to be built

Be specific and actionable.`,
          }],
          systemPrompt: 'You are an elite strategist. Propose bold, specific pivots.',
        });

        agentStates.strategist.pivots = strategistRes.data.content;
        agentResponses.push({
          id: 'strategist',
          name: 'Strategist',
          emoji: '♟️',
          status: 'responded',
          response: strategistRes.data.content,
        });
      }

      // Round 3: Analyzer models outcomes
      if (roundNum === 3) {
        const analyzerRes = await base44.functions.invoke('groqChat', {
          messages: [{
            role: 'user',
            content: `You are an Analyst. Model outcomes for "${ideaTitle}" under "${scenarioName}":

Validator's risks:
${agentStates.validator.risks}

Strategist's pivots:
${agentStates.strategist.pivots}

Calculate:
1. 3-year revenue impact if NO pivot (best/worst case)
2. Revenue impact IF pivots executed
3. Success probability with pivots (0-100%)

Use the current model baseline: ${JSON.stringify(modelData?.revenueModel || { year1: 100, year2: 300, year3: 800 })}`,
          }],
          systemPrompt: 'You are an elite quantitative analyst. Model specific financial outcomes.',
        });

        agentStates.analyzer.outcomes = analyzerRes.data.content;
        agentResponses.push({
          id: 'analyzer',
          name: 'Analyzer',
          emoji: '🔬',
          status: 'responded',
          response: analyzerRes.data.content,
        });
      }

      rounds.push({ roundNum, agentResponses });
    }

    // Final verdict from agent consensus
    const verdictRes = await base44.functions.invoke('groqChat', {
      messages: [{
        role: 'user',
        content: `Three elite agents have stress-tested "${ideaTitle}" against "${scenarioName}".

Validator's assessment:
${agentStates.validator.risks}

Strategist's pivots:
${agentStates.strategist.pivots}

Analyzer's financial model:
${agentStates.analyzer.outcomes}

Render a single VERDICT (survived: true/false) with:
1. One-line reason
2. Top 3 specific recommendations
3. If not survived: 2-3 failure points that kill the business

Format as JSON.`,
      }],
      systemPrompt: 'You render final verdicts on business model resilience.',
      response_json_schema: {
        type: 'object',
        properties: {
          survived: { type: 'boolean' },
          reason: { type: 'string' },
          recommendations: { type: 'array', items: { type: 'string' } },
          failurePoints: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    // Save test result to database
    const testResult = {
      idea_id: ideaId,
      scenario_id: scenarioId,
      scenario_name: scenarioName,
      survived: verdictRes.data.survived,
      verdict: verdictRes.data.reason,
      recommendations: verdictRes.data.recommendations?.join('; ') || '',
      failure_points: verdictRes.data.failurePoints?.join('; ') || '',
      agent_states: JSON.stringify(agentStates),
    };

    await base44.asServiceRole.entities.StressTestResult.create(testResult);

    return Response.json({
      success: true,
      rounds,
      finalVerdict: verdictRes.data,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});