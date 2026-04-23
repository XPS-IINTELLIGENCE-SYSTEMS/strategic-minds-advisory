import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const GITHUB_WEBHOOK_SECRET = Deno.env.get('GITHUB_WEBHOOK_SECRET');

async function verifyGitHubSignature(payload, signature) {
  if (!GITHUB_WEBHOOK_SECRET) {
    console.warn('GITHUB_WEBHOOK_SECRET not set, skipping verification');
    return true;
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(GITHUB_WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const hash = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const hexHash = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  const expected = `sha256=${hexHash}`;

  return expected === signature;
}

async function triggerIndexing(base44, projectName, repoUrl) {
  try {
    const result = await base44.functions.invoke('indexProjectFiles', {
      projectName,
      githubRepoUrl: repoUrl,
    });
    return result;
  } catch (error) {
    console.error('Indexing error:', error);
    throw error;
  }
}

Deno.serve(async (req) => {
  try {
    // Verify webhook signature
    const signature = req.headers.get('x-hub-signature-256');
    const payload = await req.text();

    if (!(await verifyGitHubSignature(payload, signature))) {
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(payload);

    // Only trigger on push events
    if (event.action !== 'opened' && req.headers.get('x-github-event') !== 'push') {
      return Response.json({ message: 'Not a push event' });
    }

    const base44 = createClientFromRequest(req);

    // Extract repo info
    const repoUrl = event.repository?.full_name || event.pull_request?.head?.repo?.full_name;
    const projectName = event.repository?.name || 'unknown';

    if (!repoUrl) {
      return Response.json({ error: 'No repository found in webhook' }, { status: 400 });
    }

    // Trigger indexing
    const indexResult = await triggerIndexing(base44, projectName, repoUrl);

    return Response.json({
      success: true,
      message: 'Indexing triggered',
      project: projectName,
      repository: repoUrl,
      indexResult,
    });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});