let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(m: boolean) {
  muted = m;
}

function ac(): AudioContext | null {
  if (muted) return null;
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, dur: number, type: OscillatorType, vol: number, when = 0, slideTo?: number) {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime + when;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export type SfxKind = "click" | "buy" | "upgrade" | "gold" | "achieve" | "error" | "transplant";

export function playSfx(kind: SfxKind) {
  switch (kind) {
    case "click":
      tone(520 + Math.random() * 160, 0.09, "triangle", 0.06, 0, 300);
      break;
    case "buy":
      tone(392, 0.09, "square", 0.045);
      tone(523, 0.12, "square", 0.045, 0.07);
      break;
    case "upgrade":
      tone(440, 0.08, "square", 0.045);
      tone(554, 0.08, "square", 0.045, 0.06);
      tone(659, 0.14, "square", 0.05, 0.12);
      break;
    case "gold":
      tone(880, 0.1, "sine", 0.06);
      tone(1174, 0.1, "sine", 0.06, 0.08);
      tone(1568, 0.22, "sine", 0.06, 0.16);
      break;
    case "achieve":
      tone(523, 0.1, "triangle", 0.06);
      tone(659, 0.1, "triangle", 0.06, 0.09);
      tone(784, 0.1, "triangle", 0.06, 0.18);
      tone(1046, 0.28, "triangle", 0.06, 0.27);
      break;
    case "error":
      tone(180, 0.12, "sawtooth", 0.04, 0, 120);
      break;
    case "transplant":
      tone(262, 0.3, "sine", 0.07);
      tone(330, 0.3, "sine", 0.07, 0.14);
      tone(392, 0.3, "sine", 0.07, 0.28);
      tone(523, 0.55, "sine", 0.08, 0.42);
      break;
  }
}
