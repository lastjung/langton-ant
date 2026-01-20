export class AudioManager {
  constructor() {
    this.ctx = null;
    this.isEnabled = true; // Sound ON by default
    this.masterGain = null;
    this.volume = 0.1;
    this.waveform = 'piano'; // Default to piano
    
    // Frequencies (Pentatonic scale - pleasant sounding)
    this.notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77];
  }

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.volume;
    this.masterGain.connect(this.ctx.destination);
  }

  setVolume(val) {
    this.volume = parseFloat(val);
    if (this.masterGain) {
        this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.01);
    }
  }

  setWaveform(type) {
    this.waveform = type;
  }

  toggle() {
    if (!this.ctx) this.init();
    this.isEnabled = !this.isEnabled;
    return this.isEnabled;
  }

  playStep(state, volumeMultiplier = 1) {
    if (!this.isEnabled || !this.ctx) return;

    // Apply volume multiplier to base volume
    const adjustedVolume = Math.min(1, this.volume * volumeMultiplier);
    const freq = this.notes[state % this.notes.length];

    if (this.waveform === 'piano') {
      this.playPiano(freq, adjustedVolume);
    } else {
      this.playBasic(freq, adjustedVolume);
    }
  }

  playPiano(freq, volume) {
    const t = this.ctx.currentTime;
    const duration = 0.15;
    
    // Main oscillator
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // Piano-like: main frequency + slight detune for richness
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, t);
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, t); // Octave higher (harmonic)
    
    // Quick attack, medium decay - piano-like envelope
    const peakGain = volume;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(peakGain, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(peakGain * 0.3, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);
    
    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + duration);
    osc2.stop(t + duration);
  }

  playBasic(freq, volume) {
    const t = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = this.waveform;
    osc.frequency.setValueAtTime(freq, t);

    const peakGain = volume;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(peakGain, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.1);
  }
}
