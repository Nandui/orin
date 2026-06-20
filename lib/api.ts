import { NextResponse } from 'next/server';

/** JSON response helper. */
export function json(data: unknown, init?: ResponseInit): NextResponse {
  return NextResponse.json(data, init);
}

/**
 * Cron auth guard (product spec §6). Returns a 401 Response when the Bearer
 * token doesn't match CRON_SECRET, or null to proceed. When CRON_SECRET is
 * unset (local dev), requests are allowed through.
 */
export function requireCron(req: Request): Response | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) return null;
  if (req.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  return null;
}
