import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ACHIEVEMENTS,
  ACHIEVEMENT_BONUS,
  COST_GROWTH,
  GENERATORS,
  PRESTIGE_BASE,
  SEED_BONUS,
  UPGRADES,
  type RunStats,
} from "./data";
import { formatNumber } from "./format";
import { playSfx, setMuted } from "./audio";

export interface Buff {
  kind: "frenzy" | "surge";
  mult: number;
  endsAt: number;
}

export interface GoldenApple {
  id: number;
  topPct: number;
  startedAt: number;
  durMs: number;
}

export interface Toast {
  id: number;
  title: string;
  desc: string;
  kind: "achieve" | "gold" | "info";
}

export interface GameState {
  apples: number;
  lifetime: number;
  allTime: number;
  handPicked: number;
  totalClicks: number;
  goldenClicked: number;
  owned: Record<string, number>;
  upgrades: string[];
  achievements: string[];
  seeds: number;
  transplants: number;
  buffs: Buff[];
  golden: GoldenApple | null;
  nextGoldenAt: number;
  muted: boolean;
  buyQty: 1 | 10 | "max";
  startTime: number;
  playSeconds: number;
  lastSeen: number;
  lastTick: number;
}

const SAVE_KEY = "applefall-save-v1";

function freshState(): GameState {
  const now = Date.now();
  return {
    apples: 0,
    lifetime: 0,
    allTime: 0,
    handPicked: 0,
    totalClicks: 0,
    goldenClicked: 0,
    owned: {},
    upgrades: [],
    achievements: [],
    seeds: 0,
    transplants: 0,
    buffs: [],
    golden: null,
    nextGoldenAt: now + 50_000 + Math.random() * 40_000,
    muted: false,
    buyQty: 1,
    startTime: now,
    playSeconds: 0,
    lastSeen: now,
    lastTick: now,
  };
}

/* ------------------------------ pure calculations ------------------------------ */

export function genCost(baseCost: number, owned: number, qty: number): number {
  return Math.ceil((baseCost * Math.pow(COST_GROWTH, owned) * (Math.pow(COST_GROWTH, qty) - 1)) / (COST_GROWTH - 1));
}

export function maxAffordable(baseCost: number, owned: number, money: number): number {
  const first = baseCost * Math.pow(COST_GROWTH, owned);
  if (money < first) return 0;
  return Math.floor(Math.log((money * (COST_GROWTH - 1)) / first + 1) / Math.log(COST_GROWTH));
}

export function seedsFor(lifetime: number): number {
  if (lifetime < PRESTIGE_BASE) return 0;
  return Math.floor(Math.sqrt(lifetime / PRESTIGE_BASE));
}

export interface Derived {
  aps: number;
  clickPower: number;
  globalMult: number;
  frenzyMult: number;
  surgeMult: number;
  genAps: Record<string, number>;
  genMult: Record<string, number>;
}

export function computeDerived(s: GameState): Derived {
  let clickMult = 1;
  let globalMult = 1;
  let synergyPct = 0;
  const genMult: Record<string, number> = {};
  for (const id of s.upgrades) {
    const u = UPGRADES.find((x) => x.id === id);
    if (!u) continue;
    if (u.kind === "click") clickMult *= u.mult ?? 1;
    else if (u.kind === "global") globalMult *= u.mult ?? 1;
    else if (u.kind === "synergy") synergyPct += u.pct ?? 0;
    else if (u.kind === "gen" && u.target) genMult[u.target] = (genMult[u.target] ?? 1) * (u.mult ?? 1);
  }
  globalMult *= 1 + s.seeds * SEED_BONUS;
  globalMult *= 1 + s.achievements.length * ACHIEVEMENT_BONUS;

  const now = Date.now();
  let frenzyMult = 1;
  let surgeMult = 1;
  for (const b of s.buffs) {
    if (b.endsAt > now) {
      if (b.kind === "frenzy") frenzyMult *= b.mult;
      else surgeMult *= b.mult;
    }
  }

  const genAps: Record<string, number> = {};
  let aps = 0;
  for (const gen of GENERATORS) {
    const count = s.owned[gen.id] ?? 0;
    if (count <= 0) continue;
    const v = count * gen.baseAps * (genMult[gen.id] ?? 1) * globalMult * frenzyMult;
    genAps[gen.id] = v;
    aps += v;
  }

  const clickPower = clickMult * globalMult * surgeMult + aps * synergyPct;
  return { aps, clickPower, globalMult, frenzyMult, surgeMult, genAps, genMult };
}

