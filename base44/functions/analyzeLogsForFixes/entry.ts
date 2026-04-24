import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');

async function analyzeWithAI(logs, codebaseContext) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a debugging expert. Analyze error logs and suggest specific code fixes.
For each error, provide:
1. Title: Brief issue name
2. File: Probable file location
3. Problem: What's causing the error
4. Solution: Exact code fix

Format as JSON array of objects: [{"title", "file", "problem", "solution"}]`,
        },
        {
          role: 'user',
          content: `Error logs:\n${logs.map(l => l.error || l.message).join('\n')}\n\nCodebase:\n${JSON.stringify(codebaseContext)}`,
        },
      ],
    }),
  });

  const result = await response.json();
  const content = result.choices[0].message.content;

  try {
    return JSON.parse(content);
  } catch {
    // Fallback parsing
    return [
      {
        title: 'Deployment Error',
        file: 'src/unknown',
        problem: logs[0]?.message || 'Unknown error',
        solution: 'Check deployment logs for details',
      },
    ];
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { logs = [] } = await req.json();

    if (logs.length === 0) {
      return Response.json({ suggestions: [] });
    }

    // Get codebase context
    const projectIndexes = await base44.entities.ProjectIndex.filter(
      { user_email: user.email },
      '-last_indexed',
      1
    );

    const context = projectIndexes[0]
      ? {
          entities: JSON.parse(projectIndexes[0].entity_schemas || '[]').slice(0, 5),
          functions: JSON.parse(projectIndexes[0].function_list || '[]').slice(0, 10),
        }
      : {};

    // Analyze logs
    const fixes = await analyzeWithAI(logs, context);

    // Add IDs and metadata
    const suggestions = fixes.map((fix, i) => ({
      id: `fix-${Date.now()}-${i}`,
      ...fix,
      status: 'pending',
      timestamp: new Date().toISOString(),
    }));

    return Response.json({
      success: true,
      suggestions,
      count: suggestions.length,
    });
  } catch (error) {
    console.error('Log analysis error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});