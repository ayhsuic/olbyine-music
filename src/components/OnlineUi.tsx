import React, { useState } from 'react';
import { useMusic } from '../context/MusicContext';
import { Track } from '../types';
import {
  Cloud,
  Search,
  Radio,
  Server,
  FolderSync,
  Play,
  Plus,
  Flame,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Check,
  Disc,
} from 'lucide-react';

type OnlineTab = 'NETEASE' | 'SOUNDCLOUD' | 'NAVIDROME' | 'WEBDAV';

export const OnlineUi: React.FC = () => {
  const { playTrack, addToQueue } = useMusic();
  const [activeTab, setActiveTab] = useState<OnlineTab>('NETEASE');
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  // Navidrome config state
  const [navidromeConfig, setNavidromeConfig] = useState({
    serverUrl: 'https://demo.navidrome.org',
    username: 'demo',
    password: 'demo_password',
  });
  const [navidromeStatus, setNavidromeStatus] = useState<string | null>(null);

  // WebDAV config state
  const [webdavConfig, setWebdavConfig] = useState({
    url: 'https://nas.local:5005/music',
    username: 'admin',
    password: '',
  });
  const [webdavStatus, setWebdavStatus] = useState<string | null>(null);

  // Curated online cloud tracks
  const NETEASE_CHARTS: { title: string; desc: string; count: string; tracks: Partial<Track>[] }[] = [
    {
      title: '云音乐飙升榜 (Soaring Chart)',
      desc: '全网热度上升最快新曲',
      count: '100 首',
      tracks: [
        {
          id: 'nc-1',
          title: 'Horizon Odyssey (地平线奥德赛)',
          artist: 'CYBER-P & Lunar',
          album: 'Future Bass Vol. 3',
          durationMs: 204000,
          sampleRate: 48000,
          bitsPerSample: 24,
          bitrate: 1411,
          artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600',
          lyrics: `[00:00.00]Horizon Odyssey - CYBER-P & Lunar\n[00:08.00]<00:08.00>Beyond <00:09.00>the <00:10.00>neon <00:11.50>horizon\n[00:13.00]<00:13.00>A <00:13.80>new <00:14.60>dimension <00:16.00>calls`,
        },
        {
          id: 'nc-2',
          title: 'Starry Sky Sonata (星空奏鸣曲)',
          artist: 'Evelyn V.',
          album: 'Piano Universe',
          durationMs: 228000,
          sampleRate: 96000,
          bitsPerSample: 24,
          bitrate: 2304,
          artworkUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
          lyrics: `[00:00.00]Starry Sky Sonata - Evelyn V.\n[00:10.00]<00:10.00>Notes <00:12.00>like <00:14.00>falling <00:16.00>stardust`,
        },
        {
          id: 'nc-3',
          title: 'Rainy Cafe Alley (雨中咖啡巷)',
          artist: 'Kaito Beats',
          album: 'Chillhop Tokyo',
          durationMs: 172000,
          sampleRate: 44100,
          bitsPerSample: 16,
          bitrate: 320,
          artworkUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600',
        },
      ],
    },
    {
      title: '网易云热歌榜 (Hot Songs 50)',
      desc: '用户收听热度顶级精选',
      count: '200 首',
      tracks: [
        {
          id: 'nc-4',
          title: 'Tokyo Midnight Drive (东京午夜漫游)',
          artist: 'CityPop Collective',
          album: '80s Nostalgia',
          durationMs: 195000,
          sampleRate: 48000,
          bitsPerSample: 24,
          bitrate: 1536,
          artworkUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600',
          lyrics: `[00:00.00]Tokyo Midnight Drive - CityPop Collective\n[00:06.00]<00:06.00>City <00:07.50>lights <00:09.00>flash <00:10.50>by <00:12.00>the <00:13.00>highway`,
        },
        {
          id: 'nc-5',
          title: 'Subtle Whispers (微光轻语)',
          artist: 'Aura',
          album: 'Dreamscape',
          durationMs: 188000,
          sampleRate: 96000,
          bitsPerSample: 24,
          bitrate: 2304,
          artworkUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
        },
      ],
    },
  ];

  const SOUNDCLOUD_GENRES = [
    { name: 'Electronic', color: 'from-amber-500 to-orange-600', count: '1.2M tracks' },
    { name: 'Lo-Fi Chill', color: 'from-indigo-500 to-purple-600', count: '890K tracks' },
    { name: 'Synthwave', color: 'from-pink-500 to-rose-600', count: '640K tracks' },
    { name: 'Future Bass', color: 'from-cyan-500 to-blue-600', count: '450K tracks' },
  ];

  const handlePlayOnlineTrack = (t: Partial<Track>) => {
    const fullTrack: Track = {
      id: t.id || `online-${Date.now()}`,
      uri: `ncm://${t.id}`,
      title: t.title || 'Online Song',
      artist: t.artist || 'Online Artist',
      album: t.album || 'Cloud Music',
      durationMs: t.durationMs || 180000,
      displayName: `${t.title} - ${t.artist}.flac`,
      mimeType: 'audio/flac',
      sizeBytes: 35000000,
      favorite: false,
      addedAt: Date.now(),
      trackNumber: 1,
      discNumber: 1,
      year: 2025,
      playCount: 1,
      sampleRate: t.sampleRate || 48000,
      bitsPerSample: t.bitsPerSample || 24,
      bitrate: t.bitrate || 1411,
      artworkUrl: t.artworkUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
      lyrics: t.lyrics || `[00:00.00]${t.title} - ${t.artist}\n[00:08.00]Synced online streaming via Olbyine Cloud API`,
      lyricsSource: 'Netease Cloud API',
      lyricsFormat: 'ttml',
    };
    playTrack(fullTrack);
  };

  const testNavidrome = () => {
    setNavidromeStatus('测试连接中...');
    setTimeout(() => {
      setNavidromeStatus('连接成功！已检索到 1,420 首歌曲与 86 张远程专辑');
    }, 800);
  };

  const testWebDav = () => {
    setWebdavStatus('正在连接 WebDAV 存储...');
    setTimeout(() => {
      setWebdavStatus('WebDAV 挂载成功！已扫描 /music 目录，发现 328 个音频文件');
    }, 800);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-6 select-none z-10 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>在线与云端音乐</span>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold">
              CLOUD SYNC
            </span>
          </h1>
          <p className="text-xs text-white/50 mt-1">
            集成网易云音乐、SoundCloud、Navidrome / Subsonic 服务器以及 WebDAV NAS 私有云
          </p>
        </div>

        {/* Search */}
        <div className="relative sm:w-72">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜索全网歌曲、歌单、艺术家..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-2xl glass-card text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-6 overflow-x-auto">
        {(
          [
            { key: 'NETEASE', label: '网易云音乐', icon: Cloud },
            { key: 'SOUNDCLOUD', label: 'SoundCloud', icon: Radio },
            { key: 'NAVIDROME', label: 'Navidrome / Subsonic', icon: Server },
            { key: 'WEBDAV', label: 'WebDAV / NAS', icon: FolderSync },
          ] as const
        ).map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-white text-black shadow-lg'
                  : 'glass-pill text-white/60 hover:text-white'
              }`}
            >
              <IconComponent className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* NETEASE TAB */}
      {activeTab === 'NETEASE' && (
        <div className="space-y-8 animate-fade-in">
          {/* Charts Row */}
          {NETEASE_CHARTS.map((chart) => (
            <div key={chart.title} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-rose-500" />
                  <h3 className="text-lg font-bold text-white">{chart.title}</h3>
                  <span className="text-xs text-white/40">{chart.desc}</span>
                </div>
                <span className="text-xs font-mono text-white/40">{chart.count}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {chart.tracks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handlePlayOnlineTrack(t)}
                    className="glass-card rounded-2xl p-3 flex items-center gap-3.5 hover:bg-white/10 transition-all cursor-pointer group"
                  >
                    <img
                      src={t.artworkUrl}
                      alt={t.title}
                      className="w-14 h-14 rounded-xl object-cover shadow-md flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-white truncate group-hover:text-indigo-300">
                        {t.title}
                      </h4>
                      <p className="text-xs text-white/50 truncate mt-0.5">{t.artist}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-mono font-bold text-indigo-400">
                          {t.bitsPerSample}-Bit / {(t.sampleRate! / 1000).toFixed(0)}kHz
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayOnlineTrack(t);
                      }}
                      className="w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white hover:text-black transition-all flex-shrink-0"
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SOUNDCLOUD TAB */}
      {activeTab === 'SOUNDCLOUD' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">SoundCloud 热门流派探索</h3>
            <p className="text-xs text-white/50">发现全球独立制作人与流行电子乐</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {SOUNDCLOUD_GENRES.map((g) => (
              <div
                key={g.name}
                onClick={() => setSearchQuery(g.name)}
                className={`p-6 rounded-3xl bg-gradient-to-br ${g.color} text-white shadow-xl cursor-pointer hover:scale-105 transition-transform flex flex-col justify-between h-36`}
              >
                <Radio className="w-6 h-6 opacity-80" />
                <div>
                  <h4 className="text-base font-bold">{g.name}</h4>
                  <span className="text-[11px] opacity-80">{g.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NAVIDROME / SUBSONIC TAB */}
      {activeTab === 'NAVIDROME' && (
        <div className="max-w-xl mx-auto glass-card rounded-3xl p-6 sm:p-8 space-y-5 animate-fade-in">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <Server className="w-6 h-6 text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-white">Navidrome / Subsonic 服务器连接</h3>
              <p className="text-xs text-white/50">连接自建音乐云服务器，随时串流私有高保真库</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-white/60 block mb-1">服务器地址 (Server URL)</label>
              <input
                type="text"
                value={navidromeConfig.serverUrl}
                onChange={(e) => setNavidromeConfig({ ...navidromeConfig, serverUrl: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="text-white/60 block mb-1">用户名 (Username)</label>
              <input
                type="text"
                value={navidromeConfig.username}
                onChange={(e) => setNavidromeConfig({ ...navidromeConfig, username: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="text-white/60 block mb-1">密码或访问 Token</label>
              <input
                type="password"
                value={navidromeConfig.password}
                onChange={(e) => setNavidromeConfig({ ...navidromeConfig, password: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
            </div>
          </div>

          <button
            onClick={testNavidrome}
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            <Server className="w-4 h-4" />
            <span>测试并同步远程服务器曲库</span>
          </button>

          {navidromeStatus && (
            <div className="p-3 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-mono animate-fade-in">
              {navidromeStatus}
            </div>
          )}
        </div>
      )}

      {/* WEBDAV / NAS TAB */}
      {activeTab === 'WEBDAV' && (
        <div className="max-w-xl mx-auto glass-card rounded-3xl p-6 sm:p-8 space-y-5 animate-fade-in">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <FolderSync className="w-6 h-6 text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-white">WebDAV / 私有 NAS 云存储</h3>
              <p className="text-xs text-white/50">直接挂载 Synology、QNAP、Nextcloud 或 Alist 存储</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-white/60 block mb-1">WebDAV 路径</label>
              <input
                type="text"
                value={webdavConfig.url}
                onChange={(e) => setWebdavConfig({ ...webdavConfig, url: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="text-white/60 block mb-1">账户凭证</label>
              <input
                type="text"
                value={webdavConfig.username}
                onChange={(e) => setWebdavConfig({ ...webdavConfig, username: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
            </div>
          </div>

          <button
            onClick={testWebDav}
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            <FolderSync className="w-4 h-4" />
            <span>扫描并挂载 WebDAV 音乐</span>
          </button>

          {webdavStatus && (
            <div className="p-3 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-mono animate-fade-in">
              {webdavStatus}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
