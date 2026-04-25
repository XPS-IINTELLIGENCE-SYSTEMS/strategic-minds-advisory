const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^169\.254\./,
  /^0\./,
  /^::1$/,
];

export function validatePublicUrl(value) {
  if (!value || typeof value !== 'string') return { ok: false, error: 'URL is required.' };
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    return { ok: false, error: 'URL is invalid.' };
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { ok: false, error: 'Only http and https URLs are allowed.' };
  }

  const hostname = parsed.hostname;
  if (!hostname || PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(hostname))) {
    return { ok: false, error: 'Private, local, or internal URLs are not allowed.' };
  }

  return { ok: true, url: parsed.toString() };
}

export function asString(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value).slice(0, 5000);
}

export function asBoolean(value, fallback = true) {
  if (typeof value === 'boolean') return value;
  return fallback;
}
