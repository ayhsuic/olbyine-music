export interface WordTimestamp {
  word: string;
  startTime: number; // in milliseconds
  endTime: number;   // in milliseconds
}

export interface LyricLine {
  id?: string;
  startTime: number; // in milliseconds
  endTime: number;   // in milliseconds
  words: WordTimestamp[];
  text: string;
  translatedLyric?: string;
  romanLyric?: string;
  isBG?: boolean;
  isDuet?: boolean;
}

export interface LyricsDocument {
  isSynchronized: boolean;
  lines: LyricLine[];
  source?: string;
  format?: string; // 'ttml' | 'lrc' | 'qrc' | 'amll' | 'plain'
  instrumental?: boolean;
}

export interface Track {
  id: string;
  uri: string;
  title: string;
  artist: string;
  album: string;
  durationMs: number;
  displayName: string;
  mimeType?: string;
  sizeBytes: number;
  coverPath?: string;
  artworkUrl?: string;
  lyrics?: string;
  wordLyrics?: string;
  translationLyrics?: string;
  romanLyrics?: string;
  lyricsSource?: string;
  lyricsFormat?: string;
  lyricsConfidence?: number;
  lyricsInstrumental?: boolean;
  lyricsLookupAt?: number;
  lyricsLookupStatus?: string;
  favorite: boolean;
  addedAt: number;
  folderId?: string;
  folderPath?: string;
  storedLyrics?: boolean;
  trackNumber: number;
  discNumber: number;
  year: number;
  albumArtist?: string;
  playCount: number;
  lastPlayedAt?: number;
  sampleRate: number;     // e.g. 44100, 96000
  bitsPerSample: number;  // e.g. 16, 24, 32
  bitrate: number;        // in kbps, e.g. 320, 1411, 2304
  audioUrl?: string;      // real URL or object URL or synthesized
  isOnline?: boolean;
}

export interface Album {
  key: string;
  title: string;
  artist: string;
  year: number;
  tracks: Track[];
  coverUrl?: string;
}

export interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
  createdAt: number;
  updatedAt: number;
  description?: string;
  coverUrl?: string;
}

export type ThemeMode = 'SYSTEM' | 'DARK' | 'LIGHT';
export type UiStyle = 'IOS' | 'COLOROS' | 'HYPEROS' | 'MATERIAL';
export type AlbumStyle = 'GRID' | 'COVER_FLOW' | 'SPHERICAL';
export type TransitionMode = 'OFF' | 'CROSSFADE' | 'AUTOMIX';
export type AppDestination = 'NOW_PLAYING' | 'LIBRARY' | 'ONLINE' | 'SETTINGS';
export type LibraryViewTab = 'TRACKS' | 'ALBUMS' | 'ARTISTS' | 'PLAYLISTS' | 'FAVORITES';

export interface UserSettings {
  themeMode: ThemeMode;
  uiStyle: UiStyle;
  albumStyle: AlbumStyle;
  lyricFontSize: number;
  lyricInactiveOpacity: number;
  lyricOffsetMs: number;
  lyricFontWeight: number;
  lyricBlur: boolean;
  lyricTranslation: boolean;
  lyricRomanization: boolean;
  lyricSubScale: number;
  lyricDoubleTapSeek: boolean;
  transitionMode: TransitionMode;
  crossfadeSeconds: number;
  eqEnabled: boolean;
  eqPreset: string;
  eqBands: number[]; // 10 bands
  eqPreamp: number;
  balance: number;   // -1 to 1
  monoAudio: boolean;
  hapticsEnabled: boolean;
  showLyricPreview: boolean;
  usbBitPerfectEnabled: boolean;
  playerFx: {
    titleReveal: boolean;
    heartBurst: boolean;
    coverTilt: boolean;
    elasticSeek: boolean;
    rollingTime: boolean;
    badgeShine: boolean;
    filmGrain: boolean;
    gradualBlur: boolean;
    shredder: boolean;
    bounceCards: boolean;
  };
}

export interface OnlineSongResult {
  id: string;
  title: string;
  artist: string;
  album: string;
  durationMs: number;
  coverUrl: string;
  source: 'netease' | 'soundcloud' | 'navidrome' | 'webdav';
  audioUrl?: string;
  quality?: string;
  hasLyrics?: boolean;
}
