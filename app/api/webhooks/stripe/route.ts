import { json } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST /api/webhooks/stripe — subscription lifecycle events (product spec §9).
// Full signature verification + profile updates land with the Stripe Pro
// integration in Phase 2. For now we acknowledge so test webhooks don't error.
export async function POST(req: Request) {
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return json({ error: 'missing_signature' }, { status: 400 });
  }
  return json({ received: true, handled: false, phase: 2 });
}
