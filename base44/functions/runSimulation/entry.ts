import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { variables, simulationType, periods = 12 } = await req.json();

    const prompt = `You are an expert quantitative analyst and business strategist. 
Run a ${simulationType} simulation with these variables: ${JSON.stringify(variables)}.
Generate ${periods} time periods of projection data.

Return ONLY valid JSON in this exact format:
{
  "summary": "2-3 sentence executive summary of the simulation outcome",
  "confidence": 0.85,
  "trend": "up|down|volatile|stable",
  "projections": [
    { "period": "Month 1", "value": 100, "optimistic": 120, "pessimistic": 80, "label": "string" }
  ],
  "insights": ["insight 1", "insight 2", "insight 3", "insight 4", "insight 5"],
  "risks": ["risk 1", "risk 2", "risk 3"],
  "recommendations": ["rec 1", "rec 2", "rec 3"]
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
        temperature: 0.3,
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