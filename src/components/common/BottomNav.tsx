import React from 'react';
import { Home, FolderOpen, Star, Settings, Plus } from 'lucide-react';
import { ViewMode } from '../../types';

interface BottomNavProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  onOpenImport: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onSelectView,
  onOpenImport,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 pb-safe shadow-2xl">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around relative">
        {/* Home */}
        <button
          onClick={() => onSelectView('home')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
            currentView === 'home' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Home Dashboard"
        >
          <Home className="w-5 h-5" />
          <span className="text-[11px] font-medium mt-1">Home</span>
        </button>

        {/* Library */}
        <button
          onClick={() => onSelectView('library')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
            currentView === 'library' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Document Library"
        >
          <FolderOpen className="w-5 h-5" />
          <span className="text-[11px] font-medium mt-1">Library</span>
        </button>

        {/* Center Floating Import FAB */}
        <div className="relative -top-3">
          <button
            onClick={onOpenImport}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 active:scale-95 transition-all ring-4 ring-slate-900"
            title="Import or Open PDF"
            aria-label="Import PDF"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Favorites */}
        <button
          onClick={() => onSelectView('favorites')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
            currentView === 'favorites' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Favorite Documents"
        >
          <Star className="w-5 h-5" />
          <span className="text-[11px] font-medium mt-1">Favorites</span>
        </button>

        {/* Settings */}
        <button
          onClick={() => onSelectView('settings')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
            currentView === 'settings' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
          <span className="text-[11px] font-medium mt-1">Settings</span>
        </button>
      </div>
    </nav>
  );
};
