import React from 'react';
import { ShieldCheck, HardDrive, Check } from 'lucide-react';

interface SinglePermissionDialogProps {
  isOpen: boolean;
  onAllow: () => void;
  onDeny: () => void;
}

export const SinglePermissionDialog: React.FC<SinglePermissionDialogProps> = ({
  isOpen,
  onAllow,
  onDeny,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-neutral-900 border border-neutral-700 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl">
        {/* Minimalist B&W Icon */}
        <div className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center mx-auto mb-4 shadow-lg">
          <HardDrive className="w-7 h-7 stroke-[2]" />
        </div>

        <h3 className="text-lg font-bold text-white mb-2 tracking-tight">
          Storage Permission
        </h3>

        <p className="text-xs text-neutral-300 leading-relaxed mb-6">
          Allow <strong className="text-white">AeroPDF</strong> to access your device's Files and Storage to open, upload, and view your PDF documents and gallery items?
        </p>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onAllow}
            className="w-full h-12 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Allow Access</span>
          </button>

          <button
            onClick={onDeny}
            className="w-full h-10 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white font-medium text-xs transition-colors"
          >
            Don't Allow
          </button>
        </div>
      </div>
    </div>
  );
};
