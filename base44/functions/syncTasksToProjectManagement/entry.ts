import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { decisionTaskId, pmTool, projectKey, assignedMembers } = body;

    // Fetch decision task
    const tasks = await base44.asServiceRole.entities.DecisionTask.filter({
      id: decisionTaskId,
    });

    if (!tasks || tasks.length === 0) {
      return Response.json({ error: 'Decision task not found' }, { status: 404 });
    }

    const decisionTask = tasks[0];
    const taskList = JSON.parse(decisionTask.tasks || '[]');
    const externalTaskIds = [];

    // Sync based on PM tool (mock implementations)
    if (pmTool === 'linear') {
      // Use Linear app user connector if available
      const linearTasks = await syncToLinear(base44, taskList, projectKey, assignedMembers);
      externalTaskIds.push(...linearTasks);
    } else if (pmTool === 'jira') {
      // Generic Jira API via backend
      const jiraTasks = await syncToJira(taskList, projectKey, assignedMembers);
      externalTaskIds.push(...jiraTasks);
    } else if (pmTool === 'asana') {
      // Asana API
      const asanaTasks = await syncToAsana(taskList, projectKey, assignedMembers);
      externalTaskIds.push(...asanaTasks);
    }

    // Update DecisionTask status
    await base44.asServiceRole.entities.DecisionTask.update(decisionTaskId, {
      status: 'synced',
      pm_tool: pmTool,
      external_task_ids: externalTaskIds.join(','),
      assigned_to: assignedMembers.join(','),
      synced_date: new Date().toISOString(),
    });

    // Log in VisionLog
    await base44.asServiceRole.entities.VisionLog.create({
      session_id: `sync_${decisionTaskId}`,
      agent: 'ExecutionBridge',
      log_type: 'memory',
      message: `Synced ${taskList.length} tasks to ${pmTool}`,
      idea_id: decisionTask.idea_id,
      metadata: JSON.stringify({
        external_ids: externalTaskIds,
        assigned_count: assignedMembers.length,
      }),
    });

    return Response.json({
      success: true,
      pm_tool: pmTool,
      tasks_created: externalTaskIds.length,
      external_task_ids: externalTaskIds,
      assigned_members: assignedMembers.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function syncToLinear(base44, taskList, projectKey, assignedMembers) {
  // Mock implementation - would use Linear API in production
  const taskIds = [];
  for (let i = 0; i < taskList.length; i++) {
    taskIds.push(`LINEAR-${projectKey}-${Date.now() + i}`);
  }
  return taskIds;
}

async function syncToJira(taskList, projectKey, assignedMembers) {
  // Mock implementation - would use Jira API via secrets
  const taskIds = [];
  for (let i = 0; i < taskList.length; i++) {
    taskIds.push(`${projectKey}-${1000 + i}`);
  }
  return taskIds;
}

async function syncToAsana(taskList, projectKey, assignedMembers) {
  // Mock implementation - would use Asana API
  const taskIds = [];
  for (let i = 0; i < taskList.length; i++) {
    taskIds.push(`asana_${Date.now() + i}`);
  }
  return taskIds;
}