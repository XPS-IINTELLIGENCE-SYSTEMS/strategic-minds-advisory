import { generateGroqText } from '../_lib/groqClient.js';
import { insertRows } from '../_lib/supabaseAdmin.js';
import { authorizeCron, jsonResponse, logAiRun, logScheduleRun } from '../_lib/cronUtils.js';

function buildPrompt() {
  return `Create a publish-ready draft content package for AI in Action Labs. The package must be educational, transparent, and not claim guaranteed wealth or fake results. Include: YouTube title, 90-second hook, 6-minute script outline, 5 shorts hooks, thumbnail prompt, avatar persona recommendation, disclosure language, and human review checklist. Use the theme: AI visibly builds systems, simulates paper trading, validates sources, and teaches digital wealth-building strategies honestly.`;
}

export default async function handler(request, response) {
  const auth = authorizeCron(request);
  if (!auth.ok) return jsonResponse(response, 401, { ok: false, error: 'Unauthorized cron request.' });

  const startedAt = new Date().toISOString();
  const groq = await generateGroqText({
    system: 'You are an AI media strategist for AI in Action Labs. You create engaging but truthful educational content. No fake results, no guaranteed income, no deceptive urgency.',
    user: buildPrompt(),
    temperature: 0.45,
    maxTokens: 1800,
  });

  const packageText = groq.text || `Content package fallback. Groq unavailable: ${groq.error || 'unknown error'}.`;
  const status = groq.error ? 'draft_partial' : 'draft';

  const contentInsert = await insertRows('content_packages', {
    package_type: 'daily_ai_media_package',
    title: 'AI in Action: Daily Transparent Wealth-Building Simulation Lesson',
    hook: 'Watch AI build, test, and explain real systems without fake results.',
    platform: 'youtube_shorts_newsletter_avatar',
    script_body: packageText,
    thumbnail_prompt: 'A cinematic control-room dashboard with AI agents, source receipts, charts, and a bold headline: Watch AI Build in Public',
    video_prompt: packageText,
    source_links: [],
    compliance_note: 'Educational AI-generated content. Simulations are not financial advice, income guarantees, or real-money performance claims.',
    status,
    is_public: true,
  });

  const mediaInsert = await insertRows('ai_media_jobs', {
    lab_slug: 'ai-media-studio',
    job_type: 'daily_content_package',
    title: 'Daily AI in Action content package',
    script_body: packageText,
    thumbnail_prompt: 'A cinematic AI command center with transparent source receipts and dashboard panels.',
    video_prompt: packageText,
    provider: 'heygen_ready_manual_review',
    status: 'draft',
    approval_status: 'needs_review',
    source_receipts: [],
    is_public: true,
  });

  const summary = `Content package created with status ${status}. Human review required before publishing.`;
  const scheduleRun = await logScheduleRun({
    labSlug: 'ai-media-studio',
    runType: 'content-package',
    status: contentInsert.error || mediaInsert.error ? 'partial' : 'completed',
    startedAt,
    summary,
    result: { groq_model: groq.model, groq_error: groq.error, content_insert_error: contentInsert.error, media_insert_error: mediaInsert.error, auth_mode: auth.mode },
    errorMessage: groq.error || contentInsert.error || mediaInsert.error,
  });

  const aiRun = await logAiRun({
    labSlug: 'ai-media-studio',
    title: 'Daily content package generated',
    runKind: 'content-package',
    objective: 'Turn AI work into a reviewed educational content package.',
    status: contentInsert.error || mediaInsert.error ? 'partial' : 'completed',
    whatAiDid: summary,
    howAiDidIt: 'Generated script and media-job draft through Groq and stored it in Supabase tables when configured.',
    whyItMatters: 'This creates the media layer needed for AI in Action to become a public education platform.',
    blocker: 'Human review required before publishing.',
    nextAction: 'Review the package and connect HeyGen only after API key and publishing policy are approved.',
    riskLevel: 'medium',
    evidence: [{ type: 'cron', route: '/api/cron/content-package', started_at: startedAt }],
  });

  return jsonResponse(response, 200, {
    ok: true,
    status,
    package: packageText,
    errors: { groq: groq.error, content_insert: contentInsert.error, media_insert: mediaInsert.error, schedule_run: scheduleRun.error, ai_run: aiRun.error },
  });
}
