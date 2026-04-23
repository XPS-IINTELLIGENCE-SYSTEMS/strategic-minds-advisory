import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { url, extractionSchema, workspaceId, jobId } = await req.json();

    if (!url) return Response.json({ error: 'URL required' }, { status: 400 });

    const browserbaseKey = Deno.env.get('BROWSERBASE_API_KEY');
    const browserbaseProjectId = Deno.env.get('BROWSERBASE_PROJECT_ID');

    if (!browserbaseKey || !browserbaseProjectId) {
      return Response.json({ error: 'Browserbase not configured' }, { status: 500 });
    }

    // Create Browserbase session
    const sessionRes = await fetch('https://api.browserbase.com/v1/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${browserbaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ project_id: browserbaseProjectId }),
    });

    const { id: sessionId } = await sessionRes.json();

    // Navigate to URL
    await fetch(`https://api.browserbase.com/v1/sessions/${sessionId}/navigate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${browserbaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    // Wait for page load
    await new Promise(r => setTimeout(r, 3000));

    // Extract content
    const extractRes = await fetch(`https://api.browserbase.com/v1/sessions/${sessionId}/extract`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${browserbaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        schema: extractionSchema || {
          title: 'string',
          content: 'string',
          links: 'array<string>',
        },
      }),
    });

    const extracted = await extractRes.json();

    // Screenshot
    const screenshotRes = await fetch(`https://api.browserbase.com/v1/sessions/${sessionId}/screenshot`, {
      headers: { 'Authorization': `Bearer ${browserbaseKey}` },
    });

    const screenshot = await screenshotRes.arrayBuffer();

    // Store result
    const result = await base44.asServiceRole.entities.StrategicIntelligence.create({
      workspace_id: workspaceId,
      source: 'browserbase_scraper',
      category: extractionSchema?.category || 'competitive',
      title: extracted.title || `Dynamic: ${url}`,
      content: extracted.content || '',
      impact_score: 85,
      sentiment: 'neutral',
      source_url: url,
      relevant_domains: url.split('/')[2],
    });

    // Store screenshot in Supabase Storage (if needed)
    // await base44.storage.from('scraping-screenshots').upload(`${jobId}/${Date.now()}.png`, screenshot);

    // Close session
    await fetch(`https://api.browserbase.com/v1/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${browserbaseKey}` },
    });

    return Response.json({
      success: true,
      url,
      extracted,
      resultId: result.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});