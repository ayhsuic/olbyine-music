export const EQ_FREQUENCIES = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
export const EQ_LABELS = ['31Hz', '62Hz', '125Hz', '250Hz', '500Hz', '1kHz', '2kHz', '4kHz', '8kHz', '16kHz'];

export const EQ_PRESETS: Record<string, { label: string; bands: number[] }> = {
  flat: {
    label: '平直 (Flat)',
    bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  bass: {
    label: '低音增强 (Bass Boost)',
    bands: [6, 5, 4, 2, 0.5, 0, 0, 0, 0, 0],
  },
  treble: {
    label: '高音增强 (Treble Boost)',
    bands: [0, 0, 0, 0, 0, 0.5, 2, 3.5, 4.5, 5],
  },
  vocal: {
    label: '人声突出 (Vocal)',
    bands: [-2, -1.5, -0.5, 1, 2.5, 3, 2.5, 1.5, 0.5, 0],
  },
  pop: {
    label: '流行 (Pop)',
    bands: [-1, 1, 2.5, 3, 2, 0, -0.5, -0.5, 0.5, 1],
  },
  rock: {
    label: '摇滚 (Rock)',
    bands: [4, 3, 1.5, -0.5, -1, 0, 1.5, 3, 3.5, 3.5],
  },
  electronic: {
    label: '电子 (Electronic)',
    bands: [4.5, 4, 1.5, 0, -1.5, 1, 0.5, 1.5, 3.5, 4.5],
  },
  classical: {
    label: '古典 (Classical)',
    bands: [3, 2, 1.5, 0.5, -0.5, -0.5, 0, 1.5, 2.5, 3],
  },
  acoustic: {
    label: '原声 (Acoustic)',
    bands: [3, 2.5, 2, 1, 1, 1, 2, 2.5, 2, 1.5],
  },
  loudness: {
    label: '响度补偿 (Loudness)',
    bands: [5, 3.5, 1, 0, -1, -1, 0, 1, 3, 4],
  },
  custom: {
    label: '自定义 (Custom)',
    bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
};
