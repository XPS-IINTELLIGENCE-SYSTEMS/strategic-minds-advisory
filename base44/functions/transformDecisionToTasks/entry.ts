import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { debateId, ideaId, decision } = body;

    // Use LLM to break down decision into concrete tasks
    const taskResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `Transform this strategic decision into a concrete task breakdown for execution.

STRATEGIC DECISION:
${decision}

Generate a JSON response with this structure:
{
  "summary": "string (1-2 sentence summary of execution plan)",
  "tasks": [
    {
      "title": "string (actionable task title)",
      "description": "string (detailed description)",
      "priority": "string (high/medium/low)",
      "estimated_hours": "number (estimated effort)",
      "skill_requirements": ["string"] (required skills/roles),
      "acceptance_criteria": ["string"] (how to know it's done),
      "dependencies": ["string"] (tasks that must come first)
    }
  ],
  "timeline_weeks": "number (estimated total timeline)"
}`,
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          tasks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                priority: { type: 'string' },
                estimated_hours: { type: 'number' },
                skill_requirements: { type: 'array', items: { type: 'string' } },
                acceptance_criteria: { type: 'array', items: { type: 'string' } },
                dependencies: { type: 'array', items: { type: 'string' } },
              },
            },
          },
          timeline_weeks: { type: 'number' },
        },
      },
    });

    // Create DecisionTask record
    const decisionTask = await base44.asServiceRole.entities.DecisionTask.create({
      debate_id: debateId,
      idea_id: ideaId,
      decision: decision,
      tasks: JSON.stringify(taskResponse.tasks),
      created_date: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      decision_task_id: decisionTask.id,
      summary: taskResponse.summary,
      task_count: taskResponse.tasks.length,
      timeline_weeks: taskResponse.timeline_weeks,
      tasks: taskResponse.tasks,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});