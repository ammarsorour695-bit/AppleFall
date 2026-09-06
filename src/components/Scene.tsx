import { useCallback, useEffect, useRef, useState } from "react";
import type { Game } from "../game/useGame";
import { formatAps, formatNumber } from "../game/format";
import { playSfx, setMuted } from "../game/audio";
import { Icon } from "./Icons";

interface Pop {
  id: number;
  x: number;
  y: number;
  text: string;
}
interface Fall {
  id: number;
  xPct: number;
  yPct: number;
  dx: number;
  dy: number;
  rot: number;
  dur: number;
  size: number;
}
interface Ring {
  id: number;
  x: number;
  y: number;
}

let fxId = 1;

/* ---------------- pixel-art apple sprite (2-frame twinkle, steps animation) ---------------- */

function PixelApple({ size }: { size: number }) {
  const red = "#ff5347";
  const dark = "#d92f2b";
  const lite = "#ff9c8f";
  const stem = "#6b4226";
  const leaf = "#63b453";
  const row = (y: number, xs: number[], c: string) => xs.map((x) => <rect key={`${x}-${y}-${c}`} x={x} y={y} width="1" height="1" fill={c} />);
  return (
    <svg viewBox="0 0 10 11" style={{ width: size, imageRendering: "pixelated" }} shapeRendering="crispEdges">
      {row(0, [4], stem)}
      {row(1, [4, 5, 6], leaf)}
      {row(1, [3], red)}
      {row(2, [2, 3, 4, 5, 6, 7], red)}
      {row(3, [1, 2, 3, 4, 5, 6, 7, 8], red)}
      {row(4, [1, 2, 3, 4, 5, 6, 7, 8], red)}
      {row(5, [1, 2, 3, 4, 5, 6, 7, 8], red)}
      {row(6, [1, 2, 3, 4, 5, 6, 7, 8], red)}
      {row(7, [2, 3, 4, 5, 6, 7], red)}
      {row(8, [3, 4, 5, 6], red)}
      {row(9, [4, 5], red)}
      {row(6, [7, 8], dark)}
      {row(7, [6, 7], dark)}
      {row(8, [5, 6], dark)}
      {row(9, [5], dark)}
      <g className="px-frame-a">{row(2, [2, 3], lite)}{row(3, [1, 2], lite)}</g>
      <g className="px-frame-b">{row(3, [2, 3], lite)}{row(4, [1, 2], lite)}</g>
    </svg>
  );
}

/* ---------------- the apple tree (simple hand-drawn style) ---------------- */

const TREE_APPLES = [
  { x: 132, y: 208, r: 12 },
  { x: 168, y: 150, r: 12 },
  { x: 206, y: 108, r: 12 },
  { x: 244, y: 148, r: 12 },
  { x: 276, y: 202, r: 12 },
  { x: 158, y: 240, r: 11 },
  { x: 248, y: 238, r: 11 },
  { x: 205, y: 192, r: 12 },
];

function TreeApple({ x, y, r, i }: { x: number; y: number; r: number; i: number }) {
  return (
    <g style={{ animation: `kf-bob ${3.2 + (i % 4) * 0.7}s ease-in-out ${-(i * 0.55)}s infinite` }}>
      <circle cx={x} cy={y} r={r} fill="#ff5347" />
      <circle cx={x} cy={y} r={r} fill="none" stroke="#d92f2b" strokeWidth={1.4} opacity={0.7} />
      <ellipse cx={x - r * 0.35} cy={y - r * 0.32} rx={r * 0.26} ry={r * 0.36} fill="#ff9c8f" opacity={0.85} transform={`rotate(-22 ${x - r * 0.35} ${y - r * 0.32})`} />
      <path d={`M ${x} ${y - r + 2} q ${r * 0.14} ${-r * 0.5} ${r * 0.45} ${-r * 0.62}`} stroke="#6b4226" strokeWidth={2} fill="none" strokeLinecap="round" />
      <ellipse cx={x + r * 0.55} cy={y - r * 1.28} rx={r * 0.4} ry={r * 0.19} fill="#63b453" transform={`rotate(-24 ${x + r * 0.55} ${y - r * 1.28})`} />
    </g>
  );
}

