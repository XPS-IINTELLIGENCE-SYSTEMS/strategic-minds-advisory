import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const GITHUB_TOKEN = Deno.env.get('GITHUB_TOKEN');
const VERCEL_API_KEY = Deno.env.get('VERCEL_API_KEY');

async function getGitHubFileTree(owner, repo, branch = 'main') {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    {
      headers: { 'Authorization': `token ${GITHUB_TOKEN}` },
    }
  );

  if (!response.ok) return null;
  const data = await response.json();
  return data.tree;
}

async function getVercelProjectDetails(vercelProjectId) {
  const response = await fetch(`https://api.vercel.com/v9/projects/${vercelProjectId}`, {
    headers: { 'Authorization': `Bearer ${VERCEL_API_KEY}` },
  });

  if (!response.ok) return null;
  return response.json();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectName, vercelProjectId, githubRepo } = await req.json();

    if (!projectName || !githubRepo) {
      return Response.json(
        { error: 'Missing projectName or githubRepo' },
        { status: 400 }
      );
    }

    const [owner, repo] = githubRepo.split('/');

    // Fetch file tree from GitHub
    const files = await getGitHubFileTree(owner, repo);
    if (!files) {
      return Response.json(
        { error: 'Failed to fetch GitHub repo' },
        { status: 400 }
      );
    }

    // Parse file structure
    const fileStructure = {};
    const entities = [];
    const functions = [];

    for (const file of files) {
      if (file.type === 'blob') {
        const path = file.path;

        // Categorize files
        if (path.startsWith('entities/') && path.endsWith('.json')) {
          const entityName = path.replace('entities/', '').replace('.json', '');
          entities.push(entityName);
        } else if (path.startsWith('functions/') && path.endsWith('.js')) {
          const funcName = path.replace('functions/', '').replace('.js', '');
          functions.push(funcName);
        }

        // Track file structure
        fileStructure[path] = { size: file.size, url: file.url };
      }
    }

    // Store index in Base44
    const index = await base44.entities.ProjectIndex.create({
      user_email: user.email,
      project_name: projectName,
      file_structure: JSON.stringify(fileStructure),
      entity_schemas: JSON.stringify(entities),
      function_list: JSON.stringify(functions),
      vercel_project_id: vercelProjectId,
      github_repo_url: `https://github.com/${githubRepo}`,
      last_indexed: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      indexed: {
        files_count: Object.keys(fileStructure).length,
        entities_count: entities.length,
        functions_count: functions.length,
      },
      index_id: index.id,
    });
  } catch (error) {
    console.error('Indexing error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});