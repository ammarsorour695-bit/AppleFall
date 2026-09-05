import { useCallback, useEffect, useRef, useState } from "react";
import type { Game } from "../game/useGame";
import { formatAps, formatNumber } from "../game/format";
import { playSfx, setMuted } from "../game/audio";
import { Icon } from "./Icons";

/* Painted assets (remote). The CSS/SVG scene underneath acts as an offline fallback. */
const BG_URL = "https://image.qwenlm.ai/generated-images/33e10453-5df6-4b35-9c37-d353f5096628/_result.png";
const TREE_URL = "https://image.qwenlm.ai/generated-images/c04cb85b-c505-4daa-bd3f-538bd61fb322/_result.png";

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
interface LeafBit {
  id: number;
  xPct: number;
  dur: number;
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

/* ---------------- fallback hand-drawn tree ---------------- */

const TREE_APPLES = [
  { x: 118, y: 196, r: 12 }, { x: 152, y: 142, r: 13 }, { x: 190, y: 104, r: 12 },
  { x: 228, y: 88, r: 13 }, { x: 265, y: 118, r: 12 }, { x: 297, y: 165, r: 13 },
  { x: 135, y: 225, r: 11 }, { x: 175, y: 196, r: 12 }, { x: 212, y: 158, r: 13 },
  { x: 248, y: 196, r: 12 }, { x: 285, y: 224, r: 11 }, { x: 205, y: 222, r: 11 },
];

function TreeApple({ x, y, r, i }: { x: number; y: number; r: number; i: number }) {
  return (
    <g style={{ animation: `kf-bob ${3.2 + (i % 4) * 0.7}s ease-in-out ${-(i * 0.55)}s infinite` }}>
      <circle cx={x} cy={y} r={r} fill="#ff5347" />
      <ellipse cx={x - r * 0.35} cy={y - r * 0.32} rx={r * 0.26} ry={r * 0.36} fill="#ff9c8f" opacity={0.85} />
      <path d={`M ${x} ${y - r + 2} q ${r * 0.14} ${-r * 0.5} ${r * 0.45} ${-r * 0.62}`} stroke="#6b4226" strokeWidth={2} fill="none" strokeLinecap="round" />
    </g>
  );
}

function SvgTree() {
  return (
    <svg viewBox="0 0 420 500" className="w-full h-full drop-shadow-[0_18px_28px_rgba(0,0,0,0.35)]">
      <ellipse cx="210" cy="478" rx="150" ry="16" fill="rgba(6,20,14,0.45)" />
      <path d="M 182 478 C 188 396 182 344 166 296 L 199 306 C 204 268 204 246 199 216 L 226 216 C 223 248 229 274 241 300 L 264 288 C 246 336 240 396 246 478 Z" fill="#6e4426" />
      <path d="M 199 240 L 158 200 M 224 238 L 268 196 M 210 226 L 208 178" stroke="#6e4426" strokeWidth="13" strokeLinecap="round" />
      <circle cx="210" cy="152" r="122" fill="#2e6b33" />
      <circle cx="118" cy="196" r="80" fill="#2e6b33" />
      <circle cx="302" cy="196" r="84" fill="#2e6b33" />
      <circle cx="148" cy="108" r="72" fill="#2e6b33" />
      <circle cx="272" cy="108" r="76" fill="#2e6b33" />
      <circle cx="210" cy="142" r="102" fill="#3f8a43" />
      <circle cx="140" cy="178" r="66" fill="#3f8a43" />
      <circle cx="280" cy="178" r="68" fill="#3f8a43" />
      <circle cx="210" cy="92" r="62" fill="#3f8a43" />
      <circle cx="184" cy="122" r="56" fill="#58ab4f" />
      <circle cx="254" cy="136" r="50" fill="#58ab4f" />
      <circle cx="210" cy="76" r="40" fill="#58ab4f" />
      {TREE_APPLES.map((a, i) => (
        <TreeApple key={i} {...a} i={i} />
      ))}
    </svg>
  );
}

function GrassTuft({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 30 24" className={`anim-grass ${className ?? ""}`} style={style}>
      <path d="M4 24 Q5 10 2 2 Q9 8 9 24 Z" fill="#3f9a4a" />
      <path d="M13 24 Q15 6 15 0 Q19 10 18 24 Z" fill="#57b45f" />
      <path d="M23 24 Q24 12 28 5 Q27 16 26 24 Z" fill="#3f9a4a" />
    </svg>
  );
}

function Cloud({ top, scale, duration, delay, opacity }: { top: string; scale: number; duration: number; delay: number; opacity: number }) {
  return (
    <div className="absolute left-0 pointer-events-none" style={{ top, animation: `kf-drift ${duration}s linear ${delay}s infinite`, opacity }}>
      <svg viewBox="0 0 200 70" style={{ width: 200 * scale }}>
        <ellipse cx="60" cy="45" rx="55" ry="22" fill="#f9e3b3" />
        <ellipse cx="110" cy="35" rx="48" ry="24" fill="#f9e3b3" />
        <ellipse cx="150" cy="48" rx="42" ry="18" fill="#f9e3b3" />
      </svg>
    </div>
  );
}

const FIREFLIES = Array.from({ length: 10 }, (_, i) => ({
  left: (i * 37 + 13) % 100,
  top: 48 + ((i * 53) % 44),
  dur: 5.5 + (i % 4) * 1.4,
  delay: -(i * 1.7),
}));

const STARS = Array.from({ length: 16 }, (_, i) => ({
  left: (i * 61 + 7) % 100,
  top: 3 + ((i * 29) % 30),
  dur: 2.4 + (i % 3) * 1.2,
  delay: -(i * 0.9),
  s: i % 3 === 0 ? 3 : 2,
}));

const GRASS = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 71 + 4) % 100,
  w: 22 + (i % 3) * 10,
  delay: -(i * 0.6),
  flip: i % 2 === 0,
}));

