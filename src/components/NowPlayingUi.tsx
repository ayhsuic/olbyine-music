import React, { useState, useRef, useEffect } from 'react';
import { useMusic } from '../context/MusicContext';
import { AmllLyricsView } from './AmllLyricsView';
import { EqualizerModal } from './EqualizerModal';
import { QueueDrawer } from './QueueDrawer';
import { SongInfoModal } from './SongInfoModal';
import { ShareCardModal } from './ShareCardModal';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Volume2,
  VolumeX,
  Sliders,
  ListMusic,
  Info,
  Share2,
  AlignLeft,
  Disc,
} from 'lucide-react';

export const NowPlayingUi: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    positionMs,
    durationMs,
    volume,
    shuffle,
    repeatMode,
    audioEnergy,
    userSettings,
    togglePlay,
    seekTo,
    nextTrack,
    prevTrack,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    toggleFavorite,
  } = useMusic();

  const { playerFx } = userSettings;

  const [showLyricsTab, setShowLyricsTab] = useState(false);
  const [eqOpen, setEqOpen] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  // Cover tilt 3D state
  const coverRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50 });

  const handleCoverMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerFx.coverTilt || !coverRef.current) return;
    const rect = coverRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -14;
    const rotY = ((x - centerX) / centerX) * 14;

    setTilt({
      x: rotX,
      y: rotY,
      glareX: (x / rect.width) * 100,
      glareY: (y / rect.height) * 100,
    });
  };

  const handleCoverMouseLeave = () => {
    setTilt({ x: 0, y: 0, glareX: 50, glareY: 50 });
  };

  // Format time mm:ss
  const formatTime = (ms: number) => {
    const totalSecs = Math.max(0, Math.floor(ms / 1000));
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPct = durationMs > 0 ? (positionMs / durationMs) * 100 : 0;

  if (!currentTrack) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-white/50">
        <Disc className="w-16 h-16 animate-spin duration-3000 mb-4 stroke-1" />
        <p>暂无播放曲目</p>
      </div>
    );
  }

  const isHiRes = currentTrack.bitsPerSample >= 24 || currentTrack.sampleRate >= 88200;

  return (
    <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-8 py-6 flex flex-col justify-between min-h-[calc(100vh-140px)] select-none">
      {/* Top Bar Badges */}
      <div className="flex items-center justify-between z-10 mb-4">
        <div className="flex items-center gap-2">
          {/* Format badge with shiny shimmer */}
          <button
            onClick={() => setInfoOpen(true)}
            className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 ${
              playerFx.badgeShine
                ? 'glass-pill ring-1 ring-white/20 shiny-text'
                : 'glass-pill text-white/80'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {isHiRes ? 'Hi-Res Lossless 24-Bit' : 'Lossless Audio'}
          </button>

          <span className="text-[10px] font-mono text-white/40 hidden sm:inline">
            {(currentTrack.sampleRate / 1000).toFixed(1)}kHz • {currentTrack.bitrate}kbps
          </span>
        </div>

        {/* View Switcher for Mobile/Desktop */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLyricsTab(!showLyricsTab)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              showLyricsTab
                ? 'bg-white text-black shadow-lg font-bold'
                : 'glass-pill text-white/70 hover:text-white'
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5" />
            <span>AMLL 歌词</span>
          </button>
        </div>
      </div>

      {/* Main Center Area: Split view on desktop or toggle on mobile */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center my-auto z-10">
        {/* Cover Art Column (or hidden on mobile when lyrics tab is open) */}
        <div
          className={`flex flex-col items-center justify-center transition-all duration-500 ${
            showLyricsTab ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div
            ref={coverRef}
            onMouseMove={handleCoverMouseMove}
            onMouseLeave={handleCoverMouseLeave}
            className="relative w-72 sm:w-96 aspect-square rounded-3xl overflow-hidden shadow-2xl transition-transform duration-200 ease-out group"
            style={{
              transform: playerFx.coverTilt
                ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${
                    1 + audioEnergy * 0.03
                  })`
                : undefined,
            }}
          >
            <img
              src={currentTrack.artworkUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800'}
              alt={currentTrack.title}
              className="w-full h-full object-cover rounded-3xl shadow-2xl"
            />

            {/* Specular Glare Effect on Hover */}
            {playerFx.coverTilt && (
              <div
                className="absolute inset-0 pointer-events-none rounded-3xl mix-blend-overlay transition-opacity duration-300"
                style={{
                  background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.45) 0%, transparent 65%)`,
                }}
              />
            )}

            {/* Vinyl groove ring overlay */}
            <div className="absolute inset-0 rounded-3xl border border-white/10 pointer-events-none" />
          </div>

          {/* Track title & artist (Under cover on mobile) */}
          <div className="mt-8 text-center max-w-md px-4">
            <h2
              className={`text-2xl sm:text-3xl font-extrabold text-white tracking-tight truncate ${
                playerFx.titleReveal ? 'transition-all duration-700 animate-fade-in' : ''
              }`}
            >
              {currentTrack.title}
            </h2>
            <p className="text-base text-white/60 font-medium truncate mt-1">
              {currentTrack.artist} • <span className="text-white/40">{currentTrack.album}</span>
            </p>
          </div>
        </div>

        {/* Lyrics Column (shown always on desktop, toggle on mobile) */}
        <div
          className={`h-[420px] sm:h-[480px] w-full transition-all duration-500 ${
            showLyricsTab ? 'block' : 'hidden lg:block'
          }`}
        >
          <AmllLyricsView />
        </div>
      </div>

      {/* Bottom Controls Area */}
      <div className="w-full max-w-3xl mx-auto z-10 pt-4">
        {/* Progress Bar & Rolling Timers */}
        <div className="space-y-1.5 mb-4">
          <div className="relative group flex items-center">
            <input
              type="range"
              min="0"
              max={durationMs || 100}
              value={positionMs}
              onChange={(e) => seekTo(parseFloat(e.target.value))}
              className={`w-full h-1.5 rounded-full appearance-none bg-white/20 accent-white cursor-pointer transition-all duration-200 group-hover:h-2.5 ${
                playerFx.elasticSeek ? 'active:scale-y-125' : ''
              }`}
              style={{
                background: `linear-gradient(to right, #ffffff ${progressPct}%, rgba(255,255,255,0.2) ${progressPct}%)`,
              }}
            />
          </div>

          <div className="flex justify-between items-center text-xs font-mono text-white/50 px-1">
            <span className={playerFx.rollingTime ? 'font-semibold text-white/80' : ''}>
              {formatTime(positionMs)}
            </span>
            <span>-{formatTime(Math.max(0, durationMs - positionMs))}</span>
          </div>
        </div>

        {/* Playback Button Controls */}
        <div className="flex items-center justify-between gap-4">
          {/* Favorite heart */}
          <button
            onClick={(e) => toggleFavorite(currentTrack.id, e)}
            className={`p-3 rounded-full transition-transform duration-200 hover:scale-110 active:scale-90 ${
              currentTrack.favorite ? 'text-rose-500 fill-rose-500' : 'text-white/50 hover:text-white'
            }`}
            title="收藏歌曲"
          >
            <Heart className={`w-5 h-5 ${currentTrack.favorite ? 'fill-rose-500' : ''}`} />
          </button>

          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            className={`p-3 rounded-full transition-colors ${
              shuffle ? 'text-indigo-400 bg-indigo-500/10' : 'text-white/50 hover:text-white'
            }`}
            title={shuffle ? '随机播放开启' : '顺序播放'}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {/* Previous Track */}
          <button
            onClick={prevTrack}
            className="p-3 text-white/80 hover:text-white hover:scale-110 active:scale-95 transition-all"
            title="上一首"
          >
            <SkipBack className="w-7 h-7 fill-white/80" />
          </button>

          {/* Big Play / Pause Button */}
          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all"
            title={isPlaying ? '暂停' : '播放'}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-black" />
            ) : (
              <Play className="w-7 h-7 fill-black ml-1" />
            )}
          </button>

          {/* Next Track */}
          <button
            onClick={nextTrack}
            className="p-3 text-white/80 hover:text-white hover:scale-110 active:scale-95 transition-all"
            title="下一首"
          >
            <SkipForward className="w-7 h-7 fill-white/80" />
          </button>

          {/* Repeat */}
          <button
            onClick={toggleRepeat}
            className={`p-3 rounded-full transition-colors ${
              repeatMode !== 'OFF' ? 'text-indigo-400 bg-indigo-500/10' : 'text-white/50 hover:text-white'
            }`}
            title={`循环模式: ${repeatMode}`}
          >
            {repeatMode === 'ONE' ? (
              <Repeat1 className="w-4 h-4" />
            ) : (
              <Repeat className="w-4 h-4" />
            )}
          </button>

          {/* Share Quote Card */}
          <button
            onClick={() => setShareOpen(true)}
            className="p-3 rounded-full text-white/50 hover:text-white transition-colors"
            title="分享歌词卡片"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Secondary Utility Controls Bar */}
        <div className="flex items-center justify-between pt-6 border-t border-white/10 mt-6 text-white/60">
          {/* Volume slider */}
          <div className="flex items-center gap-2.5 max-w-[180px] w-full">
            <button
              onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
              className="hover:text-white transition-colors"
            >
              {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-1 bg-white/20 rounded-full accent-white cursor-pointer"
            />
          </div>

          {/* Action Modals Toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEqOpen(true)}
              className="p-2.5 rounded-xl glass-pill text-xs font-semibold hover:text-white flex items-center gap-1.5 transition-all"
              title="10 段专业均衡器"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">均衡器</span>
            </button>

            <button
              onClick={() => setQueueOpen(true)}
              className="p-2.5 rounded-xl glass-pill text-xs font-semibold hover:text-white flex items-center gap-1.5 transition-all"
              title="播放队列 & 碎纸机"
            >
              <ListMusic className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">队列</span>
            </button>

            <button
              onClick={() => setInfoOpen(true)}
              className="p-2.5 rounded-xl glass-pill text-xs font-semibold hover:text-white flex items-center gap-1.5 transition-all"
              title="音质规格与元数据"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals & Drawers */}
      <EqualizerModal isOpen={eqOpen} onClose={() => setEqOpen(false)} />
      <QueueDrawer isOpen={queueOpen} onClose={() => setQueueOpen(false)} />
      <SongInfoModal isOpen={infoOpen} onClose={() => setInfoOpen(false)} />
      <ShareCardModal isOpen={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  );
};
