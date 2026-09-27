import React, { useState } from 'react';
import {
  X,
  User,
  Cloud,
  Smartphone,
  Laptop,
  Check,
  Sparkles,
  ArrowRight,
  LogOut,
  RefreshCw,
  HardDrive,
  Trash2,
} from 'lucide-react';
import { UserProfile } from '../../types';
import cloudSyncImg from '../../assets/images/cloud_sync_feature_1790497122914.jpg';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onOpenUpgrade: () => void;
  onTriggerSync: () => void;
  syncStatus: 'idle' | 'syncing' | 'synced';
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onOpenUpgrade,
  onTriggerSync,
  syncStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'sync' | 'plans'>('profile');
  const [isAuthMode, setIsAuthMode] = useState(!user.isLoggedIn);
  const [emailInput, setEmailInput] = useState(user.email);
  const [nameInput, setNameInput] = useState(user.name);

  if (!isOpen) return null;

  const handleSimulateLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      isLoggedIn: true,
      email: emailInput || 'alex.rivera@workspace.io',
      name: nameInput || 'Alex Rivera',
    });
    setIsAuthMode(false);
  };

  const handleGoogleLogin = () => {
    onUpdateUser({
      ...user,
      isLoggedIn: true,
      email: 'alex.rivera.google@gmail.com',
      name: 'Alex Rivera (Google)',
    });
    setIsAuthMode(false);
  };

  const handleLogout = () => {
    onUpdateUser({
      ...user,
      isLoggedIn: false,
    });
  };

  const formatBytes = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) {
      return (mb / 1024).toFixed(1) + ' GB';
    }
    return mb.toFixed(1) + ' MB';
  };

  const percentStorage = Math.min(
    100,
    Math.round((user.cloudStorageUsedBytes / user.cloudStorageLimitBytes) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl overflow-hidden my-8">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-white">SaaS Cloud & Account</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-800/80 rounded-xl mb-5 text-xs font-medium">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${
              activeTab === 'profile' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Profile & Vault
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${
              activeTab === 'sync' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Multi-Device Sync
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${
              activeTab === 'plans' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Subscription
          </button>
        </div>

        {/* TAB 1: Profile & Vault */}
        {activeTab === 'profile' && (
          <div>
            {!user.isLoggedIn ? (
              <div className="space-y-4">
                <div className="text-center py-2">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-400 flex items-center justify-center mx-auto mb-2">
                    <Cloud className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-white">Sign In for Cloud Sync</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Sign in to sync your PDF bookmarks, reading position, and annotations across all your phones and laptops. Local viewing remains 100% free!
                  </p>
                </div>

                <button
                  onClick={handleGoogleLogin}
                  className="w-full h-11 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs flex items-center justify-center gap-2.5 transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="flex items-center gap-2 my-2">
                  <div className="flex-1 h-px bg-slate-800" />
                  <span className="text-[10px] text-slate-500 font-mono">OR EMAIL</span>
                  <div className="flex-1 h-px bg-slate-800" />
                </div>

                <form onSubmit={handleSimulateLogin} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="e.g. Alex Rivera"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="alex@workspace.io"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md shadow-blue-600/25 transition-all"
                  >
                    Create Account / Sign In
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Active user header */}
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold font-display text-lg shadow-md">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-white">{user.name}</h4>
                        <span className="text-[10px] font-mono uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded-md">
                          {user.plan === 'pro' ? 'Pro Plan' : 'Free Tier'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                {/* Cloud storage meter */}
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-300 font-medium flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                      <span>Cloud Storage Used</span>
                    </span>
                    <span className="font-mono text-slate-400">
                      {formatBytes(user.cloudStorageUsedBytes)} / {formatBytes(user.cloudStorageLimitBytes)}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${percentStorage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span>{percentStorage}% capacity</span>
                    {user.plan === 'free' && (
                      <button
                        onClick={onOpenUpgrade}
                        className="text-blue-400 hover:text-blue-300 font-semibold"
                      >
                        Upgrade to 25 GB &rarr;
                      </button>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={onTriggerSync}
                    disabled={syncStatus === 'syncing'}
                    className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 transition-all"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                    <span>{syncStatus === 'syncing' ? 'Syncing Documents...' : 'Sync Vault Now'}</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full h-9 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border border-slate-800"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out of Account</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Multi-Device Sync */}
        {activeTab === 'sync' && (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden h-36 bg-slate-800 border border-slate-700/50">
              <img
                src={cloudSyncImg}
                alt="Cloud Sync Visual"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">AES-256 Encrypted Sync</h4>
                  <p className="text-[10px] text-slate-300">Continuous background sync</p>
                </div>
                <button
                  onClick={onTriggerSync}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-[11px] font-medium flex items-center gap-1 shadow-sm"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Sync</span>
                </button>
              </div>
            </div>

            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Connected Devices
            </h4>

            <div className="space-y-2">
              {user.devices.map((dev) => (
                <div
                  key={dev.id}
                  className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 text-blue-400 flex items-center justify-center">
                      {dev.type === 'desktop' ? (
                        <Laptop className="w-4 h-4" />
                      ) : (
                        <Smartphone className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{dev.name}</p>
                      <p className="text-[10px] text-slate-400">
                        Active {new Date(dev.lastActive).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                    Synchronized
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800/80 text-[11px] text-slate-400 leading-normal">
              Cloud document backup replicates your reading positions, highlighters, and bookmarks seamlessly across iOS, Android, and Web browsers.
            </div>
          </div>
        )}

        {/* TAB 3: Plans & Pricing */}
        {activeTab === 'plans' && (
          <div className="space-y-3">
            {/* Free Card */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                user.plan === 'free'
                  ? 'bg-slate-800/70 border-blue-500/50'
                  : 'bg-slate-800/30 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Free Starter
                </span>
                <span className="text-sm font-bold text-white font-mono">$0 / mo</span>
              </div>
              <ul className="text-xs text-slate-400 space-y-1.5 mb-3">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-400" />
                  <span>Unlimited local PDF viewing on device</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-400" />
                  <span>500 MB encrypted cloud vault</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-400" />
                  <span>Basic highlights & bookmarks</span>
                </li>
              </ul>
              {user.plan === 'free' ? (
                <div className="w-full py-1.5 text-center text-xs font-medium text-slate-400 bg-slate-800 rounded-lg">
                  Current Active Plan
                </div>
              ) : (
                <button
                  onClick={() => onUpdateUser({ ...user, plan: 'free' })}
                  className="w-full py-1.5 text-center text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
                >
                  Downgrade to Free
                </button>
              )}
            </div>

            {/* Pro Card */}
            <div
              className={`p-4 rounded-2xl border relative overflow-hidden transition-all ${
                user.plan === 'pro'
                  ? 'bg-blue-950/30 border-blue-500 ring-1 ring-blue-500'
                  : 'bg-gradient-to-br from-blue-950/20 to-indigo-950/30 border-blue-500/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                    AeroPDF Pro
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-white font-mono">$4.99</span>
                  <span className="text-[10px] text-slate-400 font-mono"> / mo</span>
                </div>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 mb-4">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>25 GB High-Speed Cloud Document Vault</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Instant Cross-Device Auto Sync (Unlimited devices)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Vector Pen & Freehand Highlighting</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>AMOLED Dark Mode & Custom Sepia Themes</span>
                </li>
              </ul>

              {user.plan === 'pro' ? (
                <div className="w-full py-2 text-center text-xs font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 rounded-xl">
                  Pro Membership Active
                </div>
              ) : (
                <button
                  onClick={() => {
                    onUpdateUser({
                      ...user,
                      plan: 'pro',
                      cloudStorageLimitBytes: 26843545600, // 25 GB
                    });
                  }}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-[0.99]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Upgrade to AeroPDF Pro</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
