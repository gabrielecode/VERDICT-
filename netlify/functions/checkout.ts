import type { Context } from '@netlify/functions';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import Stripe from 'stripe';

function getFirebaseAdminApp() {
  if (getApps().length > 0) return getApps()[0];

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return initializeApp({
      credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    });
  }

  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    return initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  }

  return initializeApp();
}

const app = getFirebaseAdminApp();
const db = getFirestore(
  app,
  process.env.FIREBASE_DATABASE_ID || process.env.VITE_FIREBASE_DATABASE_ID || '(default)'
);

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

function resolveSafeRedirectUrl(candidate: unknown, fallback: string, allowedOrigin: string): string {
  if (typeof candidate !== 'string' || !candidate) return fallback;
  try {
    const parsed = new URL(candidate, allowedOrigin);
    if (parsed.origin === new URL(allowedOrigin).origin) {
      return parsed.toString();
    }
  } catch {
    // ignore invalid URL
  }
  return fallback;
}

export default async (req: Request, _context: Context) => {
  if (req.method !== 'POST') return json(405, { error: 'METHOD' });

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!stripeSecretKey || !priceId) {
    return json(503, { error: 'STRIPE_NOT_CONFIGURED' });
  }

  const token = (req.headers.get('authorization') || '').replace(/^Bearer /, '');
  if (!token) return json(401, { error: 'AUTH' });

  let uid: string;
  let email: string | undefined;
  let isAnon: boolean;
  try {
    const decoded = await getAuth(app).verifyIdToken(token);
    uid = decoded.uid;
    email = decoded.email;
    isAnon = decoded.firebase?.sign_in_provider === 'anonymous';
  } catch {
    return json(401, { error: 'AUTH' });
  }

  if (isAnon) return json(403, { error: 'FORBIDDEN' });

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return json(400, { error: 'INVALID' });
  }

  let orgId = typeof body?.orgId === 'string' ? body.orgId.trim() : '';
  if (!orgId) {
    const userSnap = await db.collection('users').doc(uid).get();
    orgId = typeof userSnap.data()?.orgId === 'string' ? userSnap.data()!.orgId : '';
  }

  if (!orgId || !/^[A-Za-z0-9_-]{1,60}$/.test(orgId)) {
    return json(400, { error: 'INVALID_ORG' });
  }

  try {
    const orgRef = db.collection('orgs').doc(orgId);
    const [orgSnap, memberSnap] = await Promise.all([
      orgRef.get(),
      orgRef.collection('members').doc(uid).get(),
    ]);

    if (!orgSnap.exists) return json(404, { error: 'NOT_FOUND' });

    const orgData = orgSnap.data() as any;
    const isOwner = orgData?.ownerUid === uid || (memberSnap.exists && memberSnap.data()?.role === 'owner');
    if (!isOwner) return json(403, { error: 'FORBIDDEN' });

    const reqOrigin = req.headers.get('origin') || process.env.URL || process.env.APP_URL || 'https://easydecision.netlify.app';
    const successUrl = resolveSafeRedirectUrl(body?.successUrl, `${reqOrigin}/?checkout=success`, reqOrigin);
    const cancelUrl = resolveSafeRedirectUrl(body?.cancelUrl, `${reqOrigin}/?checkout=cancel`, reqOrigin);

    const stripe = new Stripe(stripeSecretKey);
    const mode = process.env.STRIPE_CHECKOUT_MODE === 'payment' ? 'payment' : 'subscription';

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: orgId,
      ...(email ? { customer_email: email } : {}),
      metadata: {
        orgId,
        uid,
      },
    });

    return json(200, { url: session.url, sessionId: session.id });
  } catch (e: any) {
    console.error('checkout error', e);
    return json(500, { error: 'SERVER' });
  }
};