const PLAQUE = "rounded-xl border-[3px] border-[#7a5326] bg-gradient-to-b from-[#4a2f16] to-[#2e1b0b] shadow-[0_10px_25px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.14)]";

export function Scene({ game, onRequestReset }: { game: Game; onRequestReset: () => void }) {
  const { s, derived } = game;
  const sceneRef = useRef<HTMLDivElement>(null);
  const [pops, setPops] = useState<Pop[]>([]);
  const [falls, setFalls] = useState<Fall[]>([]);
  const [leaves, setLeaves] = useState<LeafBit[]>([]);
  const [rings, setRings] = useState<Ring[]>([]);
  const [shaking, setShaking] = useState(false);
  const [bumpKey, setBumpKey] = useState(0);
  const [saveFlash, setSaveFlash] = useState(false);
  const [bgOk, setBgOk] = useState(true);
  const [treeOk, setTreeOk] = useState(true);
  const shakeTimer = useRef<number | null>(null);
  const apsRef = useRef(derived.aps);
  apsRef.current = derived.aps;

  /* sound wiring */
  useEffect(() => setMuted(s.muted), [s.muted]);
  const ownedGenCount = Object.values(s.owned).reduce((a, b) => a + b, 0);
  const prevCounts = useRef({ g: ownedGenCount, u: s.upgrades.length, a: s.achievements.length, t: s.seeds });
  useEffect(() => {
    const p = prevCounts.current;
    if (ownedGenCount > p.g) playSfx("buy");
    if (s.upgrades.length > p.u) playSfx("upgrade");
    if (s.achievements.length > p.a) playSfx("achieve");
    if (s.seeds > p.t) playSfx("transplant");
    prevCounts.current = { g: ownedGenCount, u: s.upgrades.length, a: s.achievements.length, t: s.seeds };
  }, [ownedGenCount, s.upgrades.length, s.achievements.length, s.seeds]);

  /* ambient falling pixel-apples + leaves while producing */
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
      if (Math.random() < 0.75) {
        const lid = fxId++;
        setLeaves((l) => [...l.slice(-4), { id: lid, xPct: 34 + Math.random() * 32, dur: 6500 + Math.random() * 3500 }]);
        window.setTimeout(() => setLeaves((l) => l.filter((x) => x.id !== lid)), 10_500);
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
    <div ref={sceneRef} className="relative flex-1 min-h-0 overflow-hidden select-none" style={{ background: "linear-gradient(to bottom, #081c1f 0%, #10382e 34%, #1d5a40 55%, #7fa453 72%, #d99a4e 79%, #f6b352 84%, #2f7a3f 84.5%, #245c33 100%)" }}>
      <style>{`
        .px-frame-a { animation: kf-pxA 0.6s steps(1, end) infinite; }
        .px-frame-b { animation: kf-pxB 0.6s steps(1, end) infinite; }
        @keyframes kf-pxA { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes kf-pxB { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes kf-ring { 0% { transform: translate(-50%,-50%) scale(0.35); opacity: 0.9; } 100% { transform: translate(-50%,-50%) scale(2.4); opacity: 0; } }
      `}</style>

      {/* painted backdrop (with CSS scene as fallback) */}
      {bgOk ? (
        <img src={BG_URL} alt="" className="absolute inset-0 w-full h-full object-cover" onError={() => setBgOk(false)} draggable={false} />
      ) : (
        <>
          {STARS.map((st, i) => (
            <div key={i} className="absolute rounded-full bg-[#fff3cf] pointer-events-none" style={{ left: `${st.left}%`, top: `${st.top}%`, width: st.s, height: st.s, animation: `kf-twinkle ${st.dur}s ease-in-out ${st.delay}s infinite` }} />
          ))}
          <Cloud top="6%" scale={1.3} duration={130} delay={-30} opacity={0.16} />
          <Cloud top="15%" scale={0.9} duration={100} delay={-70} opacity={0.2} />
          <Cloud top="25%" scale={1.1} duration={155} delay={-110} opacity={0.13} />
          <svg className="absolute bottom-[15%] left-0 w-full pointer-events-none" viewBox="0 0 1200 220" preserveAspectRatio="none" style={{ height: "34%" }}>
            <path d="M0 220 L0 130 Q 200 40 420 120 Q 640 190 830 100 Q 1010 25 1200 110 L1200 220 Z" fill="#143726" />
            <path d="M0 220 L0 175 Q 260 95 520 165 Q 780 230 1000 150 Q 1110 112 1200 140 L1200 220 Z" fill="#1b4534" />
          </svg>
        </>
      )}

      {/* fence */}
      <div className="absolute bottom-[13.5%] left-0 w-full pointer-events-none">
        <svg viewBox="0 0 1200 70" preserveAspectRatio="none" className="w-full" style={{ height: 56 }}>
          {Array.from({ length: 21 }, (_, i) => (
            <g key={i}>
              <rect x={i * 60 + 8} y="12" width="10" height="52" rx="3" fill="#5f3d1e" />
              <path d={`M ${i * 60 + 8} 16 l 5 -9 l 5 9 Z`} fill="#77502a" />
            </g>
          ))}
          <rect x="0" y="24" width="1200" height="7" fill="#472c14" />
          <rect x="0" y="46" width="1200" height="7" fill="#472c14" />
        </svg>
      </div>

      {/* grass tufts */}
      {GRASS.map((gt, i) => (
        <GrassTuft key={i} className="absolute bottom-[12.2%] pointer-events-none" style={{ left: `${gt.left}%`, width: gt.w, animationDelay: `${gt.delay}s`, transform: gt.flip ? "scaleX(-1)" : undefined }} />
      ))}

      {/* THE TREE */}
      <div className="absolute inset-x-0 bottom-[11%] flex justify-center pointer-events-none">
        <div
          className={`pointer-events-auto relative cursor-pointer transition-transform duration-100 active:scale-[0.985] ${shaking ? "anim-shake" : ""}`}
          style={{ height: "min(66vh, 560px)", width: "min(66vh, 560px)", touchAction: "manipulation" }}
          onPointerDown={onTreeDown}
          role="button"
          aria-label="Shake the apple tree"
        >
          <div className="anim-sway w-full h-full">
            {treeOk ? (
              <>
                <div className="absolute bottom-[1%] left-1/2 -translate-x-1/2 w-[62%] h-[7%] rounded-[50%] bg-black/40 blur-[6px]" />
                <img src={TREE_URL} alt="The great apple tree" className="w-full h-full object-contain" style={{ mixBlendMode: "screen" }} onError={() => setTreeOk(false)} draggable={false} />
              </>
            ) : (
              <SvgTree />
            )}
          </div>
          {showHint && (
            <div className="absolute -right-6 top-8 sm:right-[-90px] anim-bob pointer-events-none">
              <div className="bg-gold text-bark-900 font-display text-lg px-4 py-2 rounded-xl shadow-lg rotate-6 whitespace-nowrap">
                Shake the tree!
                <span className="absolute -bottom-2 left-6 w-4 h-4 bg-gold rotate-45" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* fireflies */}
      {FIREFLIES.map((f, i) => (
        <div key={i} className="absolute pointer-events-none" style={{ left: `${f.left}%`, top: `${f.top}%` }}>
          <div className="w-[5px] h-[5px] rounded-full bg-[#ffe9ad]" style={{ boxShadow: "0 0 10px 3px rgba(255,233,173,0.7)", animation: `kf-firefly ${f.dur}s ease-in-out ${f.delay}s infinite` }} />
        </div>
      ))}

      {/* ambient leaves */}
      {leaves.map((l) => (
        <div key={l.id} className="absolute pointer-events-none" style={{ left: `${l.xPct}%`, top: "12%", animation: `kf-leaf ${l.dur}ms ease-in forwards` }}>
          <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path d="M20 3 Q22 14 12 19 Q4 15 4 8 Q4 4 20 3 Z" fill="#6cc24a" />
            <path d="M6 16 Q11 10 18 5" stroke="#3f7f3a" strokeWidth="1.4" fill="none" />
          </svg>
        </div>
      ))}

      {/* falling pixel-apples */}
      {falls.map((f) => (
        <div key={f.id} className="absolute pointer-events-none" style={{ left: `${f.xPct}%`, top: `${f.yPct}%`, ["--dx" as string]: `${f.dx}px`, ["--dy" as string]: `${f.dy}px`, ["--rot" as string]: `${f.rot}deg`, animation: `kf-apple-fall ${f.dur}ms cubic-bezier(0.45, 0, 0.9, 0.6) forwards` }}>
          <PixelApple size={f.size} />
        </div>
      ))}

      {/* click ripples */}
      {rings.map((r) => (
        <span key={r.id} className="absolute w-16 h-16 rounded-full border-[3px] border-[#ffd9d2] pointer-events-none z-20" style={{ left: r.x, top: r.y, animation: "kf-ring 0.5s ease-out forwards" }} />
      ))}

      {/* click pops */}
      {pops.map((p) => (
        <div key={p.id} className="absolute pointer-events-none font-display text-2xl text-cream text-outline-sm z-20" style={{ left: p.x, top: p.y - 14, animation: "kf-pop 0.95s ease-out forwards" }}>
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
          className="absolute left-0 z-30 block bg-transparent border-0 p-0"
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
      {frenzy && <div className="absolute inset-0 pointer-events-none z-10" style={{ background: "radial-gradient(circle at 50% 42%, rgba(255,201,77,0.22), transparent 62%)", animation: "kf-frenzy 1.1s ease-in-out infinite" }} />}
      {surge && <div className="absolute inset-0 pointer-events-none z-10" style={{ boxShadow: "inset 0 0 120px rgba(255,83,71,0.35)" }} />}

      {/* vignette */}
      <div className="absolute inset-0 pointer-events-none z-10" style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(4,13,10,0.45) 100%)" }} />

      {/* ---------- HUD ---------- */}
      <div className="absolute top-3 left-3 sm:top-5 sm:left-5 z-30 pointer-events-none">
        <div className="flex items-center gap-2 mb-2">
          <Icon name="leaf" className="w-5 h-5" />
          <span className="font-display tracking-[0.22em] text-[13px] text-[#a8d18a] text-outline-sm">APPLEFALL</span>
        </div>
        <div className={`${PLAQUE} relative px-4 py-3`}>
          <span className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-[#1d1006] ring-1 ring-[#6b4a26]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#1d1006] ring-1 ring-[#6b4a26]" />
          <div key={bumpKey} className={`flex items-center gap-2.5 ${bumpKey ? "bump" : ""}`}>
            <Icon name="apple" className="w-9 h-9 sm:w-11 sm:h-11 drop-shadow-lg" />
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
                  <Icon name={b.kind === "frenzy" ? "sparkle" : "thunder"} className="w-4 h-4" />
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
        {saveFlash && <span className="mt-2 text-leaf font-bold text-xs bg-pine-950/80 border border-leaf/40 rounded-full px-2.5 py-1">Saved</span>}
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
