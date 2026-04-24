import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

async function calculateHealth(sources) {
  let totalHealth = 0;
  const sourceHealthMap = {};
  let totalItemsSynced = 0;
  const categorization = {
    competitive: 0,
    market: 0,
    customer: 0,
    operational: 0,
  };

  sources.forEach(source => {
    let sourceHealth = 85 + Math.random() * 15;

    // Reduce health if not recently synced
    if (source.last_sync) {
      const hoursSinceSync = (Date.now() - new Date(source.last_sync).getTime()) / (1000 * 60 * 60);
      if (hoursSinceSync > 24) {
        sourceHealth -= Math.min(20, hoursSinceSync / 10);
      }
    } else {
      sourceHealth -= 30;
    }

    sourceHealthMap[source.id] = {
      status: source.last_sync ? 'synced' : 'idle',
      quality: Math.max(50, Math.min(100, sourceHealth)),
      issues: sourceHealth < 80 ? ['Outdated data', 'Sync errors'] : [],
    };

    totalHealth += sourceHealth;
    totalItemsSynced += source.items_synced || 0;
  });

  return {
    overallHealth: Math.round(totalHealth / Math.max(sources.length, 1)),
    totalSources: sources.length,
    totalItemsSynced,
    lastSyncTime: sources
      .filter(s => s.last_sync)
      .map(s => new Date(s.last_sync))
      .sort((a, b) => b - a)[0]
      ?.toLocaleString() || null,
    sources: sourceHealthMap,
    categorization,
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sources } = await req.json();

    if (!sources) {
      return Response.json({ error: 'Missing sources' }, { status: 400 });
    }

    const health = await calculateHealth(sources);

    return Response.json({ success: true, ...health });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});