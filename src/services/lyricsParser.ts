import { LyricLine, LyricsDocument, WordTimestamp } from '../types';

/**
 * Parses timestamp string like [01:23.45] or 01:23.450 or 00:01:23.450 to milliseconds
 */
export function parseTimeToMs(timeStr: string): number {
  if (!timeStr) return 0;
  const cleaned = timeStr.replace(/[\[\]]/g, '').trim();
  const parts = cleaned.split(':');
  if (parts.length === 2) {
    const mins = parseFloat(parts[0]) || 0;
    const secs = parseFloat(parts[1]) || 0;
    return Math.round((mins * 60 + secs) * 1000);
  } else if (parts.length === 3) {
    const hours = parseFloat(parts[0]) || 0;
    const mins = parseFloat(parts[1]) || 0;
    const secs = parseFloat(parts[2]) || 0;
    return Math.round((hours * 3600 + mins * 60 + secs) * 1000);
  }
  return 0;
}

/**
 * Splits plain line text into synthetic word segments evenly if no word-level timing is present
 */
function createSyntheticWords(text: string, startTime: number, endTime: number): WordTimestamp[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  // Check if CJK or Latin
  const isCjk = /[\u4e00-\u9fa5\u3040-\u30ff]/.test(trimmed);
  const tokens = isCjk
    ? trimmed.split('')
    : trimmed.split(/(\s+)/).filter(Boolean);

  const duration = Math.max(endTime - startTime, 1000);
  const step = duration / Math.max(tokens.length, 1);

  return tokens.map((token, i) => ({
    word: token,
    startTime: Math.round(startTime + i * step),
    endTime: Math.round(startTime + (i + 1) * step),
  }));
}

/**
 * Parses Enhanced LRC with word tags: e.g. [00:12.00]<00:12.00>Word1 <00:12.50>Word2
 */
function parseEnhancedLrcLine(lineText: string, lineStart: number, nextStart: number): { words: WordTimestamp[]; text: string } {
  const wordTagRegex = /<(\d{1,2}:\d{2}(?:\.\d+)?)>([^<]*)/g;
  const words: WordTimestamp[] = [];
  let match: RegExpExecArray | null;
  let rawText = '';

  while ((match = wordTagRegex.exec(lineText)) !== null) {
    const time = parseTimeToMs(match[1]);
    const word = match[2];
    rawText += word;
    words.push({
      word,
      startTime: time,
      endTime: time + 500, // provisional
    });
  }

  // Adjust end times of words
  for (let i = 0; i < words.length; i++) {
    if (i < words.length - 1) {
      words[i].endTime = words[i + 1].startTime;
    } else {
      words[i].endTime = Math.max(words[i].startTime + 500, nextStart);
    }
  }

  if (words.length === 0) {
    const cleanText = lineText.replace(/\[\d{1,2}:\d{2}(?:\.\d+)?\]/g, '').trim();
    return {
      words: createSyntheticWords(cleanText, lineStart, nextStart),
      text: cleanText,
    };
  }

  return { words, text: rawText.trim() };
}

/**
 * Parses TTML (Apple Music / AMLL style XML)
 */
function parseTtmlLyrics(ttmlText: string): LyricsDocument {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(ttmlText, 'text/xml');
    const pElements = Array.from(doc.querySelectorAll('p'));

    if (pElements.length === 0) {
      throw new Error('No <p> elements in TTML');
    }

    const lines: LyricLine[] = [];

    pElements.forEach((p, index) => {
      const beginAttr = p.getAttribute('begin') || '0';
      const endAttr = p.getAttribute('end') || '0';
      const startTime = parseTimeToMs(beginAttr);
      const endTime = parseTimeToMs(endAttr) || (startTime + 3500);

      const spanElements = Array.from(p.querySelectorAll('span'));
      const words: WordTimestamp[] = [];

      if (spanElements.length > 0) {
        spanElements.forEach((span) => {
          const sBegin = span.getAttribute('begin');
          const sEnd = span.getAttribute('end');
          const text = span.textContent || '';
          if (text) {
            words.push({
              word: text,
              startTime: sBegin ? parseTimeToMs(sBegin) : startTime,
              endTime: sEnd ? parseTimeToMs(sEnd) : endTime,
            });
          }
        });
      } else {
        const fullText = p.textContent || '';
        words.push(...createSyntheticWords(fullText, startTime, endTime));
      }

      lines.push({
        id: `line-${index}`,
        startTime,
        endTime,
        words,
        text: p.textContent || '',
      });
    });

    return {
      isSynchronized: true,
      lines,
      format: 'ttml',
    };
  } catch (err) {
    console.warn('Failed parsing TTML, fallback to LRC:', err);
    return parseLrcLyrics(ttmlText);
  }
}

