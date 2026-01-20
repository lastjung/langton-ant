export class AudioManager {
  constructor() {
    this.ctx = null;
    this.isEnabled = false;
    this.masterGain = null;
    this.volume = 0.1;
    this.waveform = 'triangle';
    
    // Frequencies (Pentatonic)
    this.notes = [440.00, 493.88, 523.25, 587.33, 659.25, 783.99, 880.00];
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

  playStep(state) {
    if (!this.isEnabled || !this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = this.waveform;
    const freq = this.notes[state % this.notes.length];
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    // Envelope
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }
}
