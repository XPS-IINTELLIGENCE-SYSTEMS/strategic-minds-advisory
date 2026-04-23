import { getUser, corsHeaders, supabaseAdmin } from "../_shared/base44Client.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders() });
  }

  try {
    const user = await getUser(req);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders() },
      });
    }

    const { entityName, schema } = await req.json();

    if (!entityName || !schema) {
      return new Response(
        JSON.stringify({ error: "Missing entityName or schema" }),
        { status: 400, headers: corsHeaders() }
      );
    }

    const tableName = entityName.toLowerCase();
    const columns = Object.entries(schema.properties || {}).map(
      ([name, field]: any) => {
        const typeMap: Record<string, string> = {
          string: "text",
          number: "numeric",
          integer: "integer",
          boolean: "boolean",
          date: "date",
          "date-time": "timestamp with time zone",
          object: "jsonb",
          array: "jsonb",
        };
        const sqlType = typeMap[field.type] || "text";
        const isRequired = schema.required?.includes(name);
        return `${name} ${sqlType}${isRequired ? " NOT NULL" : ""}`;
      }
    );

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.${tableName} (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at timestamp with time zone DEFAULT now(),
        updated_at timestamp with time zone DEFAULT now(),
        ${columns.join(",\n")}
      );
      
      CREATE TRIGGER update_${tableName}_updated_at
        BEFORE UPDATE ON public.${tableName}
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    `;

    // Log schema update
    await supabaseAdmin.from("project_index").upsert({
      user_email: user.email,
      project_name: entityName,
      entity_schemas: JSON.stringify([schema]),
      last_indexed: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Schema synced successfully",
        tableName,
        columns: columns.length,
        sql: createTableSQL,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders() },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  }
});