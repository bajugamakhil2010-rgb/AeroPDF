import React, { useState } from 'react';
import {
  Moon,
  Sun,
  Monitor,
  Maximize2,
  HardDrive,
  ShieldCheck,
  HelpCircle,
  FileText,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Trash2,
  Download,
  Info,
  Smartphone,
  Eye,
} from 'lucide-react';
import { AppSettings, UserProfile } from '../../types';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  user: UserProfile;
  storageStats: { usedBytes: number; docCount: number };
  onClearAllData: () => void;
  onExportBackup: () => void;
  onOpenPermissions: () => void;
  onOpenUpgrade: () => void;
  onReopenOnboarding: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  user,
  storageStats,
  onClearAllData,
  onExportBackup,
  onOpenPermissions,
  onOpenUpgrade,
  onReopenOnboarding,
}) => {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 pb-24 space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-display font-bold text-white tracking-tight">App Settings</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure reader preferences, storage management, and device integration.
        </p>
      </div>

      {/* Pro Membership Banner */}
      {user.plan === 'free' ? (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Upgrade to AeroPDF Pro</h4>
              <p className="text-[11px] text-slate-300">
                Unlock 25 GB cloud vault, cross-device sync & vector highlighter tools.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenUpgrade}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shrink-0 shadow-sm transition-colors"
          >
            Upgrade
          </button>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-xs font-semibold text-white">AeroPDF Pro Active</p>
              <p className="text-[11px] text-slate-400">All premium capabilities enabled</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
            PRO SUITE
          </span>
        </div>
      )}

      {/* Appearance Section */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Appearance & Themes
        </h3>

        <div className="grid grid-cols-3 gap-2">
          {(['light', 'dark', 'system'] as const).map((t) => (
            <button
              key={t}
              onClick={() => onUpdateSettings({ ...settings, theme: t })}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                settings.theme === t
                  ? 'bg-blue-600/10 border-blue-500 text-blue-400'
                  : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {t === 'light' && <Sun className="w-5 h-5" />}
              {t === 'dark' && <Moon className="w-5 h-5" />}
              {t === 'system' && <Monitor className="w-5 h-5" />}
              <span className="text-xs font-medium capitalize">{t}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Reader Preferences */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Reading Preferences
        </h3>

        {/* Default Fit Mode */}
        <div className="flex items-center justify-between text-xs">
          <div>
            <p className="font-semibold text-white">Default PDF View Mode</p>
            <p className="text-[11px] text-slate-400">Fit page size upon opening document</p>
          </div>
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => onUpdateSettings({ ...settings, defaultFitMode: 'fit-width' })}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                settings.defaultFitMode === 'fit-width'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Fit Width
            </button>
            <button
              onClick={() => onUpdateSettings({ ...settings, defaultFitMode: 'fit-page' })}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                settings.defaultFitMode === 'fit-page'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Fit Page
            </button>
          </div>
        </div>

        {/* Continuous Scroll Toggle */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
          <div>
            <p className="font-semibold text-white">Continuous Vertical Scroll</p>
            <p className="text-[11px] text-slate-400">Read pages sequentially without single-page flipping</p>
          </div>
          <input
            type="checkbox"
            checked={settings.continuousScroll}
            onChange={(e) => onUpdateSettings({ ...settings, continuousScroll: e.target.checked })}
            className="w-5 h-5 rounded text-blue-600 bg-slate-800 border-slate-700 focus:ring-blue-500"
          />
        </div>

        {/* High contrast dark mode */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
          <div>
            <p className="font-semibold text-white">Night Reading Invert</p>
            <p className="text-[11px] text-slate-400">Invert PDF canvas colors for night reading comfort</p>
          </div>
          <input
            type="checkbox"
            checked={settings.highContrastDarkMode}
            onChange={(e) => onUpdateSettings({ ...settings, highContrastDarkMode: e.target.checked })}
            className="w-5 h-5 rounded text-blue-600 bg-slate-800 border-slate-700 focus:ring-blue-500"
          />
        </div>

        {/* Keep Screen Awake */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
          <div>
            <p className="font-semibold text-white">Prevent Screen Sleep (Wake Lock)</p>
            <p className="text-[11px] text-slate-400">Keep mobile display awake while reading documents</p>
          </div>
          <input
            type="checkbox"
            checked={settings.keepScreenAwake}
            onChange={(e) => onUpdateSettings({ ...settings, keepScreenAwake: e.target.checked })}
            className="w-5 h-5 rounded text-blue-600 bg-slate-800 border-slate-700 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Storage Management */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Storage Management
        </h3>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
            <span className="text-slate-400 block mb-1">Local Documents</span>
            <span className="text-base font-bold text-white font-mono">{storageStats.docCount} files</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
            <span className="text-slate-400 block mb-1">IndexedDB Vault Used</span>
            <span className="text-base font-bold text-white font-mono">{formatBytes(storageStats.usedBytes)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <button
            onClick={onExportBackup}
            className="flex-1 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export Document Backup (JSON)</span>
          </button>

          {confirmClear ? (
            <button
              onClick={() => {
                onClearAllData();
                setConfirmClear(false);
              }}
              className="flex-1 h-10 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Confirm Wipe Vault?</span>
            </button>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="flex-1 h-10 rounded-xl bg-slate-800/60 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border border-slate-800"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Local Storage</span>
            </button>
          )}
        </div>
      </div>

      {/* Permissions & Security */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Device Permissions & Privacy
        </h3>

        <button
          onClick={onOpenPermissions}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 transition-colors text-xs text-left"
        >
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <div>
              <p className="font-semibold text-white">Device Permissions Sandbox</p>
              <p className="text-[11px] text-slate-400">Storage, native file picker, and camera permissions</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        <button
          onClick={onReopenOnboarding}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 transition-colors text-xs text-left"
        >
          <div className="flex items-center gap-2.5">
            <RotateCcw className="w-4 h-4 text-indigo-400" />
            <div>
              <p className="font-semibold text-white">Replay Onboarding Tour</p>
              <p className="text-[11px] text-slate-400">View welcome tutorial and feature highlights</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* Legal & Support */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Legal & Support
        </h3>

        <button
          onClick={() => setShowFaqModal(true)}
          className="w-full flex items-center justify-between py-2 text-xs text-slate-300 hover:text-white"
        >
          <span className="flex items-center gap-2">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" /> Help & Frequently Asked Questions
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        </button>

        <button
          onClick={() => setShowPrivacyModal(true)}
          className="w-full flex items-center justify-between py-2 text-xs text-slate-300 hover:text-white border-t border-slate-800/60"
        >
          <span className="flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-slate-400" /> Privacy Policy
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        </button>

        <button
          onClick={() => setShowTermsModal(true)}
          className="w-full flex items-center justify-between py-2 text-xs text-slate-300 hover:text-white border-t border-slate-800/60"
        >
          <span className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-slate-400" /> Terms of Service
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        </button>
      </div>

      {/* App Info Footer */}
      <div className="text-center pt-2 pb-4 text-xs text-slate-500 space-y-1">
        <p className="font-semibold text-slate-400">AeroPDF Mobile Suite v2.4.0</p>
        <p className="text-[11px]">Hardware-accelerated PDF rendering engine for iOS & Android</p>
      </div>

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-2">Privacy Policy</h3>
            <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
              <p>
                <strong>1. Data Sovereignty & Local Storage:</strong> AeroPDF is built with a zero-tracking, offline-first architecture. All PDF documents, bookmarks, and annotations are saved inside your device's private browser IndexedDB storage sandbox.
              </p>
              <p>
                <strong>2. Document Picker Transparency:</strong> We only access documents that you explicitly select using the Android Storage Access Framework or iOS Document Picker. AeroPDF does not scan directories without user interaction.
              </p>
              <p>
                <strong>3. Optional Cloud Sync:</strong> If you activate an optional AeroPDF Cloud Vault account, documents and metadata are synchronized using TLS 1.3 transport security and encrypted at-rest using AES-256.
              </p>
            </div>
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="mt-6 w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Terms of Service Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-2">Terms of Service</h3>
            <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
              <p>
                <strong>1. Permitted Use:</strong> AeroPDF grants you a personal, non-exclusive license to view, edit, annotate, and manage PDF documents for commercial and personal workflows.
              </p>
              <p>
                <strong>2. User Content Ownership:</strong> You retain 100% intellectual property ownership of all documents imported into the application. We claim no ownership rights.
              </p>
              <p>
                <strong>3. Service Availability:</strong> Local PDF viewing works 100% offline without continuous server dependency.
              </p>
            </div>
            <button
              onClick={() => setShowTermsModal(false)}
              className="mt-6 w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      {showFaqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">Frequently Asked Questions</h3>
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-semibold text-white">Can I view PDFs offline without an internet connection?</h4>
                <p className="text-slate-400 mt-1">
                  Yes! All imported PDFs are cached in your device's persistent IndexedDB storage, meaning you can open, read, zoom, and annotate documents anytime without Wi-Fi.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white">How does pinch-to-zoom work on mobile?</h4>
                <p className="text-slate-400 mt-1">
                  You can pinch with two fingers on mobile screens or double-tap to zoom in and out. You can also use the zoom slider or the Fit Width button in the reader toolbar.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white">Are my annotations saved automatically?</h4>
                <p className="text-slate-400 mt-1">
                  Yes, highlights, drawings, notes, and the last-read page are automatically persisted in real-time as you read.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowFaqModal(false)}
              className="mt-6 w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
