import React from 'react';
import { useMusic } from '../context/MusicContext';
import { AppDestination } from '../types';
import { PlayCircle, Library, Cloud, Settings, Music, Disc } from 'lucide-react';

export const AppNavigation: React.FC = () => {
  const { currentDestination, setCurrentDestination, userSettings, currentTrack } = useMusic();
  const { uiStyle } = userSettings;

  const NAV_ITEMS: { key: AppDestination; label: string; icon: typeof PlayCircle }[] = [
    { key: 'NOW_PLAYING', label: '正在播放', icon: PlayCircle },
    { key: 'LIBRARY', label: '音乐库', icon: Library },
    { key: 'ONLINE', label: '在线与云', icon: Cloud },
    { key: 'SETTINGS', label: '设置', icon: Settings },
  ];

  // Visual classes according to UI style
  const getNavContainerClass = () => {
    switch (uiStyle) {
      case 'COLOROS':
        return 'glass-panel rounded-full px-4 py-2 border-indigo-400/20 shadow-xl';
      case 'HYPEROS':
        return 'glass-card rounded-2xl px-3 py-2 border-white/20 shadow-2xl backdrop-blur-3xl';
      case 'MATERIAL':
        return 'bg-neutral-900/90 rounded-3xl px-4 py-2.5 border border-white/10 shadow-xl';
      case 'IOS':
      default:
        return 'glass-panel rounded-full px-5 py-2.5 border-white/15 shadow-2xl';
    }
  };

  const getPillActiveClass = (active: boolean) => {
    if (!active) return 'text-white/60 hover:text-white';
    switch (uiStyle) {
      case 'COLOROS':
        return 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow-lg shadow-indigo-500/30';
      case 'HYPEROS':
        return 'bg-white/20 text-white font-bold shadow-inner border border-white/20';
      case 'MATERIAL':
        return 'bg-indigo-600 text-white font-bold rounded-2xl';
      case 'IOS':
      default:
        return 'bg-white text-black font-bold shadow-lg';
    }
  };

  return (
    <>
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-40 px-6 py-4 flex items-center justify-between pointer-events-none select-none">
        <div
          onClick={() => setCurrentDestination('NOW_PLAYING')}
          className="pointer-events-auto flex items-center gap-2.5 glass-pill px-3.5 py-1.5 rounded-full cursor-pointer hover:bg-white/15 transition-all shadow-md"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center shadow-sm">
            <Music className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs font-extrabold tracking-tight text-white">OLBYINE</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/10 text-white/60 uppercase">
            {uiStyle}
          </span>
        </div>

        {/* Current status pill */}
        <div className="pointer-events-auto hidden sm:flex items-center gap-2 glass-pill px-3 py-1 rounded-full text-[11px] font-mono text-white/60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>BIT-PERFECT OUTPUT</span>
        </div>
      </header>

      {/* Floating Bottom Navigation Bar */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 select-none">
        <div className={`flex items-center gap-1.5 sm:gap-3 ${getNavContainerClass()}`}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentDestination === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setCurrentDestination(item.key)}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs font-medium transition-all ${getPillActiveClass(
                  isActive
                )}`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
