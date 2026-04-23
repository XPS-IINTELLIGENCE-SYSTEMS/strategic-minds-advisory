import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { topic, context, horizon, predictionType } = await req.json();

    const prompt = `You are a world-class AI prediction and forecasting system with expertise in ${predictionType}.
Topic: ${topic}
Context: ${context}
Time Horizon: ${horizon}

Perform a comprehensive prediction analysis. Return ONLY valid JSON:
{
  "headline": "One powerful predictive statement",
  "probability": 0.78,
  "timeframe": "${horizon}",
  "scenarios": [
    { "name": "Bull Case", "probability": 0.30, "description": "...", "keyDrivers": ["..."], "projectedValue": "+45%" },
    { "name": "Base Case", "probability": 0.50, "description": "...", "keyDrivers": ["..."], "projectedValue": "+18%" },
    { "name": "Bear Case", "probability": 0.20, "description": "...", "keyDrivers": ["..."], "projectedValue": "-12%" }
  ],
  "signals": [
    { "signal": "signal name", "strength": "high|medium|low", "direction": "bullish|bearish|neutral", "description": "..." }
  ],
  "catalysts": ["catalyst 1", "catalyst 2", "catalyst 3", "catalyst 4"],
  "risks": ["risk 1", "risk 2", "risk 3"],
  "keyMetrics": [
    { "metric": "metric name", "current": "value", "predicted": "value", "change": "+X%" }
  ],
  "verdict": "Final 2-3 sentence expert verdict"
}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 3000,
        temperature: 0.2,
        response_format: { type: 'json_object' },
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Groq API error');

    const result = JSON.parse(data.choices[0].message.content);
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});