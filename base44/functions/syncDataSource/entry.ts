import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');

async function categorizeIntelligence(items) {
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
          content: `Categorize intelligence data into: competitive, market, customer, operational.
          Return JSON with categories and tags.`,
        },
        {
          role: 'user',
          content: `Categorize: ${JSON.stringify(items.slice(0, 5))}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 800,
    }),
  });

  const result = await response.json();
  return result.choices[0].message.content;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sourceId } = await req.json();

    if (!sourceId) {
      return Response.json({ error: 'Missing sourceId' }, { status: 400 });
    }

    // Simulate sync
    const itemsProcessed = Math.floor(Math.random() * 100) + 20;

    // Update source in database
    const { data } = await base44.asServiceRole.entities.ExternalDataSource.update(sourceId, {
      last_sync: new Date().toISOString(),
      items_synced: itemsProcessed,
      sync_enabled: true,
    });

    // Categorize new items
    if (itemsProcessed > 0) {
      await categorizeIntelligence([]);
    }

    return Response.json({
      success: true,
      itemsProcessed,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});