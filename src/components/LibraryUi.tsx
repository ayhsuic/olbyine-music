import React, { useState, useRef } from 'react';
import { useMusic } from '../context/MusicContext';
import { AlbumDisplays } from './AlbumDisplays';
import {
  Track,
  Album,
  Playlist,
  LibraryViewTab,
  AlbumStyle,
} from '../types';
import {
  Search,
  Upload,
  Plus,
  Play,
  Heart,
  MoreVertical,
  Music,
  Disc,
  User,
  ListPlus,
  ArrowUpDown,
  FolderOpen,
  Check,
  Trash2,
} from 'lucide-react';

export const LibraryUi: React.FC = () => {
  const {
    tracks,
    albums,
    artists,
    playlists,
    currentTrack,
    isPlaying,
    userSettings,
    playTrack,
    addToQueue,
    toggleFavorite,
    importFiles,
    createPlaylist,
    deletePlaylist,
    updateSettings,
    addToPlaylist,
  } = useMusic();

  const [activeTab, setActiveTab] = useState<LibraryViewTab>('TRACKS');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [sortBy, setSortBy] = useState<'title' | 'artist' | 'album' | 'recent' | 'plays'>('title');
  const [isImporting, setIsImporting] = useState(false);
  const [importReport, setImportReport] = useState<string | null>(null);

  // New playlist dialog
  const [showNewPlaylist, setShowNewPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  // Dropdown options
  const [activeMenuTrackId, setActiveMenuTrackId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered tracks
  const filteredTracks = React.useMemo(() => {
    let result = [...tracks];

    if (activeTab === 'FAVORITES') {
      result = result.filter((t) => t.favorite);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          t.album.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'artist') return a.artist.localeCompare(b.artist);
      if (sortBy === 'album') return a.album.localeCompare(b.album);
      if (sortBy === 'recent') return b.addedAt - a.addedAt;
      if (sortBy === 'plays') return b.playCount - a.playCount;
      return 0;
    });

    return result;
  }, [tracks, activeTab, searchQuery, sortBy]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsImporting(true);
    try {
      const count = await importFiles(e.target.files);
      setImportReport(`成功导入 ${count} 首本地音频文件！`);
      setTimeout(() => setImportReport(null), 4000);
    } catch (err) {
      setImportReport('导入失败，请检查文件格式');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCreatePlaylistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setShowNewPlaylist(false);
    }
  };

  const formatDuration = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-6 select-none z-10 relative">
      {/* Hidden File Input for Local Import */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*,.mp3,.flac,.wav,.m4a,.alac,.ogg"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            本地音乐库
          </h1>
          <p className="text-xs text-white/50 mt-1">
            共 {tracks.length} 首曲目 • {albums.length} 张专辑 • 支持 WAV / AIFF / ALAC / FLAC / MP3
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索歌曲、歌手或专辑..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-2xl glass-card text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
            />
          </div>

          {/* Import Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>{isImporting ? '导入中...' : '导入音频'}</span>
          </button>
        </div>
      </div>

      {/* Import Notification Banner */}
      {importReport && (
        <div className="mb-4 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4" />
          <span>{importReport}</span>
        </div>
      )}

      {/* Tabs Row */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 gap-2 overflow-x-auto">
        <div className="flex items-center gap-2">
          {(
            [
              { key: 'TRACKS', label: '所有歌曲', icon: Music },
              { key: 'ALBUMS', label: '专辑浏览', icon: Disc },
              { key: 'ARTISTS', label: '艺术家', icon: User },
              { key: 'PLAYLISTS', label: '歌单分类', icon: ListPlus },
              { key: 'FAVORITES', label: '特别喜爱', icon: Heart },
            ] as const
          ).map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setSelectedAlbum(null);
                  setSelectedPlaylist(null);
                }}
                className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-black shadow-lg shadow-white/10'
                    : 'glass-pill text-white/60 hover:text-white'
                }`}
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab-specific actions (e.g. Album view style switcher or Sort) */}
        {activeTab === 'ALBUMS' && (
          <div className="flex items-center gap-1.5 glass-card p-1 rounded-2xl">
            {(['GRID', 'COVER_FLOW', 'SPHERICAL'] as AlbumStyle[]).map((mode) => (
              <button
                key={mode}
                onClick={() => updateSettings({ albumStyle: mode })}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-semibold transition-all ${
                  userSettings.albumStyle === mode
                    ? 'bg-white text-black font-bold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {mode === 'GRID' ? '网格' : mode === 'COVER_FLOW' ? 'Cover Flow 3D' : '球形 3D'}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'TRACKS' && (
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-white/40" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs text-white/70 font-medium focus:outline-none cursor-pointer"
            >
              <option value="title" className="bg-neutral-900">按歌曲名</option>
              <option value="artist" className="bg-neutral-900">按艺术家</option>
              <option value="album" className="bg-neutral-900">按专辑</option>
              <option value="recent" className="bg-neutral-900">最近导入</option>
              <option value="plays" className="bg-neutral-900">播放次数</option>
            </select>
          </div>
        )}
      </div>

      {/* SELECTED ALBUM DETAIL VIEW */}
      {selectedAlbum ? (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 p-6 rounded-3xl glass-card">
            <img
              src={selectedAlbum.coverUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500'}
              alt={selectedAlbum.title}
              className="w-44 h-44 rounded-2xl object-cover shadow-2xl"
            />
            <div className="flex-1 text-center sm:text-left space-y-2">
              <span className="text-xs uppercase font-bold text-indigo-400 tracking-wider">专辑详情</span>
              <h2 className="text-3xl font-extrabold text-white">{selectedAlbum.title}</h2>
              <p className="text-sm text-white/70">{selectedAlbum.artist} • {selectedAlbum.year}</p>
              <div className="flex items-center justify-center sm:justify-start gap-3 pt-3">
                <button
                  onClick={() => playTrack(selectedAlbum.tracks[0], selectedAlbum.tracks)}
                  className="px-6 py-2.5 rounded-full bg-white text-black font-bold text-xs flex items-center gap-2 hover:bg-white/90 shadow-xl"
                >
                  <Play className="w-4 h-4 fill-black" /> 播放专辑 ({selectedAlbum.tracks.length} 首)
                </button>
                <button
                  onClick={() => setSelectedAlbum(null)}
                  className="px-4 py-2.5 rounded-full glass-pill text-xs font-semibold text-white/80 hover:text-white"
                >
                  返回专辑列表
                </button>
              </div>
            </div>
          </div>

          {/* Album Track List */}
          <div className="glass-card rounded-3xl p-4 divide-y divide-white/5">
            {selectedAlbum.tracks.map((track, i) => (
              <div
                key={track.id}
                onClick={() => playTrack(track, selectedAlbum.tracks)}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 cursor-pointer group transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="w-5 text-center text-xs font-mono text-white/40">{i + 1}</span>
                  <div>
                    <h4 className="text-sm font-semibold text-white group-hover:text-indigo-300">
                      {track.title}
                    </h4>
                    <p className="text-xs text-white/50">{track.artist}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-white/40">{formatDuration(track.durationMs)}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(track.id, e);
                    }}
                    className={`p-1.5 text-white/40 hover:text-rose-400 ${
                      track.favorite ? 'text-rose-500 fill-rose-500' : ''
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${track.favorite ? 'fill-rose-500' : ''}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'ALBUMS' ? (
        /* ALBUMS TAB */
        <AlbumDisplays
          albums={albums}
          style={userSettings.albumStyle}
          onSelectAlbum={(alb) => setSelectedAlbum(alb)}
        />
      ) : activeTab === 'ARTISTS' ? (
        /* ARTISTS TAB */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {artists.map((artist) => (
            <div
              key={artist.name}
              onClick={() => {
                setSearchQuery(artist.name);
                setActiveTab('TRACKS');
              }}
              className="glass-card rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer hover:bg-white/10 transition-all hover:-translate-y-1 group"
            >
              <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg mb-3 border border-white/10 group-hover:border-indigo-400">
                <img
                  src={artist.coverUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400'}
                  alt={artist.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <h4 className="text-sm font-bold text-white truncate w-full">{artist.name}</h4>
              <p className="text-xs text-white/50 mt-1">{artist.trackCount} 首歌曲</p>
            </div>
          ))}
        </div>
      ) : activeTab === 'PLAYLISTS' ? (
        /* PLAYLISTS TAB */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white/70">所有歌单 ({playlists.length})</span>
            <button
              onClick={() => setShowNewPlaylist(true)}
              className="px-3.5 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> 新建歌单
            </button>
          </div>

          {/* New Playlist Form Modal */}
          {showNewPlaylist && (
            <form onSubmit={handleCreatePlaylistSubmit} className="glass-panel p-4 rounded-2xl flex gap-3 animate-fade-in">
              <input
                type="text"
                placeholder="输入歌单名称..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                autoFocus
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs"
              >
                创建
              </button>
              <button
                type="button"
                onClick={() => setShowNewPlaylist(false)}
                className="px-3 py-2 rounded-xl glass-pill text-xs text-white/70"
              >
                取消
              </button>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {playlists.map((pl) => {
              const count = pl.trackIds.length;
              return (
                <div
                  key={pl.id}
                  className="glass-card rounded-2xl p-4 flex items-center gap-4 hover:bg-white/10 transition-all cursor-pointer group"
                >
                  <img
                    src={pl.coverUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200'}
                    alt={pl.name}
                    className="w-16 h-16 rounded-xl object-cover shadow-md"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-white truncate">{pl.name}</h4>
                    <p className="text-xs text-white/50 truncate mt-0.5">{pl.description || `${count} 首歌曲`}</p>
                    <span className="text-[10px] text-indigo-400 font-mono mt-1 block">{count} 首歌曲</span>
                  </div>
                  {pl.id !== 'pl-favorites' && pl.id !== 'pl-hi-res' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePlaylist(pl.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 text-white/40 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* TRACKS / FAVORITES LIST */
        <div className="glass-card rounded-3xl p-2 sm:p-4 overflow-hidden divide-y divide-white/5">
          {filteredTracks.length === 0 ? (
            <div className="py-16 text-center text-white/40">
              <FolderOpen className="w-12 h-12 mx-auto mb-3 stroke-[1.5]" />
              <p className="text-sm">没有找到匹配的歌曲</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 px-4 py-2 rounded-full glass-pill text-xs font-semibold text-white"
              >
                点击导入音频文件
              </button>
            </div>
          ) : (
            filteredTracks.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;
              const isHiRes = track.bitsPerSample >= 24;

              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track, filteredTracks)}
                  className={`group relative flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-indigo-600/20 border border-indigo-500/30'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Index or Equalizer Wave */}
                    <div className="w-6 text-center font-mono text-xs text-white/40 flex-shrink-0">
                      {isCurrent && isPlaying ? (
                        <div className="flex items-end justify-center gap-0.5 h-3">
                          <span className="w-1 bg-indigo-400 rounded-full animate-bounce" />
                          <span className="w-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      ) : (
                        idx + 1
                      )}
                    </div>

                    {/* Album Art Thumbnail */}
                    <img
                      src={track.artworkUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160'}
                      alt={track.title}
                      className="w-11 h-11 rounded-xl object-cover shadow-sm flex-shrink-0"
                    />

                    {/* Title & Artist & Badges */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-semibold truncate ${
                            isCurrent ? 'text-indigo-300' : 'text-white'
                          }`}
                        >
                          {track.title}
                        </span>
                        {isHiRes && (
                          <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-mono font-bold tracking-tight uppercase flex-shrink-0">
                            Hi-Res {track.bitsPerSample}B
                          </span>
                        )}
                        {track.lyrics && (
                          <span className="px-1.5 py-0.2 rounded bg-white/10 text-white/60 text-[9px] font-mono tracking-tight flex-shrink-0">
                            AMLL
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/50 truncate mt-0.5">
                        {track.artist} — <span className="text-white/40">{track.album}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions & Duration */}
                  <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 ml-3">
                    <span className="text-xs font-mono text-white/40 hidden sm:inline">
                      {formatDuration(track.durationMs)}
                    </span>

                    {/* Favorite Heart with burst */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(track.id, e);
                      }}
                      className={`p-2 rounded-full transition-transform hover:scale-110 active:scale-95 ${
                        track.favorite ? 'text-rose-500 fill-rose-500' : 'text-white/30 hover:text-white'
                      }`}
                      title="收藏"
                    >
                      <Heart className={`w-4 h-4 ${track.favorite ? 'fill-rose-500' : ''}`} />
                    </button>

                    {/* Add to queue */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToQueue(track);
                      }}
                      className="p-2 rounded-full text-white/30 hover:text-white hover:bg-white/10 transition-colors"
                      title="添加至队列"
                    >
                      <ListPlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
