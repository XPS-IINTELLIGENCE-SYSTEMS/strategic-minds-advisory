import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const VERCEL_API_KEY = Deno.env.get('VERCEL_API_KEY');

async function getVercelProjects() {
  const response = await fetch('https://api.vercel.com/v9/projects', {
    headers: { 'Authorization': `Bearer ${VERCEL_API_KEY}` },
  });

  if (!response.ok) {
    throw new Error(`Vercel API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.projects || [];
}

async function getLatestDeployment(projectId) {
  const response = await fetch(`https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=1`, {
    headers: { 'Authorization': `Bearer ${VERCEL_API_KEY}` },
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.deployments?.[0] || null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all projects from Vercel
    const projects = await getVercelProjects();

    // Enrich with latest deployment info
    const enrichedProjects = await Promise.all(
      projects.map(async (p) => {
        const deployment = await getLatestDeployment(p.id);
        return {
          ...p,
          latest_deployment: deployment,
        };
      })
    );

    // Get most recent deployment across all projects
    const allDeployments = enrichedProjects
      .filter(p => p.latest_deployment)
      .sort((a, b) => new Date(b.latest_deployment.created_at) - new Date(a.latest_deployment.created_at));

    return Response.json({
      success: true,
      projects: enrichedProjects,
      lastDeployment: allDeployments[0]?.latest_deployment?.created_at
        ? new Date(allDeployments[0].latest_deployment.created_at).toLocaleDateString()
        : 'Never',
    });
  } catch (error) {
    console.error('Error fetching Vercel projects:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});