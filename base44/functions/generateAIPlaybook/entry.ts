import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');

async function generatePlaybook(ideaData, stressTests, intelligence) {
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
          content: `You are a strategic advisor generating comprehensive playbooks. 
          Return ONLY valid JSON with no additional text.`,
        },
        {
          role: 'user',
          content: `Generate strategic playbook for:
          Idea: ${ideaData.ideaTitle}
          Description: ${ideaData.ideaDescription}
          Business Model: ${ideaData.businessModel}
          
          Context:
          - Recent stress tests: ${JSON.stringify(stressTests.slice(0, 3))}
          - Market intelligence: ${JSON.stringify(intelligence.slice(0, 3))}
          
          Return JSON:
          {
            "id": "pb-${Date.now()}",
            "title": "Playbook Title",
            "description": "Overview",
            "strategy": "Core strategic direction",
            "steps": ["Step 1", "Step 2", ...],
            "outcomes": "Expected outcomes",
            "metrics": "Success metrics"
          }`,
        },
      ],
      temperature: 0.8,
      max_tokens: 2048,
    }),
  });

  const result = await response.json();
  const content = result.choices[0].message.content;

  try {
    return JSON.parse(content);
  } catch {
    return {
      id: `pb-${Date.now()}`,
      title: 'Strategic Playbook',
      description: content,
      strategy: 'Execute market entry with focus on differentiation',
      steps: [
        'Define target customer segments',
        'Build MVP with key features',
        'Establish market presence',
        'Scale based on validation',
      ],
      outcomes: 'Market traction and customer validation',
      metrics: 'MRR, customer acquisition, retention',
    };
  }
}

async function refinePlaybook(currentPlaybook, refinementPrompt, accessToken) {
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
          content: `You are refining strategic playbooks based on feedback. Return ONLY valid JSON.`,
        },
        {
          role: 'user',
          content: `Refine this playbook: ${JSON.stringify(currentPlaybook)}
          
          Refinement request: ${refinementPrompt}
          
          Return updated JSON with same structure.`,
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
    return { ...currentPlaybook, description: 'Playbook refined' };
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ideaId, ideaTitle, ideaDescription, businessModel, stressTests, intelligence } =
      await req.json();

    const playbook = await generatePlaybook(
      { ideaId, ideaTitle, ideaDescription, businessModel },
      stressTests || [],
      intelligence || []
    );

    return Response.json({ success: true, ...playbook });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});