import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json' with { type: 'json' };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleAuthProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleAuthProvider);
export const logout = () => signOut(auth);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function getReadableErrorMessage(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  const lower = msg.toLowerCase();

  if (lower.includes('permission-denied') || lower.includes('permission_denied') || lower.includes('insufficient permissions')) {
    return 'Accesso negato: non disponi dei permessi necessari per questa operazione.';
  }
  if (lower.includes('offline') || lower.includes('unavailable') || lower.includes('failed-precondition') || lower.includes('network')) {
    return 'Connessione assente: verifica la tua rete e riprova.';
  }
  return 'Si è verificato un errore durante l\'operazione. Riprova più tardi.';
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): string {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };

  console.error('Firestore Error Details:', JSON.stringify(errInfo));
  const userFriendlyMessage = getReadableErrorMessage(error);
  console.error('Firestore User Message:', userFriendlyMessage);
  return userFriendlyMessage;
}

