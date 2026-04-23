import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SUPABASE_CONNECTOR_ID = '69e521c8418f5cecefb2567c'; // Supabase connector id

async function syncToSupabase(schema, accessToken) {
  const tableName = schema.name.toLowerCase();
  const columns = Object.entries(schema.properties).map(([name, field]) => ({
    name,
    type: mapTypeToSQL(field.type),
    required: schema.required?.includes(name) || false,
  }));

  // Create table if it doesn't exist
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at timestamp DEFAULT now(),
      updated_at timestamp DEFAULT now(),
      ${columns
        .map(
          c =>
            `${c.name} ${c.type}${c.required ? ' NOT NULL' : ' DEFAULT NULL'}`
        )
        .join(',\n')}
    );
  `;

  // Execute via Supabase API
  const response = await fetch(
    'https://api.supabase.com/v1/rpc/execute_sql',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql: createTableSQL }),
    }
  );

  if (!response.ok) {
    throw new Error(`Supabase sync failed: ${response.statusText}`);
  }

  return { tableName, columns };
}

function mapTypeToSQL(jsonType) {
  const typeMap = {
    string: 'text',
    number: 'numeric',
    integer: 'integer',
    boolean: 'boolean',
    'date': 'date',
    'date-time': 'timestamp',
    object: 'jsonb',
    array: 'jsonb',
  };
  return typeMap[jsonType] || 'text';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { entityName, schema } = await req.json();

    if (!entityName || !schema) {
      return Response.json(
        { error: 'Missing entityName or schema' },
        { status: 400 }
      );
    }

    // Get Supabase connection (app user connector)
    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(
      SUPABASE_CONNECTOR_ID
    );

    // Sync schema to Supabase
    const result = await syncToSupabase(schema, accessToken);

    return Response.json({
      success: true,
      message: 'Schema synced successfully',
      ...result,
    });
  } catch (error) {
    console.error('Schema sync error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});