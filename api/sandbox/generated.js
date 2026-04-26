import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestDir = path.join(root, '.ai-ops', 'inventions');

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);
}

function fallbackSystem(slug) {
  const safeSlug = slugify(slug || 'unknown-generated-system');
  return {
    system_name: safeSlug.split('-').filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ') || 'Unknown Generated System',
    system_slug: safeSlug,
    target_mode: 'sandbox',
    status: 'manifest_not_found',
    objective: 'Generated sandbox route reached, but no manifest was found for this slug.',
    description: 'Fallback response from the shared dynamic generated invention API route.',
    safety: [
      'Sandbox-only until promoted.',
      'No public publishing without approval.',
      'No paid API activation without approval.',
      'No secret values in code, issues, logs, or frontend.'
    ],
    frontend_path: `/ai-in-action#${safeSlug}`,
    backend_routes: [`/api/sandbox/generated?slug=${safeSlug}`]
  };
}

function safeReadManifest(slug) {
  const safeSlug = slugify(slug);
  if (!safeSlug) return null;
  const manifestPath = path.join(manifestDir, `${safeSlug}.json`);
  if (!manifestPath.startsWith(manifestDir)) return null;
  if (!fs.existsSync(manifestPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    return { ...fallbackSystem(safeSlug), status: 'manifest_parse_error', error: error.message };
  }
}

function normalizeSystem(manifest, slug) {
  const safeSlug = slugify(slug || manifest?.system_slug);
  const fallback = fallbackSystem(safeSlug);
  const base = manifest || fallback;
  return {
    system_name: base.system_name || base.name || fallback.system_name,
    system_slug: safeSlug || slugify(base.system_slug),
    target_mode: base.target_mode || 'sandbox',
    status: base.status || 'generated',
    objective: base.objective || 'Generated sandbox proof.',
    description: base.description || base.build_prompt || 'Generated sandbox system.',
    safety: Array.isArray(base.safety) && base.safety.length ? base.safety : fallback.safety,
    frontend_path: base.frontend_path || `/ai-in-action#${safeSlug}`,
    backend_routes: [`/api/sandbox/generated?slug=${safeSlug}`],
    files: base.files || {},
    generated_at: base.generated_at || null,
    promotion_gate: base.promotion_gate || 'Human approval required before public launch, paid API activation, real-money operation, or new repo creation.'
  };
}

export default async function handler(request, response) {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');

  if (!['GET', 'POST'].includes(request.method)) {
    response.setHeader('Allow', 'GET, POST');
    return response.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  const rawSlug = request.query?.slug || request.query?.system_slug || '';
  const slug = slugify(Array.isArray(rawSlug) ? rawSlug[0] : rawSlug);

  if (!slug) {
    return response.status(400).json({
      ok: false,
      error: 'Missing required query parameter: slug',
      example: '/api/sandbox/generated?slug=ai-focus-sprint-coach',
      timestamp: new Date().toISOString()
    });
  }

  const manifest = safeReadManifest(slug);
  const system = normalizeSystem(manifest, slug);
  const report = request.method === 'POST'
    ? {
        ok: true,
        status: 'logged_synthetic',
        message: 'Generated sandbox validation report acknowledged by shared dynamic route.',
        system_slug: slug
      }
    : null;

  return response.status(200).json({
    ok: true,
    mode: manifest ? 'generated-sandbox-dynamic' : 'generated-sandbox-dynamic-fallback',
    system_slug: slug,
    system,
    report,
    validation: {
      frontend_status: 'manifest_driven',
      backend_status: 'shared_dynamic_api_reached',
      supabase_status: 'seed_migration_generated_when_available',
      promotion_status: 'human_review_required',
      vercel_function_model: 'single_dynamic_function'
    },
    timestamp: new Date().toISOString()
  });
}
