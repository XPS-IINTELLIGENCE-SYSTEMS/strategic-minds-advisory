import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const GITHUB_TOKEN = Deno.env.get('GITHUB_TOKEN');

async function commitToGitHub(owner, repo, file, solution) {
  // Get current file content
  const getRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${file}`,
    {
      headers: { 'Authorization': `token ${GITHUB_TOKEN}` },
    }
  );

  let sha = null;
  let currentContent = '';

  if (getRes.ok) {
    const data = await getRes.json();
    sha = data.sha;
    currentContent = Buffer.from(data.content, 'base64').toString('utf-8');
  }

  // Apply fix to content (simplified - in production, parse and apply precisely)
  const updatedContent = currentContent + '\n\n// AI-suggested fix:\n' + solution;

  // Commit
  const commitRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${file}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `🤖 Auto-fix: ${file}`,
        content: Buffer.from(updatedContent).toString('base64'),
        ...(sha && { sha }),
      }),
    }
  );

  if (!commitRes.ok) {
    throw new Error(`GitHub commit failed: ${commitRes.statusText}`);
  }

  return commitRes.json();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { suggestion, suggestionId } = await req.json();

    if (!suggestion) {
      return Response.json({ error: 'Missing suggestion' }, { status: 400 });
    }

    // Get project info
    const projectIndexes = await base44.entities.ProjectIndex.filter(
      { user_email: user.email },
      '-last_indexed',
      1
    );

    const projectIndex = projectIndexes[0];
    if (!projectIndex?.github_repo_url) {
      return Response.json(
        { error: 'GitHub repo not configured' },
        { status: 400 }
      );
    }

    const [owner, repo] = projectIndex.github_repo_url.split('/').slice(-2);

    // Apply fix to GitHub
    const commitResult = await commitToGitHub(owner, repo, suggestion.file, suggestion.solution);

    // Log operation
    await base44.entities.CodeOperation.create({
      user_email: user.email,
      operation_type: 'modify_file',
      target_path: suggestion.file,
      description: `Auto-fix applied: ${suggestion.title}`,
      status: 'completed',
      content: suggestion.solution,
      timestamp: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      message: 'Fix applied and committed to GitHub',
      commitSha: commitResult.commit.sha,
      htmlUrl: commitResult.content.html_url,
    });
  } catch (error) {
    console.error('Fix application error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});