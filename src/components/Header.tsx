import React from 'react';
import { RefreshCw, Zap, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSync: () => void;
  isSyncing: boolean;
  avatarUrl: string;
  username: string;
  unifiedRating: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onSync,
  isSyncing,
  avatarUrl,
  username,
  unifiedRating,
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'profile', label: 'My Profile' },
    { id: 'placement', label: '7-Mo Plan' },
    { id: 'topics', label: 'Topic Engine' },
    { id: 'contests', label: 'Contest Scheduler' },
    { id: 'sm2', label: 'SM-2 Revision' },
    { id: 'pipeline', label: 'Worker Pipeline' },
    { id: 'schema', label: 'Scale & Schema' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
            <Zap className="w-4 h-4" />
          </div>
          <button
            onClick={() => setActiveTab('overview')}
            className="text-lg font-bold tracking-tight text-white hover:text-indigo-300 transition-colors whitespace-nowrap text-left"
          >
            AlgoPulse
          </button>
        </div>

        {/* Zone 2: Single-line Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-400">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`whitespace-nowrap transition-colors relative py-1 text-xs uppercase tracking-wider font-semibold ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action & Profile */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={`hidden sm:flex items-center gap-2.5 p-1 rounded-lg transition-colors text-left ${
              activeTab === 'profile'
                ? 'ring-1 ring-indigo-500 bg-indigo-950/40'
                : 'hover:bg-slate-900'
            }`}
            title="Open My Profile & Platform Handles"
          >
            <img
              src={avatarUrl}
              alt={username}
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-700"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="flex flex-col text-left">
              <span className="text-slate-200 font-medium leading-none text-xs">{username}</span>
              <span className="text-[11px] font-mono text-indigo-400 tabular-nums">Rating: {unifiedRating}</span>
            </div>
          </button>

          <button
            onClick={onSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors whitespace-nowrap shadow-sm shadow-indigo-600/30"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Platforms'}</span>
          </button>
        </div>
      </div>

      {/* Mobile nav bar row for small screens */}
      <div className="lg:hidden flex items-center gap-3 overflow-x-auto pt-2.5 pb-1 border-t border-slate-800/60 mt-2 text-xs scrollbar-none">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`whitespace-nowrap px-2.5 py-1 rounded transition-colors ${
              activeTab === item.id
                ? 'bg-indigo-600/20 text-indigo-300 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
