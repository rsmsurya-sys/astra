/**
 * ARUNA STATION: Web Audio API Procedural Synthesizer
 * Zero-dependency acoustic engine synthesizing:
 * - Subsurface Sonar Pings (432 Hz harmonics)
 * - Lunar Habitat Ambient Drone
 * - Geiger counter / radiation static
 * - Entity acoustic resonance & communication tones
 * - Emergency Klaxon Alarms & Radio Beeps
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.ambientGain = null;
    this.isMuted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.startAmbientDrone();
    } else if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound() {
    this.isMuted = !this.isMuted;
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.15, this.ctx.currentTime);
    }
    return !this.isMuted;
  }

  // 1. Procedural Sonar PING (Sub-bass punch + 432 Hz resonant decay)
  playPing(isInterference = false) {
    if (this.isMuted) return;
    this.init();

    const t = this.ctx.currentTime;
    
    // Sub-bass thump
    const oscSub = this.ctx.createOscillator();
    const gainSub = this.ctx.createGain();
    oscSub.type = 'sine';
    oscSub.frequency.setValueAtTime(120, t);
    oscSub.frequency.exponentialRampToValueAtTime(35, t + 0.3);
    gainSub.gain.setValueAtTime(0.4, t);
    gainSub.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    oscSub.connect(gainSub);
    gainSub.connect(this.ctx.destination);
    oscSub.start(t);
    oscSub.stop(t + 0.4);

    // High Acoustic Ping (432 Hz or Distorted)
    const oscPing = this.ctx.createOscillator();
    const gainPing = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    oscPing.type = isInterference ? 'sawtooth' : 'sine';
    const baseFreq = isInterference ? 380 : 432;
    oscPing.frequency.setValueAtTime(baseFreq, t);
    oscPing.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, t + 0.08);
    oscPing.frequency.exponentialRampToValueAtTime(baseFreq, t + 0.25);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(baseFreq, t);
    filter.Q.setValueAtTime(isInterference ? 2 : 12, t);

    gainPing.gain.setValueAtTime(0.35, t);
    gainPing.gain.exponentialRampToValueAtTime(0.0001, t + (isInterference ? 0.7 : 1.8));

    oscPing.connect(filter);
    filter.connect(gainPing);
    gainPing.connect(this.ctx.destination);

    oscPing.start(t);
    oscPing.stop(t + 2.0);

    // Secondary harmonic echo
    if (!isInterference) {
      setTimeout(() => {
        if (this.isMuted) return;
        const t2 = this.ctx.currentTime;
        const oscEcho = this.ctx.createOscillator();
        const gainEcho = this.ctx.createGain();
        oscEcho.type = 'sine';
        oscEcho.frequency.setValueAtTime(864, t2); // octave harmonic
        gainEcho.gain.setValueAtTime(0.08, t2);
        gainEcho.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.9);
        oscEcho.connect(gainEcho);
        gainEcho.connect(this.ctx.destination);
        oscEcho.start(t2);
        oscEcho.stop(t2 + 1.0);
      }, 180);
    }
  }

  // 2. Ambient Habitat Rumble & Drone
  startAmbientDrone() {
    if (!this.ctx || this.ambientGain) return;
    const t = this.ctx.currentTime;
    
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.12, t);
    this.ambientGain.connect(this.ctx.destination);

    // Deep 48 Hz station foundation vibration
    const droneOsc = this.ctx.createOscillator();
    droneOsc.type = 'sine';
    droneOsc.frequency.setValueAtTime(48, t);

    // Air flow filter
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(110, t);

    droneOsc.connect(noiseFilter);
    noiseFilter.connect(this.ambientGain);
    droneOsc.start();
  }

  // 3. Entity Harmonic Resonance (First Contact 432 Hz chord)
  playEntityHarmonic(isPeaceful = true) {
    if (this.isMuted) return;
    this.init();
    const t = this.ctx.currentTime;

    const freqs = isPeaceful ? [432, 540, 648, 864] : [432, 458, 610, 890]; // Major chord vs dissonant tritone
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = isPeaceful ? 'sine' : 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.06 / (idx + 1), t + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 3.5);
    });
  }

  // 4. Geiger / Electromagnetic Spark
  playGeiger() {
    if (this.isMuted) return;
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1200 + Math.random() * 800, t);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.04);
  }

  // 5. Radio Beep & Interaction Chime
  playTerminalBeep() {
    if (this.isMuted) return;
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(950, t);
    osc.frequency.setValueAtTime(1400, t + 0.06);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  // 6. Emergency Klaxon Alert
  playKlaxon() {
    if (this.isMuted) return;
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.linearRampToValueAtTime(450, t + 0.4);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.5);
  }
}

// Global Sound Instance
window.soundEngine = new SoundEngine();
