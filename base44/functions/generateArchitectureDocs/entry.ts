import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const GITHUB_TOKEN = Deno.env.get('GITHUB_TOKEN');
const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');

async function generateArchitectureDoc(codebaseContext) {
  // Use Groq to generate comprehensive architecture documentation
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
          content: `You are a technical documentation expert. Generate comprehensive architecture documentation in Markdown format based on the codebase context provided.

Include:
1. System Overview
2. Entity Relationships (ERD in text format)
3. Backend Functions (list with descriptions)
4. API Endpoints (if applicable)
5. Data Flow Diagrams (in text/ASCII format)
6. Technology Stack
7. Key Dependencies

Be concise but comprehensive. Use proper Markdown formatting.`,
        },
        {
          role: 'user',
          content: `Generate architecture documentation for this codebase:\n\n${JSON.stringify(codebaseContext, null, 2)}`,
        },
      ],
    }),
  });

  const result = await response.json();
  return result.choices[0].message.content;
}

async function commitToGitHub(owner, repo, content, filePath) {
  // Get current file SHA if it exists
  let sha = null;
  const getResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
    {
      headers: { 'Authorization': `token ${GITHUB_TOKEN}` },
    }
  );

  if (getResponse.ok) {
    const data = await getResponse.json();
    sha = data.sha;
  }

  // Commit file
  const commitResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Auto-generated: Update Architecture.md (${new Date().toISOString()})`,
        content: btoa(content),
        ...(sha && { sha }),
      }),
    }
  );

  if (!commitResponse.ok) {
    throw new Error(`GitHub commit failed: ${commitResponse.statusText}`);
  }

  return commitResponse.json();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectName, githubRepo, vercelProjectId } = await req.json();

    if (!projectName || !githubRepo) {
      return Response.json(
        { error: 'Missing projectName or githubRepo' },
        { status: 400 }
      );
    }

    const [owner, repo] = githubRepo.split('/');

    // Get project index for context
    const projectIndexes = await base44.entities.ProjectIndex.filter(
      { user_email: user.email, project_name: projectName },
      '-last_indexed',
      1
    );

    const projectIndex = projectIndexes[0];
    if (!projectIndex) {
      return Response.json(
        { error: 'Project index not found. Run indexProjectFiles first.' },
        { status: 400 }
      );
    }

    // Prepare codebase context
    const codebaseContext = {
      projectName,
      lastIndexed: projectIndex.last_indexed,
      entities: JSON.parse(projectIndex.entity_schemas || '[]'),
      functions: JSON.parse(projectIndex.function_list || '[]'),
      fileCount: Object.keys(JSON.parse(projectIndex.file_structure || '{}')).length,
      technologies: projectIndex.dependencies ? JSON.parse(projectIndex.dependencies) : [],
    };

    // Generate documentation
    const docContent = await generateArchitectureDoc(codebaseContext);

    // Commit to GitHub
    const commitResult = await commitToGitHub(owner, repo, docContent, 'docs/Architecture.md');

    return Response.json({
      success: true,
      message: 'Architecture documentation generated and committed',
      file_path: 'docs/Architecture.md',
      commit_sha: commitResult.commit.sha,
      html_url: commitResult.content.html_url,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Documentation generation error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});