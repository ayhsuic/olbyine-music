import React, { useState } from 'react';
import { useMusic } from '../context/MusicContext';
import { X, Trash2, Music, Play, Scissors } from 'lucide-react';
import { Track } from '../types';

interface QueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QueueDrawer: React.FC<QueueDrawerProps> = ({ isOpen, onClose }) => {
  const { queue, currentTrack, playTrack, removeFromQueue, clearQueue, userSettings } = useMusic();
  const [shreddingId, setShreddingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleShred = (track: Track, index: number) => {
    if (userSettings.playerFx.shredder) {
      setShreddingId(track.id);
      setTimeout(() => {
        removeFromQueue(index);
        setShreddingId(null);
      }, 500);
    } else {
      removeFromQueue(index);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-md h-full glass-panel flex flex-col text-white shadow-2xl border-l border-white/10 animate-slide-left">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight">播放队列</h2>
            <p className="text-xs text-white/50">{queue.length} 首待播歌曲 • 碎纸机保护已开启</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearQueue}
              className="p-2 rounded-full glass-pill text-white/60 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="清空队列"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full glass-pill text-white/70 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Queue List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-white/40">
              <Music className="w-12 h-12 mb-2 stroke-[1.5]" />
              <p className="text-sm">队列为空</p>
            </div>
          ) : (
            queue.map((track, idx) => {
              const isCurrent = track.id === currentTrack?.id;
              const isShredding = shreddingId === track.id;

              return (
                <div
                  key={`${track.id}-${idx}`}
                  className={`group relative flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 ${
                    isCurrent
                      ? 'bg-indigo-600/30 border border-indigo-500/40'
                      : 'hover:bg-white/5 border border-transparent'
                  } ${isShredding ? 'scale-y-0 opacity-0 -translate-y-4 rotate-6 blur-sm' : ''}`}
                >
                  {/* Track index or play indicator */}
                  <div className="w-6 text-center text-xs font-mono text-white/40">
                    {isCurrent ? (
                      <div className="w-2 h-2 mx-auto rounded-full bg-indigo-400 animate-ping" />
                    ) : (
                      idx + 1
                    )}
                  </div>

                  {/* Album Cover */}
                  <img
                    src={track.artworkUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200'}
                    alt={track.title}
                    className="w-11 h-11 rounded-xl object-cover shadow-sm flex-shrink-0"
                  />

                  {/* Info */}
                  <div
                    onClick={() => playTrack(track)}
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    <p
                      className={`text-sm font-semibold truncate ${
                        isCurrent ? 'text-indigo-300' : 'text-white'
                      }`}
                    >
                      {track.title}
                    </p>
                    <p className="text-xs text-white/50 truncate mt-0.5">{track.artist}</p>
                  </div>

                  {/* Shredder button */}
                  <button
                    onClick={() => handleShred(track, idx)}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-xl text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                    title="碎纸机粉碎移除 (Shred)"
                  >
                    <Scissors className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Tip */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02] text-center">
          <p className="text-[11px] text-white/40">
            支持点击剪刀启用碎纸机切纸动画移除曲目
          </p>
        </div>
      </div>
    </div>
  );
};
