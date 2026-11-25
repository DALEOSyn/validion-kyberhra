/** Optional short beeps (off by default). Generated locally with WebAudio: no audio files, no network. */
let ctx: AudioContext | null = null;
let enabled = false;

export function setSound(on: boolean): void {
  enabled = on;
}

export function beep(freq: number, seconds: number, type: OscillatorType = 'triangle'): void {
  if (!enabled) return;
  try {
    ctx ??= new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.08, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + seconds);
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + seconds);
  } catch {
    /* sound is optional */
  }
}
