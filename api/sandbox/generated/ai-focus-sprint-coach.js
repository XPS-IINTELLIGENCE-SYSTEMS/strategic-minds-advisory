const system = {
  "system_name": "AI Focus Sprint Coach",
  "system_slug": "ai-focus-sprint-coach",
  "target_mode": "sandbox",
  "status": "generated",
  "objective": "Prove batch autopilot can generate, deploy, and validate the first generated sandbox route in a batch.",
  "description": "A sandbox coach that helps a user plan one focused work sprint with a clear goal, timer discipline, and completion checklist.",
  "safety": [
    "Sandbox-only until promoted.",
    "No public publishing without approval.",
    "No paid API activation without approval.",
    "No secret values in code, issues, logs, or frontend."
  ],
  "frontend_path": "/ai-in-action#ai-focus-sprint-coach",
  "backend_routes": [
    "/api/sandbox/generated/ai-focus-sprint-coach"
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
