import React, { useState, useRef, useEffect } from 'react';
import { Album, AlbumStyle } from '../types';
import { useMusic } from '../context/MusicContext';
import { Play, Disc, Music } from 'lucide-react';

interface AlbumDisplaysProps {
  albums: Album[];
  style: AlbumStyle;
  onSelectAlbum: (album: Album) => void;
}

export const AlbumDisplays: React.FC<AlbumDisplaysProps> = ({
  albums,
  style,
  onSelectAlbum,
}) => {
  const { playTrack, currentTrack, isPlaying } = useMusic();

  // Cover Flow state
  const [cfActiveIndex, setCfActiveIndex] = useState(0);

  // Spherical 3D state
  const sphereRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 10, y: 0 });
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Handle spherical drag
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - lastMousePosRef.current.x;
    const deltaY = e.clientY - lastMousePosRef.current.y;
    setRotation((prev) => ({
      x: Math.max(-60, Math.min(60, prev.x - deltaY * 0.4)),
      y: prev.y + deltaX * 0.5,
    }));
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // COVER FLOW VIEW
  if (style === 'COVER_FLOW') {
    const activeAlbum = albums[cfActiveIndex] || albums[0];

    return (
      <div className="flex flex-col items-center justify-center py-8 select-none overflow-hidden">
        {/* 3D Stage */}
        <div
          className="relative w-full max-w-4xl h-[340px] sm:h-[400px] flex items-center justify-center"
          style={{ perspective: '1000px' }}
        >
          {albums.map((album, idx) => {
            const offset = idx - cfActiveIndex;
            const absOffset = Math.abs(offset);
            if (absOffset > 4) return null; // Only render nearby

            const translateX = offset * 140;
            const translateZ = -absOffset * 160;
            const rotateY = offset > 0 ? -48 : offset < 0 ? 48 : 0;
            const isCenter = offset === 0;

            return (
              <div
                key={album.key}
                onClick={() => {
                  if (isCenter) {
                    onSelectAlbum(album);
                  } else {
                    setCfActiveIndex(idx);
                  }
                }}
                className={`absolute w-52 sm:w-64 h-52 sm:h-64 rounded-2xl cursor-pointer transition-all duration-500 ease-out shadow-2xl ${
                  isCenter ? 'z-30 scale-105 ring-2 ring-white/30' : 'z-10 hover:brightness-110'
                }`}
                style={{
                  transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg)`,
                  filter: isCenter ? 'none' : 'brightness(0.65)',
                }}
              >
                <img
                  src={album.coverUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600'}
                  alt={album.title}
                  className="w-full h-full object-cover rounded-2xl shadow-xl"
                  loading="lazy"
                />
                {/* Mirror reflection */}
                <div
                  className="w-full h-1/2 mt-2 rounded-b-2xl opacity-20 pointer-events-none transform -scale-y-100 blur-[2px] overflow-hidden"
                  style={{
                    background: `linear-gradient(to top, rgba(0,0,0,0.8), transparent), url(${album.coverUrl})`,
                    backgroundSize: 'cover',
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Active album details & controls */}
        {activeAlbum && (
          <div className="text-center mt-6 z-20 space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {activeAlbum.title}
            </h3>
            <p className="text-sm text-white/60">
              {activeAlbum.artist} • {activeAlbum.year} • {activeAlbum.tracks.length} 首歌曲
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onSelectAlbum(activeAlbum)}
                className="px-4 py-2 rounded-full glass-pill text-xs font-semibold text-white hover:bg-white/20 transition-colors flex items-center gap-2"
              >
                <Disc className="w-4 h-4" /> 查看专辑
              </button>
              <button
                onClick={() => activeAlbum.tracks[0] && playTrack(activeAlbum.tracks[0], activeAlbum.tracks)}
                className="px-5 py-2 rounded-full bg-white text-black text-xs font-bold hover:bg-white/90 transition-all flex items-center gap-2 shadow-lg"
              >
                <Play className="w-3.5 h-3.5 fill-black" /> 播放全部
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // SPHERICAL 3D VIEW
  if (style === 'SPHERICAL') {
    // Distribute albums on a sphere using Fibonacci sphere algorithm
    const total = Math.max(albums.length, 8);
    const radius = 220;

    return (
      <div
        ref={sphereRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative w-full h-[460px] flex items-center justify-center select-none cursor-grab active:cursor-grabbing overflow-hidden"
        style={{ perspective: '900px' }}
      >
        <div className="absolute top-4 left-6 text-xs text-white/40 font-mono pointer-events-none">
          按住并拖动以旋转 3D 专辑球 (Drag to rotate sphere)
        </div>

        <div
          className="relative w-0 h-0 transition-transform duration-75"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          }}
        >
          {albums.map((album, i) => {
            const phi = Math.acos(-1 + (2 * i) / total);
            const theta = Math.sqrt(total * Math.PI) * phi;
            const x = radius * Math.cos(theta) * Math.sin(phi);
            const y = radius * Math.sin(theta) * Math.sin(phi);
            const z = radius * Math.cos(phi);

            return (
              <div
                key={album.key}
                onClick={() => onSelectAlbum(album)}
                className="absolute w-28 h-28 -left-14 -top-14 rounded-xl shadow-2xl cursor-pointer hover:scale-125 transition-transform duration-200 group"
                style={{
                  transform: `translate3d(${x}px, ${y}px, ${z}px)`,
                }}
              >
                <img
                  src={album.coverUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400'}
                  alt={album.title}
                  className="w-full h-full object-cover rounded-xl border border-white/20 shadow-md group-hover:border-indigo-400"
                />
                <div className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-1 text-center">
                  <Play className="w-5 h-5 text-white fill-white mb-1" />
                  <span className="text-[10px] font-bold text-white line-clamp-1">{album.title}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // STANDARD GRID VIEW
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
      {albums.map((album) => {
        const isCurrentAlbum = currentTrack?.album === album.title;

        return (
          <div
            key={album.key}
            onClick={() => onSelectAlbum(album)}
            className="group relative glass-card rounded-2xl p-3 cursor-pointer hover:bg-white/10 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-lg mb-3">
              <img
                src={album.coverUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500'}
                alt={album.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (album.tracks[0]) playTrack(album.tracks[0], album.tracks);
                  }}
                  className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
                >
                  <Play className="w-5 h-5 fill-black ml-0.5" />
                </button>
              </div>
              {isCurrentAlbum && isPlaying && (
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-indigo-600/90 text-white text-[10px] font-bold flex items-center gap-1 backdrop-blur-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" /> 播放中
                </div>
              )}
            </div>
            <h4 className="text-sm font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
              {album.title}
            </h4>
            <p className="text-xs text-white/50 truncate mt-0.5">{album.artist}</p>
            <p className="text-[10px] text-white/40 mt-1 font-mono">
              {album.year} • {album.tracks.length} 首歌曲
            </p>
          </div>
        );
      })}
    </div>
  );
};
