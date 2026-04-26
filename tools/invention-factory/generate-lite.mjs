#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const inputPath = process.argv[2];
if (!inputPath) throw new Error('Usage: node tools/invention-factory/generate-lite.mjs <request.json>');

function slugify(value) {
  return String(value || 'generated-ai-system')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72) || 'generated-ai-system';
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(root, file), 'utf8'));
}

function write(relative, content) {
  const full = path.resolve(root, relative);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  return relative;
}

function sql(value) {
  return String(value || '').replace(/'/g, "''");
}

const req = readJson(inputPath);
const slug = slugify(req.system_slug || req.slug || req.system_name || req.name);
const name = req.system_name || req.name || slug.split('-').map((x) => x.charAt(0).toUpperCase() + x.slice(1)).join(' ');
const description = req.description || req.build_prompt || `Sandbox proof for ${name}.`;
const objective = req.objective || `Create, deploy, and validate a sandbox proof for ${name}.`;
const safety = Array.isArray(req.safety) && req.safety.length ? req.safety : [
  'Sandbox-only until promoted.',
  'No public publishing without approval.',
  'No paid API activation without approval.',
  'No real-money trading.',
  'No secret values in code, issues, logs, or frontend.'
];
const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);

const apiPath = `api/sandbox/generated/${slug}.js`;
const manifestPath = `.ai-ops/inventions/${slug}.json`;
const migrationPath = `supabase/migrations/${stamp}_${slug}_seed.sql`;

const api = `const system = ${JSON.stringify({
  system_name: name,
  system_slug: slug,
  target_mode: 'sandbox',
  status: 'generated',
  objective,
  description,
  safety,
  frontend_path: `/ai-in-action#${slug}`,
  backend_routes: [`/api/sandbox/generated/${slug}`]
}, null, 2)};

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
`;

const migration = `-- Generated sandbox seed for ${sql(name)}
insert into ai_invention_requests (
  requested_by, system_name, system_slug, build_prompt, target_mode, status,
  frontend_path, backend_routes, supabase_tables, proof_summary, risk_notes,
  next_ai_action, next_human_action, is_public
) values (
  'ai-in-action-generator',
  '${sql(name)}',
  '${sql(slug)}',
  '${sql(description)}',
  'sandbox',
  'generated',
  '/ai-in-action#${sql(slug)}',
  array['/api/sandbox/generated/${sql(slug)}'],
  array['ai_invention_requests','ai_invention_runs','ai_invention_proofs'],
  '${sql(objective)}',
  '${sql(safety.join(' | '))}',
  'Deploy and validate generated sandbox route.',
  'Review generated proof before promotion.',
  true
)
on conflict (system_slug) do update set
  status = excluded.status,
  proof_summary = excluded.proof_summary,
  next_ai_action = excluded.next_ai_action,
  next_human_action = excluded.next_human_action;
`;

const manifest = {
  system_name: name,
  system_slug: slug,
  target_mode: 'sandbox',
  generated_at: new Date().toISOString(),
  files: { api: apiPath, migration: migrationPath, manifest: manifestPath },
  objective,
  description,
  safety,
  promotion_gate: 'Human approval required before public launch, paid API activation, real-money operation, or new repo creation.'
};

const files = [
  write(apiPath, api),
  write(migrationPath, migration),
  write(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
];

const output = { ok: true, system_name: name, system_slug: slug, files };
write('.ai-ops/invention-factory-last-output.json', JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify(output, null, 2));
