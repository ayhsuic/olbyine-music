import React from 'react';
import { useMusic } from '../context/MusicContext';
import { EQ_FREQUENCIES, EQ_LABELS, EQ_PRESETS } from '../utils/eqConstants';
import { X, Sliders, Volume2, RotateCcw } from 'lucide-react';

interface EqualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EqualizerModal: React.FC<EqualizerModalProps> = ({ isOpen, onClose }) => {
  const { userSettings, updateSettings, frequencyData } = useMusic();
  const { eqEnabled, eqPreset, eqBands, eqPreamp, balance, monoAudio } = userSettings;

  if (!isOpen) return null;

  const handlePresetSelect = (presetKey: string) => {
    const preset = EQ_PRESETS[presetKey];
    if (preset) {
      updateSettings({
        eqPreset: presetKey,
        eqBands: [...preset.bands],
      });
    }
  };

  const handleBandChange = (index: number, val: number) => {
    const newBands = [...eqBands];
    newBands[index] = val;
    updateSettings({
      eqPreset: 'custom',
      eqBands: newBands,
    });
  };

  const handleReset = () => {
    handlePresetSelect('flat');
    updateSettings({ eqPreamp: 0, balance: 0, monoAudio: false });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-2xl glass-panel rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">10 段专业图形均衡器</h2>
              <p className="text-xs text-white/50">Hardware-accurate Web Audio Biquad Peaking Filters</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateSettings({ eqEnabled: !eqEnabled })}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                eqEnabled
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-white/10 text-white/50'
              }`}
            >
              {eqEnabled ? '已启用 (ON)' : '已旁通 (BYPASS)'}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full glass-pill flex items-center justify-center text-white/70 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Real-time spectrum visualizer banner */}
        <div className="my-5 h-16 w-full glass-card rounded-2xl p-2 flex items-end justify-between gap-1 overflow-hidden">
          {Array.from({ length: 32 }).map((_, i) => {
            const val = frequencyData[i] || 0;
            const heightPct = Math.min(100, Math.max(8, (val / 255) * 100));
            return (
              <div
                key={i}
                className="flex-1 rounded-t-sm transition-all duration-75"
                style={{
                  height: `${heightPct}%`,
                  background: `linear-gradient(to top, rgba(99,102,241,0.4), rgba(236,72,153,0.9))`,
                  opacity: eqEnabled ? 1 : 0.25,
                }}
              />
            );
          })}
        </div>

        {/* Preset Selector */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white/60 uppercase tracking-wider">预设音效</span>
            <button
              onClick={handleReset}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono"
            >
              <RotateCcw className="w-3 h-3" /> 重置为平直
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(EQ_PRESETS).map(([key, val]) => (
              <button
                key={key}
                onClick={() => handlePresetSelect(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  eqPreset === key
                    ? 'bg-white text-black font-bold shadow-md'
                    : 'glass-pill text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {val.label}
              </button>
            ))}
          </div>
        </div>

        {/* 10 Band Sliders */}
        <div className="grid grid-cols-10 gap-1.5 sm:gap-2 pt-2 pb-4">
          {EQ_FREQUENCIES.map((freq, idx) => {
            const gain = eqBands[idx] ?? 0;
            return (
              <div key={freq} className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-mono text-white/50">
                  {gain > 0 ? `+${gain.toFixed(0)}` : gain.toFixed(0)}
                </span>
                <div className="relative h-36 w-6 flex items-center justify-center">
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="0.5"
                    disabled={!eqEnabled}
                    value={gain}
                    onChange={(e) => handleBandChange(idx, parseFloat(e.target.value))}
                    className="h-32 w-2 appearance-none rounded-full bg-white/10 accent-indigo-400 cursor-pointer disabled:opacity-40 -rotate-90 origin-center"
                  />
                </div>
                <span className="text-[10px] font-mono font-medium text-white/70">
                  {EQ_LABELS[idx]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Preamp & Balance */}
        <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-white/60">前级增益 (Preamp)</span>
              <span className="font-mono text-indigo-400">{eqPreamp > 0 ? `+${eqPreamp}dB` : `${eqPreamp}dB`}</span>
            </div>
            <input
              type="range"
              min="-6"
              max="6"
              step="0.5"
              value={eqPreamp}
              onChange={(e) => updateSettings({ eqPreamp: parseFloat(e.target.value) })}
              className="w-full accent-indigo-500 bg-white/10 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-white/60">立体声平衡 (Balance)</span>
              <span className="font-mono text-indigo-400">
                {balance === 0 ? '居中' : balance < 0 ? `左 ${Math.abs(Math.round(balance * 100))}%` : `右 ${Math.round(balance * 100)}%`}
              </span>
            </div>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.05"
              value={balance}
              onChange={(e) => updateSettings({ balance: parseFloat(e.target.value) })}
              className="w-full accent-indigo-500 bg-white/10 h-1.5 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
