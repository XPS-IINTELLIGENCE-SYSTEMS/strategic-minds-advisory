#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import childProcess from 'node:child_process';

const root = process.cwd();
const queuePath = process.argv[2];
if (!queuePath) throw new Error('Usage: node tools/invention-factory/run-batch-lite.mjs <queue.json>');

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(root, file), 'utf8'));
}

function write(relative, content) {
  const full = path.resolve(root, relative);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  return relative;
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);
}

const queue = readJson(queuePath);
const requests = Array.isArray(queue.requests) ? queue.requests : [];
const maxItems = Math.min(Number(queue.max_items || 3), 5);
if (!requests.length) throw new Error('Queue has no requests.');
if (requests.length > maxItems) throw new Error(`Queue has ${requests.length} requests but max_items is ${maxItems}.`);

const seen = new Set();
const generated = [];

for (const request of requests) {
  const slug = slugify(request.system_slug || request.slug || request.system_name || request.name);
  if (!slug) throw new Error('Request missing valid slug.');
  if (seen.has(slug)) throw new Error(`Duplicate slug in batch: ${slug}`);
  seen.add(slug);
  if (!/^[a-z0-9][a-z0-9-]{2,72}$/.test(slug)) throw new Error(`Unsafe slug: ${slug}`);

  const requestFile = `.ai-ops/invention-requests/batch-${slug}.json`;
  write(requestFile, JSON.stringify({ ...request, system_slug: slug }, null, 2) + '\n');
  const output = childProcess.execFileSync('node', ['tools/invention-factory/generate-lite.mjs', requestFile], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit']
  });
  const parsed = JSON.parse(output);
  generated.push(parsed);
}

const report = {
  ok: true,
  batch_name: queue.batch_name || 'unnamed-batch',
  generated_at: new Date().toISOString(),
  count: generated.length,
  deploy_after_batch: queue.deploy_after_batch !== false,
  generated
};

write('.ai-ops/invention-factory-last-batch-output.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
