import React, { useState } from 'react';
import { ShieldCheck, HardDrive, Camera, Bell, Check, X, ExternalLink } from 'lucide-react';
import { AppSettings } from '../../types';

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdatePermissions: (storage: boolean, notifications: boolean) => void;
}

export const PermissionsModal: React.FC<PermissionsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdatePermissions,
}) => {
  const [storageGranted, setStorageGranted] = useState(settings.permissions.storageGranted);
  const [notificationsGranted, setNotificationsGranted] = useState(settings.permissions.notificationsGranted);
  const [showSettingsToast, setShowSettingsToast] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdatePermissions(storageGranted, notificationsGranted);
    onClose();
  };

  const handleSimulateOpenSettings = () => {
    setShowSettingsToast(true);
    setTimeout(() => setShowSettingsToast(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">App Permissions</h3>
              <p className="text-xs text-slate-400">Android & iOS Security Sandbox</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed mb-5">
          AeroPDF operates on a zero-intrusion principle. We access local documents only when you select them via your system file dialog.
        </p>

        <div className="space-y-3 mb-6">
          {/* Storage permission */}
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Local Storage & Documents</p>
                <p className="text-[11px] text-slate-400">Read & save selected PDF files</p>
              </div>
            </div>
            <button
              onClick={() => setStorageGranted(!storageGranted)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                storageGranted
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {storageGranted ? 'Granted' : 'Denied'}
            </button>
          </div>

          {/* Camera / Scan permission */}
          <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Camera & Document Scan</p>
                <p className="text-[11px] text-slate-400">Used only for snapping paper docs</p>
              </div>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">On Request</span>
          </div>

          {/* Notifications */}
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Cloud Sync Alerts</p>
                <p className="text-[11px] text-slate-400">Notify when sync completes</p>
              </div>
            </div>
            <button
              onClick={() => setNotificationsGranted(!notificationsGranted)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                notificationsGranted
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {notificationsGranted ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>

        {showSettingsToast && (
          <div className="mb-4 p-2.5 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs text-center animate-fade-in">
            Redirecting to System Settings: App info &gt; Permissions
          </div>
        )}

        <div className="flex flex-col gap-2">
          <button
            onClick={handleSave}
            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/25 active:scale-[0.99] transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>

          <button
            onClick={handleSimulateOpenSettings}
            className="w-full h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open System App Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
