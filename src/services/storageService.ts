import { PdfDocument, AppSettings, UserProfile } from '../types';

const DB_NAME = 'AeroPdfDB';
const DB_VERSION = 1;
const DOCS_STORE = 'documents';
const SETTINGS_STORE = 'settings';

export const defaultSettings: AppSettings = {
  theme: 'dark',
  defaultZoomMode: 'fit-width',
  defaultFitMode: 'fit-width',
  continuousScroll: false,
  keepScreenAwake: true,
  highContrastDarkMode: true,
  hasCompletedOnboarding: false,
  permissions: {
    storageGranted: false,
    notificationsGranted: false,
  },
};

export const defaultUser: UserProfile = {
  id: 'user_default',
  name: 'Alex Rivera',
  email: 'alex.rivera@workspace.io',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  plan: 'free',
  cloudStorageUsedBytes: 14200000, // ~14.2 MB
  cloudStorageLimitBytes: 524288000, // 500 MB
  isLoggedIn: false,
  lastSyncedAt: Date.now() - 3600000,
  devices: [
    { id: 'dev_1', name: 'iPhone 16 Pro', type: 'ios', lastActive: Date.now() - 60000 },
    { id: 'dev_2', name: 'Pixel 9 Pro', type: 'android', lastActive: Date.now() - 86400000 },
    { id: 'dev_3', name: 'MacBook Air M3', type: 'desktop', lastActive: Date.now() - 3600000 },
  ],
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(DOCS_STORE)) {
        db.createObjectStore(DOCS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllDocuments(): Promise<PdfDocument[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DOCS_STORE], 'readonly');
      const store = transaction.objectStore(DOCS_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const docs = request.result as PdfDocument[];
        // Sort by lastOpenedAt descending
        docs.sort((a, b) => b.lastOpenedAt - a.lastOpenedAt);
        resolve(docs);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to load documents from IndexedDB', err);
    return [];
  }
}

export async function getDocumentById(id: string): Promise<PdfDocument | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DOCS_STORE], 'readonly');
      const store = transaction.objectStore(DOCS_STORE);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to get document by id', err);
    return null;
  }
}

export async function saveDocument(doc: PdfDocument): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DOCS_STORE], 'readwrite');
      const store = transaction.objectStore(DOCS_STORE);
      const request = store.put(doc);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to save document to IndexedDB', err);
    throw err;
  }
}

export async function deleteDocument(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([DOCS_STORE], 'readwrite');
      const store = transaction.objectStore(DOCS_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to delete document', err);
    throw err;
  }
}

export async function getSettings(): Promise<AppSettings> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction([SETTINGS_STORE], 'readonly');
      const store = transaction.objectStore(SETTINGS_STORE);
      const request = store.get('app_settings');

      request.onsuccess = () => {
        if (request.result && request.result.value) {
          resolve({ ...defaultSettings, ...request.result.value });
        } else {
          // fallback to localStorage
          const local = localStorage.getItem('aeropdf_settings');
          if (local) {
            resolve({ ...defaultSettings, ...JSON.parse(local) });
          } else {
            resolve(defaultSettings);
          }
        }
      };
      request.onerror = () => resolve(defaultSettings);
    });
  } catch {
    const local = localStorage.getItem('aeropdf_settings');
    return local ? { ...defaultSettings, ...JSON.parse(local) } : defaultSettings;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    localStorage.setItem('aeropdf_settings', JSON.stringify(settings));
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction([SETTINGS_STORE], 'readwrite');
      const store = transaction.objectStore(SETTINGS_STORE);
      store.put({ key: 'app_settings', value: settings });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => resolve();
    });
  } catch (err) {
    console.error('Failed to save settings to IndexedDB', err);
  }
}

export async function getUserProfile(): Promise<UserProfile> {
  try {
    const stored = localStorage.getItem('aeropdf_user_profile');
    if (stored) {
      return { ...defaultUser, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.warn(e);
  }
  return defaultUser;
}

export async function saveUserProfile(user: UserProfile): Promise<void> {
  try {
    localStorage.setItem('aeropdf_user_profile', JSON.stringify(user));
  } catch (e) {
    console.warn(e);
  }
}

export async function getStorageStats(): Promise<{ usedBytes: number; docCount: number }> {
  try {
    const docs = await getAllDocuments();
    const usedBytes = docs.reduce((acc, d) => acc + (d.fileSize || 0), 0);
    return { usedBytes, docCount: docs.length };
  } catch {
    return { usedBytes: 0, docCount: 0 };
  }
}
