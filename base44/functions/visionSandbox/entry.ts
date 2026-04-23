import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

async function callGroq(apiKey, system, user) {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      max_tokens: 4096,
      temperature: 0.4,
      response_format: { type: 'json_object' },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Groq error');
  return JSON.parse(data.choices[0].message.content);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { ideaTitle, ideaConcept, mvpSpec, mode } = await req.json();
    const apiKey = Deno.env.get('GROQ_API_KEY');

    if (mode === 'provision') {
      // Generate full sandbox spec: DB schema, API endpoints, sample code
      const result = await callGroq(apiKey,
        `You are the Coder Agent generating a complete sandbox specification for an MVP. Output JSON only.`,
        `Idea: "${ideaTitle}"
Concept: ${ideaConcept}
MVP Spec: ${mvpSpec || 'Not yet generated'}

Generate a complete sandbox spec:
{
  "app_name": "string",
  "tech_stack": { "frontend": "string", "backend": "string", "database": "string", "ai": "string" },
  "database_schema": [
    { "table": "string", "columns": [{ "name": "string", "type": "string", "description": "string", "primary_key": bool }] }
  ],
  "api_endpoints": [
    { "method": "GET|POST|PUT|DELETE", "path": "/api/...", "description": "string", "request_body": {}, "response_example": {} }
  ],
  "core_algorithms": [
    { "name": "string", "language": "python", "pseudocode": "string", "description": "string" }
  ],
  "sample_code": [
    { "filename": "string", "language": "javascript|python|sql", "code": "string", "description": "string" }
  ],
  "env_variables": [{ "key": "string", "description": "string", "example": "string" }],
  "deployment_steps": ["step 1", "step 2"],
  "test_cases": [{ "name": "string", "input": {}, "expected_output": {}, "description": "string" }]
}`
      );
      return Response.json({ success: true, sandbox: result });
    }

    if (mode === 'run_test') {
      const { testCase, endpoint, schema } = await req.json();
      // Simulate running a test against the sandbox
      const result = await callGroq(apiKey,
        `You are a sandbox test runner. Simulate the execution of a test case and return realistic results.`,
        `Test case: ${JSON.stringify(testCase)}
API Endpoint: ${JSON.stringify(endpoint || {})}
DB Schema context: ${JSON.stringify(schema || {}).substring(0, 500)}

Return JSON: { "passed": bool, "execution_time_ms": number, "response": {}, "logs": ["log1", "log2"], "errors": [] }`
      );
      return Response.json({ success: true, result });
    }

    return Response.json({ error: 'Unknown mode' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});