import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { intelligenceTitle, intelligenceData, playbookTitle } = await req.json();

    // Generate playbook using LLM
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a strategic business consultant. Based on the following market intelligence, generate a comprehensive, actionable strategy playbook.

Intelligence Title: ${intelligenceTitle}
Intelligence Data: ${intelligenceData}
Playbook Focus: ${playbookTitle}

Generate a detailed JSON response with EXACTLY this structure:
{
  "strategy": "A 2-3 sentence executive summary of the strategic pivot",
  "steps": [
    {
      "title": "Step title",
      "description": "Detailed description of what to do",
      "duration": "Timeline (e.g., '2 weeks')",
      "owner": "Who should own this",
      "checklist": ["Item 1", "Item 2", "Item 3"]
    }
  ],
  "outcomes": "Expected business outcomes and impact",
  "metrics": [
    {
      "name": "Metric name",
      "target": "Target value or description"
    }
  ]
}

Create 5-7 detailed, actionable steps with specific timelines and checklists. Ensure each step is concrete and measurable.`,
      response_json_schema: {
        type: 'object',
        properties: {
          strategy: { type: 'string' },
          steps: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                duration: { type: 'string' },
                owner: { type: 'string' },
                checklist: { type: 'array', items: { type: 'string' } }
              }
            }
          },
          outcomes: { type: 'string' },
          metrics: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                target: { type: 'string' }
              }
            }
          }
        }
      }
    });

    return Response.json({
      strategy: response.strategy,
      steps: response.steps || [],
      outcomes: response.outcomes,
      metrics: response.metrics || []
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});