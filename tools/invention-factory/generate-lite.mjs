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
  'No secrets in code, issues, logs, or frontend.'
];
const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);

const manifestPath = `.ai-ops/inventions/${slug}.json`;
const migrationPath = `supabase/migrations/${stamp}_${slug}_seed.sql`;
const route = `/api/sandbox/generated?slug=${slug}`;

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
  array['${sql(route)}'],
  array['ai_invention_requests','ai_invention_runs','ai_invention_proofs'],
  '${sql(objective)}',
  '${sql(safety.join(' | '))}',
  'Deploy and validate generated sandbox route through shared dynamic API.',
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
  status: 'generated',
  generated_at: new Date().toISOString(),
  files: { api: 'api/sandbox/generated.js', migration: migrationPath, manifest: manifestPath },
  frontend_path: `/ai-in-action#${slug}`,
  backend_routes: [route],
  objective,
  description,
  safety,
  promotion_gate: 'Human approval required before public launch or paid service activation.',
  vercel_function_model: 'single_dynamic_function'
};

const files = [
  write(migrationPath, migration),
  write(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
];

const output = { ok: true, system_name: name, system_slug: slug, route, files };
write('.ai-ops/invention-factory-last-output.json', JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify(output, null, 2));
