import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import {
  getFirestore,
  doc,
  collection,
  getDocs,
  getDocsFromServer,
  getDocFromServer,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  Project,
  ServiceItem,
  EditorialInsight,
  ClientItem,
  HeroSlide,
  SiteSettings,
  ContactInquiry,
} from '../types';
import {
  initialProjects,
  initialServices,
  initialClients,
  initialHeroSlides,
  initialSiteSettings,
  initialEditorialInsights,
} from '../data/initialData';

// Flexible Production Firebase Config: Uses environment variables if set, fallback to bundled config
const effectiveConfig = {
  ...firebaseConfig,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfig.appId,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || firebaseConfig.firestoreDatabaseId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket,
};

// Initialize Firebase App
export const app = getApps().length ? getApp() : initializeApp(effectiveConfig);

// CRITICAL: Must use firestoreDatabaseId from effective configuration
export const db = getFirestore(app, effectiveConfig.firestoreDatabaseId);

export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export async function sendAdminPasswordReset(email: string) {
  const { sendPasswordResetEmail } = await import('firebase/auth');
  return sendPasswordResetEmail(auth, email);
}

// Skill Error Handler Definition
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
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection per SKILL.md
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
      return false;
    }
    // If permission denied or doc not found, it still proves connection reached Firestore server
    return true;
  }
}

// Seed initial collections in Firestore if empty
let isSeeding = false;
export async function seedInitialDataIfEmpty(): Promise<void> {
  if (isSeeding) return;
  isSeeding = true;
  try {
    const projectsSnap = await getDocs(collection(db, 'projects'));
    if (!projectsSnap.empty) {
      isSeeding = false;
      return;
    }

    console.log('Seeding initial studio data into Firestore...');
    const batch = writeBatch(db);

    // Projects
    initialProjects.forEach((p) => {
      const ref = doc(db, 'projects', p.id);
      batch.set(ref, p);
    });

    // Services
    initialServices.forEach((s) => {
      const ref = doc(db, 'services', s.id);
      batch.set(ref, s);
    });

    // Editorial Insights
    initialEditorialInsights.forEach((i) => {
      const ref = doc(db, 'insights', i.id);
      batch.set(ref, i);
    });

    // Clients
    initialClients.forEach((c) => {
      const ref = doc(db, 'clients', c.id);
      batch.set(ref, c);
    });

    // Sliders
    initialHeroSlides.forEach((s) => {
      const ref = doc(db, 'sliders', s.id);
      batch.set(ref, s);
    });

    // Settings
    const settingsRef = doc(db, 'settings', 'site');
    batch.set(settingsRef, initialSiteSettings);

    await batch.commit();
    console.log('Firestore initial data seed complete.');
  } catch (err) {
    console.warn('Firestore seed note (may have existing data or rules):', err);
  } finally {
    isSeeding = false;
  }
}

// Direct Fresh Fetch From Server (Bypasses local cache completely on Sign In)
export async function fetchFreshDataFromServer(): Promise<{
  projects: Project[];
  services: ServiceItem[];
  insights: EditorialInsight[];
  clients: ClientItem[];
  sliders: HeroSlide[];
  settings: SiteSettings | null;
}> {
  try {
    const [projSnap, srvSnap, insightSnap, clientSnap, slideSnap, settDoc] =
      await Promise.all([
        getDocsFromServer(collection(db, 'projects')),
        getDocsFromServer(collection(db, 'services')),
        getDocsFromServer(collection(db, 'insights')),
        getDocsFromServer(collection(db, 'clients')),
        getDocsFromServer(collection(db, 'sliders')),
        getDocFromServer(doc(db, 'settings', 'site')),
      ]);

    const projects = projSnap.docs.map((d) => d.data() as Project).sort((a, b) => a.order - b.order);
    const services = srvSnap.docs.map((d) => d.data() as ServiceItem).sort((a, b) => a.order - b.order);
    const insights = insightSnap.docs.map((d) => d.data() as EditorialInsight).sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
    const clients = clientSnap.docs.map((d) => d.data() as ClientItem).sort((a, b) => a.order - b.order);
    const sliders = slideSnap.docs.map((d) => d.data() as HeroSlide).sort((a, b) => a.order - b.order);
    const settings = settDoc.exists() ? (settDoc.data() as SiteSettings) : null;

    return { projects, services, insights, clients, sliders, settings };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'multiple');
    throw error;
  }
}

// Real-Time Subscriptions: Any CMS modification triggers immediate live update on Main Site
export interface FirestoreListeners {
  onProjectsUpdate?: (projects: Project[]) => void;
  onServicesUpdate?: (services: ServiceItem[]) => void;
  onInsightsUpdate?: (insights: EditorialInsight[]) => void;
  onClientsUpdate?: (clients: ClientItem[]) => void;
  onSlidersUpdate?: (sliders: HeroSlide[]) => void;
  onSettingsUpdate?: (settings: SiteSettings) => void;
}

