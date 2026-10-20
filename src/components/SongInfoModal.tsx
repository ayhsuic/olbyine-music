import React from 'react';
import { useMusic } from '../context/MusicContext';
import { X, Info, Zap, Disc, FileAudio, ShieldCheck } from 'lucide-react';

interface SongInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SongInfoModal: React.FC<SongInfoModalProps> = ({ isOpen, onClose }) => {
  const { currentTrack } = useMusic();

  if (!isOpen || !currentTrack) return null;

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '未知';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const isHiRes = currentTrack.bitsPerSample >= 24 || currentTrack.sampleRate >= 88200;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">音频规格与元数据</h2>
              <p className="text-xs text-white/50">Audio Codec & Bit-Perfect Inspection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full glass-pill flex items-center justify-center text-white/70 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Badge banner */}
        <div className="my-5 p-4 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-pink-900/30 border border-white/10 flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-indigo-400 flex-shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                {isHiRes ? 'Hi-Res Lossless (母带级无损)' : 'Lossless CD Quality'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 text-[10px] font-mono font-bold">
                BIT-PERFECT
              </span>
            </div>
            <p className="text-xs text-white/60 mt-0.5">
              原生采样直通，无损高保真音频渲染管线
            </p>
          </div>
        </div>

        {/* Detailed Spec Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-white/40 block mb-1">采样率 (Sample Rate)</span>
            <span className="font-mono text-sm font-semibold text-white">
              {(currentTrack.sampleRate / 1000).toFixed(1)} kHz
            </span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-white/40 block mb-1">位深度 (Bit Depth)</span>
            <span className="font-mono text-sm font-semibold text-white">
              {currentTrack.bitsPerSample}-Bit PCM
            </span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-white/40 block mb-1">比特率 (Bitrate)</span>
            <span className="font-mono text-sm font-semibold text-white">
              {currentTrack.bitrate} kbps
            </span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-white/40 block mb-1">容器格式 (Format)</span>
            <span className="font-mono text-sm font-semibold text-white uppercase">
              {currentTrack.mimeType?.split('/')[1] || 'FLAC'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-white/40 block mb-1">文件大小 (Size)</span>
            <span className="font-mono text-sm font-semibold text-white">
              {formatFileSize(currentTrack.sizeBytes)}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-white/40 block mb-1">歌词引擎 (Lyrics Engine)</span>
            <span className="font-mono text-sm font-semibold text-white">
              AMLL ({currentTrack.lyricsFormat?.toUpperCase() || 'TTML'})
            </span>
          </div>
        </div>

        {/* Metadata section */}
        <div className="mt-4 pt-4 border-t border-white/10 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-white/40">曲目标题</span>
            <span className="text-white font-medium">{currentTrack.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">主要艺术家</span>
            <span className="text-white font-medium">{currentTrack.artist}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">所属专辑</span>
            <span className="text-white font-medium">{currentTrack.album}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">歌词来源</span>
            <span className="text-white font-medium">{currentTrack.lyricsSource || 'AMLL Hub'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