/**
 * Main LRC Parser supporting standard LRC, enhanced LRC, translations & romaji
 */
export function parseLrcLyrics(
  lrcContent: string,
  translationContent?: string,
  romanContent?: string
): LyricsDocument {
  if (!lrcContent || !lrcContent.trim()) {
    return { isSynchronized: false, lines: [] };
  }

  // Check if content is actually TTML
  if (lrcContent.trim().startsWith('<tt') || lrcContent.includes('<p begin=')) {
    return parseTtmlLyrics(lrcContent);
  }

  const rawLines = lrcContent.split(/\r?\n/);
  const timeTagRegex = /\[(\d{1,2}:\d{2}(?:\.\d+)?)\]/;
  const parsedItems: { startTime: number; text: string; raw: string }[] = [];

  for (const line of rawLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const match = timeTagRegex.exec(trimmed);
    if (match) {
      const startTime = parseTimeToMs(match[1]);
      const content = trimmed.substring(match[0].length).trim();
      parsedItems.push({
        startTime,
        text: content,
        raw: trimmed,
      });
    }
  }

  // If no timestamps found, parse as plain text
  if (parsedItems.length === 0) {
    const plainLines: LyricLine[] = rawLines
      .map((l) => l.trim())
      .filter(Boolean)
      .map((text, i) => ({
        id: `plain-${i}`,
        startTime: i * 3000,
        endTime: (i + 1) * 3000,
        words: [{ word: text, startTime: i * 3000, endTime: (i + 1) * 3000 }],
        text,
      }));

    return {
      isSynchronized: false,
      lines: plainLines,
      format: 'plain',
    };
  }

  // Sort by start time
  parsedItems.sort((a, b) => a.startTime - b.startTime);

  // Parse translations if available
  const transMap = new Map<number, string>();
  if (translationContent) {
    const tLines = translationContent.split(/\r?\n/);
    for (const tl of tLines) {
      const match = timeTagRegex.exec(tl);
      if (match) {
        const time = parseTimeToMs(match[1]);
        const transText = tl.substring(match[0].length).trim();
        transMap.set(time, transText);
      }
    }
  }

  // Parse romanization if available
  const romanMap = new Map<number, string>();
  if (romanContent) {
    const rLines = romanContent.split(/\r?\n/);
    for (const rl of rLines) {
      const match = timeTagRegex.exec(rl);
      if (match) {
        const time = parseTimeToMs(match[1]);
        const romText = rl.substring(match[0].length).trim();
        romanMap.set(time, romText);
      }
    }
  }

  const lines: LyricLine[] = parsedItems.map((item, index) => {
    const nextItem = parsedItems[index + 1];
    const nextStart = nextItem ? nextItem.startTime : item.startTime + 4000;
    const endTime = Math.max(item.startTime + 1500, nextStart);

    const { words, text } = parseEnhancedLrcLine(item.raw, item.startTime, endTime);

    // Find translation match closest in time
    let translatedLyric: string | undefined = transMap.get(item.startTime);
    if (!translatedLyric) {
      for (const [tTime, tText] of transMap.entries()) {
        if (Math.abs(tTime - item.startTime) < 500) {
          translatedLyric = tText;
          break;
        }
      }
    }

    let romanLyric: string | undefined = romanMap.get(item.startTime);
    if (!romanLyric) {
      for (const [rTime, rText] of romanMap.entries()) {
        if (Math.abs(rTime - item.startTime) < 500) {
          romanLyric = rText;
          break;
        }
      }
    }

    return {
      id: `line-${index}`,
      startTime: item.startTime,
      endTime,
      words,
      text,
      translatedLyric,
      romanLyric,
    };
  });

  return {
    isSynchronized: true,
    lines,
    format: 'lrc',
  };
}
