import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get ideas with watched models
    const ideas = await base44.entities.VisionIdea.filter({
      created_by: user.email,
    }, '-created_date', 10);

    const results = [];

    for (const idea of ideas) {
      try {
        const models = await base44.entities.SavedModel.filter({
          idea_id: idea.id,
        });

        for (const model of models) {
          // Run stress test using Groq
          const prompt = `You are a stress-testing analyst. Analyze this business model for vulnerabilities:
          
Model: ${model.name}
Financial Data: ${model.financial_model}

Identify:
1. Top 3 failure scenarios
2. Survival likelihood (0-100%)
3. Pivot recommendations

Return ONLY valid JSON: { "survived": boolean, "verdict": "string", "recommendations": ["str1", "str2", "str3"], "failure_points": "string" }`;

          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages: [{ role: 'user', content: prompt }],
              max_tokens: 800,
              temperature: 0.5,
              response_format: { type: 'json_object' },
            }),
          });

          const data = await response.json();
          if (!response.ok) throw new Error(data.error?.message || 'Groq API error');

          const testResult = JSON.parse(data.choices[0].message.content);

          // Save result
          await base44.entities.StressTestResult.create({
            idea_id: idea.id,
            scenario_id: `weekly_${Date.now()}`,
            scenario_name: 'Weekly Automated Stress Test',
            survived: testResult.survived,
            verdict: testResult.verdict,
            recommendations: testResult.recommendations.join('; '),
            failure_points: testResult.failure_points,
            agent_states: JSON.stringify({ automated: true, timestamp: new Date().toISOString() }),
            test_duration_ms: 0,
          });

          results.push({
            model: model.name,
            survived: testResult.survived,
            verdict: testResult.verdict,
          });
        }
      } catch (error) {
        console.error(`Error testing idea ${idea.id}:`, error);
      }
    }

    return Response.json({
      success: true,
      ideas_tested: ideas.length,
      results_count: results.length,
      results,
    });
  } catch (error) {
    console.error('Weekly stress test error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});