function AppleTree() {
  return (
    <svg viewBox="0 0 400 500" className="w-full h-full">
      {/* ground shadow */}
      <ellipse cx="205" cy="458" rx="130" ry="13" fill="rgba(0,0,0,0.15)" />
      {/* trunk */}
      <path
        d="M 184 452 C 190 380 186 336 170 296 L 196 304 C 201 268 201 248 197 220 L 224 220 C 220 250 226 276 238 302 L 260 292 C 243 338 239 388 243 452 Z"
        fill="#7a4a28"
      />
      <path d="M 191 444 C 196 386 193 348 184 314" stroke="#5f3a1e" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.7" />
      <path d="M 234 444 C 232 392 236 352 244 320" stroke="#8f5c34" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.8" />
      {/* branches */}
      <path d="M 198 238 L 150 196 M 222 236 L 270 192" stroke="#7a4a28" strokeWidth="13" strokeLinecap="round" />
      {/* canopy */}
      <circle cx="200" cy="168" r="100" fill="#4a9e3b" />
      <circle cx="128" cy="208" r="62" fill="#4a9e3b" />
      <circle cx="272" cy="206" r="64" fill="#4a9e3b" />
      <circle cx="150" cy="116" r="58" fill="#4a9e3b" />
      <circle cx="250" cy="114" r="60" fill="#4a9e3b" />
      <circle cx="200" cy="150" r="82" fill="#5fb34d" />
      <circle cx="140" cy="180" r="46" fill="#5fb34d" />
      <circle cx="262" cy="178" r="48" fill="#5fb34d" />
      <circle cx="200" cy="100" r="44" fill="#5fb34d" />
      <circle cx="166" cy="132" r="26" fill="#74c563" opacity="0.9" />
      <circle cx="232" cy="120" r="22" fill="#74c563" opacity="0.9" />
      <circle cx="128" cy="238" r="30" fill="#3a7d2f" />
      <circle cx="274" cy="236" r="32" fill="#3a7d2f" />
      <circle cx="200" cy="246" r="40" fill="#3a7d2f" opacity="0.9" />
      {/* apples */}
      {TREE_APPLES.map((a, i) => (
        <TreeApple key={i} {...a} i={i} />
      ))}
    </svg>
  );
}

const PLAQUE = "rounded-xl border-[3px] border-[#7a5326] bg-gradient-to-b from-[#4a2f16] to-[#2e1b0b] shadow-[0_10px_25px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.14)]";

