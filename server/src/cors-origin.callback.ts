/**
 * CORS origin resolver: allows Electron file:// (Origin "null" or missing)
 * while still honoring FRONTEND_URL / CORS_ORIGIN when set to explicit origins.
 */
export function corsOriginCallback(
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void,
): void {
  const raw = process.env.FRONTEND_URL || process.env.CORS_ORIGIN;
  if (!raw || raw === '*') {
    callback(null, true);
    return;
  }
  const allowed = raw.split(',').map((s) => s.trim()).filter(Boolean);
  if (origin === undefined || origin === 'null') {
    callback(null, true);
    return;
  }
  callback(null, allowed.includes(origin));
}
