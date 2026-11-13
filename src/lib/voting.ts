import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';

export type VoteErrorCode =
  | 'AUTH'
  | 'NOT_FOUND'
  | 'ALREADY_VOTED'
  | 'CLOSED'
  | 'FORBIDDEN'
  | 'INVALID'
  | 'PERMISSION_DENIED'
  | 'SERVER';

export class VoteError extends Error {
  code: VoteErrorCode;
  constructor(code: VoteErrorCode, message?: string) {
    super(message || code);
    this.code = code;
  }
}

export interface SubmitVoteParams {
  decisionId: string;
  optionIds?: string[];
  ratingValue?: number;
  voterName?: string;
}

const DEFAULT_RATING_OPTIONS = [
  { id: 0, text: '1 Stella', votes: 0 },
  { id: 1, text: '2 Stelle', votes: 0 },
  { id: 2, text: '3 Stelle', votes: 0 },
  { id: 3, text: '4 Stelle', votes: 0 },
  { id: 4, text: '5 Stelle', votes: 0 },
];

export async function submitVote({
  decisionId,
  optionIds,
  ratingValue,
  voterName,
}: SubmitVoteParams): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new VoteError('AUTH', 'Autenticazione richiesta per votare.');
  }

  const uid = currentUser.uid;
  const isAnon = currentUser.isAnonymous;

  if (typeof decisionId !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(decisionId)) {
    throw new VoteError('INVALID', 'ID proposta non valido.');
  }

  try {
    await runTransaction(db, async (tx) => {
      const dRef = doc(db, 'decisions', decisionId);
      const vRef = doc(db, 'decisions', decisionId, 'votes', uid);
      const [dSnap, vSnap] = await Promise.all([tx.get(dRef), tx.get(vRef)]);

      if (!dSnap.exists()) {
        throw new VoteError('NOT_FOUND', 'Decisione non trovata.');
      }
      if (vSnap.exists()) {
        throw new VoteError('ALREADY_VOTED', 'Hai già votato questa proposta.');
      }

      const d = dSnap.data() as Record<string, any>;

      if (d.status !== undefined && d.status !== 'active') {
        throw new VoteError('CLOSED', 'Votazione non attiva o conclusa.');
      }

      const deadlineMs: number =
        typeof d.deadlineTs?.toMillis === 'function'
          ? d.deadlineTs.toMillis()
          : Date.parse(d.deadline);
      if (!Number.isFinite(deadlineMs) || Date.now() >= deadlineMs) {
        throw new VoteError('CLOSED', 'Votazione chiusa.');
      }

      if (d.audience !== 'link') {
        if (isAnon) {
          throw new VoteError('FORBIDDEN', 'Accesso riservato ai membri dell\'organizzazione.');
        }
        const mSnap = await tx.get(doc(db, 'orgs', d.orgId, 'members', uid));
        if (!mSnap.exists()) {
          throw new VoteError('FORBIDDEN', 'Non fai parte di questa organizzazione.');
        }
        if (d.audience === 'private' && d.creator?.uid !== uid) {
          throw new VoteError('FORBIDDEN', 'Questa decisione è privata.');
        }
      }

      const rawOptions: any[] = Array.isArray(d.options) ? d.options : [];
      const isRating = d.type === 'rating';
      const cleanName =
        !d.isAnonymous && typeof voterName === 'string' && voterName.trim()
          ? voterName.trim().slice(0, 60)
          : !d.isAnonymous && currentUser.displayName
          ? currentUser.displayName.trim().slice(0, 60)
          : undefined;

      const nowIso = new Date().toISOString();

      let updatedOptions: any[];
      let chosen: string[] = [];
      let rating: number | undefined;

      if (isRating) {
        if (
          typeof ratingValue !== 'number' ||
          !Number.isInteger(ratingValue) ||
          ratingValue < 1 ||
          ratingValue > 5
        ) {
          throw new VoteError('INVALID', 'Valutazione a stelle non valida (1–5).');
        }
        rating = ratingValue;
        const baseOptions = rawOptions.length === 5 ? rawOptions : DEFAULT_RATING_OPTIONS;
        updatedOptions = baseOptions.map((o, idx) =>
          idx === rating! - 1
            ? { ...o, votes: (Number(o.votes) || 0) + 1 }
            : o
        );
      } else {
        if (
          !Array.isArray(optionIds) ||
          optionIds.length > 50 ||
          !optionIds.every((x) => typeof x === 'string')
        ) {
          throw new VoteError('INVALID', 'Opzione di voto non valida.');
        }
        chosen = Array.from(new Set(optionIds));
        const validIds = new Set(rawOptions.map((o) => String(o.id)));
        if (chosen.length < 1 || !chosen.every((id) => validIds.has(id))) {
          throw new VoteError('INVALID', 'Opzione selezionata non valida.');
        }
        if (d.type !== 'multiple' && chosen.length !== 1) {
          throw new VoteError('INVALID', 'Puoi selezionare una sola opzione.');
        }
        updatedOptions = rawOptions.map((o) =>
          chosen.includes(String(o.id))
            ? { ...o, votes: (Number(o.votes) || 0) + 1 }
            : o
        );
      }

      const totalVotes = updatedOptions.reduce(
        (sum, o) => sum + (Number(o.votes) || 0),
        0
      );

      const votePayload: Record<string, any> = {
        userId: uid,
        ...(isRating ? { rating } : { optionIds: chosen }),
        ...(cleanName ? { voterName: cleanName } : {}),
        createdAt: serverTimestamp(),
      };

      tx.set(vRef, votePayload);

      const updatePayload: Record<string, any> = {
        options: updatedOptions,
        totalVotes,
      };

      if (isRating) {
        const weightedSum = updatedOptions.reduce(
          (sum, o, idx) => sum + (Number(o.votes) || 0) * (idx + 1),
          0
        );
        updatePayload.averageRating =
          totalVotes > 0 ? Number((weightedSum / totalVotes).toFixed(2)) : 0;
      }

      if (!d.isAnonymous) {
        const existingParticipants: any[] = Array.isArray(d.participants)
          ? d.participants
          : [];
        if (existingParticipants.length < 200) {
          updatePayload.participants = [
            ...existingParticipants,
            {
              name: cleanName || 'Partecipante',
              avatar: currentUser.photoURL || '',
              ...(isRating ? { ratingValue: rating } : { optionIds: chosen }),
              timestamp: nowIso,
            },
          ];
        }
      }

      tx.update(dRef, updatePayload);
    });
  } catch (err: any) {
    if (err instanceof VoteError) {
      throw err;
    }
    const errCode = String(err?.code || '').toLowerCase();
    const realMessage =
      (typeof err?.error === 'string' && err.error.trim()) ||
      (err instanceof Error && err.message) ||
      (typeof err?.message === 'string' && err.message.trim()) ||
      String(err);
    handleFirestoreError(err, OperationType.WRITE, `decisions/${decisionId}/votes/${uid}`);
    if (
      errCode.includes('permission-denied') ||
      realMessage.toLowerCase().includes('permission') ||
      realMessage.toLowerCase().includes('insufficient')
    ) {
      throw new VoteError('PERMISSION_DENIED', realMessage);
    }
    throw new VoteError('SERVER', realMessage);
  }
}
