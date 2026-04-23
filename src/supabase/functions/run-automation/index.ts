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

    const { automationType, config, targetData } = await req.json();

    // Get automation from database
    const { data: automation, error } = await supabaseAdmin
      .from("automation_tasks")
      .select("*")
      .eq("automation_type", automationType)
      .single();

    if (error || !automation) {
      return new Response(
        JSON.stringify({ error: "Automation not found" }),
        { status: 404, headers: corsHeaders() }
      );
    }

    // Update status to running
    await supabaseAdmin
      .from("automation_tasks")
      .update({ status: "running", last_run: new Date().toISOString() })
      .eq("id", automation.id);

    // Simulate automation execution
    const result = {
      status: "completed",
      output: {
        summary: `Automation ${automationType} executed successfully`,
        results: targetData,
      },
      nextActions: [
        "Review results in dashboard",
        "Export report if needed",
        "Schedule next run",
      ],
    };

    // Update with result
    await supabaseAdmin
      .from("automation_tasks")
      .update({ status: "completed", result: JSON.stringify(result) })
      .eq("id", automation.id);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  }
});