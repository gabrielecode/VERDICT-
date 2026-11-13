import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult,
  signInAnonymously,
  signOut, 
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  User,
  AuthError
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfigFile from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigFile.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigFile.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigFile.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigFile.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigFile.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigFile.appId,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || firebaseConfigFile.firestoreDatabaseId,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({
  prompt: 'select_account'
});

export const signInWithGoogle = async () => {
  try {
    return await signInWithPopup(auth, googleAuthProvider);
  } catch (error: any) {
    if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/cancelled-popup-request') {
      await signInWithRedirect(auth, googleAuthProvider);
      return;
    }
    throw error;
  }
};

export const signInWithGoogleRedirect = () => signInWithRedirect(auth, googleAuthProvider);

export const checkRedirectResult = async () => {
  try {
    return await getRedirectResult(auth);
  } catch (error) {
    throw error;
  }
};

export const sendEmailLink = async (email: string) => {
  const actionCodeSettings = {
    url: window.location.origin,
    handleCodeInApp: true,
  };
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  window.localStorage.setItem('emailForSignIn', email);
};

export const completeEmailLinkSignIn = async () => {
  if (isSignInWithEmailLink(auth, window.location.href)) {
    let email = window.localStorage.getItem('emailForSignIn');
    if (!email) {
      email = window.prompt('Inserisci la tua email per completare l\'accesso:');
    }
    if (email) {
      const result = await signInWithEmailLink(auth, email, window.location.href);
      window.localStorage.removeItem('emailForSignIn');
      return result;
    }
  }
  return null;
};

export const logout = () => signOut(auth);

export const signInAnon = () => signInAnonymously(auth);

export interface AuthErrorDetails {
  code: string;
  isUnauthorizedDomain: boolean;
  isPopupBlocked: boolean;
  isOperationNotAllowed: boolean;
  message: string;
}

export function parseAuthError(error: any): AuthErrorDetails {
  const code = error?.code || '';
  const message = error?.message || String(error);

  const isUnauthorizedDomain = code === 'auth/unauthorized-domain' || message.includes('unauthorized-domain');
  const isPopupBlocked = code === 'auth/popup-blocked' || code === 'auth/cancelled-popup-request';
  const isOperationNotAllowed = code === 'auth/operation-not-allowed';

  let userFriendlyMessage = 'Si è verificato un errore durante l\'accesso con Google.';
  if (isUnauthorizedDomain) {
    userFriendlyMessage = `Il dominio "${window.location.hostname}" non è autorizzato in Firebase Console.`;
  } else if (isPopupBlocked) {
    userFriendlyMessage = 'Finestra popup bloccata dal browser. Prova con l\'accesso via redirect.';
  } else if (isOperationNotAllowed) {
    userFriendlyMessage = 'L\'accesso con Google non è abilitato nel pannello Firebase Authentication.';
  }

  return {
    code,
    isUnauthorizedDomain,
    isPopupBlocked,
    isOperationNotAllowed,
    message: userFriendlyMessage
  };
}

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
