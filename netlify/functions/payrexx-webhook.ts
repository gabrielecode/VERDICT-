import { createHmac } from 'node:crypto';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const app =
  getApps()[0] ??
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string)),
  });
const db = getFirestore(app, process.env.FIREBASE_DATABASE_ID || '(default)');

const ok = (msg = 'ok') => new Response(msg, { status: 200 });

export default async (req: Request) => {
  if (req.method !== 'POST') return ok();

  const instance = process.env.PAYREXX_INSTANCE;
  const secret = process.env.PAYREXX_SECRET;
  if (!instance || !secret) return new Response('config', { status: 500 });

  const raw = await req.text();
  let payload: any = {};
  try {
    payload = JSON.parse(raw);
  } catch {
    payload = Object.fromEntries(new URLSearchParams(raw));
  }

  const sub = payload?.subscription ?? payload;
  const id = Number(sub?.id);
  if (!payload?.subscription || !Number.isInteger(id) || id <= 0) return ok('ignored');

  const signature = createHmac('sha256', secret).update('').digest('base64');
  let s: any;
  try {
    const res = await fetch(
      `https://api.payrexx.com/v1.0/Subscription/${id}/?instance=${encodeURIComponent(instance)}&ApiSignature=${encodeURIComponent(signature)}`
    );
    const r: any = await res.json();
    if (r?.status !== 'success') return new Response('provider', { status: 502 });
    s = Array.isArray(r.data) ? r.data[0] : r.data;
  } catch {
    return new Response('provider', { status: 502 });
  }

  const orgId = s?.invoice?.referenceId;
  if (typeof orgId !== 'string' || !orgId) return ok('ignored');

  const orgRef = db.collection('orgs').doc(orgId);
  const orgSnap = await orgRef.get();
  if (!orgSnap.exists) return ok('ignored');
  const org = orgSnap.data() as any;

  const status = String(s.status);
  const update: Record<string, unknown> = {
    subscriptionStatus: status,
    payrexxSubscriptionId: id,
    currentPeriodEnd: s.valid_until ? Timestamp.fromDate(new Date(s.valid_until)) : null,
  };

  if (['active', 'in_notice', 'overdue'].includes(status)) {
    update.plan = 'pro';
  } else if (['failed', 'cancelled'].includes(status)) {
    if (org.plan === 'pro') update.plan = 'expired';
  } else {
    return ok('ignored');
  }

  await orgRef.update(update);
  return ok();
};
