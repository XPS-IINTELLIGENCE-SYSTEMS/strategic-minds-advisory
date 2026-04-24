import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get Supabase connection for current app user
    const supabaseConnection = await base44.asServiceRole.connectors.getCurrentAppUserConnection('69e521c8418f5cecefb2567c');
    
    if (!supabaseConnection?.accessToken) {
      return Response.json({ error: 'Supabase not connected' }, { status: 400 });
    }

    const SUPABASE_URL = Deno.env.get('VITE_SUPABASE_URL');
    const accessToken = supabaseConnection.accessToken;

    const status = {
      timestamp: new Date().toISOString(),
      user_email: user.email,
      supabase_url: SUPABASE_URL,
      sections: {},
    };

    // 1. Query project info
    try {
      const projectRes = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      status.sections.project = {
        status: projectRes.ok ? 'active' : 'error',
        response_code: projectRes.status,
      };
    } catch (e) {
      status.sections.project = { status: 'error', message: e.message };
    }

    // 2. Query all tables
    try {
      const tablesRes = await fetch(`${SUPABASE_URL}/rest/v1/information_schema.tables?table_schema=eq.public`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (tablesRes.ok) {
        const tables = await tablesRes.json();
        status.sections.tables = {
          count: tables.length,
          tables: tables.map(t => ({
            name: t.table_name,
            type: t.table_type,
          })),
        };
      }
    } catch (e) {
      status.sections.tables = { error: e.message };
    }

    // 3. Query database size
    try {
      const sizeRes = await fetch(
        `${SUPABASE_URL}/rest/v1/rpc/pg_database_size`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${accessToken}` },
        }
      );

      if (sizeRes.ok) {
        const result = await sizeRes.json();
        status.sections.database_size = {
          bytes: result,
          mb: (result / 1024 / 1024).toFixed(2),
          gb: (result / 1024 / 1024 / 1024).toFixed(3),
        };
      }
    } catch (e) {
      status.sections.database_size = { note: 'Size calculation unavailable' };
    }

    // 4. Query record counts per table
    const recordCounts = {};
    if (status.sections.tables?.tables) {
      for (const table of status.sections.tables.tables) {
        try {
          const countRes = await fetch(
            `${SUPABASE_URL}/rest/v1/${table.name}?select=count=exact`,
            {
              headers: { 'Authorization': `Bearer ${accessToken}` },
            }
          );

          if (countRes.ok) {
            const count = countRes.headers.get('content-range')?.split('/')[1] || 0;
            recordCounts[table.name] = parseInt(count) || 0;
          }
        } catch (e) {
          recordCounts[table.name] = 'error';
        }
      }
    }

    status.sections.record_counts = recordCounts;

    // 5. Query active connections (if available)
    try {
      const connRes = await fetch(
        `${SUPABASE_URL}/rest/v1/rpc/get_db_connections`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${accessToken}` },
        }
      );

      if (connRes.ok) {
        const connections = await connRes.json();
        status.sections.active_connections = connections;
      }
    } catch (e) {
      status.sections.active_connections = { note: 'Connection info unavailable' };
    }

    // 6. Query RLS status
    try {
      const rlsRes = await fetch(
        `${SUPABASE_URL}/rest/v1/information_schema.tables?table_schema=eq.public&select=table_name`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        }
      );

      if (rlsRes.ok) {
        const tables = await rlsRes.json();
        const rlsStatus = {};
        
        for (const table of tables) {
          try {
            const checkRes = await fetch(
              `${SUPABASE_URL}/rest/v1/rpc/check_rls_enabled?table_name=${table.table_name}`,
              {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${accessToken}` },
              }
            );
            
            if (checkRes.ok) {
              const result = await checkRes.json();
              rlsStatus[table.table_name] = result;
            }
          } catch (e) {
            // RLS check might not be available
          }
        }

        status.sections.rls_status = rlsStatus || { note: 'RLS status unavailable' };
      }
    } catch (e) {
      status.sections.rls_status = { note: 'RLS check unavailable' };
    }

    // 7. Summary
    status.summary = {
      total_tables: status.sections.tables?.count || 0,
      total_records: Object.values(recordCounts || {}).reduce((sum, count) => {
        if (typeof count === 'number') return sum + count;
        return sum;
      }, 0),
      database_size_mb: status.sections.database_size?.mb || 'unknown',
      status: 'connected',
      last_checked: new Date().toISOString(),
    };

    return Response.json(status);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});