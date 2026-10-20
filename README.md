# Olbyine Music (Web / React)

Olbyine Music 是一个现代高保真本地与流媒体音乐播放器，重构自原 Android Kotlin 项目并基于 **React 19**、**TypeScript**、**Tailwind CSS** 与 **Web Audio API** 构建。

## 核心特性

- **逐字同步歌词 (AMLL 引擎)**：
  - Apple Music 风格 syllable-by-syllable 逐字卡拉OK流光动效
  - 间奏倒计时小圆点动画 (Interlude Dots)
  - 翻译与罗马音（Romaji）双语支持与独立缩放
  - 景深模糊、双击/单击跳转时间轴
- **本地音乐库管理**：
  - 支持本地音频文件导入（MP3、FLAC、WAV、ALAC、AAC、OGG）
  - 专辑三种浏览模式：标准网格 (Grid)、3D 封面流 (Cover Flow)、交互式 3D 球形唱片墙 (Spherical 3D)
  - 歌曲搜索、按歌曲名/艺术家/专辑/播放次数排序
  - 歌单创建与管理、红心特别喜爱
- **流媒体与云端服务**：
  - 网易云音乐发现推荐、飙升榜与热歌榜
  - SoundCloud 热门流派探索与串流
  - Navidrome / Subsonic 服务器私有云串流
  - WebDAV / NAS 私有存储挂载
- **专业级音频处理与特效 (Audio FX)**：
  - 10 段专业图形均衡器 (Web Audio API 真实 Biquad Peaking Filters: 31Hz - 16kHz)
  - 预设音效（平直、低音增强、高音增强、人声、摇滚、电子、流行等）
  - 前级增益 (Preamp) 与立体声平衡 (Stereo Balance) 调节
  - 歌曲淡入淡出过渡 (Crossfade / Automix)
  - 实时音频频谱可视化与节拍脉冲 (Audio Energy Beat Pulse)
- **多系统界面风格与视觉动效 (PlayerFx)**：
  - 4 种系统风格自由切换：iOS（液态玻璃）、ColorOS（水生流体）、澎湃 OS (HyperOS)、原生 Android (Material You)
  - 专辑封面 3D 悬浮倾斜与高光反光 (Cover Tilt & Glare)
  - 标题逐字聚焦显现 (Title Reveal BlurText)
  - 进度时间数字滚动 (Rolling Counter)
  - 收藏心形粒子脉冲 (Heart Burst Confetti)
  - 播放队列碎纸机粉碎动画 (Queue Shredder)
  - 胶片噪点与自适应封面流体背景 (Fluid Mesh Backdrop)

## 本地运行

```bash
npm install
npm run dev
```

访问 `http://localhost:3000` 即可开始使用。
