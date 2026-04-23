import { corsHeaders, supabaseAdmin } from "../_shared/base44Client.ts";
import * as crypto from "https://deno.land/std@0.195.0/crypto/mod.ts";

const GITHUB_WEBHOOK_SECRET = Deno.env.get("GITHUB_WEBHOOK_SECRET");

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders() });
  }

  try {
    const signature = req.headers.get("x-hub-signature-256");
    const body = await req.text();

    // Verify signature
    if (signature && GITHUB_WEBHOOK_SECRET) {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(GITHUB_WEBHOOK_SECRET),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const computedSignature =
        "sha256=" +
        (await crypto.subtle.sign("HMAC", key, encoder.encode(body)));
      const computedHex = Array.from(new Uint8Array(computedSignature))
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("");

      if (signature !== `sha256=${computedHex}`) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: corsHeaders(),
        });
      }
    }

    const payload = JSON.parse(body);

    if (payload.action === "opened" || payload.action === "synchronize") {
      // Index code operation from GitHub push
      await supabaseAdmin.from("code_operations").insert({
        user_email: payload.sender?.login || "github-bot",
        operation_type: "modify_file",
        target_path: payload.repository?.name || "unknown",
        description: payload.pull_request?.title || "GitHub PR",
        status: "completed",
        timestamp: new Date().toISOString(),
      });
    }

    return new Response(JSON.stringify({ success: true }), {
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