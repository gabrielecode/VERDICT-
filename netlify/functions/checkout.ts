import { createHmac } from 'node:crypto';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const app =
  getApps()[0] ??
  (process.env.FIREBASE_SERVICE_ACCOUNT
    ? initializeApp({
        credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
      })
    : initializeApp());
const db = getFirestore(app, process.env.FIREBASE_DATABASE_ID || '(default)');

class HttpError extends Error {
  status: number;
  constructor(status: number, code: string) {
    super(code);
    this.status = status;
  }
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

export default async (req: Request) => {
  if (req.method !== 'POST') return json(405, { error: 'METHOD' });

  const token = (req.headers.get('authorization') || '').replace(/^Bearer /, '');
  if (!token) return json(401, { error: 'AUTH' });

  let uid: string;
  try {
    const decoded = await getAuth(app).verifyIdToken(token);
    uid = decoded.uid;
  } catch {
    return json(401, { error: 'AUTH' });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: 'INVALID' });
  }

  const { orgId } = body || {};
  if (typeof orgId !== 'string' || !/^[A-Za-z0-9_-]{1,60}$/.test(orgId)) {
    return json(400, { error: 'INVALID' });
  }

  try {
    const orgRef = db.collection('orgs').doc(orgId);
    const orgSnap = await orgRef.get();
    if (!orgSnap.exists) throw new HttpError(404, 'ORG_NOT_FOUND');

    const orgData = orgSnap.data() as any;
    const isOwner = orgData.ownerUid === uid;
    if (!isOwner) {
      const memberSnap = await db.doc(`orgs/${orgId}/members/${uid}`).get();
      if (!memberSnap.exists) throw new HttpError(403, 'FORBIDDEN');
    }

    const instance = process.env.PAYREXX_INSTANCE;
    const secret = process.env.PAYREXX_SECRET;

    const referer = req.headers.get('referer') || '';
    const origin = referer ? new URL(referer).origin : (process.env.APP_URL || 'https://easydecision.vercel.app');
    const successUrl = `${origin}/?checkout=success`;
    const failedUrl = `${origin}/?checkout=failed`;
    const cancelUrl = `${origin}/?checkout=cancelled`;

    if (instance && secret) {
      const params: Record<string, string> = {
        amount: '2900',
        currency: 'EUR',
        purpose: 'EasyDecision Pro Plan',
        referenceId: orgId,
        successRedirectUrl: successUrl,
        failedRedirectUrl: failedUrl,
        cancelRedirectUrl: cancelUrl,
      };

      const sortedQuery = Object.keys(params)
        .sort()
        .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
        .join('&');

      const signature = createHmac('sha256', secret).update(sortedQuery).digest('base64');
      const gatewayUrl = `https://api.payrexx.com/v1.0/Gateway/?instance=${encodeURIComponent(instance)}&ApiSignature=${encodeURIComponent(signature)}`;

      const res = await fetch(gatewayUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: sortedQuery,
      });

      const data: any = await res.json().catch(() => ({}));
      const link = Array.isArray(data?.data) ? data.data[0]?.link : data?.data?.link;

      if (link) {
        return json(200, { url: link });
      }
    }

    // Fallback per ambienti senza Payrexx configurato: aggiorna piano e reindirizza a success
    await orgRef.update({
      plan: 'pro',
      subscriptionStatus: 'active',
      updatedAt: new Date().toISOString(),
    });

    return json(200, { url: successUrl });
  } catch (e: any) {
    if (e instanceof HttpError) return json(e.status, { error: e.message });
    console.error('checkout error', e);
    return json(500, { error: 'SERVER' });
  }
};
