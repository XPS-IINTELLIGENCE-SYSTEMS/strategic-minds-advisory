import { getUser, corsHeaders, supabase } from "../_shared/base44Client.ts";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");

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

    const { messages, systemPrompt } = await req.json();

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          temperature: 0.7,
          max_tokens: 2048,
        }),
      }
    );

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Log to database
    await supabase.from("edge_function_logs").insert({
      function_name: "groq-chat",
      request_data: { messages, systemPrompt },
      status: "success",
      response_data: { content },
    });

    return new Response(
      JSON.stringify({ content, model: "llama-3.3-70b-versatile" }),
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