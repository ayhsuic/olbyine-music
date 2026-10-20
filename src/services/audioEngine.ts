import { EQ_FREQUENCIES } from '../utils/eqConstants';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private audioElement: HTMLAudioElement;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private filters: BiquadFilterNode[] = [];
  private preampGain: GainNode | null = null;
  private pannerNode: StereoPannerNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  
  // Procedural synthesizer state for demo songs
  private isSynthesizing = false;
  private synthInterval: number | null = null;
  private synthGain: GainNode | null = null;
  private synthStartTime = 0;
  private synthOffset = 0;
  private synthTempo = 110;

  constructor() {
    this.audioElement = new Audio();
    this.audioElement.crossOrigin = 'anonymous';
    this.audioElement.preload = 'auto';
  }

  private initContext() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();

    // Create 10 EQ BiquadFilterNodes
    this.filters = EQ_FREQUENCIES.map((freq) => {
      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'peaking';
      filter.frequency.value = freq;
      filter.Q.value = 1.4;
      filter.gain.value = 0;
      return filter;
    });

    this.preampGain = this.ctx.createGain();
    this.preampGain.gain.value = 1.0;

    if (this.ctx.createStereoPanner) {
      this.pannerNode = this.ctx.createStereoPanner();
      this.pannerNode.pan.value = 0;
    }

    this.analyserNode = this.ctx.createAnalyser();
    this.analyserNode.fftSize = 64;
    this.analyserNode.smoothingTimeConstant = 0.8;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 1.0;

    // Synth gain node into the same effects chain
    this.synthGain = this.ctx.createGain();
    this.synthGain.gain.value = 0.35;
    this.synthGain.connect(this.preampGain);

    // Chain: Preamp -> Filter 0 -> Filter 1 -> ... -> Filter 9 -> Panner -> Analyser -> MasterGain -> Destination
    let prevNode: AudioNode = this.preampGain;
    for (const filter of this.filters) {
      prevNode.connect(filter);
      prevNode = filter;
    }

    if (this.pannerNode) {
      prevNode.connect(this.pannerNode);
      this.pannerNode.connect(this.analyserNode);
    } else {
      prevNode.connect(this.analyserNode);
    }

    this.analyserNode.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    // Connect HTML Audio Element
    try {
      this.sourceNode = this.ctx.createMediaElementSource(this.audioElement);
      this.sourceNode.connect(this.preampGain);
    } catch (e) {
      console.warn('Audio element source already connected or unsupported:', e);
    }
  }

  public async resumeContext(): Promise<void> {
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  public getAudioElement(): HTMLAudioElement {
    return this.audioElement;
  }

  public setVolume(vol: number): void {
    const clamped = Math.max(0, Math.min(1, vol));
    this.audioElement.volume = clamped;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.05);
    }
  }

  public setEqEnabled(enabled: boolean, bands: number[], preampDb = 0): void {
    this.initContext();
    if (!this.ctx) return;

    const preampFactor = enabled ? Math.pow(10, preampDb / 20) : 1.0;
    if (this.preampGain) {
      this.preampGain.gain.setTargetAtTime(preampFactor, this.ctx.currentTime, 0.05);
    }

    this.filters.forEach((filter, idx) => {
      const gainValue = enabled ? (bands[idx] ?? 0) : 0;
      filter.gain.setTargetAtTime(gainValue, this.ctx!.currentTime, 0.05);
    });
  }

  public setBalance(pan: number): void {
    this.initContext();
    if (this.pannerNode && this.ctx) {
      const clamped = Math.max(-1, Math.min(1, pan));
      this.pannerNode.pan.setTargetAtTime(clamped, this.ctx.currentTime, 0.05);
    }
  }

  public getFrequencyData(): Uint8Array {
    if (!this.analyserNode) {
      return new Uint8Array(32).fill(0);
    }
    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(dataArray);
    return dataArray;
  }

  public getEnergy(): number {
    const freqs = this.getFrequencyData();
    if (freqs.length === 0) return 0;
    // Calculate average low-mid energy
    let sum = 0;
    const count = Math.min(freqs.length, 12);
    for (let i = 0; i < count; i++) {
      sum += freqs[i];
    }
    return sum / (count * 255);
  }

  // --- Procedural Synth for demo songs with zero network dependency ---
  public playProcedural(
    onProgress: (posMs: number) => void,
    startOffsetMs = 0,
    tempo = 118,
    style = 'synth'
  ): void {
    this.resumeContext();
    this.stopProcedural();
    this.audioElement.pause();

    this.isSynthesizing = true;
    this.synthTempo = tempo;
    this.synthOffset = startOffsetMs;
    this.synthStartTime = performance.now();

    const chords = [
      [261.63, 329.63, 392.0, 523.25], // C maj
      [220.0, 261.63, 329.63, 440.0],  // A min
      [174.61, 220.0, 261.63, 349.23], // F maj
      [196.0, 246.94, 293.66, 392.0],  // G maj
    ];

    let beat = Math.floor((startOffsetMs / 1000) * (tempo / 60));

    const stepInterval = (60 / tempo) * 1000 * 0.5; // eighth notes

    this.synthInterval = window.setInterval(() => {
      if (!this.isSynthesizing || !this.ctx) return;
      const nowMs = this.synthOffset + (performance.now() - this.synthStartTime);
      onProgress(nowMs);

      // Play note every eighth note
      const currentChord = chords[Math.floor(beat / 8) % chords.length];
      const noteFreq = currentChord[beat % currentChord.length];

      try {
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        osc.type = style === 'lofi' ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(noteFreq * (beat % 4 === 0 ? 0.5 : 1), this.ctx.currentTime);

        noteGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
        noteGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

        osc.connect(noteGain);
        if (this.synthGain) {
          noteGain.connect(this.synthGain);
        }

        osc.start();
        osc.stop(this.ctx.currentTime + 0.36);

        // Add sub-bass thump on quarter beats
        if (beat % 2 === 0) {
          const kick = this.ctx.createOscillator();
          const kickGain = this.ctx.createGain();
          kick.frequency.setValueAtTime(110, this.ctx.currentTime);
          kick.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.15);
          kickGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
          kickGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.16);
          kick.connect(kickGain);
          if (this.synthGain) kickGain.connect(this.synthGain);
          kick.start();
          kick.stop(this.ctx.currentTime + 0.17);
        }
      } catch (err) {
        // Audio context may be closed or suspended
      }

      beat++;
    }, stepInterval);
  }

  public pauseProcedural(): void {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    this.isSynthesizing = false;
  }

  public stopProcedural(): void {
    this.pauseProcedural();
    this.synthOffset = 0;
  }

  public isProceduralPlaying(): boolean {
    return this.isSynthesizing;
  }
}

export const audioEngine = new AudioEngine();
