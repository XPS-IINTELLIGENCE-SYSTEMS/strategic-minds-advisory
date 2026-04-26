import { selectRows, insertRows } from '../_lib/supabaseAdmin.js';
import { sendSandboxReport } from '../_lib/emailReporter.js';

const slug = 'ai-skill-drill-coach';

const lesson = {
  title: 'Practical Prompt Engineering for Small Business Automation',
  objective: 'Teach a user to turn a vague business task into a clear AI instruction with role, context, task, constraints, output format, and validation criteria.',
  skill: 'Prompt engineering',
  audience: 'Small business owner or operator',
  drill: {
    setup: 'You need AI to create a follow-up email for leads who asked about a service but did not book.',
    weakPrompt: 'Write a follow-up email for customers.',
    strongPrompt: 'Act as a service-business sales assistant. Write a polite follow-up email for leads who requested a quote but have not booked within 3 days. Keep it under 140 words, include one clear call to action, avoid pressure tactics, and output subject line plus email body.',
    practice: 'Rewrite one repetitive business task into a strong AI prompt using: role, context, task, constraints, output format, and success criteria.',
  },
  checklist: [
    'Define the AI role.',
    'Give the business context.',
    'State the exact task.',
    'Add constraints and safety boundaries.',
    'Specify output format.',
    'Add success criteria or validation rules.',
  ],
  proofRules: [
    'No fake live data.',
    'No secret values.',
    'Sandbox-only until promoted.',
    'Explain what is being taught and why.',
  ],
};

const fallbackRequest = {
  system_name: 'AI Skill Drill Coach',
  system_slug: slug,
  target_mode: 'sandbox',
  status: 'fallback_available',
  frontend_path: '/ai-in-action#ai-skill-drill-coach',
  backend_routes: ['/api/sandbox/skill-drill-coach', '/api/sandbox/status?slug=ai-skill-drill-coach'],
  proof_summary: 'Fallback proof record served directly by the API route. Supabase live records are used when available.',
};

function normalizeResult(result, fallbackData = []) {
  return {
    data: Array.isArray(result?.data) ? result.data : fallbackData,
    error: result?.error || null,
    mode: result?.mode || (result?.error ? 'fallback' : 'live'),
  };
}

function collectErrors(...items) {
  return items.flatMap((item) => item?.error ? [item.error] : []);
}

export default async function handler(request, response) {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');

  if (!['GET', 'POST'].includes(request.method)) {
    response.setHeader('Allow', 'GET, POST');
    return response.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  try {
    const [rawRequestRows, rawRunRows, rawProofRows] = await Promise.all([
      selectRows('ai_invention_requests', [], { eq: ['system_slug', slug], limit: 1 }),
      selectRows('ai_invention_runs', [], { eq: ['invention_slug', slug], order: { column: 'created_at', ascending: false }, limit: 5 }),
      selectRows('ai_invention_proofs', [], { eq: ['invention_slug', slug], order: { column: 'created_at', ascending: false }, limit: 10 }),
    ]);

    const requestRows = normalizeResult(rawRequestRows, [fallbackRequest]);
    const runRows = normalizeResult(rawRunRows, []);
    const proofRows = normalizeResult(rawProofRows, []);

    let report = null;
    let writeResult = null;

    if (request.method === 'POST') {
      const validation = {
        frontend_status: 'panel_route_committed',
        backend_status: 'api_route_reached',
        supabase_status: requestRows.mode === 'live' ? 'live_read_ok' : 'fallback_or_unavailable',
        lesson_status: 'available',
        proof_count: proofRows.data.length,
      };

      writeResult = await insertRows('ai_invention_runs', {
        invention_slug: slug,
        run_type: 'api_validation',
        status: 'completed',
        frontend_status: validation.frontend_status,
        backend_status: validation.backend_status,
        supabase_status: validation.supabase_status,
        vercel_status: 'api_reachable_if_deployed',
        validation_results: validation,
        email_status: 'pending_or_logged',
        summary: 'AI Skill Drill Coach sandbox API validation route was reached.',
        is_public: true,
      });

      try {
        report = await sendSandboxReport({
          subject: 'AI Skill Drill Coach Sandbox Validation',
          body: [
            'AI Skill Drill Coach Sandbox Validation',
            '',
            `System slug: ${slug}`,
            `Lesson: ${lesson.title}`,
            'Backend route: /api/sandbox/skill-drill-coach',
            `Supabase mode: ${requestRows.mode}`,
            `Proof records visible: ${validation.proof_count}`,
            '',
            'Result:',
            'The backend validation route responded and logged/attempted report delivery.',
          ].join('\n'),
          metadata: { severity: 'low', system_slug: slug },
        });
      } catch (error) {
        report = { ok: false, provider: 'fallback', status: 'report_failed_safely', error: error.message };
      }
    }

    return response.status(200).json({
      ok: true,
      mode: requestRows.mode === 'live' ? 'live' : 'fallback',
      system_slug: slug,
      lesson,
      request: requestRows.data[0] || fallbackRequest,
      runs: runRows.data,
      proofs: proofRows.data,
      report,
      write_result: writeResult,
      errors: collectErrors(requestRows, runRows, proofRows, writeResult),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return response.status(200).json({
      ok: true,
      mode: 'safe-fallback-after-exception',
      system_slug: slug,
      lesson,
      request: fallbackRequest,
      runs: [],
      proofs: [],
      report: null,
      errors: [error.message],
      timestamp: new Date().toISOString(),
    });
  }
}
