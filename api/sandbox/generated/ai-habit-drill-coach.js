const system = {
  "system_name": "AI Habit Drill Coach",
  "system_slug": "ai-habit-drill-coach",
  "target_mode": "sandbox",
  "status": "generated",
  "objective": "Prove the AI Invention Factory Generator can create a second sandbox invention package, deploy it, and validate the generated API route after direct deploy dispatch hardening.",
  "description": "A safe generated sandbox coach that teaches users how to build one repeatable daily skill habit with a tiny practice loop, checklist, and validation route.",
  "safety": [
    "Sandbox-only until promoted.",
    "No public publishing without approval.",
    "No paid API activation without approval.",
    "No medical, legal, financial, or real-money claims.",
    "No secret values in code, issues, logs, or frontend."
  ],
  "frontend_path": "/ai-in-action#ai-habit-drill-coach",
  "backend_routes": [
    "/api/sandbox/generated/ai-habit-drill-coach"
  ]
};

export default async function handler(request, response) {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');

  if (!['GET', 'POST'].includes(request.method)) {
    response.setHeader('Allow', 'GET, POST');
    return response.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  const report = request.method === 'POST'
    ? { ok: true, status: 'logged_synthetic', message: 'Generated sandbox validation report acknowledged.' }
    : null;

  return response.status(200).json({
    ok: true,
    mode: 'generated-sandbox',
    system_slug: system.system_slug,
    system,
    report,
    validation: {
      frontend_status: 'manifest_created',
      backend_status: 'api_route_reached',
      supabase_status: 'seed_migration_generated',
      promotion_status: 'human_review_required'
    },
    timestamp: new Date().toISOString()
  });
}
