import { doc, runTransaction } from 'firebase/firestore';
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
  optionIds: string[];
  ratingValue?: number;
  voterName?: string;
}

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

  if (
    typeof decisionId !== 'string' ||
    !/^[A-Za-z0-9_-]{1,128}$/.test(decisionId) ||
    !Array.isArray(optionIds) ||
    optionIds.length > 50 ||
    !optionIds.every((x) => typeof x === 'string')
  ) {
    throw new VoteError('INVALID', 'Opzione di voto non valida.');
  }

  const chosen = Array.from(new Set(optionIds));

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

      const options: any[] = Array.isArray(d.options) ? d.options : [];
      const validIds = new Set(options.map((o) => String(o.id)));
      if (chosen.length < 1 || !chosen.every((id) => validIds.has(id))) {
        throw new VoteError('INVALID', 'Opzione selezionata non valida.');
      }

      if (d.type !== 'multiple' && chosen.length !== 1) {
        throw new VoteError('INVALID', 'Puoi selezionare una sola opzione.');
      }

      let rating: number | undefined;
      if (d.type === 'rating') {
        if (
          typeof ratingValue !== 'number' ||
          !Number.isInteger(ratingValue) ||
          ratingValue < 1 ||
          ratingValue > 5
        ) {
          throw new VoteError('INVALID', 'Valutazione a stelle non valida.');
        }
        rating = ratingValue;
      }

      const updatedOptions = options.map((o) =>
        chosen.includes(String(o.id))
          ? { ...o, votes: (Number(o.votes) || 0) + 1 }
          : o
      );

      const cleanName =
        !d.isAnonymous && typeof voterName === 'string' && voterName.trim()
          ? voterName.trim().slice(0, 60)
          : !d.isAnonymous && currentUser.displayName
          ? currentUser.displayName.trim().slice(0, 60)
          : undefined;

      const nowIso = new Date().toISOString();

      tx.set(vRef, {
        userId: uid,
        optionIds: chosen,
        ...(rating !== undefined ? { ratingValue: rating } : {}),
        ...(cleanName ? { voterName: cleanName } : {}),
        timestamp: nowIso,
      });

      const updatePayload: Record<string, any> = {
        options: updatedOptions,
      };

      if (!d.isAnonymous) {
        const existingParticipants: any[] = Array.isArray(d.participants) ? d.participants : [];
        if (existingParticipants.length < 200) {
          updatePayload.participants = [
            ...existingParticipants,
            {
              name: cleanName || 'Partecipante',
              avatar: currentUser.photoURL || '',
              optionIds: chosen,
              ...(rating !== undefined ? { ratingValue: rating } : {}),
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
    const errMsg = String(err?.message || '').toLowerCase();
    handleFirestoreError(err, OperationType.WRITE, `decisions/${decisionId}/votes/${uid}`);
    if (errCode.includes('permission-denied') || errMsg.includes('permission') || errMsg.includes('insufficient')) {
      throw new VoteError(
        'PERMISSION_DENIED',
        'Permessi insufficienti o votazione già effettuata/scaduta.'
      );
    }
    throw new VoteError('SERVER', 'Errore durante l\'invio del voto. Riprova.');
  }
}
