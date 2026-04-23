import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { stressTestResultId, ideaId, pivotStrategyText } = body;

    // Fetch stress test result
    const results = await base44.asServiceRole.entities.StressTestResult.filter({
      id: stressTestResultId,
    });

    if (!results || results.length === 0) {
      return Response.json({ error: 'Stress test result not found' }, { status: 404 });
    }

    const result = results[0];

    // Generate actionable tasks from pivot strategy using LLM
    const taskResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `Convert this stress test pivot strategy into a detailed, actionable task list for a development team.

SCENARIO: ${result.scenario_name}
PIVOT STRATEGY: ${result.recommendations || pivotStrategyText}

Generate a JSON array of 5-7 specific, measurable tasks that the team should execute. Each task should have:
1. title: Clear action item (e.g., "Refactor payment processing for multi-currency support")
2. description: 1-2 sentence explanation
3. priority: 1-5 (5 is highest)
4. estimated_days: How many days to complete
5. dependencies: What tasks must be done first (array of indices or empty)
6. assignee_role: Who should do it (engineer, product, design, business)

Format as JSON array only.`,
      response_json_schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            priority: { type: 'number' },
            estimated_days: { type: 'number' },
            dependencies: { type: 'array', items: { type: 'number' } },
            assignee_role: { type: 'string' },
          },
        },
      },
    });

    // Get Google Tasks connector
    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection('69db201897e4e8f9ae073be7');

    // Create Google Tasks list
    const listResponse = await fetch('https://www.googleapis.com/tasks/v1/users/@me/lists', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: `Pivot Strategy: ${result.scenario_name} - ${new Date().toLocaleDateString()}`,
      }),
    });

    const listData = await listResponse.json();
    const taskListId = listData.id;

    // Add tasks to Google Tasks
    const createdTasks = [];
    for (let i = 0; i < taskResponse.length; i++) {
      const taskItem = taskResponse[i];

      const taskCreateResponse = await fetch(
        `https://www.googleapis.com/tasks/v1/lists/${taskListId}/tasks`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: taskItem.title,
            notes: `${taskItem.description}\n\nPriority: ${taskItem.priority}/5 | Est. ${taskItem.estimated_days} days | Role: ${taskItem.assignee_role}`,
            due: new Date(Date.now() + taskItem.estimated_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          }),
        }
      );

      const createdTask = await taskCreateResponse.json();
      createdTasks.push({
        title: taskItem.title,
        google_task_id: createdTask.id,
        priority: taskItem.priority,
        estimated_days: taskItem.estimated_days,
      });
    }

    // Log deployment
    await base44.asServiceRole.entities.VisionLog.create({
      session_id: `deployment_${ideaId}_${Date.now()}`,
      agent: 'DeploymentEngine',
      log_type: 'memory',
      message: `Deployed ${createdTasks.length} tasks from pivot strategy to Google Tasks`,
      idea_id: ideaId,
      metadata: JSON.stringify({
        google_tasks_list_id: taskListId,
        scenario: result.scenario_name,
        task_count: createdTasks.length,
      }),
    });

    return Response.json({
      success: true,
      scenario: result.scenario_name,
      tasks_created: createdTasks.length,
      google_tasks_list_id: taskListId,
      tasks: createdTasks,
      synced_to_google_tasks: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});