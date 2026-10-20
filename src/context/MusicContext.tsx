import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Track,
  Playlist,
  UserSettings,
  AppDestination,
  LyricsDocument,
  Album,
} from '../types';
import { DEMO_TRACKS } from '../data/demoTracks';
import { parseLrcLyrics } from '../services/lyricsParser';
import { extractPaletteFromImage, PaletteColors } from '../services/paletteExtractor';
import { audioEngine } from '../services/audioEngine';
import { EQ_PRESETS } from '../utils/eqConstants';

const DEFAULT_SETTINGS: UserSettings = {
  themeMode: 'DARK',
  uiStyle: 'IOS',
  albumStyle: 'COVER_FLOW',
  lyricFontSize: 32,
  lyricInactiveOpacity: 0.35,
  lyricOffsetMs: 0,
  lyricFontWeight: 700,
  lyricBlur: false,
  lyricTranslation: true,
  lyricRomanization: true,
  lyricSubScale: 0.55,
  lyricDoubleTapSeek: true,
  transitionMode: 'CROSSFADE',
  crossfadeSeconds: 4,
  eqEnabled: true,
  eqPreset: 'flat',
  eqBands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  eqPreamp: 0,
  balance: 0,
  monoAudio: false,
  hapticsEnabled: true,
  showLyricPreview: true,
  usbBitPerfectEnabled: true,
  playerFx: {
    titleReveal: true,
    heartBurst: true,
    coverTilt: true,
    elasticSeek: true,
    rollingTime: true,
    badgeShine: true,
    filmGrain: true,
    gradualBlur: true,
    shredder: true,
    bounceCards: true,
  },
};

