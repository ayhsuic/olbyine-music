import React, { useState } from 'react';
import { useMusic } from '../context/MusicContext';
import { X, Share2, Copy, Check, Sparkles } from 'lucide-react';

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({ isOpen, onClose }) => {
  const { currentTrack, lyricsDoc, palette } = useMusic();
  const [copied, setCopied] = useState(false);
  const [selectedLineIdx, setSelectedLineIdx] = useState(0);

  if (!isOpen || !currentTrack) return null;

  const lines = lyricsDoc.lines.slice(0, 8);
  const activeLyric = lines[selectedLineIdx] || lines[0];

  const handleCopy = () => {
    const textToCopy = `🎵 ${currentTrack.title} - ${currentTrack.artist}\n"${activeLyric?.text || ''}"\n${activeLyric?.translatedLyric ? `「${activeLyric.translatedLyric}」\n` : ''}via Olbyine Music`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-md glass-panel rounded-3xl p-6 text-white shadow-2xl border border-white/10">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold">分享歌词卡片 (Share Card)</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full glass-pill flex items-center justify-center text-white/70 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* The Visual Share Card */}
        <div
          id="olbyine-share-card"
          className="my-5 p-6 rounded-3xl relative overflow-hidden shadow-2xl border border-white/20 transition-all"
          style={{
            background: `linear-gradient(135deg, ${palette.primary}dd, ${palette.secondary}dd, ${palette.bgDark})`,
          }}
        >
          {/* Subtle noise */}
          <div className="absolute inset-0 film-grain opacity-20 pointer-events-none" />

          {/* Header with track art & title */}
          <div className="relative z-10 flex items-center gap-3 mb-6">
            <img
              src={currentTrack.artworkUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200'}
              alt={currentTrack.title}
              className="w-12 h-12 rounded-2xl object-cover shadow-lg border border-white/20"
            />
            <div className="min-w-0">
              <h4 className="font-bold text-sm text-white truncate">{currentTrack.title}</h4>
              <p className="text-xs text-white/70 truncate">{currentTrack.artist}</p>
            </div>
          </div>

          {/* Featured Lyric Quote */}
          <div className="relative z-10 my-4 p-4 rounded-2xl bg-black/30 backdrop-blur-md border border-white/10">
            <p className="text-lg font-bold text-white leading-relaxed">
              “{activeLyric?.text || currentTrack.title}”
            </p>
            {activeLyric?.translatedLyric && (
              <p className="text-xs text-white/80 mt-2 font-medium">
                {activeLyric.translatedLyric}
              </p>
            )}
          </div>

          {/* Footer Branding */}
          <div className="relative z-10 flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-white/60 font-mono">
            <span>OLBYINE MUSIC</span>
            <span>HI-RES LOSSLESS</span>
          </div>
        </div>

        {/* Lyric line selector */}
        {lines.length > 0 && (
          <div className="mb-4">
            <span className="text-xs text-white/50 block mb-2">选择卡片引用的歌词：</span>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {lines.map((l, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedLineIdx(i)}
                  className={`px-3 py-1 rounded-xl text-xs whitespace-nowrap transition-all ${
                    selectedLineIdx === i
                      ? 'bg-white text-black font-semibold'
                      : 'glass-pill text-white/60 hover:text-white'
                  }`}
                >
                  {l.text.slice(0, 10)}...
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleCopy}
          className="w-full py-3 rounded-2xl bg-white text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/90 shadow-xl transition-all"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              已复制卡片文本到剪贴板
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              复制歌词卡片内容
            </>
          )}
        </button>
      </div>
    </div>
  );
};