function runStats(s: GameState, aps: number): RunStats {
  let ownedGenerators = 0;
  for (const k in s.owned) ownedGenerators += s.owned[k];
  return {
    lifetime: s.lifetime,
    allTime: s.allTime,
    totalClicks: s.totalClicks,
    goldenClicked: s.goldenClicked,
    handPicked: s.handPicked,
    owned: s.owned,
    ownedGenerators,
    upgradesOwned: s.upgrades.length,
    achievementsOwned: s.achievements.length,
    seeds: s.seeds,
    transplants: s.transplants,
    aps,
    playSeconds: s.playSeconds,
  };
}

/* --------------------------------- persistence --------------------------------- */

function serialize(s: GameState): string {
  const { golden: _g, lastTick: _t, ...rest } = s;
  void _g;
  void _t;
  return JSON.stringify({ ...rest, lastTick: Date.now() });
}

function loadState(): { state: GameState; offlineGain: number; offlineSeconds: number } {
  const base = freshState();
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return { state: base, offlineGain: 0, offlineSeconds: 0 };
    const parsed = JSON.parse(raw) as Partial<GameState>;
    const s: GameState = {
      ...base,
      ...parsed,
      owned: parsed.owned ?? {},
      upgrades: parsed.upgrades ?? [],
      achievements: parsed.achievements ?? [],
      buffs: Array.isArray(parsed.buffs) ? parsed.buffs.filter((b) => b.endsAt > Date.now()) : [],
      golden: null,
      nextGoldenAt: Date.now() + 40_000 + Math.random() * 50_000,
      lastTick: Date.now(),
    };
    const away = Math.max(0, (Date.now() - (parsed.lastSeen ?? Date.now())) / 1000);
    let offlineGain = 0;
    if (away > 45) {
      const d = computeDerived(s);
      const capped = Math.min(away, 8 * 3600);
      offlineGain = d.aps * capped * 0.5;
      if (offlineGain > 0) {
        s.apples += offlineGain;
        s.lifetime += offlineGain;
        s.allTime += offlineGain;
      }
    }
    return { state: s, offlineGain, offlineSeconds: Math.min(away, 8 * 3600) };
  } catch {
    return { state: base, offlineGain: 0, offlineSeconds: 0 };
  }
}

/* ------------------------------------ hook ------------------------------------- */

let toastId = 1;

