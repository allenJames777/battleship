// ── Sound Manager (Web Audio API — no files needed) ───────

const SoundManager = (() => {
  let ctx = null;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }

  function playTone(freq, duration, type = 'sine', volume = 0.3) {
    try {
      const c = getCtx();
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(volume, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start();
      osc.stop(c.currentTime + duration);
    } catch (e) {}
  }

  function playNoise(duration, volume = 0.2) {
    try {
      const c = getCtx();
      const bufferSize = c.sampleRate * duration;
      const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
      }
      const source = c.createBufferSource();
      source.buffer = buffer;
      const gain = c.createGain();
      gain.gain.setValueAtTime(volume, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
      source.connect(gain);
      gain.connect(c.destination);
      source.start();
    } catch (e) {}
  }

  return {
    playFire() {
      // Cannon boom: low rumble + noise burst
      playTone(80, 0.4, 'sawtooth', 0.4);
      playNoise(0.3, 0.3);
    },

    playHit() {
      // Explosion: descending tone + noise
      playTone(400, 0.15, 'square', 0.3);
      playTone(200, 0.3, 'sawtooth', 0.25);
      playNoise(0.4, 0.25);
    },

    playMiss() {
      // Water splash: short noise + high blip
      playNoise(0.25, 0.15);
      playTone(600, 0.08, 'sine', 0.15);
    },

    playSunk() {
      // Big explosion: long rumble + descending tones
      playTone(300, 0.15, 'square', 0.35);
      setTimeout(() => playTone(150, 0.3, 'sawtooth', 0.3), 100);
      setTimeout(() => playTone(80, 0.5, 'sawtooth', 0.25), 200);
      setTimeout(() => playNoise(0.6, 0.3), 50);
    },

    playWin() {
      // Victory fanfare: ascending tones
      playTone(523, 0.2, 'square', 0.2);
      setTimeout(() => playTone(659, 0.2, 'square', 0.2), 150);
      setTimeout(() => playTone(784, 0.2, 'square', 0.2), 300);
      setTimeout(() => playTone(1047, 0.4, 'square', 0.25), 450);
    },

    playLose() {
      // Defeat: descending sad tones
      playTone(400, 0.3, 'sine', 0.2);
      setTimeout(() => playTone(350, 0.3, 'sine', 0.2), 250);
      setTimeout(() => playTone(300, 0.3, 'sine', 0.2), 500);
      setTimeout(() => playTone(200, 0.6, 'sine', 0.15), 750);
    },

    playPlace() {
      // Click/clunk: short metallic tap
      playTone(800, 0.05, 'square', 0.2);
      playTone(400, 0.1, 'triangle', 0.15);
    },
  };
})();
