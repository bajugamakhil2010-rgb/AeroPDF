export interface PdfAnnotation {
  id: string;
  pageNumber: number;
  type: 'highlight' | 'draw' | 'note';
  color: string;
  points?: { x: number; y: number }[]; // For freehand drawing (percentage relative to page size)
  rect?: { x: number; y: number; width: number; height: number }; // For highlights
  text?: string; // For notes
  createdAt: number;
}

export interface PdfBookmark {
  id: string;
  pageNumber: number;
  title: string;
  createdAt: number;
}

export interface PdfDocument {
  id: string;
  name: string;
  fileSize: number;
  totalPages: number;
  lastOpenedAt: number;
  createdAt: number;
  lastReadPage: number;
  isFavorite: boolean;
  category: 'all' | 'recent' | 'downloads' | 'work' | 'personal';
  thumbnailUrl?: string; // base64 or object URL of page 1 preview
  fileData?: ArrayBuffer; // Full binary in IndexedDB
  isImage?: boolean;
  imageUrl?: string;
  bookmarks: PdfBookmark[];
  annotations: PdfAnnotation[];
  syncedToCloud?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  plan: 'free' | 'pro';
  cloudStorageUsedBytes: number;
  cloudStorageLimitBytes: number;
  isLoggedIn: boolean;
  lastSyncedAt: number | null;
  devices: {
    id: string;
    name: string;
    type: 'ios' | 'android' | 'desktop';
    lastActive: number;
  }[];
}

export type ViewMode = 'home' | 'library' | 'favorites' | 'settings' | 'reader';

export type ReaderTheme = 'light' | 'dark' | 'sepia';
export type ZoomMode = 'fit-width' | 'fit-page' | 'custom';

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  defaultZoomMode: ZoomMode;
  defaultFitMode: 'fit-width' | 'fit-page';
  continuousScroll: boolean;
  keepScreenAwake: boolean;
  highContrastDarkMode: boolean;
  hasCompletedOnboarding: boolean;
  permissions: {
    storageGranted: boolean;
    notificationsGranted: boolean;
  };
}
