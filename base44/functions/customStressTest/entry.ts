import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const {
      ideaId,
      scenarioName,
      probability,
      duration,
      impactScore,
    } = body;

    // Fetch the idea
    const ideas = await base44.asServiceRole.entities.VisionIdea.filter({ id: ideaId });
    if (!ideas || ideas.length === 0) {
      return Response.json({ error: 'Idea not found' }, { status: 404 });
    }

    const idea = ideas[0];

    // Log debate start
    await base44.asServiceRole.entities.VisionLog.create({
      session_id: `custom_stress_test_${ideaId}_${Date.now()}`,
      agent: 'System',
      log_type: 'debate',
      message: `Starting custom stress test: ${scenarioName} (P: ${(probability * 100).toFixed(0)}%, D: ${duration}mo, I: ${(impactScore * 100).toFixed(0)})`,
      idea_id: ideaId,
      metadata: JSON.stringify({ round: 'initialization' }),
    });

    // Round 1: Validator Risk Assessment
    const validatorPrompt = `You are the Validator agent. Assess the risks of "${idea.title}" under this scenario:
${scenarioName}
- Probability: ${(probability * 100).toFixed(0)}%
- Duration: ${duration} months
- Impact Severity: ${(impactScore * 100).toFixed(0)}/100

Identify critical failure points and risk signals.`;

    const validatorResponse = await base44.integrations.Core.InvokeLLM({
      prompt: validatorPrompt,
      model: 'gpt_5_mini',
    });

    await base44.asServiceRole.entities.VisionLog.create({
      session_id: `custom_stress_test_${ideaId}_${Date.now()}`,
      agent: 'Validator',
      log_type: 'debate',
      message: validatorResponse,
      idea_id: ideaId,
      metadata: JSON.stringify({ round: 1 }),
    });

    // Round 2: Strategist Pivot Recommendation
    const strategistPrompt = `You are the Strategist agent. Based on the Validator's risk assessment of "${idea.title}" under "${scenarioName}", recommend 3 strategic pivots to survive.
Current model: ${idea.description}
Impact level: ${impactScore}

Provide actionable, specific pivot strategies.`;

    const strategistResponse = await base44.integrations.Core.InvokeLLM({
      prompt: strategistPrompt,
      model: 'gpt_5_mini',
    });

    await base44.asServiceRole.entities.VisionLog.create({
      session_id: `custom_stress_test_${ideaId}_${Date.now()}`,
      agent: 'Strategist',
      log_type: 'debate',
      message: strategistResponse,
      idea_id: ideaId,
      metadata: JSON.stringify({ round: 2 }),
    });

    // Round 3: Analyzer Financial Impact
    const analyzerPrompt = `You are the Analyzer agent. Evaluate the financial impact of "${scenarioName}" on "${idea.title}" given:
- Probability: ${probability}
- Duration: ${duration} months
- Impact: ${impactScore}

Provide a quantitative survival assessment (survived: true/false) and explain the financial implications.`;

    const analyzerResponse = await base44.integrations.Core.InvokeLLM({
      prompt: analyzerPrompt,
      model: 'gpt_5_mini',
    });

    await base44.asServiceRole.entities.VisionLog.create({
      session_id: `custom_stress_test_${ideaId}_${Date.now()}`,
      agent: 'Analyzer',
      log_type: 'debate',
      message: analyzerResponse,
      idea_id: ideaId,
      metadata: JSON.stringify({ round: 3 }),
    });

    // Save custom stress test result
    const survived = analyzerResponse.toLowerCase().includes('survived: true') || 
                    analyzerResponse.toLowerCase().includes('survive');

    await base44.asServiceRole.entities.StressTestResult.create({
      idea_id: ideaId,
      scenario_id: `custom_${Date.now()}`,
      scenario_name: scenarioName,
      survived,
      verdict: `Custom stress test: ${scenarioName} - ${survived ? 'SURVIVED' : 'FAILED'}`,
      recommendations: strategistResponse.substring(0, 500),
      failure_points: validatorResponse.substring(0, 300),
      agent_states: JSON.stringify({
        validator: validatorResponse,
        strategist: strategistResponse,
        analyzer: analyzerResponse,
        parameters: { probability, duration, impactScore },
      }),
      test_duration_ms: 3000,
    });

    return Response.json({
      success: true,
      scenario: scenarioName,
      survived,
      debate_logged: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});