import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { dataSourceId } = body;

    // Fetch data source config
    const sources = await base44.asServiceRole.entities.ExternalDataSource.filter({
      id: dataSourceId,
    });

    if (!sources || sources.length === 0) {
      return Response.json({ error: 'Data source not found' }, { status: 404 });
    }

    const source = sources[0];
    const config = JSON.parse(source.config || '{}');

    let extractedData = [];

    if (source.source_type === 'slack') {
      extractedData = await syncFromSlack(base44, source.connector_id, config);
    } else if (source.source_type === 'notion') {
      extractedData = await syncFromNotion(base44, source.connector_id, config);
    }

    // Parse extracted data into intelligence signals
    const signals = [];
    for (const item of extractedData) {
      const signalResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `Extract competitive intelligence signal from this external data:

TITLE: ${item.title}
CONTENT: ${item.content}

Return JSON: {
  "title": "string (intelligence signal title)",
  "content_summary": "string",
  "intelligence_type": "string (competitive/market_trend/opportunity/risk/other)",
  "domains": ["string"] (applicable domains),
  "confidence": "number (0-100)"
}`,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            content_summary: { type: 'string' },
            intelligence_type: { type: 'string' },
            domains: { type: 'array', items: { type: 'string' } },
            confidence: { type: 'number' },
          },
        },
      });

      if (signalResponse.confidence > 60) {
        const intel = await base44.asServiceRole.entities.StrategicIntelligence.create({
          title: signalResponse.title,
          content: signalResponse.content_summary,
          intelligence_type: signalResponse.intelligence_type,
          domains: signalResponse.domains.join(','),
          value_score: signalResponse.confidence,
          rarity_score: 70,
          extracted_date: new Date().toISOString().split('T')[0],
          tags: `external_${source.source_type}`,
        });

        signals.push(intel);
      }
    }

    // Update sync metadata
    await base44.asServiceRole.entities.ExternalDataSource.update(dataSourceId, {
      last_sync: new Date().toISOString(),
      items_synced: extractedData.length,
    });

    return Response.json({
      success: true,
      source_type: source.source_type,
      items_extracted: extractedData.length,
      signals_created: signals.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function syncFromSlack(base44, connectorId, config) {
  const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(connectorId);

  const channelId = config.channel_id;
  const response = await fetch(
    `https://slack.com/api/conversations.history?channel=${channelId}&limit=50`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    }
  );

  const data = await response.json();
  return (data.messages || []).map(msg => ({
    title: msg.text?.substring(0, 100) || 'Slack Message',
    content: msg.text || '',
    timestamp: msg.ts,
  }));
}

async function syncFromNotion(base44, connectorId, config) {
  const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(connectorId);

  const databaseId = config.database_id;
  const response = await fetch(
    `https://api.notion.com/v1/databases/${databaseId}/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    }
  );

  const data = await response.json();
  return (data.results || []).map(page => ({
    title: page.properties.Name?.title?.[0]?.plain_text || 'Notion Page',
    content: JSON.stringify(page.properties),
  }));
}