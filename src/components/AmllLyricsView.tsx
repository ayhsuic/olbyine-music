import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useMusic } from '../context/MusicContext';
import { LyricLine } from '../types';

interface AmllLyricsViewProps {
  compact?: boolean;
  onLineClick?: (timeMs: number) => void;
}

export const AmllLyricsView: React.FC<AmllLyricsViewProps> = ({
  compact = false,
  onLineClick,
}) => {
  const { lyricsDoc, positionMs, seekTo, userSettings, isPlaying } = useMusic();
  const {
    lyricFontSize,
    lyricInactiveOpacity,
    lyricBlur,
    lyricTranslation,
    lyricRomanization,
    lyricSubScale,
    lyricDoubleTapSeek,
  } = userSettings;

  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<{ id: string; time: number } | null>(null);
  const [userScrolled, setUserScrolled] = useState(false);
  const scrollTimeoutRef = useRef<number | null>(null);

  const lines = lyricsDoc.lines;
  const isSync = lyricsDoc.isSynchronized;

  // Find active line index
  const activeIndex = React.useMemo(() => {
    if (!isSync || lines.length === 0) return -1;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const nextLine = lines[i + 1];
      const nextStart = nextLine ? nextLine.startTime : line.endTime + 2000;
      if (positionMs >= line.startTime && positionMs < nextStart) {
        return i;
      }
    }
    // If before first line
    if (positionMs < lines[0].startTime) return 0;
    // If past last line
    return lines.length - 1;
  }, [lines, positionMs, isSync]);

  // Auto-scroll to active line if user is not actively scrolling
  useEffect(() => {
    if (userScrolled) return;
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex, userScrolled]);

  const handleContainerScroll = () => {
    setUserScrolled(true);
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = window.setTimeout(() => {
      setUserScrolled(false);
    }, 3200);
  };

  const handleLineClick = useCallback(
    (line: LyricLine) => {
      if (!isSync) return;

      const executeSeek = () => {
        if (onLineClick) {
          onLineClick(line.startTime);
        } else {
          seekTo(line.startTime);
        }
      };

      if (!lyricDoubleTapSeek) {
        executeSeek();
        return;
      }

      const now = performance.now();
      if (lastTapRef.current && lastTapRef.current.id === line.id && now - lastTapRef.current.time < 450) {
        lastTapRef.current = null;
        executeSeek();
      } else {
        lastTapRef.current = { id: line.id || '', time: now };
      }
    },
    [isSync, lyricDoubleTapSeek, onLineClick, seekTo]
  );

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-white/50 text-center px-6">
        <div className="w-16 h-16 mb-4 rounded-full bg-white/5 flex items-center justify-center text-white/30">
          ♪
        </div>
        <p className="text-lg font-medium text-white/70">纯音乐，无歌词</p>
        <p className="text-xs text-white/40 mt-1">Instrumental / No synced lyrics available</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleContainerScroll}
      className={`h-full overflow-y-auto scroll-smooth py-24 px-4 sm:px-8 select-none transition-all ${
        compact ? 'max-h-[420px]' : 'h-full'
      }`}
      style={{
        maskImage:
          'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
      }}
    >
      <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
        {lines.map((line, index) => {
          const isActive = index === activeIndex;
          const isPassed = index < activeIndex;
          const nextLine = lines[index + 1];
          const hasInterlude =
            isActive &&
            nextLine &&
            nextLine.startTime - line.endTime > 4500 &&
            positionMs > line.endTime;

          // Compute word-level progress if active
          return (
            <div
              key={line.id || index}
              ref={isActive ? activeLineRef : null}
              onClick={() => handleLineClick(line)}
              className={`group transition-all duration-500 cursor-pointer rounded-2xl p-3 sm:p-4 text-left ${
                isActive
                  ? 'scale-[1.02] transform'
                  : 'hover:scale-[1.01] hover:bg-white/5'
              }`}
              style={{
                opacity: isActive ? 1 : isPassed ? lyricInactiveOpacity * 0.9 : lyricInactiveOpacity,
                filter: lyricBlur && !isActive ? 'blur(1.5px)' : 'none',
              }}
            >
              {/* Main Lyric Line */}
              <div
                className={`font-bold tracking-tight leading-snug transition-colors duration-300 flex flex-wrap gap-x-1.5 ${
                  isActive ? 'text-white' : 'text-white/80'
                }`}
                style={{
                  fontSize: compact ? `${lyricFontSize * 0.75}px` : `${lyricFontSize}px`,
                  fontWeight: userSettings.lyricFontWeight,
                }}
              >
                {line.words.length > 0 ? (
                  line.words.map((wordObj, wIdx) => {
                    let fillPercentage = 0;
                    if (isActive) {
                      if (positionMs >= wordObj.endTime) {
                        fillPercentage = 100;
                      } else if (positionMs >= wordObj.startTime) {
                        const duration = Math.max(wordObj.endTime - wordObj.startTime, 1);
                        fillPercentage = Math.min(100, Math.max(0, ((positionMs - wordObj.startTime) / duration) * 100));
                      }
                    } else if (isPassed) {
                      fillPercentage = 100;
                    }

                    const isCurrentlySinging =
                      isActive && positionMs >= wordObj.startTime && positionMs <= wordObj.endTime;

                    return (
                      <span
                        key={wIdx}
                        className={`relative inline-block transition-transform duration-150 ${
                          isCurrentlySinging ? 'scale-105' : ''
                        }`}
                        style={{
                          background: `linear-gradient(to right, #ffffff ${fillPercentage}%, rgba(255,255,255,0.45) ${fillPercentage}%)`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          textShadow:
                            isCurrentlySinging && isActive
                              ? '0 0 20px rgba(255,255,255,0.6), 0 0 40px rgba(99,102,241,0.5)'
                              : 'none',
                        }}
                      >
                        {wordObj.word}
                      </span>
                    );
                  })
                ) : (
                  <span>{line.text}</span>
                )}
              </div>

              {/* Translation Sub-line */}
              {lyricTranslation && line.translatedLyric && (
                <div
                  className="mt-1.5 font-medium tracking-normal text-white/70 transition-opacity"
                  style={{
                    fontSize: `${lyricFontSize * lyricSubScale}px`,
                  }}
                >
                  {line.translatedLyric}
                </div>
              )}

              {/* Romanization Sub-line */}
              {lyricRomanization && line.romanLyric && (
                <div
                  className="mt-0.5 font-mono text-white/50 tracking-wide text-xs sm:text-sm"
                  style={{
                    fontSize: `${lyricFontSize * (lyricSubScale * 0.85)}px`,
                  }}
                >
                  {line.romanLyric}
                </div>
              )}

              {/* Interlude countdown dots if musical break between lines */}
              {hasInterlude && (
                <div className="flex items-center gap-2 mt-4 ml-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/70 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-xs font-mono text-white/40 ml-2">间奏 (Interlude)</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
