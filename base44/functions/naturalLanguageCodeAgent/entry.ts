import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const VERCEL_API_KEY = Deno.env.get('VERCEL_API_KEY');
const GITHUB_TOKEN = Deno.env.get('GITHUB_TOKEN');

async function parseNaturalLanguageRequest(prompt, fileIndex, groqApiKey) {
  // Use Groq to understand the user's intent and extract operations
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a code generation AI that understands natural language requests and converts them into file operations. 

Current project structure:
${JSON.stringify(fileIndex, null, 2)}

You must respond ONLY with a valid JSON object (no markdown, no explanation) containing:
{
  "operations": [
    {
      "type": "create_file|modify_file|delete_file|create_entity|create_function",
      "target": "file/path or entity name or function name",
      "content": "code/schema content (for create/modify)",
      "description": "what this does",
      "dependencies": ["npm-package@version"] or []
    }
  ],
  "deployment_needed": true|false,
  "reasoning": "brief explanation of the plan"
}`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  const result = await response.json();
  const content = result.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (e) {
    // If JSON parsing fails, try to extract JSON from markdown code blocks
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    throw new Error(`Failed to parse Groq response: ${content}`);
  }
}

async function createFileInVercel(filePath, content, vercelProjectId, githubToken) {
  // Use GitHub API to create/update files in the linked repo
  const repo = await getVercelGitRepo(vercelProjectId, githubToken);
  const [owner, repo_name] = repo.split('/');

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo_name}/contents/${filePath}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Auto-generated via natural language: ${filePath}`,
        content: btoa(content), // base64 encode
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  return response.json();
}

async function getVercelGitRepo(vercelProjectId, githubToken) {
  const response = await fetch(`https://api.vercel.com/v9/projects/${vercelProjectId}`, {
    headers: { 'Authorization': `Bearer ${VERCEL_API_KEY}` },
  });
  const project = await response.json();
  return project.link?.repo || null;
}

async function deployToVercel(vercelProjectId) {
  // Trigger Vercel deployment
  const response = await fetch(`https://api.vercel.com/v13/deployments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VERCEL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      projectId: vercelProjectId,
      source: 'cli',
    }),
  });

  if (!response.ok) {
    throw new Error(`Vercel deployment failed: ${response.statusText}`);
  }

  const deployment = await response.json();
  return {
    deploymentId: deployment.id,
    url: `https://${deployment.url}`,
  };
}

async function getProjectFileIndex(base44, userEmail, projectName) {
  // Fetch or create a project index for context-aware operations
  const indexes = await base44.entities.ProjectIndex.filter(
    { user_email: userEmail, project_name: projectName },
    '-last_indexed',
    1
  );

  if (indexes.length > 0) {
    return JSON.parse(indexes[0].file_structure || '{}');
  }

  return {
    pages: [],
    components: [],
    entities: [],
    functions: [],
    utilities: [],
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, projectName, vercelProjectId, action = 'generate' } = await req.json();

    if (!prompt || !projectName) {
      return Response.json(
        { error: 'Missing prompt or projectName' },
        { status: 400 }
      );
    }

    // Get project file index for context
    const fileIndex = await getProjectFileIndex(base44, user.email, projectName);

    // Parse natural language request using Groq
    const plan = await parseNaturalLanguageRequest(
      prompt,
      fileIndex,
      Deno.env.get('GROQ_API_KEY')
    );

    const operationResults = [];

    // Execute each operation
    for (const op of plan.operations) {
      let result = {
        type: op.type,
        target: op.target,
        status: 'pending',
      };

      try {
        if (op.type === 'create_file' || op.type === 'modify_file') {
          // Create/update file in GitHub via Vercel
          const fileResult = await createFileInVercel(
            op.target,
            op.content,
            vercelProjectId,
            Deno.env.get('GITHUB_TOKEN')
          );

          result.status = 'completed';
          result.github_url = fileResult.content.html_url;

          // Log operation in Base44
          await base44.entities.CodeOperation.create({
            user_email: user.email,
            operation_type: op.type,
            target_path: op.target,
            description: op.description,
            content: op.content,
            status: 'completed',
            timestamp: new Date().toISOString(),
            natural_language_prompt: prompt,
          });
        } else if (op.type === 'create_entity') {
          // Create entity schema in Base44
          const entityContent = typeof op.content === 'string' 
            ? JSON.parse(op.content) 
            : op.content;

          // Note: Base44 entities are created via dashboard/CLI
          // Here we log the request for manual implementation or future API expansion
          await base44.entities.CodeOperation.create({
            user_email: user.email,
            operation_type: 'create_entity',
            target_path: op.target,
            description: op.description,
            content: JSON.stringify(entityContent),
            status: 'completed',
            timestamp: new Date().toISOString(),
            natural_language_prompt: prompt,
          });

          result.status = 'completed';
          result.note = 'Entity schema logged. Review and create via Base44 dashboard if needed.';
        } else if (op.type === 'create_function') {
          // Create backend function
          const functionContent = op.content;
          const funcPath = `functions/${op.target}.js`;

          const fileResult = await createFileInVercel(
            funcPath,
            functionContent,
            vercelProjectId,
            Deno.env.get('GITHUB_TOKEN')
          );

          result.status = 'completed';
          result.github_url = fileResult.content.html_url;

          await base44.entities.CodeOperation.create({
            user_email: user.email,
            operation_type: 'create_function',
            target_path: op.target,
            description: op.description,
            content: functionContent,
            status: 'completed',
            timestamp: new Date().toISOString(),
            natural_language_prompt: prompt,
          });
        }
      } catch (opError) {
        result.status = 'failed';
        result.error = opError.message;

        await base44.entities.CodeOperation.create({
          user_email: user.email,
          operation_type: op.type,
          target_path: op.target,
          description: op.description,
          status: 'failed',
          error_message: opError.message,
          timestamp: new Date().toISOString(),
          natural_language_prompt: prompt,
        });
      }

      operationResults.push(result);
    }

    // Deploy if needed
    let deploymentUrl = null;
    if (plan.deployment_needed && vercelProjectId) {
      try {
        const deployment = await deployToVercel(vercelProjectId);
        deploymentUrl = deployment.url;
      } catch (deployError) {
        console.error('Deployment failed:', deployError.message);
      }
    }

    return Response.json({
      success: true,
      plan: plan.reasoning,
      operations: operationResults,
      deployment_url: deploymentUrl,
      file_index_updated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Agent error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});