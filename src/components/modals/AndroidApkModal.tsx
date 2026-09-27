import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  ExternalLink,
  X,
  CheckCircle2,
  Copy,
  Check,
  FileCode,
  Layers,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface AndroidApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidApkModal: React.FC<AndroidApkModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isOpen) return null;

  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const pwabuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(appUrl)}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleDownloadTwaManifest = () => {
    const twaManifest = {
      packageId: 'app.aeropdf.viewer',
      host: typeof window !== 'undefined' ? window.location.hostname : 'localhost',
      name: 'AeroPDF',
      launcherName: 'AeroPDF',
      themeColor: '#000000',
      navigationColor: '#000000',
      backgroundColor: '#000000',
      startUrl: '/',
      iconUrl: '/pwa-512x512.png',
      maskableIconUrl: '/pwa-maskable-512x512.png',
      appVersionName: '1.0.0',
      appVersionCode: 1,
      shortcuts: [],
      generatorApp: 'bubblewrap-cli',
      webManifestUrl: `${appUrl}/manifest.webmanifest`,
      fallbackType: 'customtabs',
      enableNotifications: false,
    };

    const blob = new Blob([JSON.stringify(twaManifest, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'twa-manifest.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-neutral-900 border border-neutral-700 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-left">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center">
              <Smartphone className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Android App (APK / WebAPK)</h3>
              <p className="text-xs text-neutral-400">Install directly or build package</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed mb-5">
          AeroPDF is fully configured for Android with offline caching, high-resolution icons, and native device storage access.
        </p>

        {/* Option 1: Direct Android Install (WebAPK) */}
        <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 mb-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>1. Direct Android Install (WebAPK)</span>
            </span>
            <span className="text-[10px] font-mono uppercase bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded">
              Recommended
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 leading-normal">
            Android Chrome generates an authentic native APK package installed directly to your home screen and app drawer with no URL bars.
          </p>

          {isInstalled ? (
            <div className="w-full py-2 bg-neutral-800 rounded-xl text-center text-xs font-semibold text-white">
              App Already Installed on this Device
            </div>
          ) : (
            <button
              onClick={() => {
                if (isInstallable) {
                  install();
                } else {
                  alert(
                    'To install on Android:\n1. Open this URL in Chrome on your Android phone.\n2. Tap the three dots (⋮) menu.\n3. Tap "Install App" or "Add to Home Screen".'
                  );
                }
              }}
              className="w-full h-11 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>{isInstallable ? 'Install to Android Now' : 'How to Install on Android'}</span>
            </button>
          )}
        </div>

        {/* Option 2: Generate Signed APK via PWABuilder */}
        <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 mb-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <ExternalLink className="w-4 h-4 text-white" />
              <span>2. Generate .APK / .AAB File</span>
            </span>
            <span className="text-[10px] font-mono bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded">
              PWABuilder
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 leading-normal">
            Generate a standalone downloadable <strong className="text-white">.apk</strong> or Google Play Store <strong className="text-white">.aab</strong> package in one click via PWABuilder.
          </p>

          <div className="flex gap-2">
            <a
              href={pwabuilderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 h-10 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-neutral-700"
            >
              <span>Build APK on PWABuilder</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handleCopyUrl}
              className="px-3 h-10 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs flex items-center gap-1 border border-neutral-700"
              title="Copy App URL"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Option 3: Download Android TWA Manifest */}
        <div className="p-3 rounded-2xl bg-neutral-950/60 border border-neutral-850 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-neutral-400" />
            <span>Developer Bubblewrap Manifest</span>
          </div>
          <button
            onClick={handleDownloadTwaManifest}
            className="text-white hover:underline text-xs font-semibold"
          >
            Download JSON
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full h-10 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium text-xs transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
