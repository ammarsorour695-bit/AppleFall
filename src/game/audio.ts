/*
 * Sound effects sourced from freesound.org preview clips.
 *
 *  - "pop.ogg"      by birdOfTheNorth  — https://freesound.org/people/birdOfTheNorth/sounds/572540/  (CC0)
 *  - "cha ching.wav" by creek23        — https://freesound.org/people/creek23/sounds/75235/          (CC BY-NC 4.0)
 *  - "Levelup.wav"  by Seidhepriest    — https://freesound.org/people/Seidhepriest/sounds/382915/    (CC BY-NC 4.0)
 *
 * Variations (pitch, layering, trim) are derived at runtime.
 */

type Src = "pop" | "chaching" | "chime";

const SOURCES: Record<Src, { url: string; vol: number }> = {
  pop: { url: "https://cdn.freesound.org/previews/572/572540_12923717-hq.mp3", vol: 0.5 },
  chaching: { url: "https://cdn.freesound.org/previews/75/75235_778044-hq.mp3", vol: 0.42 },
  chime: { url: "https://cdn.freesound.org/previews/382/382915_736471-hq.mp3", vol: 0.34 },
};

const POOL_SIZE = 3;
const pools: Partial<Record<Src, HTMLAudioElement[]>> = {};
const cursors: Record<Src, number> = { pop: 0, chaching: 0, chime: 0 };
const trims = new WeakMap<HTMLAudioElement, number>();

let muted = false;

export function setMuted(m: boolean) {
  muted = m;
}

function getPool(src: Src): HTMLAudioElement[] {
  let pool = pools[src];
  if (!pool) {
    pool = Array.from({ length: POOL_SIZE }, () => {
      const el = new Audio(SOURCES[src].url);
      el.preload = "auto";
      el.addEventListener("timeupdate", () => {
        const t = trims.get(el);
        if (t !== undefined && el.currentTime >= t) {
          el.pause();
        }
      });
      return el;
    });
    pools[src] = pool;
  }
  return pool;
}

function play(src: Src, opts: { rate?: number; rand?: number; trim?: number; vol?: number } = {}) {
  if (muted) return;
  try {
    const pool = getPool(src);
    const el = pool[cursors[src] % POOL_SIZE];
    cursors[src] = (cursors[src] + 1) % POOL_SIZE;
    const { rate = 1, rand = 0, trim, vol } = opts;
    el.volume = vol ?? SOURCES[src].vol;
    el.playbackRate = Math.max(0.25, rate + (Math.random() * 2 - 1) * rand);
    if (trim !== undefined) trims.set(el, trim);
    else trims.delete(el);
    el.currentTime = 0;
    void el.play().catch(() => {
      /* autoplay policy — ignore */
    });
  } catch {
    /* audio unavailable — stay silent */
  }
}

export type SfxKind = "click" | "buy" | "upgrade" | "gold" | "achieve" | "error" | "transplant";

export function playSfx(kind: SfxKind) {
  switch (kind) {
    case "click":
      play("pop", { rate: 0.95, rand: 0.2 });
      break;
    case "buy":
      play("chaching", { rate: 1, rand: 0.04 });
      break;
    case "upgrade":
      play("chime", { trim: 2.4, rate: 1.02 });
      break;
    case "gold":
      play("chaching", { rate: 1.12, vol: 0.45 });
      play("chime", { trim: 3, rate: 1.06, vol: 0.3 });
      break;
    case "achieve":
      play("chime", { trim: 3.4, rate: 1 });
      break;
    case "error":
      play("pop", { rate: 0.45, rand: 0, vol: 0.42 });
      break;
    case "transplant":
      play("chime", { trim: 6, rate: 0.94, vol: 0.36 });
      play("chaching", { rate: 0.9, vol: 0.3 });
      break;
  }
}