export function useGame() {
  const loadedRef = useRef<{ state: GameState; offlineGain: number; offlineSeconds: number } | null>(null);
  if (!loadedRef.current) loadedRef.current = loadState();

  const stateRef = useRef<GameState>(loadedRef.current.state);
  const [version, setVersion] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [offlineInfo, setOfflineInfo] = useState<{ gain: number; seconds: number } | null>(
    loadedRef.current.offlineGain > 0
      ? { gain: loadedRef.current.offlineGain, seconds: loadedRef.current.offlineSeconds }
      : null,
  );

  const s = stateRef.current;
  setMuted(s.muted);

  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const pushToast = useCallback((t: Omit<Toast, "id">) => {
    const id = toastId++;
    setToasts((prev) => [...prev.slice(-3), { ...t, id }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4600);
  }, []);

  const save = useCallback(() => {
    try {
      stateRef.current.lastSeen = Date.now();
      localStorage.setItem(SAVE_KEY, serialize(stateRef.current));
    } catch {
      /* storage unavailable */
    }
  }, []);

  /* main loop */
  useEffect(() => {
    let saveTimer = 0;
    const id = window.setInterval(() => {
      const st = stateRef.current;
      const now = Date.now();
      const dt = Math.min((now - st.lastTick) / 1000, 5);
      st.lastTick = now;
      st.playSeconds += dt;

      const d = computeDerived(st);
      const gain = d.aps * dt;
      if (gain > 0) {
        st.apples += gain;
        st.lifetime += gain;
        st.allTime += gain;
      }

      st.buffs = st.buffs.filter((b) => b.endsAt > now);

      if (st.golden && now - st.golden.startedAt > st.golden.durMs) st.golden = null;
      if (!st.golden && now >= st.nextGoldenAt) {
        st.golden = {
          id: now,
          topPct: 10 + Math.random() * 42,
          startedAt: now,
          durMs: 11_000 + Math.random() * 4000,
        };
        st.nextGoldenAt = now + 50_000 + Math.random() * 60_000;
      }

      // achievements
      const rs = runStats(st, d.aps);
      for (const a of ACHIEVEMENTS) {
        if (!st.achievements.includes(a.id) && a.test(rs)) {
          st.achievements.push(a.id);
          pushToast({ title: `Award: ${a.name}`, desc: `${a.desc} (+2% production)`, kind: "achieve" });
          playSfx("achieve");
        }
      }

      saveTimer += dt;
      if (saveTimer > 15) {
        saveTimer = 0;
        save();
      }
      bump();
    }, 100);

    const onHide = () => save();
    window.addEventListener("beforeunload", onHide);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("beforeunload", onHide);
      document.removeEventListener("visibilitychange", onHide);
      save();
    };
  }, [bump, pushToast, save]);

  /* ---------------------------------- actions ---------------------------------- */

  const clickTree = useCallback((): number => {
    const st = stateRef.current;
    const d = computeDerived(st);
    st.apples += d.clickPower;
    st.lifetime += d.clickPower;
    st.allTime += d.clickPower;
    st.handPicked += d.clickPower;
    st.totalClicks += 1;
    playSfx("click");
    bump();
    return d.clickPower;
  }, [bump]);

  const buyGenerator = useCallback(
    (genId: string): boolean => {
      const st = stateRef.current;
      const gen = GENERATORS.find((x) => x.id === genId);
      if (!gen) return false;
      const owned = st.owned[genId] ?? 0;
      let qty = st.buyQty === "max" ? maxAffordable(gen.baseCost, owned, st.apples) : st.buyQty;
      if (qty <= 0) {
        playSfx("error");
        return false;
      }
      if (st.buyQty === "max") qty = Math.max(1, qty);
      const cost = genCost(gen.baseCost, owned, qty);
      if (st.apples < cost) {
        playSfx("error");
        return false;
      }
      st.apples -= cost;
      st.owned[genId] = owned + qty;
      playSfx("buy");
      bump();
      return true;
    },
    [bump],
  );

  const buyUpgrade = useCallback(
    (upId: string): boolean => {
      const st = stateRef.current;
      const up = UPGRADES.find((x) => x.id === upId);
      if (!up || st.upgrades.includes(upId)) return false;
      if (st.apples < up.cost) {
        playSfx("error");
        return false;
      }
      st.apples -= up.cost;
      st.upgrades.push(upId);
      playSfx("upgrade");
      pushToast({ title: up.name, desc: up.desc, kind: "info" });
      bump();
      return true;
    },
    [bump, pushToast],
  );

  const setBuyQty = useCallback(
    (q: 1 | 10 | "max") => {
      stateRef.current.buyQty = q;
      bump();
    },
    [bump],
  );

  const catchGolden = useCallback(() => {
    const st = stateRef.current;
    if (!st.golden) return;
    st.golden = null;
    st.goldenClicked += 1;
    st.nextGoldenAt = Date.now() + 50_000 + Math.random() * 60_000;
    const d = computeDerived(st);
    const roll = Math.random();
    if (roll < 0.42) {
      st.buffs = [...st.buffs.filter((b) => b.kind !== "frenzy"), { kind: "frenzy", mult: 7, endsAt: Date.now() + 30_000 }];
      pushToast({ title: "Apple Frenzy!", desc: "Production ×7 for 30 seconds.", kind: "gold" });
    } else if (roll < 0.72) {
      st.buffs = [...st.buffs.filter((b) => b.kind !== "surge"), { kind: "surge", mult: 20, endsAt: Date.now() + 20_000 }];
      pushToast({ title: "Click Surge!", desc: "Clicking power ×20 for 20 seconds.", kind: "gold" });
    } else {
      const windfall = Math.max(d.aps * 600, st.apples * 0.15, 50);
      st.apples += windfall;
      st.lifetime += windfall;
      st.allTime += windfall;
      pushToast({ title: "Apple Windfall!", desc: `+${formatNumber(windfall)} apples found in the grass.`, kind: "gold" });
    }
    playSfx("gold");
    bump();
  }, [bump, pushToast]);

  const toggleMute = useCallback(() => {
    const st = stateRef.current;
    st.muted = !st.muted;
    setMuted(st.muted);
    bump();
  }, [bump]);

  const transplant = useCallback(() => {
    const st = stateRef.current;
    const gained = seedsFor(st.lifetime);
    if (gained < 1) return;
    st.seeds += gained;
    st.transplants += 1;
    st.apples = 0;
    st.lifetime = 0;
    st.handPicked = 0;
    st.owned = {};
    st.upgrades = [];
    st.buffs = [];
    st.golden = null;
    st.nextGoldenAt = Date.now() + 60_000;
    playSfx("transplant");
    pushToast({ title: "Grove Transplanted", desc: `+${gained} Golden Seed${gained > 1 ? "s" : ""} (+${gained * 10}% production forever)`, kind: "gold" });
    save();
    bump();
  }, [bump, pushToast, save]);

  const hardReset = useCallback(() => {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      /* noop */
    }
    stateRef.current = freshState();
    setMuted(false);
    bump();
  }, [bump]);

  const derived = useMemo(() => computeDerived(s), [s, version]);

  return {
    s,
    derived,
    version,
    toasts,
    offlineInfo,
    clearOfflineInfo: () => setOfflineInfo(null),
    clickTree,
    buyGenerator,
    buyUpgrade,
    setBuyQty,
    catchGolden,
    toggleMute,
    transplant,
    hardReset,
    save,
  };
}

export type Game = ReturnType<typeof useGame>;
