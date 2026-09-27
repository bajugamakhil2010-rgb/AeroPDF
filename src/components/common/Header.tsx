import React from 'react';
import { FileText, Sparkles, Smartphone, Monitor, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../../types';

interface HeaderProps {
  user: UserProfile;
  onOpenAccount: () => void;
  onOpenUpgrade: () => void;
  isMobileDeviceView: boolean;
  onToggleDeviceView: () => void;
  syncStatus: 'idle' | 'syncing' | 'synced';
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenAccount,
  onOpenUpgrade,
  isMobileDeviceView,
  onToggleDeviceView,
  syncStatus,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        {/* Zone 1: Single text element wordmark with icon */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <FileText className="w-4 h-4" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
            Aero<span className="text-blue-400">PDF</span>
            {user.plan === 'pro' && (
              <span className="text-[10px] font-mono uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.2 rounded-md font-semibold tracking-wider">
                PRO
              </span>
            )}
          </span>
        </div>

        {/* Zone 2: Device Frame toggle & Cloud Sync status */}
        <div className="flex items-center gap-2">
          {/* Cloud sync indicator */}
          <button
            onClick={onOpenAccount}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors border border-slate-800/80"
            title="Cloud Vault Status"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                syncStatus === 'syncing'
                  ? 'bg-amber-400 animate-ping'
                  : syncStatus === 'synced'
                  ? 'bg-emerald-400'
                  : 'bg-blue-400'
              }`}
            />
            <span className="truncate max-w-[120px]">
              {syncStatus === 'syncing' ? 'Syncing...' : 'Cloud Vault Active'}
            </span>
          </button>

          {/* Desktop/Mobile Device Frame Toggle */}
          <button
            onClick={onToggleDeviceView}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 transition-colors"
            title={isMobileDeviceView ? 'Switch to responsive full-width view' : 'Preview in mobile device frame (390px)'}
          >
            {isMobileDeviceView ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Fluid View</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Mobile Frame</span>
              </>
            )}
          </button>
        </div>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2">
          {user.plan === 'free' ? (
            <button
              onClick={onOpenUpgrade}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-500 hover:to-indigo-500 transition-all shadow-sm active:scale-[0.98] whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Upgrade</span>
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-1 text-xs text-emerald-400 font-medium bg-emerald-950/40 border border-emerald-500/20 px-2 py-1 rounded-md">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Pro Active</span>
            </div>
          )}

          <button
            onClick={onOpenAccount}
            className="w-8 h-8 rounded-full ring-2 ring-slate-700 hover:ring-blue-500 overflow-hidden transition-all bg-slate-800 flex items-center justify-center shrink-0"
            title="Account & Cloud Sync"
          >
            <div className="w-full h-full bg-gradient-to-tr from-slate-700 to-blue-900 flex items-center justify-center text-white text-xs font-bold font-mono">
              AR
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