export function subscribeToFirestore(listeners: FirestoreListeners): () => void {
  const unsubs: Unsubscribe[] = [];

  // Projects listener
  if (listeners.onProjectsUpdate) {
    const unsub = onSnapshot(
      collection(db, 'projects'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => d.data() as Project).sort((a, b) => a.order - b.order);
          listeners.onProjectsUpdate!(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'projects');
      }
    );
    unsubs.push(unsub);
  }

  // Services listener
  if (listeners.onServicesUpdate) {
    const unsub = onSnapshot(
      collection(db, 'services'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => d.data() as ServiceItem).sort((a, b) => a.order - b.order);
          listeners.onServicesUpdate!(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'services');
      }
    );
    unsubs.push(unsub);
  }

  // Insights listener
  if (listeners.onInsightsUpdate) {
    const unsub = onSnapshot(
      collection(db, 'insights'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => d.data() as EditorialInsight).sort((a, b) => {
            if (a.order !== b.order) return a.order - b.order;
            return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
          });
          listeners.onInsightsUpdate!(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'insights');
      }
    );
    unsubs.push(unsub);
  }

  // Clients listener
  if (listeners.onClientsUpdate) {
    const unsub = onSnapshot(
      collection(db, 'clients'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => d.data() as ClientItem).sort((a, b) => a.order - b.order);
          listeners.onClientsUpdate!(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'clients');
      }
    );
    unsubs.push(unsub);
  }

  // Sliders listener
  if (listeners.onSlidersUpdate) {
    const unsub = onSnapshot(
      collection(db, 'sliders'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => d.data() as HeroSlide).sort((a, b) => a.order - b.order);
          listeners.onSlidersUpdate!(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'sliders');
      }
    );
    unsubs.push(unsub);
  }

  // Settings listener
  if (listeners.onSettingsUpdate) {
    const unsub = onSnapshot(
      doc(db, 'settings', 'site'),
      (snapshot) => {
        if (snapshot.exists()) {
          listeners.onSettingsUpdate!(snapshot.data() as SiteSettings);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'settings/site');
      }
    );
    unsubs.push(unsub);
  }

  return () => {
    unsubs.forEach((u) => u());
  };
}

// Direct Firestore Mutators (Used by CMS to guarantee live synchronization)
export async function saveProjectToFirestore(project: Project): Promise<void> {
  const path = `projects/${project.id}`;
  try {
    await setDoc(doc(db, 'projects', project.id), project, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteProjectFromFirestore(id: string): Promise<void> {
  const path = `projects/${id}`;
  try {
    await deleteDoc(doc(db, 'projects', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveServiceToFirestore(service: ServiceItem): Promise<void> {
  const path = `services/${service.id}`;
  try {
    await setDoc(doc(db, 'services', service.id), service, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteServiceFromFirestore(id: string): Promise<void> {
  const path = `services/${id}`;
  try {
    await deleteDoc(doc(db, 'services', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveInsightToFirestore(insight: EditorialInsight): Promise<void> {
  const path = `insights/${insight.id}`;
  try {
    await setDoc(doc(db, 'insights', insight.id), insight, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteInsightFromFirestore(id: string): Promise<void> {
  const path = `insights/${id}`;
  try {
    await deleteDoc(doc(db, 'insights', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveClientToFirestore(client: ClientItem): Promise<void> {
  const path = `clients/${client.id}`;
  try {
    await setDoc(doc(db, 'clients', client.id), client, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteClientFromFirestore(id: string): Promise<void> {
  const path = `clients/${id}`;
  try {
    await deleteDoc(doc(db, 'clients', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveSliderToFirestore(slider: HeroSlide): Promise<void> {
  const path = `sliders/${slider.id}`;
  try {
    await setDoc(doc(db, 'sliders', slider.id), slider, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteSliderFromFirestore(id: string): Promise<void> {
  const path = `sliders/${id}`;
  try {
    await deleteDoc(doc(db, 'sliders', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveSettingsToFirestore(settings: SiteSettings): Promise<void> {
  const path = 'settings/site';
  try {
    await setDoc(doc(db, 'settings', 'site'), settings, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function submitInquiryToFirestore(
  inquiry: Omit<ContactInquiry, 'id' | 'createdAt' | 'status'>
): Promise<ContactInquiry> {
  const id = `inq_${Date.now()}`;
  const path = `inquiries/${id}`;
  const newInquiry: ContactInquiry = {
    ...inquiry,
    id,
    status: 'new',
    createdAt: new Date().toISOString(),
  };
  try {
    await setDoc(doc(db, 'inquiries', id), newInquiry);
    return newInquiry;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

// Authentication Helpers
export async function signInWithGooglePopup(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutFirebase(): Promise<void> {
  await signOut(auth);
}

export function subscribeAuthState(callback: (user: FirebaseUser | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}
