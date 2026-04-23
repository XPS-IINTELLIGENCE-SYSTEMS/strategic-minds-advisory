import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { automationType, config, targetData } = await req.json();

    const prompt = `You are an expert AI automation orchestrator. 
Automation Type: ${automationType}
Configuration: ${JSON.stringify(config)}
Target Data: ${JSON.stringify(targetData)}

Execute this automation task and return a comprehensive result. Return ONLY valid JSON:
{
  "status": "completed|partial|failed",
  "executionTime": "2.3s",
  "tasksCompleted": 5,
  "tasksTotal": 5,
  "output": {
    "summary": "What was accomplished",
    "results": ["result 1", "result 2", "result 3"],
    "generatedContent": "Main generated content here (can be long)",
    "metadata": {}
  },
  "nextActions": ["suggested next step 1", "suggested next step 2"],
  "logs": [
    { "timestamp": "00:00:01", "level": "info", "message": "..." },
    { "timestamp": "00:00:02", "level": "success", "message": "..." }
  ]
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
        max_tokens: 4096,
        temperature: 0.4,
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