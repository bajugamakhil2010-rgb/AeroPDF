import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  Zap,
  FolderLock,
  ChevronRight,
  CheckCircle2,
  HardDrive,
  Eye,
  Settings,
} from 'lucide-react';
import onboardingHeroImg from '../../assets/images/onboarding_pdf_hero_1790497095294.jpg';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (loadSamples: boolean) => void;
  onRequestPermissions: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  onRequestPermissions,
}) => {
  const [step, setStep] = useState<'welcome' | 'permissions' | 'ready'>('welcome');
  const [storagePermission, setStoragePermission] = useState<boolean>(true);
  const [showSettingsAlert, setShowSettingsAlert] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl transition-all">
        {step === 'welcome' && (
          <div className="p-6 sm:p-8 flex flex-col items-center text-center">
            {/* Hero Image */}
            <div className="w-full h-48 sm:h-56 rounded-2xl overflow-hidden mb-6 relative bg-slate-800 border border-slate-700/50">
              <img
                src={onboardingHeroImg}
                alt="AeroPDF Document Viewer Illustration"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
              <Zap className="w-3.5 h-3.5" />
              <span>Next-Gen Mobile Document Suite</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight mb-2">
              Welcome to AeroPDF
            </h2>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed mb-6">
              Lightning-fast PDF rendering, distraction-free reading, and encrypted offline vault designed for modern Android and iOS workflows.
            </p>

            {/* Feature highlights */}
            <div className="w-full grid grid-cols-1 gap-3 text-left mb-6">
              <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-800/50 border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Native Hardware Acceleration</h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Pinch-to-zoom and fluid vertical rendering powered by HTML5 Vector Canvas.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-800/50 border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <FolderLock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Zero-Tracking Private Storage</h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Documents remain strictly on your device storage unless you choose cloud sync.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-800/50 border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Native File System Integration</h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Seamless access to local Downloads, Documents, and external storage pickers.
                  </p>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="w-full flex flex-col gap-2.5">
              <button
                onClick={() => setStep('permissions')}
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 active:scale-[0.99] transition-all"
              >
                <span>Continue Setup</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onComplete(true)}
                className="w-full h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center justify-center transition-colors"
              >
                Skip & Load Sample Documents
              </button>
            </div>
          </div>
        )}

        {step === 'permissions' && (
          <div className="p-6 sm:p-8 flex flex-col">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
              <HardDrive className="w-6 h-6" />
            </div>

            <h3 className="text-xl sm:text-2xl font-display font-bold text-white mb-2">
              Device Storage & Permissions
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              AeroPDF respects your privacy. We never perform blanket scans of your internal drive or photo library. We use the standard Android/iOS document picker to access only the files you explicitly choose.
            </p>

            <div className="space-y-3 mb-6">
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-white">Files & Documents Access</h5>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Allows browsing and opening PDFs from Downloads, iCloud, Google Drive, or SD card.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={storagePermission}
                  onChange={(e) => setStoragePermission(e.target.checked)}
                  className="w-5 h-5 mt-1 rounded text-blue-600 bg-slate-700 border-slate-600 focus:ring-blue-500"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-800 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-slate-300">Privacy Safeguard</h5>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Gallery and media permissions are only prompted if you use document image capture. No tracking cookies or telemetry.
                  </p>
                </div>
              </div>
            </div>

            {showSettingsAlert && (
              <div className="p-3 mb-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between">
                <span>Permission disabled. Open device settings to re-enable?</span>
                <button
                  onClick={() => setShowSettingsAlert(false)}
                  className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 rounded text-[11px] font-semibold flex items-center gap-1"
                >
                  <Settings className="w-3 h-3" />
                  <span>Settings</span>
                </button>
              </div>
            )}

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => {
                  if (!storagePermission) {
                    setShowSettingsAlert(true);
                  } else {
                    onRequestPermissions();
                    setStep('ready');
                  }
                }}
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 active:scale-[0.99] transition-all"
              >
                <span>Confirm & Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setStep('welcome')}
                className="w-full h-9 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {step === 'ready' && (
          <div className="p-6 sm:p-8 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-display font-bold text-white mb-2">You're All Set!</h3>
            <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
              Your secure local document workspace is initialized. Ready to explore your PDF files with instant search and reading progress saving.
            </p>

            <div className="w-full flex flex-col gap-3">
              <button
                onClick={() => onComplete(true)}
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 active:scale-[0.99] transition-all"
              >
                <span>Explore with 3 Preloaded Sample PDFs</span>
              </button>

              <button
                onClick={() => onComplete(false)}
                className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center justify-center transition-colors"
              >
                Start with Empty Workspace (Import Your Own)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
