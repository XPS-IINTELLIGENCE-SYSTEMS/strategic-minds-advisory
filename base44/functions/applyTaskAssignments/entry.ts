import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { decisionId, assignments, suggestions } = await req.json();

    if (!decisionId || !assignments) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update decision tasks with assignments
    const { data } = await base44.asServiceRole.entities.DecisionTask.update(decisionId, {
      assigned_to: JSON.stringify(assignments),
      status: 'assigned',
    });

    // Update team member workload
    const memberWorkload = {};
    Object.values(assignments).forEach(member => {
      memberWorkload[member] = (memberWorkload[member] || 0) + 1;
    });

    for (const [member, count] of Object.entries(memberWorkload)) {
      // Find and update team member
      const teamMembers = await base44.asServiceRole.entities.TeamMember.filter({
        full_name: member,
      });

      if (teamMembers.length > 0) {
        await base44.asServiceRole.entities.TeamMember.update(teamMembers[0].id, {
          current_tasks: (teamMembers[0].current_tasks || 0) + count,
        });
      }
    }

    return Response.json({
      success: true,
      message: 'Assignments applied successfully',
      decisionId,
      assignmentCount: Object.keys(assignments).length,
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});