import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');

async function refinePlaybook(currentPlaybook, refinementPrompt) {
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
          content: `You are refining strategic playbooks. Return ONLY valid JSON.`,
        },
        {
          role: 'user',
          content: `Refine this playbook based on feedback:
          
          Current: ${JSON.stringify(currentPlaybook)}
          Feedback: ${refinementPrompt}
          
          Return updated JSON with same structure, incorporating the feedback.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    }),
  });

  const result = await response.json();
  const content = result.choices[0].message.content;

  try {
    return JSON.parse(content);
  } catch {
    return { ...currentPlaybook, strategy: `${currentPlaybook.strategy} (refined)` };
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { playbookId, currentPlaybook, refinementPrompt } = await req.json();

    const refined = await refinePlaybook(currentPlaybook, refinementPrompt);

    return Response.json({ success: true, ...refined });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});