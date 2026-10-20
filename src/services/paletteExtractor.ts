export interface PaletteColors {
  primary: string;
  secondary: string;
  tertiary: string;
  accent: string;
  bgDark: string;
}

const DEFAULT_PALETTES: PaletteColors[] = [
  {
    primary: '#4f46e5',
    secondary: '#9333ea',
    tertiary: '#06b6d4',
    accent: '#f43f5e',
    bgDark: '#0c0a1f',
  },
  {
    primary: '#059669',
    secondary: '#0d9488',
    tertiary: '#10b981',
    accent: '#34d399',
    bgDark: '#061712',
  },
  {
    primary: '#e11d48',
    secondary: '#f97316',
    tertiary: '#db2777',
    accent: '#fbbf24',
    bgDark: '#1a080d',
  },
  {
    primary: '#2563eb',
    secondary: '#7c3aed',
    tertiary: '#38bdf8',
    accent: '#a855f7',
    bgDark: '#070f26',
  },
];

/**
 * Extracts a harmonious palette from an image or generates one deterministically based on track seed
 */
export async function extractPaletteFromImage(
  imageUrl?: string,
  seedStr?: string
): Promise<PaletteColors> {
  if (!imageUrl) {
    const hash = (seedStr || 'default')
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return DEFAULT_PALETTES[hash % DEFAULT_PALETTES.length];
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const fallback = () => {
      const hash = (imageUrl + (seedStr || ''))
        .split('')
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
      resolve(DEFAULT_PALETTES[hash % DEFAULT_PALETTES.length]);
    };

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return fallback();

        canvas.width = 50;
        canvas.height = 50;
        ctx.drawImage(img, 0, 0, 50, 50);

        const imgData = ctx.getImageData(0, 0, 50, 50).data;
        const colorCounts: { [key: string]: number } = {};

        for (let i = 0; i < imgData.length; i += 16) {
          const r = Math.round(imgData[i] / 32) * 32;
          const g = Math.round(imgData[i + 1] / 32) * 32;
          const b = Math.round(imgData[i + 2] / 32) * 32;
          const key = `${r},${g},${b}`;
          colorCounts[key] = (colorCounts[key] || 0) + 1;
        }

        const sortedColors = Object.entries(colorCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([rgb]) => rgb.split(',').map(Number));

        if (sortedColors.length >= 2) {
          const [c1, c2] = sortedColors;
          const c3 = sortedColors[2] || sortedColors[0];
          resolve({
            primary: `rgb(${c1[0]}, ${c1[1]}, ${c1[2]})`,
            secondary: `rgb(${c2[0]}, ${c2[1]}, ${c2[2]})`,
            tertiary: `rgb(${c3[0]}, ${c3[1]}, ${c3[2]})`,
            accent: `rgba(${c1[0]}, ${c1[1]}, ${c1[2]}, 0.85)`,
            bgDark: `rgb(${Math.max(8, Math.round(c1[0] * 0.15))}, ${Math.max(8, Math.round(c1[1] * 0.15))}, ${Math.max(12, Math.round(c1[2] * 0.15))})`,
          });
          return;
        }
        fallback();
      } catch (err) {
        fallback();
      }
    };

    img.onerror = fallback;
    img.src = imageUrl;
  });
}
