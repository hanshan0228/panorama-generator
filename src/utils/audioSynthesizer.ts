/**
 * Web Audio API Procedural Ambient Soundscape Engine.
 * 100% Client-side synthetic soundscapes (Zero network downloads, zero latency).
 * Provides cinematic immersive audio for 360 VR spaces.
 */

export type AmbientSoundType = 'none' | 'ocean' | 'cyberpunk' | 'space' | 'breeze';

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentType: AmbientSoundType = 'none';
  private activeNodes: Array<AudioNode | { stop?: () => void }> = [];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.35;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime, 0.05);
    }
  }

  public play(type: AmbientSoundType) {
    this.stop();
    if (type === 'none') {
      this.currentType = 'none';
      return;
    }

    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    this.currentType = type;

    switch (type) {
      case 'ocean':
        this.createOceanWaves();
        break;
      case 'cyberpunk':
        this.createCyberpunkSynth();
        break;
      case 'space':
        this.createSpaceDrone();
        break;
      case 'breeze':
        this.createForestBreeze();
        break;
    }
  }

  public stop() {
    for (const node of this.activeNodes) {
      try {
        if ('stop' in node && typeof node.stop === 'function') {
          node.stop();
        }
        if ('disconnect' in node && typeof node.disconnect === 'function') {
          node.disconnect();
        }
      } catch {
        // Safe cleanup
      }
    }
    this.activeNodes = [];
    this.currentType = 'none';
  }

  public getCurrentType(): AmbientSoundType {
    return this.currentType;
  }

  // 1. Procedural Ocean Waves (Filtered Pink Noise with LFO)
  private createOceanWaves() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    // Buffer with pink noise
    const bufferSize = ctx.sampleRate * 3;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2) * 0.12;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Lowpass filter swept by an LFO (simulates wave crests coming and going)
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    const waveLfo = ctx.createOscillator();
    waveLfo.type = 'sine';
    waveLfo.frequency.value = 0.12; // 8.3-second wave cycle

    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 350;

    waveLfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const waveGain = ctx.createGain();
    waveGain.gain.value = 0.6;

    whiteNoise.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(this.masterGain);

    whiteNoise.start();
    waveLfo.start();

    this.activeNodes.push(whiteNoise, filter, waveLfo, lfoGain, waveGain);
  }

  // 2. Procedural Cyberpunk Drone (Warm detuned saws with lowpass warmth)
  private createCyberpunkSynth() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    const freqs = [65.41, 130.81, 196.0]; // C2, C3, G3 triad
    const masterTone = ctx.createGain();
    masterTone.gain.value = 0.4;
    masterTone.connect(this.masterGain);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;
    filter.connect(masterTone);

    for (const freq of freqs) {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      // Slight detune for analog warmth
      osc.detune.value = (Math.random() - 0.5) * 14;

      const oscGain = ctx.createGain();
      oscGain.gain.value = 0.25;

      osc.connect(oscGain);
      oscGain.connect(filter);
      osc.start();

      this.activeNodes.push(osc, oscGain);
    }

    this.activeNodes.push(filter, masterTone);
  }

  // 3. Procedural Deep Space Drone (Sub-bass resonant hum)
  private createSpaceDrone() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    const subOsc = ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.value = 48.0; // G1 deep sub

    const shimmerOsc = ctx.createOscillator();
    shimmerOsc.type = 'sine';
    shimmerOsc.frequency.value = 288.0; // D4 ethereal overtone
    shimmerOsc.detune.value = 6;

    const shimmerGain = ctx.createGain();
    shimmerGain.gain.value = 0.08;
    shimmerOsc.connect(shimmerGain);

    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.5;

    subOsc.connect(droneGain);
    shimmerGain.connect(droneGain);
    droneGain.connect(this.masterGain);

    subOsc.start();
    shimmerOsc.start();

    this.activeNodes.push(subOsc, shimmerOsc, shimmerGain, droneGain);
  }

  // 4. Procedural Forest Breeze (Soft airy wind flutter)
  private createForestBreeze() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.08;
    }

    const windSource = ctx.createBufferSource();
    windSource.buffer = noiseBuffer;
    windSource.loop = true;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 650;
    bandpass.Q.value = 2.0;

    const windGain = ctx.createGain();
    windGain.gain.value = 0.5;

    windSource.connect(bandpass);
    bandpass.connect(windGain);
    windGain.connect(this.masterGain);

    windSource.start();
    this.activeNodes.push(windSource, bandpass, windGain);
  }
}

export const soundEngine = new AmbientAudioEngine();
