import React from 'react';
import { useMusic } from '../context/MusicContext';
import { Play, Pause, SkipForward, Heart, Disc } from 'lucide-react';

export const MiniPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    positionMs,
    durationMs,
    currentDestination,
    setCurrentDestination,
    togglePlay,
    nextTrack,
    toggleFavorite,
  } = useMusic();

  if (!currentTrack || currentDestination === 'NOW_PLAYING') return null;

  const progressPct = durationMs > 0 ? (positionMs / durationMs) * 100 : 0;

  return (
    <div
      onClick={() => setCurrentDestination('NOW_PLAYING')}
      className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-8 sm:w-96 z-40 glass-panel rounded-2xl p-2.5 shadow-2xl border border-white/15 cursor-pointer hover:scale-[1.02] active:scale-[0.99] transition-all select-none animate-slide-up group"
    >
      {/* Mini top progress indicator */}
      <div className="absolute top-0 left-3 right-3 h-[2px] bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-white transition-all duration-150"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-3 pt-0.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-11 h-11 rounded-xl overflow-hidden shadow-md flex-shrink-0">
            <img
              src={currentTrack.artworkUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200'}
              alt={currentTrack.title}
              className={`w-full h-full object-cover ${isPlaying ? 'scale-105' : ''} transition-transform`}
            />
          </div>

          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
              {currentTrack.title}
            </h4>
            <p className="text-[11px] text-white/50 truncate mt-0.5">{currentTrack.artist}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(currentTrack.id, e);
            }}
            className={`p-2 text-white/40 hover:text-rose-400 ${
              currentTrack.favorite ? 'text-rose-500' : ''
            }`}
          >
            <Heart className={`w-4 h-4 ${currentTrack.favorite ? 'fill-rose-500' : ''}`} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-black" />
            ) : (
              <Play className="w-4 h-4 fill-black ml-0.5" />
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              nextTrack();
            }}
            className="p-2 text-white/60 hover:text-white hover:scale-110 active:scale-95 transition-all"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
};