interface MusicContextType {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
  volume: number;
  shuffle: boolean;
  repeatMode: 'OFF' | 'ALL' | 'ONE';
  queue: Track[];
  playlists: Playlist[];
  palette: PaletteColors;
  lyricsDoc: LyricsDocument;
  userSettings: UserSettings;
  currentDestination: AppDestination;
  audioEnergy: number;
  frequencyData: Uint8Array;
  albums: Album[];
  artists: { name: string; trackCount: number; coverUrl?: string }[];
  setCurrentDestination: (dest: AppDestination) => void;
  playTrack: (track: Track, newQueue?: Track[]) => void;
  togglePlay: () => void;
  seekTo: (ms: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (vol: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleFavorite: (trackId: string, event?: React.MouseEvent) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  importFiles: (files: FileList | File[]) => Promise<number>;
  createPlaylist: (name: string, description?: string) => void;
  addToPlaylist: (playlistId: string, trackId: string) => void;
  removeFromPlaylist: (playlistId: string, trackId: string) => void;
  deletePlaylist: (playlistId: string) => void;
  resetToDemoTracks: () => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial settings
  const [userSettings, setUserSettings] = useState<UserSettings>(() => {
    try {
      const stored = localStorage.getItem('olbyine_settings');
      if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch (e) {}
    return DEFAULT_SETTINGS;
  });

  const [tracks, setTracks] = useState<Track[]>(() => {
    try {
      const stored = localStorage.getItem('olbyine_tracks');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEMO_TRACKS;
  });

  const [currentTrack, setCurrentTrack] = useState<Track | null>(tracks[0] || null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [positionMs, setPositionMs] = useState<number>(0);
  const [durationMs, setDurationMs] = useState<number>(currentTrack?.durationMs || 180000);
  const [volume, setVolumeState] = useState<number>(0.85);
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<'OFF' | 'ALL' | 'ONE'>('ALL');
  const [queue, setQueue] = useState<Track[]>(() => [...tracks]);
  const [currentDestination, setCurrentDestination] = useState<AppDestination>('NOW_PLAYING');
  const [audioEnergy, setAudioEnergy] = useState<number>(0);
  const [frequencyData, setFrequencyData] = useState<Uint8Array>(new Uint8Array(32));

  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    try {
      const stored = localStorage.getItem('olbyine_playlists');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [
      {
        id: 'pl-favorites',
        name: '特别喜爱 (Favorites)',
        trackIds: tracks.filter(t => t.favorite).map(t => t.id),
        createdAt: Date.now() - 86400000 * 3,
        updatedAt: Date.now(),
        description: '高频播放与心动珍藏',
        coverUrl: tracks[0]?.artworkUrl,
      },
      {
        id: 'pl-hi-res',
        name: 'Hi-Res 无损发烧盘',
        trackIds: tracks.filter(t => t.bitsPerSample >= 24).map(t => t.id),
        createdAt: Date.now() - 86400000 * 2,
        updatedAt: Date.now(),
        description: '24-Bit / 96kHz+ 母带级音频',
        coverUrl: tracks[1]?.artworkUrl,
      },
    ];
  });

  const [palette, setPalette] = useState<PaletteColors>({
    primary: '#6366f1',
    secondary: '#a855f7',
    tertiary: '#06b6d4',
    accent: '#ec4899',
    bgDark: '#080811',
  });

  const [lyricsDoc, setLyricsDoc] = useState<LyricsDocument>({ isSynchronized: false, lines: [] });

  const animFrameRef = useRef<number | null>(null);
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  // Save settings to localStorage
  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setUserSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('olbyine_settings', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, []);

  // Update EQ in audioEngine
  useEffect(() => {
    audioEngine.setEqEnabled(userSettings.eqEnabled, userSettings.eqBands, userSettings.eqPreamp);
    audioEngine.setBalance(userSettings.balance);
  }, [userSettings.eqEnabled, userSettings.eqBands, userSettings.eqPreamp, userSettings.balance]);

  // Extract palette and parse lyrics when track changes
  useEffect(() => {
    if (!currentTrack) return;
    setDurationMs(currentTrack.durationMs || 180000);

    // Extract dynamic palette
    extractPaletteFromImage(currentTrack.artworkUrl, currentTrack.title).then(setPalette);

    // Parse lyrics
    const doc = parseLrcLyrics(
      currentTrack.lyrics || '',
      userSettings.lyricTranslation ? currentTrack.translationLyrics : undefined,
      userSettings.lyricRomanization ? currentTrack.romanLyrics : undefined
    );
    setLyricsDoc(doc);
  }, [currentTrack, userSettings.lyricTranslation, userSettings.lyricRomanization]);

  // Audio element listeners
  useEffect(() => {
    const audio = audioEngine.getAudioElement();

    const handleTimeUpdate = () => {
      if (!audioEngine.isProceduralPlaying()) {
        setPositionMs(Math.round(audio.currentTime * 1000));
      }
    };

    const handleEnded = () => {
      if (repeatMode === 'ONE') {
        seekTo(0);
        audio.play().catch(() => {});
      } else {
        nextTrack();
      }
    };

    const handleLoadedMetadata = () => {
      if (!Number.isNaN(audio.duration) && audio.duration > 0) {
        setDurationMs(Math.round(audio.duration * 1000));
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [repeatMode]);

  // Energy & Frequency loop for beat pulse & visualizer
  useEffect(() => {
    let active = true;
    const loop = () => {
      if (!active) return;
      if (isPlayingRef.current) {
        const energy = audioEngine.getEnergy();
        const freqs = audioEngine.getFrequencyData();
        setAudioEnergy(energy);
        setFrequencyData(freqs);
      } else {
        setAudioEnergy(0);
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const playTrack = useCallback(
    async (track: Track, newQueue?: Track[]) => {
      setCurrentTrack(track);
      if (newQueue) setQueue(newQueue);

      await audioEngine.resumeContext();
      setPositionMs(0);

      // Check if real audioUrl vs procedural demo track
      if (track.audioUrl) {
        audioEngine.stopProcedural();
        const audio = audioEngine.getAudioElement();
        audio.src = track.audioUrl;
        audio.currentTime = 0;
        try {
          await audio.play();
          setIsPlaying(true);
        } catch (err) {
          console.warn('Playback error:', err);
        }
      } else {
        // Procedural synth playback
        audioEngine.playProcedural(
          (posMs) => {
            setPositionMs(posMs);
            if (posMs >= track.durationMs) {
              if (repeatMode === 'ONE') {
                playTrack(track);
              } else {
                nextTrack();
              }
            }
          },
          0,
          track.sampleRate > 48000 ? 122 : 112,
          track.title.includes('Lofi') ? 'lofi' : 'synth'
        );
        setIsPlaying(true);
      }
    },
    [repeatMode]
  );

  const togglePlay = useCallback(async () => {
    await audioEngine.resumeContext();
    if (!currentTrack) {
      if (tracks.length > 0) playTrack(tracks[0]);
      return;
    }

    if (isPlaying) {
      if (audioEngine.isProceduralPlaying()) {
        audioEngine.pauseProcedural();
      } else {
        audioEngine.getAudioElement().pause();
      }
      setIsPlaying(false);
    } else {
      if (currentTrack.audioUrl) {
        try {
          await audioEngine.getAudioElement().play();
          setIsPlaying(true);
        } catch (e) {
          console.warn('Audio play resumed error', e);
        }
      } else {
        audioEngine.playProcedural(
          (posMs) => {
            setPositionMs(posMs);
            if (posMs >= currentTrack.durationMs) {
              nextTrack();
            }
          },
          positionMs,
          currentTrack.sampleRate > 48000 ? 122 : 112,
          currentTrack.title.includes('Lofi') ? 'lofi' : 'synth'
        );
        setIsPlaying(true);
      }
    }
  }, [isPlaying, currentTrack, positionMs, tracks]);

  const seekTo = useCallback(
    (ms: number) => {
      const clamped = Math.max(0, Math.min(durationMs, ms));
      setPositionMs(clamped);

      if (currentTrack?.audioUrl) {
        audioEngine.getAudioElement().currentTime = clamped / 1000;
      } else if (audioEngine.isProceduralPlaying()) {
        audioEngine.playProcedural(
          (pos) => setPositionMs(pos),
          clamped,
          currentTrack?.sampleRate && currentTrack.sampleRate > 48000 ? 122 : 112
        );
      }
    },
    [durationMs, currentTrack]
  );

  const nextTrack = useCallback(() => {
    if (queue.length === 0) return;
    const currentIndex = queue.findIndex((t) => t.id === currentTrack?.id);
    let nextIdx = 0;
    if (shuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else {
      nextIdx = (currentIndex + 1) % queue.length;
    }
    playTrack(queue[nextIdx]);
  }, [queue, currentTrack, shuffle, playTrack]);

  const prevTrack = useCallback(() => {
    if (positionMs > 3000) {
      seekTo(0);
      return;
    }
    if (queue.length === 0) return;
    const currentIndex = queue.findIndex((t) => t.id === currentTrack?.id);
    let prevIdx = (currentIndex - 1 + queue.length) % queue.length;
    playTrack(queue[prevIdx]);
  }, [queue, currentTrack, positionMs, seekTo, playTrack]);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    audioEngine.setVolume(vol);
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle((prev) => !prev);
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeatMode((prev) => (prev === 'OFF' ? 'ALL' : prev === 'ALL' ? 'ONE' : 'OFF'));
  }, []);

  const toggleFavorite = useCallback(
    (trackId: string, event?: React.MouseEvent) => {
      if (userSettings.playerFx.heartBurst && event) {
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        const x = (rect.left + rect.width / 2) / window.innerWidth;
        const y = (rect.top + rect.height / 2) / window.innerHeight;
        confetti({
          particleCount: 28,
          spread: 60,
          origin: { x, y },
          colors: ['#ec4899', '#f43f5e', '#a855f7', '#fb7185'],
          ticks: 120,
          gravity: 1.2,
          scalar: 0.8,
        });
      }

      setTracks((prev) => {
        const next = prev.map((t) => (t.id === trackId ? { ...t, favorite: !t.favorite } : t));
        localStorage.setItem('olbyine_tracks', JSON.stringify(next));
        return next;
      });

      if (currentTrack?.id === trackId) {
        setCurrentTrack((prev) => (prev ? { ...prev, favorite: !prev.favorite } : null));
      }
    },
    [userSettings.playerFx.heartBurst, currentTrack]
  );

  const addToQueue = useCallback((track: Track) => {
    setQueue((prev) => [...prev, track]);
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue(currentTrack ? [currentTrack] : []);
  }, [currentTrack]);

  // Local file importer
  const importFiles = useCallback(async (files: FileList | File[]): Promise<number> => {
    const fileArray = Array.from(files);
    let count = 0;
    const newTracks: Track[] = [];

    for (const file of fileArray) {
      if (!file.type.startsWith('audio/') && !/\.(mp3|wav|flac|aac|m4a|ogg|opus)$/i.test(file.name)) {
        continue;
      }

      const objectUrl = URL.createObjectURL(file);
      const nameParts = file.name.replace(/\.[^/.]+$/, '').split(' - ');
      const artist = nameParts.length > 1 ? nameParts[0].trim() : 'Unknown Artist';
      const title = nameParts.length > 1 ? nameParts.slice(1).join(' - ').trim() : nameParts[0].trim();

      const track: Track = {
        id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        uri: objectUrl,
        audioUrl: objectUrl,
        title,
        artist,
        album: 'Local Imports',
        durationMs: 180000,
        displayName: file.name,
        mimeType: file.type || 'audio/mpeg',
        sizeBytes: file.size,
        favorite: false,
        addedAt: Date.now(),
        trackNumber: newTracks.length + 1,
        discNumber: 1,
        year: new Date().getFullYear(),
        playCount: 0,
        sampleRate: 44100,
        bitsPerSample: 16,
        bitrate: 320,
        lyrics: `[00:00.00]${title} - ${artist}\n[00:05.00]Local audio loaded successfully.\n[00:10.00]Enjoy high-fidelity playback in Olbyine Music!`,
      };

      // Probe audio duration
      try {
        const tempAudio = new Audio(objectUrl);
        await new Promise((res) => {
          tempAudio.onloadedmetadata = () => {
            if (tempAudio.duration && !Number.isNaN(tempAudio.duration)) {
              track.durationMs = Math.round(tempAudio.duration * 1000);
            }
            res(true);
          };
          tempAudio.onerror = () => res(true);
          setTimeout(res, 800);
        });
      } catch (e) {}

      newTracks.push(track);
      count++;
    }

    if (newTracks.length > 0) {
      setTracks((prev) => {
        const merged = [...newTracks, ...prev];
        localStorage.setItem('olbyine_tracks', JSON.stringify(merged));
        return merged;
      });
      setQueue((prev) => [...newTracks, ...prev]);
      playTrack(newTracks[0]);
    }

    return count;
  }, [playTrack]);

  // Playlist management
  const createPlaylist = useCallback((name: string, description?: string) => {
    const pl: Playlist = {
      id: `pl-${Date.now()}`,
      name,
      description,
      trackIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setPlaylists((prev) => {
      const next = [...prev, pl];
      localStorage.setItem('olbyine_playlists', JSON.stringify(next));
      return next;
    });
  }, []);

  const addToPlaylist = useCallback((playlistId: string, trackId: string) => {
    setPlaylists((prev) => {
      const next = prev.map((pl) =>
        pl.id === playlistId && !pl.trackIds.includes(trackId)
          ? { ...pl, trackIds: [...pl.trackIds, trackId], updatedAt: Date.now() }
          : pl
      );
      localStorage.setItem('olbyine_playlists', JSON.stringify(next));
      return next;
    });
  }, []);

  const removeFromPlaylist = useCallback((playlistId: string, trackId: string) => {
    setPlaylists((prev) => {
      const next = prev.map((pl) =>
        pl.id === playlistId
          ? { ...pl, trackIds: pl.trackIds.filter((id) => id !== trackId), updatedAt: Date.now() }
          : pl
      );
      localStorage.setItem('olbyine_playlists', JSON.stringify(next));
      return next;
    });
  }, []);

  const deletePlaylist = useCallback((playlistId: string) => {
    setPlaylists((prev) => {
      const next = prev.filter((pl) => pl.id !== playlistId);
      localStorage.setItem('olbyine_playlists', JSON.stringify(next));
      return next;
    });
  }, []);

  const resetToDemoTracks = useCallback(() => {
    setTracks(DEMO_TRACKS);
    setQueue(DEMO_TRACKS);
    setCurrentTrack(DEMO_TRACKS[0]);
    localStorage.removeItem('olbyine_tracks');
  }, []);

  // Compute albums & artists
  const albums: Album[] = React.useMemo(() => {
    const map = new Map<string, Album>();
    tracks.forEach((t) => {
      const key = `${t.album} - ${t.albumArtist || t.artist}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          title: t.album,
          artist: t.albumArtist || t.artist,
          year: t.year,
          tracks: [t],
          coverUrl: t.artworkUrl,
        });
      } else {
        const existing = map.get(key)!;
        existing.tracks.push(t);
        if (!existing.coverUrl && t.artworkUrl) existing.coverUrl = t.artworkUrl;
      }
    });
    return Array.from(map.values());
  }, [tracks]);

  const artists = React.useMemo(() => {
    const map = new Map<string, { count: number; cover?: string }>();
    tracks.forEach((t) => {
      const existing = map.get(t.artist);
      if (!existing) {
        map.set(t.artist, { count: 1, cover: t.artworkUrl });
      } else {
        existing.count++;
        if (!existing.cover && t.artworkUrl) existing.cover = t.artworkUrl;
      }
    });
    return Array.from(map.entries()).map(([name, data]) => ({
      name,
      trackCount: data.count,
      coverUrl: data.cover,
    }));
  }, [tracks]);

  return (
    <MusicContext.Provider
      value={{
        tracks,
        currentTrack,
        isPlaying,
        positionMs,
        durationMs,
        volume,
        shuffle,
        repeatMode,
        queue,
        playlists,
        palette,
        lyricsDoc,
        userSettings,
        currentDestination,
        audioEnergy,
        frequencyData,
        albums,
        artists,
        setCurrentDestination,
        playTrack,
        togglePlay,
        seekTo,
        nextTrack,
        prevTrack,
        setVolume,
        toggleShuffle,
        toggleRepeat,
        toggleFavorite,
        addToQueue,
        removeFromQueue,
        clearQueue,
        updateSettings,
        importFiles,
        createPlaylist,
        addToPlaylist,
        removeFromPlaylist,
        deletePlaylist,
        resetToDemoTracks,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
