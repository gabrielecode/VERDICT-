import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const app =
  getApps()[0] ??
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string)),
  });
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
  let isAnon: boolean;
  try {
    const decoded = await getAuth(app).verifyIdToken(token);
    uid = decoded.uid;
    isAnon = decoded.firebase?.sign_in_provider === 'anonymous';
  } catch {
    return json(401, { error: 'AUTH' });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: 'INVALID' });
  }

  const { decisionId, optionIds, ratingValue, voterName } = body || {};
  if (
    typeof decisionId !== 'string' ||
    !/^[A-Za-z0-9_-]{1,60}$/.test(decisionId) ||
    !Array.isArray(optionIds) ||
    optionIds.length > 50 ||
    !optionIds.every((x: unknown) => typeof x === 'string')
  ) {
    return json(400, { error: 'INVALID' });
  }
  const chosen: string[] = Array.from(new Set(optionIds as string[]));

  try {
    await db.runTransaction(async (tx) => {
      const dRef = db.collection('decisions').doc(decisionId);
      const vRef = dRef.collection('votes').doc(uid);
      const [dSnap, vSnap] = await Promise.all([tx.get(dRef), tx.get(vRef)]);

      if (!dSnap.exists) throw new HttpError(404, 'NOT_FOUND');
      if (vSnap.exists) throw new HttpError(409, 'ALREADY_VOTED');

      const d = dSnap.data() as any;

      const deadlineMs: number =
        typeof d.deadlineTs?.toMillis === 'function' ? d.deadlineTs.toMillis() : Date.parse(d.deadline);
      if (!Number.isFinite(deadlineMs) || Date.now() >= deadlineMs) throw new HttpError(403, 'CLOSED');

      if (d.audience !== 'link') {
        if (isAnon) throw new HttpError(403, 'FORBIDDEN');
        const mSnap = await tx.get(db.doc(`orgs/${d.orgId}/members/${uid}`));
        if (!mSnap.exists) throw new HttpError(403, 'FORBIDDEN');
        if (d.audience === 'private' && d.creator?.uid !== uid) throw new HttpError(403, 'FORBIDDEN');
      }

      const options: any[] = Array.isArray(d.options) ? d.options : [];
      const validIds = new Set(options.map((o) => String(o.id)));
      if (chosen.length < 1 || !chosen.every((id) => validIds.has(id))) throw new HttpError(400, 'INVALID');

      if (d.type === 'multiple') {
        // piu' opzioni consentite
      } else if (chosen.length !== 1) {
        throw new HttpError(400, 'INVALID');
      }

      let rating: number | undefined;
      if (d.type === 'rating') {
        if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) throw new HttpError(400, 'INVALID');
        rating = ratingValue;
      }

      const updatedOptions = options.map((o) =>
        chosen.includes(String(o.id)) ? { ...o, votes: (Number(o.votes) || 0) + 1 } : o
      );

      const name =
        !d.isAnonymous && typeof voterName === 'string' && voterName.trim() ? voterName.trim().slice(0, 60) : undefined;

      tx.set(vRef, {
        userId: uid,
        optionIds: chosen,
        ...(rating !== undefined ? { ratingValue: rating } : {}),
        ...(name ? { voterName: name } : {}),
        timestamp: new Date().toISOString(),
      });
      tx.update(dRef, { options: updatedOptions });
    });
    return json(200, { ok: true });
  } catch (e: any) {
    if (e instanceof HttpError) return json(e.status, { error: e.message });
    console.error('vote error', e);
    return json(500, { error: 'SERVER' });
  }
};
