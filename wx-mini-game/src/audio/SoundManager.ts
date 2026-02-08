/**
 * Procedural sound effects using Web Audio API.
 * Zero external audio files — all sounds are synthesized.
 */

export class SoundManager {
  private ctx: AudioContext | null = null;
  private windNode: OscillatorNode | null = null;
  private windGain: GainNode | null = null;
  private windNoise: AudioBufferSourceNode | null = null;
  private windNoiseGain: GainNode | null = null;
  private lastPedalTime = 0;
  private enabled = true;

  constructor() {
    try {
      // WeChat: wx.createWebAudioContext(), Browser: new AudioContext()
      if (typeof wx !== 'undefined' && (wx as any).createWebAudioContext) {
        this.ctx = (wx as any).createWebAudioContext();
      } else if (typeof AudioContext !== 'undefined') {
        this.ctx = new AudioContext();
      }
    } catch (_e) {
      this.ctx = null;
    }
  }

  private ensureContext(): AudioContext | null {
    if (!this.ctx || !this.enabled) return null;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /** Short click sound for pedaling */
  playPedal() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    if (now - this.lastPedalTime < 0.08) return; // Debounce
    this.lastPedalTime = now;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.05);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  /** High-pitched friction noise for braking */
  playBrake() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.12;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start(now);
  }

  /** Update continuous wind sound based on speed */
  updateWind(speed: number) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const volume = Math.min(0.04, (speed - 3) * 0.008);

    if (speed > 3) {
      if (!this.windNoise) {
        // Create noise buffer
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        this.windNoise = ctx.createBufferSource();
        this.windNoise.buffer = buffer;
        this.windNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400 + speed * 80;

        this.windNoiseGain = ctx.createGain();
        this.windNoiseGain.gain.value = volume;

        this.windNoise.connect(filter).connect(this.windNoiseGain).connect(ctx.destination);
        this.windNoise.start();
      } else if (this.windNoiseGain) {
        this.windNoiseGain.gain.setTargetAtTime(volume, ctx.currentTime, 0.1);
      }
    } else {
      this.stopWind();
    }
  }

  stopWind() {
    if (this.windNoise) {
      try { this.windNoise.stop(); } catch (_e) {}
      this.windNoise = null;
      this.windNoiseGain = null;
    }
  }

  /** Low boom + noise burst for crash */
  playCrash() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    this.stopWind();

    const now = ctx.currentTime;

    // Low boom
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.3);
    oscGain.gain.setValueAtTime(0.15, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(oscGain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);

    // Noise burst
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.1, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    noise.connect(noiseGain).connect(ctx.destination);
    noise.start(now);
  }

  /** Descending tone for game over */
  playGameOver() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [392, 349, 330, 262]; // G4, F4, E4, C4

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const t = now + i * 0.2;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  }

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stopWind();
    }
    return this.enabled;
  }

  get isEnabled() { return this.enabled; }
}
