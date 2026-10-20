import React from 'react';
import { useMusic } from '../context/MusicContext';
import { UiStyle, ThemeMode, TransitionMode } from '../types';
import {
  Palette,
  Sliders,
  Type,
  Sparkles,
  Volume2,
  RotateCcw,
  ShieldCheck,
  Check,
  Disc,
} from 'lucide-react';

export const SettingsUi: React.FC = () => {
  const { userSettings, updateSettings, resetToDemoTracks } = useMusic();
  const { playerFx } = userSettings;

  const UI_STYLES: { key: UiStyle; name: string; desc: string }[] = [
    { key: 'IOS', name: 'iOS 风格', desc: '液态玻璃质感、毛玻璃模糊与 SF 几何圆角' },
    { key: 'COLOROS', name: 'ColorOS 风格', desc: '水生流体动效、微拟物色谱与舒适胶囊卡片' },
    { key: 'HYPEROS', name: '澎湃 OS (HyperOS)', desc: '多维层次感、生动光影与系统级透光设计' },
    { key: 'MATERIAL', name: '原生 Android (Material You)', desc: '动态色彩取色器、高对比色彩与大圆角容器' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-8 select-none z-10 relative space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          偏好与系统设置
        </h1>
        <p className="text-xs text-white/50 mt-1">
          定制 Olbyine Music 的渲染界面、歌词动画、音频管线及视觉动效
        </p>
      </div>

      {/* 1. UI Style Selector */}
      <section className="glass-card rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <Palette className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white">界面设计语言 (UI Design Style)</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {UI_STYLES.map((style) => {
            const active = userSettings.uiStyle === style.key;
            return (
              <div
                key={style.key}
                onClick={() => updateSettings({ uiStyle: style.key })}
                className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                  active
                    ? 'bg-indigo-600/30 border-indigo-400/60 shadow-lg'
                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-bold ${active ? 'text-indigo-300' : 'text-white'}`}>
                    {style.name}
                  </span>
                  {active && <Check className="w-4 h-4 text-indigo-400" />}
                </div>
                <p className="text-xs text-white/50">{style.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. AMLL Synced Lyrics Engine */}
      <section className="glass-card rounded-3xl p-6 space-y-5">
        <div className="flex items-center gap-2.5">
          <Type className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white">AMLL 逐字歌词引擎 (Lyrics Engine)</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Font size */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-white/70">歌词字号大小</span>
              <span className="font-mono text-indigo-400 font-bold">{userSettings.lyricFontSize}px</span>
            </div>
            <input
              type="range"
              min="20"
              max="54"
              value={userSettings.lyricFontSize}
              onChange={(e) => updateSettings({ lyricFontSize: parseInt(e.target.value) })}
              className="w-full accent-indigo-500 bg-white/10 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Inactive opacity */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-white/70">非当前行透明度</span>
              <span className="font-mono text-indigo-400 font-bold">
                {Math.round(userSettings.lyricInactiveOpacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.8"
              step="0.05"
              value={userSettings.lyricInactiveOpacity}
              onChange={(e) => updateSettings({ lyricInactiveOpacity: parseFloat(e.target.value) })}
              className="w-full accent-indigo-500 bg-white/10 h-1.5 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <label className="flex items-center justify-between p-3 rounded-2xl bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
            <div>
              <span className="text-xs font-semibold text-white block">显示歌词翻译 (Translation)</span>
              <span className="text-[11px] text-white/40">外文歌词下方渲染中文/双语翻译</span>
            </div>
            <input
              type="checkbox"
              checked={userSettings.lyricTranslation}
              onChange={(e) => updateSettings({ lyricTranslation: e.target.checked })}
              className="w-4 h-4 accent-indigo-500 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
            <div>
              <span className="text-xs font-semibold text-white block">显示罗马音 (Romanization)</span>
              <span className="text-[11px] text-white/40">日韩语等歌词渲染注音/罗马字</span>
            </div>
            <input
              type="checkbox"
              checked={userSettings.lyricRomanization}
              onChange={(e) => updateSettings({ lyricRomanization: e.target.checked })}
              className="w-4 h-4 accent-indigo-500 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
            <div>
              <span className="text-xs font-semibold text-white block">非当前行景深模糊 (Line Blur)</span>
              <span className="text-[11px] text-white/40">对非唱行添加柔和的高斯模糊</span>
            </div>
            <input
              type="checkbox"
              checked={userSettings.lyricBlur}
              onChange={(e) => updateSettings({ lyricBlur: e.target.checked })}
              className="w-4 h-4 accent-indigo-500 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
            <div>
              <span className="text-xs font-semibold text-white block">双击跳转歌词时间 (Double Tap Seek)</span>
              <span className="text-[11px] text-white/40">防误触，连击两次某行定位播放</span>
            </div>
            <input
              type="checkbox"
              checked={userSettings.lyricDoubleTapSeek}
              onChange={(e) => updateSettings({ lyricDoubleTapSeek: e.target.checked })}
              className="w-4 h-4 accent-indigo-500 rounded"
            />
          </label>
        </div>
      </section>

      {/* 3. Audio & Transition Mode */}
      <section className="glass-card rounded-3xl p-6 space-y-5">
        <div className="flex items-center gap-2.5">
          <Volume2 className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white">音频输出与切歌过渡 (Audio & Transitions)</h2>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-semibold text-white block">歌曲过渡效果 (Transition Mode)</span>
              <span className="text-[11px] text-white/40">平滑淡出上一首并淡入下一首</span>
            </div>
            <div className="flex gap-1.5">
              {(['OFF', 'CROSSFADE', 'AUTOMIX'] as TransitionMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => updateSettings({ transitionMode: mode })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    userSettings.transitionMode === mode
                      ? 'bg-white text-black font-bold'
                      : 'glass-pill text-white/60 hover:text-white'
                  }`}
                >
                  {mode === 'OFF' ? '无缝衔接' : mode === 'CROSSFADE' ? '淡入淡出' : '自动过渡'}
                </button>
              ))}
            </div>
          </div>

          {userSettings.transitionMode === 'CROSSFADE' && (
            <div className="space-y-2 p-3 rounded-2xl bg-white/5">
              <div className="flex justify-between text-xs">
                <span className="text-white/70">淡入淡出时长</span>
                <span className="font-mono text-indigo-400 font-bold">{userSettings.crossfadeSeconds} 秒</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={userSettings.crossfadeSeconds}
                onChange={(e) => updateSettings({ crossfadeSeconds: parseInt(e.target.value) })}
                className="w-full accent-indigo-500 bg-white/10 h-1.5 rounded-lg cursor-pointer"
              />
            </div>
          )}

          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5">
            <div>
              <span className="text-xs font-semibold text-white block">USB 位完美音频直通 (Bit-Perfect)</span>
              <span className="text-[11px] text-white/40">绕过系统混音器重采样，点对点输送 PCM 信号</span>
            </div>
            <input
              type="checkbox"
              checked={userSettings.usbBitPerfectEnabled}
              onChange={(e) => updateSettings({ usbBitPerfectEnabled: e.target.checked })}
              className="w-4 h-4 accent-indigo-500 rounded"
            />
          </div>
        </div>
      </section>

      {/* 4. PlayerFx Visual Effects */}
      <section className="glass-card rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white">播放器特色视觉动效 (PlayerFx)</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { key: 'titleReveal', label: '标题模糊显现 (BlurText)', desc: '切歌时歌名逐字由模糊聚焦清晰' },
            { key: 'heartBurst', label: '收藏脉冲 (Heart Burst)', desc: '点红心时迸出流光火花与粒子' },
            { key: 'coverTilt', label: '封面 3D 倾斜反光 (Cover Tilt)', desc: '鼠标或手势拖拽时呈现立体光泽与反光' },
            { key: 'elasticSeek', label: '弹性进度条 (Elastic Slider)', desc: '进度条拖动时提供物理弹性形变' },
            { key: 'rollingTime', label: '时间数字逐位滚动 (Counter)', desc: '时间码像仪表盘逐位翻滚' },
            { key: 'badgeShine', label: '音质标签流光 (Badge Shine)', desc: 'Hi-Res 标签上持续扫过一道高光' },
            { key: 'filmGrain', label: '胶片颗粒噪点 (Film Grain)', desc: '背景叠一层细微胶片噪点减轻渐变色带' },
            { key: 'shredder', label: '队列碎纸机 (Shredder)', desc: '删除待播歌曲时触发卷纸撕碎动画' },
          ].map((fx) => {
            const isEnabled = (playerFx as any)[fx.key];
            return (
              <label
                key={fx.key}
                className="flex items-center justify-between p-3 rounded-2xl bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
              >
                <div>
                  <span className="text-xs font-semibold text-white block">{fx.label}</span>
                  <span className="text-[11px] text-white/40">{fx.desc}</span>
                </div>
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) =>
                    updateSettings({
                      playerFx: {
                        ...playerFx,
                        [fx.key]: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 accent-indigo-500 rounded"
                />
              </label>
            );
          })}
        </div>
      </section>

      {/* 5. Reset & Storage */}
      <section className="glass-card rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white">重置与恢复示例曲目</h3>
          <p className="text-xs text-white/50 mt-0.5">
            重新载入自带的 5 首全格式 Hi-Res 母带演示曲目及逐字同步歌词
          </p>
        </div>
        <button
          onClick={resetToDemoTracks}
          className="px-4 py-2 rounded-2xl glass-pill text-xs font-semibold text-white/80 hover:text-white hover:bg-white/20 transition-all flex items-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" /> 恢复演示曲库
        </button>
      </section>
    </div>
  );
};
