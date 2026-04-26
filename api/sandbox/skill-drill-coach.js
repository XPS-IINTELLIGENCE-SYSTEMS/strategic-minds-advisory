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

export default async function handler(request, response) {
  if (!['GET', 'POST'].includes(request.method)) {
    response.setHeader('Allow', 'GET, POST');
    return response.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  const [requestRows, runRows, proofRows] = await Promise.all([
    selectRows('ai_invention_requests', [], { eq: ['system_slug', slug], limit: 1 }),
    selectRows('ai_invention_runs', [], { eq: ['invention_slug', slug], order: { column: 'created_at', ascending: false }, limit: 5 }),
    selectRows('ai_invention_proofs', [], { eq: ['invention_slug', slug], order: { column: 'created_at', ascending: false }, limit: 10 }),
  ]);

  let report = null;
  if (request.method === 'POST') {
    const validation = {
      frontend_status: 'panel_route_committed',
      backend_status: 'api_route_reached',
      supabase_status: requestRows.mode === 'live' ? 'live_read_ok' : 'fallback_or_unavailable',
      lesson_status: 'available',
      proof_count: proofRows.data?.length || 0,
    };

    await insertRows('ai_invention_runs', {
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

    report = await sendSandboxReport({
      subject: 'AI Skill Drill Coach Sandbox Validation',
      body: [
        'AI Skill Drill Coach Sandbox Validation',
        '',
        `System slug: ${slug}`,
        `Lesson: ${lesson.title}`,
        `Backend route: /api/sandbox/skill-drill-coach`,
        `Supabase mode: ${requestRows.mode}`,
        `Proof records visible: ${validation.proof_count}`,
        '',
        'Result:',
        'The backend validation route responded and logged/attempted report delivery.',
      ].join('\n'),
    });
  }

  return response.status(200).json({
    ok: true,
    mode: requestRows.mode === 'live' ? 'live' : 'fallback',
    system_slug: slug,
    lesson,
    request: requestRows.data?.[0] || null,
    runs: runRows.data || [],
    proofs: proofRows.data || [],
    report,
    errors: [requestRows.error, runRows.error, proofRows.error].filter(Boolean),
    timestamp: new Date().toISOString(),
  });
}
