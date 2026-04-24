import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { event, data, old_data, entity_name } = await req.json();

    // Get Supabase connection for current user
    const supabaseConnection = await base44.asServiceRole.connectors.getCurrentAppUserConnection('69e521c8418f5cecefb2567c');
    
    if (!supabaseConnection?.accessToken) {
      return Response.json({ error: 'Supabase not connected' }, { status: 400 });
    }

    const SUPABASE_URL = Deno.env.get('VITE_SUPABASE_URL');
    const tableName = entity_name.toLowerCase();
    const recordId = data?.id || old_data?.id;

    // Prepare payload
    const payload = {
      ...data,
      synced_at: new Date().toISOString(),
    };

    let response;

    // Handle different event types
    if (event.type === 'create') {
      response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseConnection.accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify(payload),
      });
    } else if (event.type === 'update') {
      response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?id=eq.${recordId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${supabaseConnection.accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify(payload),
      });
    } else if (event.type === 'delete') {
      response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?id=eq.${recordId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${supabaseConnection.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
    }

    if (!response.ok) {
      const error = await response.text();
      console.error(`Sync failed for ${entity_name}:`, error);
      return Response.json(
        { error: `Sync failed: ${error}`, success: false },
        { status: response.status }
      );
    }

    console.log(`✓ Synced ${entity_name} (${event.type}) to Supabase`);

    return Response.json({
      success: true,
      entity: entity_name,
      event: event.type,
      synced_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Sync error:', error);
    return Response.json(
      { error: error.message, success: false },
      { status: 500 }
    );
  }
});