export function Scene({ game, onRequestReset }: { game: Game; onRequestReset: () => void }) {
  const { s, derived } = game;
  const sceneRef = useRef<HTMLDivElement>(null);
  const [pops, setPops] = useState<Pop[]>([]);
  const [falls, setFalls] = useState<Fall[]>([]);
  const [rings, setRings] = useState<Ring[]>([]);
  const [shaking, setShaking] = useState(false);
  const [bumpKey, setBumpKey] = useState(0);
  const [saveFlash, setSaveFlash] = useState(false);
  const shakeTimer = useRef<number | null>(null);
  const apsRef = useRef(derived.aps);
  apsRef.current = derived.aps;

  /* sound wiring */
  useEffect(() => setMuted(s.muted), [s.muted]);
  const prevCounts = useRef({ g: 0, u: 0, a: 0, t: 0 });
  useEffect(() => {
    const g = Object.values(s.owned).reduce((acc, n) => acc + n, 0);
    const u = s.upgrades.length;
    const a = s.achievements.length;
    const p = prevCounts.current;
    if (p.g === 0 && p.u === 0 && p.a === 0 && p.t === 0 && (g > 0 || u > 0 || a > 0)) {
      /* first hydration tick after loading a save — no fanfare */
    } else {
      if (g > p.g) playSfx("buy");
      if (u > p.u) playSfx("upgrade");
      if (a > p.a) playSfx("achieve");
      if (s.transplants > p.t) playSfx("transplant");
    }
    prevCounts.current = { g, u, a, t: s.transplants };
  }, [s.owned, s.upgrades.length, s.achievements.length, s.transplants]);

  /* ambient falling pixel-apples while producing */
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.hidden) return;
      if (apsRef.current > 0) {
        const fid = fxId++;
        setFalls((f) => [
          ...f.slice(-7),
          { id: fid, xPct: 40 + Math.random() * 20, yPct: 16 + Math.random() * 12, dx: (Math.random() - 0.5) * 90, dy: 900, rot: 120 + Math.random() * 200, dur: 1500 + Math.random() * 700, size: 22 + Math.random() * 10 },
        ]);
        window.setTimeout(() => setFalls((f) => f.filter((x) => x.id !== fid)), 2300);
      }
    }, 2400);
    return () => window.clearInterval(id);
  }, []);

  const onTreeDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      const rect = sceneRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const gained = game.clickTree();
      playSfx("click");
      const pid = fxId++;
      setPops((p) => [...p.slice(-11), { id: pid, x, y, text: `+${formatNumber(gained)}` }]);
      window.setTimeout(() => setPops((p) => p.filter((q) => q.id !== pid)), 950);
      const rid = fxId++;
      setRings((r) => [...r.slice(-5), { id: rid, x, y }]);
      window.setTimeout(() => setRings((r) => r.filter((q) => q.id !== rid)), 520);

      const burst = 2 + Math.floor(Math.random() * 2);
      const newFalls: Fall[] = [];
      for (let i = 0; i < burst; i++) {
        newFalls.push({
          id: fxId++,
          xPct: (x / rect.width) * 100 + (Math.random() - 0.5) * 8,
          yPct: Math.max(6, (y / rect.height) * 100 - 6),
          dx: (Math.random() - 0.5) * 130,
          dy: rect.height * 0.52,
          rot: 140 + Math.random() * 240,
          dur: 950 + Math.random() * 450,
          size: 20 + Math.random() * 12,
        });
      }
      setFalls((f) => [...f.slice(-10), ...newFalls]);
      window.setTimeout(() => setFalls((f) => f.filter((q) => !newFalls.includes(q))), 1500);

      setShaking(true);
      if (shakeTimer.current) window.clearTimeout(shakeTimer.current);
      shakeTimer.current = window.setTimeout(() => setShaking(false), 330);
      setBumpKey((k) => k + 1);
    },
    [game],
  );

  const doSave = () => {
    game.save();
    playSfx("buy");
    setSaveFlash(true);
    window.setTimeout(() => setSaveFlash(false), 1400);
  };

  const now = Date.now();
  const frenzy = derived.frenzyMult > 1;
  const surge = derived.surgeMult > 1;
  const showHint = s.totalClicks === 0;

  return (
    <div
      ref={sceneRef}
      className="relative flex-1 min-h-0 overflow-hidden select-none"
      style={{ background: "linear-gradient(to bottom, #8ecdf5 0%, #b5e2fb 50%, #e2f4ff 73.8%, #6fb84d 74%, #57a43e 92%, #4c9436 100%)" }}
    >
      <style>{`
        .px-frame-a { animation: kf-pxA 0.6s steps(1, end) infinite; }
        .px-frame-b { animation: kf-pxB 0.6s steps(1, end) infinite; }
        @keyframes kf-pxA { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes kf-pxB { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes kf-ring { 0% { transform: translate(-50%,-50%) scale(0.35); opacity: 0.9; } 100% { transform: translate(-50%,-50%) scale(2.4); opacity: 0; } }
      `}</style>

      {/* subtle grass horizon line */}
      <div className="absolute left-0 right-0 pointer-events-none" style={{ top: "74%", height: 3, background: "rgba(255,255,255,0.28)" }} />

      {/* THE TREE */}
      <div className="absolute inset-x-0 bottom-[8%] flex justify-center pointer-events-none">
        <div
          className={`pointer-events-auto relative cursor-pointer transition-transform duration-100 active:scale-[0.985] ${shaking ? "anim-shake" : ""}`}
          style={{ height: "min(64vh, 540px)", width: "min(64vh, 540px)", touchAction: "manipulation" }}
          onPointerDown={onTreeDown}
          role="button"
          aria-label="Shake the apple tree"
        >
          <div className="anim-sway w-full h-full">
            <AppleTree />
          </div>
          {showHint && (
            <div className="absolute -right-6 top-8 sm:right-[-90px] anim-bob pointer-events-none">
              <div className="bg-gold text-bark-900 font-display text-lg px-4 py-2 rounded-xl shadow-lg rotate-6 whitespace-nowrap border-2 border-gold-dark">
                Shake the tree!
                <span className="absolute -bottom-2 left-6 w-4 h-4 bg-gold rotate-45 border-b-2 border-r-2 border-gold-dark" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* falling pixel-apples */}
      {falls.map((f) => (
        <div key={f.id} className="absolute pointer-events-none" style={{ left: `${f.xPct}%`, top: `${f.yPct}%`, ["--dx" as string]: `${f.dx}px`, ["--dy" as string]: `${f.dy}px`, ["--rot" as string]: `${f.rot}deg`, animation: `kf-apple-fall ${f.dur}ms cubic-bezier(0.45, 0, 0.9, 0.6) forwards` }}>
          <PixelApple size={f.size} />
        </div>
      ))}

      {/* click ripples */}
      {rings.map((r) => (
        <span key={r.id} className="absolute w-16 h-16 rounded-full border-[3px] border-[#ff5347] pointer-events-none z-20" style={{ left: r.x, top: r.y, animation: "kf-ring 0.5s ease-out forwards" }} />
      ))}

      {/* click pops */}
      {pops.map((p) => (
        <div key={p.id} className="absolute pointer-events-none font-display text-2xl text-cream z-20" style={{ left: p.x, top: p.y - 14, animation: "kf-pop 0.95s ease-out forwards", textShadow: "0 2px 0 rgba(0,0,0,0.45), 0 0 10px rgba(0,0,0,0.25)" }}>
          {p.text}
        </div>
      ))}

      {/* golden apple */}
      {s.golden && (
        <button
          key={s.golden.id}
          onClick={() => {
            playSfx("gold");
            game.catchGolden();
          }}
          className="absolute left-0 z-30 block bg-transparent border-0 p-0 text-gold"
          style={{ top: `${s.golden.topPct}%`, animation: `kf-gold-fly ${s.golden.durMs}ms linear forwards` }}
          aria-label="Catch the golden apple"
        >
          <span className="block" style={{ animation: "kf-gold-bob 1.6s ease-in-out infinite" }}>
            <span className="block" style={{ animation: "kf-pulse-gold 1.1s ease-in-out infinite" }}>
              <Icon name="goldapple" className="w-14 h-14" />
            </span>
          </span>
        </button>
      )}

      {/* frenzy / surge tints */}
      {frenzy && <div className="absolute inset-0 pointer-events-none z-10" style={{ background: "radial-gradient(circle at 50% 42%, rgba(255,201,77,0.28), transparent 62%)", animation: "kf-frenzy 1.1s ease-in-out infinite" }} />}
      {surge && <div className="absolute inset-0 pointer-events-none z-10" style={{ boxShadow: "inset 0 0 120px rgba(255,83,71,0.35)" }} />}

      {/* ---------- HUD ---------- */}
      <div className="absolute top-3 left-3 sm:top-5 sm:left-5 z-30 pointer-events-none">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[#1c6b36]"><Icon name="leaf" className="w-5 h-5" /></span>
          <span className="font-display tracking-[0.22em] text-[13px] text-[#1c5b34]" style={{ textShadow: "0 1px 0 rgba(255,255,255,0.45)" }}>APPLEFALL</span>
        </div>
        <div className={`${PLAQUE} relative px-4 py-3`}>
          <span className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-[#1d1006] ring-1 ring-[#6b4a26]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#1d1006] ring-1 ring-[#6b4a26]" />
          <div key={bumpKey} className={`flex items-center gap-2.5 ${bumpKey ? "bump" : ""}`}>
            <span className="text-apple drop-shadow-lg"><Icon name="apple" className="w-9 h-9 sm:w-11 sm:h-11" /></span>
            <span className="font-display text-4xl sm:text-5xl leading-none text-cream text-outline tabular-nums">{formatNumber(s.apples)}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="bg-black/35 border border-leaf/40 text-leaf font-bold text-xs sm:text-[13px] px-2.5 py-0.5 rounded-full">
              {formatAps(derived.aps)} / sec
            </span>
            <span className="bg-black/35 border border-gold/40 text-gold font-bold text-xs sm:text-[13px] px-2.5 py-0.5 rounded-full">
              +{formatNumber(derived.clickPower)} / click
            </span>
            {s.seeds > 0 && (
              <span className="bg-black/35 border border-gold/50 text-gold font-bold text-xs sm:text-[13px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Icon name="seed" className="w-4 h-4" /> {s.seeds} seed{s.seeds > 1 ? "s" : ""} · +{s.seeds * 10}%
              </span>
            )}
          </div>
        </div>

        {/* active buffs */}
        <div className="mt-2 space-y-1.5">
          {s.buffs.filter((b) => b.endsAt > now).map((b, i) => {
            const total = b.kind === "frenzy" ? 30_000 : 20_000;
            const remain = Math.max(0, b.endsAt - now);
            return (
              <div key={i} className={`w-56 rounded-lg overflow-hidden border-2 shadow-lg ${b.kind === "frenzy" ? "border-gold/60 bg-[#3d2c0a]/90" : "border-apple/60 bg-[#3a1410]/90"}`}>
                <div className="flex items-center gap-2 px-2.5 py-1">
                  <span className={b.kind === "frenzy" ? "text-gold" : "text-[#ff9c8f]"}>
                    <Icon name={b.kind === "frenzy" ? "sparkle" : "thunder"} className="w-4 h-4" />
                  </span>
                  <span className={`font-display text-[13px] ${b.kind === "frenzy" ? "text-gold" : "text-[#ff9c8f]"}`}>
                    {b.kind === "frenzy" ? `Frenzy ×${b.mult}` : `Surge ×${b.mult}`}
                  </span>
                  <span className="ml-auto text-[11px] font-bold text-cream/80 tabular-nums">{Math.ceil(remain / 1000)}s</span>
                </div>
                <div className="h-1.5 bg-black/40">
                  <div className={`h-full ${b.kind === "frenzy" ? "bg-gold" : "bg-apple"}`} style={{ width: `${(remain / total) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* controls */}
      <div className="absolute top-3 right-3 sm:top-5 sm:right-5 z-30 flex items-start gap-2">
        {saveFlash && <span className="mt-2 text-[#1c5b34] font-bold text-xs bg-white/70 border border-[#1c5b34]/40 rounded-full px-2.5 py-1">Saved</span>}
        <button onClick={game.toggleMute} className="w-10 h-10 rounded-full bg-bark-800/90 border-2 border-bark-600 flex items-center justify-center hover:border-gold/60 hover:-translate-y-0.5 transition-all shadow-lg" title={s.muted ? "Unmute" : "Mute"}>
          <Icon name={s.muted ? "mute" : "sound"} className="w-5 h-5" />
        </button>
        <button onClick={doSave} className="w-10 h-10 rounded-full bg-bark-800/90 border-2 border-bark-600 flex items-center justify-center hover:border-gold/60 hover:-translate-y-0.5 transition-all shadow-lg" title="Save game">
          <Icon name="save" className="w-5 h-5" />
        </button>
        <button onClick={onRequestReset} className="w-10 h-10 rounded-full bg-bark-800/90 border-2 border-bark-600 flex items-center justify-center hover:border-apple/70 hover:-translate-y-0.5 transition-all shadow-lg" title="Reset game">
          <Icon name="reset" className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
