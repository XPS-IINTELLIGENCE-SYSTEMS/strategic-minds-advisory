import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch external data sources configured by user
    const sources = await base44.entities.ExternalDataSource.filter({
      user_email: user.email,
      sync_enabled: true,
    });

    const results = [];

    for (const source of sources) {
      try {
        let data = null;

        // Placeholder for different source types
        if (source.source_type === 'slack') {
          // Would integrate with Slack connector
          data = { type: 'slack', items: 0 };
        } else if (source.source_type === 'notion') {
          // Would integrate with Notion connector
          data = { type: 'notion', items: 0 };
        } else {
          data = { type: source.source_type, items: 0 };
        }

        // Update last sync
        await base44.entities.ExternalDataSource.update(source.id, {
          last_sync: new Date().toISOString(),
          items_synced: data.items,
        });

        results.push({ source: source.source_name, status: 'synced', items: data.items });
      } catch (error) {
        results.push({ source: source.source_name, status: 'failed', error: error.message });
      }
    }

    return Response.json({ success: true, synced: results.length, results });
  } catch (error) {
    console.error('Intelligence sync error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});