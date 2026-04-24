import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const VERCEL_API_KEY = Deno.env.get('VERCEL_API_KEY');

async function getDeploymentLogs(deploymentId) {
  const response = await fetch(
    `https://api.vercel.com/v11/deployments/${deploymentId}/events?until=0`,
    {
      headers: { 'Authorization': `Bearer ${VERCEL_API_KEY}` },
    }
  );

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data.events || [];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { limit = 5 } = await req.json();

    // Fetch recent deployments
    const deploymentsRes = await fetch(
      `https://api.vercel.com/v6/deployments?limit=${limit}`,
      {
        headers: { 'Authorization': `Bearer ${VERCEL_API_KEY}` },
      }
    );

    if (!deploymentsRes.ok) {
      return Response.json(
        { error: 'Failed to fetch Vercel deployments' },
        { status: 500 }
      );
    }

    const deploymentsData = await deploymentsRes.json();
    const deployments = deploymentsData.deployments || [];

    // Fetch logs for failed/errored deployments
    const logs = [];
    for (const deployment of deployments) {
      if (deployment.state === 'ERROR' || deployment.state === 'FAILED') {
        const events = await getDeploymentLogs(deployment.id);
        logs.push({
          id: deployment.id,
          project: deployment.name,
          state: deployment.state,
          url: deployment.url,
          timestamp: deployment.created,
          events: events
            .filter(e => e.type === 'error' || e.text?.includes('error'))
            .slice(0, 3),
        });
      }
    }

    // Extract error messages
    const errorLogs = [];
    logs.forEach(log => {
      log.events.forEach((event, i) => {
        errorLogs.push({
          id: `${log.id}-${i}`,
          project: log.project,
          error: event.text || event.message || 'Unknown error',
          message: event.text?.substring(0, 200),
          timestamp: log.timestamp,
          type: 'error',
        });
      });
    });

    return Response.json({
      success: true,
      logs: errorLogs.slice(0, limit),
      deployments: deployments.length,
      failed: logs.length,
    });
  } catch (error) {
    console.error('Vercel logs fetch error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});