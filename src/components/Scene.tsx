import { useCallback, useEffect, useRef, useState } from "react";
import type { Game } from "../game/useGame";
import { formatAps, formatNumber } from "../game/format";
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
interface LeafBit {
  id: number;
  xPct: number;
  dur: number;
  delay: number;
}

let fxId = 1;

const TREE_APPLES = [
  { x: 118, y: 196, r: 12 }, { x: 152, y: 142, r: 13 }, { x: 190, y: 104, r: 12 },
  { x: 228, y: 88, r: 13 }, { x: 265, y: 118, r: 12 }, { x: 297, y: 165, r: 13 },
  { x: 135, y: 225, r: 11 }, { x: 175, y: 196, r: 12 }, { x: 212, y: 158, r: 13 },
  { x: 248, y: 196, r: 12 }, { x: 285, y: 224, r: 11 }, { x: 205, y: 222, r: 11 },
  { x: 165, y: 248, r: 10 }, { x: 245, y: 246, r: 10 },
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

function BigTree() {
  return (
    <svg viewBox="0 0 420 500" className="w-full h-full drop-shadow-[0_18px_28px_rgba(0,0,0,0.35)]">
      <ellipse cx="210" cy="478" rx="150" ry="16" fill="rgba(6,20,14,0.45)" />
      {/* trunk */}
      <path
        d="M 182 478 C 188 396 182 344 166 296 L 199 306 C 204 268 204 246 199 216 L 226 216 C 223 248 229 274 241 300 L 264 288 C 246 336 240 396 246 478 Z"
        fill="#6e4426"
      />
      <path d="M 191 470 C 196 400 192 356 182 318 M 226 470 C 224 410 228 360 236 320 M 205 300 q 4 -30 2 -56" stroke="#533015" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.8" />
      <path d="M 199 240 L 158 200 M 224 238 L 268 196 M 210 226 L 208 178" stroke="#6e4426" strokeWidth="13" strokeLinecap="round" />
      {/* canopy */}
      <g>
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
        <circle cx="160" cy="100" r="26" fill="#6fc163" opacity="0.85" />
        <circle cx="236" cy="86" r="20" fill="#6fc163" opacity="0.85" />
        <circle cx="286" cy="150" r="18" fill="#6fc163" opacity="0.7" />
      </g>
      {TREE_APPLES.map((a, i) => (
        <TreeApple key={i} {...a} i={i} />
      ))}
      {/* bird */}
      <g style={{ animation: "kf-bob 2.6s ease-in-out infinite" }}>
        <ellipse cx="312" cy="252" rx="13" ry="10" fill="#e85d4a" />
        <circle cx="322" cy="244" r="6.5" fill="#e85d4a" />
        <path d="M 328 244 l 7 2 l -7 3 Z" fill="#f2b03d" />
        <circle cx="323.5" cy="242.5" r="1.4" fill="#2e2620" />
        <path d="M 302 250 l -9 -4 l 3 8 Z" fill="#c94a38" />
      </g>
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

export function Scene({ game, onRequestReset }: { game: Game; onRequestReset: () => void }) {
  const { s, derived } = game;
  const sceneRef = useRef<HTMLDivElement>(null);
  const [pops, setPops] = useState<Pop[]>([]);
  const [falls, setFalls] = useState<Fall[]>([]);
  const [leaves, setLeaves] = useState<LeafBit[]>([]);
  const [shaking, setShaking] = useState(false);
  const [bumpKey, setBumpKey] = useState(0);
  const [saveFlash, setSaveFlash] = useState(false);
  const shakeTimer = useRef<number | null>(null);
  const apsRef = useRef(derived.aps);
  apsRef.current = derived.aps;

  /* ambient falling apples + leaves while producing */
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.hidden) return;
      if (apsRef.current > 0) {
        const fid = fxId++;
        setFalls((f) => [
          ...f.slice(-7),
          { id: fid, xPct: 40 + Math.random() * 20, yPct: 16 + Math.random() * 12, dx: (Math.random() - 0.5) * 90, dy: 900, rot: 120 + Math.random() * 200, dur: 1500 + Math.random() * 700, size: 16 + Math.random() * 8 },
        ]);
        window.setTimeout(() => setFalls((f) => f.filter((x) => x.id !== fid)), 2300);
      }
      if (Math.random() < 0.75) {
        const lid = fxId++;
        setLeaves((l) => [...l.slice(-4), { id: lid, xPct: 34 + Math.random() * 32, dur: 6500 + Math.random() * 3500, delay: 0 }]);
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
      const pid = fxId++;
      setPops((p) => [...p.slice(-11), { id: pid, x, y, text: `+${formatNumber(gained)}` }]);
      window.setTimeout(() => setPops((p) => p.filter((q) => q.id !== pid)), 950);

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
          size: 15 + Math.random() * 9,
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
    setSaveFlash(true);
    window.setTimeout(() => setSaveFlash(false), 1400);
  };

  const now = Date.now();
  const frenzy = derived.frenzyMult > 1;
  const surge = derived.surgeMult > 1;
  const showHint = s.totalClicks === 0;

  return (
    <div ref={sceneRef} className="relative flex-1 min-h-0 overflow-hidden select-none" style={{ background: "linear-gradient(to bottom, #081c1f 0%, #10382e 34%, #1d5a40 55%, #7fa453 72%, #d99a4e 79%, #f6b352 84%, #2f7a3f 84.5%, #245c33 100%)" }}>
      {/* stars */}
      {STARS.map((st, i) => (
        <div key={i} className="absolute rounded-full bg-[#fff3cf] pointer-events-none" style={{ left: `${st.left}%`, top: `${st.top}%`, width: st.s, height: st.s, animation: `kf-twinkle ${st.dur}s ease-in-out ${st.delay}s infinite` }} />
      ))}

      {/* sun with rotating rays */}
      <div className="absolute pointer-events-none" style={{ left: "64%", top: "60%" }}>
        <svg viewBox="-110 -110 220 220" className="w-[340px] h-[340px] -translate-x-1/2 -translate-y-1/2">
          <g className="anim-ray" opacity="0.5">
            {Array.from({ length: 12 }, (_, i) => (
              <line key={i} x1="0" y1="-52" x2="0" y2="-96" stroke="#ffd98a" strokeWidth="7" strokeLinecap="round" transform={`rotate(${i * 30})`} opacity="0.55" />
            ))}
          </g>
          <circle r="46" fill="#ffd98a" opacity="0.9" />
          <circle r="46" fill="url(#sunfade)" />
          <defs>
            <radialGradient id="sunfade">
              <stop offset="0%" stopColor="#fff0c0" />
              <stop offset="70%" stopColor="#ffd98a" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#f6b352" stopOpacity="0.4" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* clouds */}
      <Cloud top="6%" scale={1.3} duration={130} delay={-30} opacity={0.16} />
      <Cloud top="15%" scale={0.9} duration={100} delay={-70} opacity={0.2} />
      <Cloud top="25%" scale={1.1} duration={155} delay={-110} opacity={0.13} />

      {/* hills */}
      <svg className="absolute bottom-[15%] left-0 w-full pointer-events-none" viewBox="0 0 1200 220" preserveAspectRatio="none" style={{ height: "34%" }}>
        <path d="M0 220 L0 130 Q 200 40 420 120 Q 640 190 830 100 Q 1010 25 1200 110 L1200 220 Z" fill="#143726" />
        <path d="M0 220 L0 175 Q 260 95 520 165 Q 780 230 1000 150 Q 1110 112 1200 140 L1200 220 Z" fill="#1b4534" />
        {/* distant orchard silhouettes */}
        {[90, 190, 300, 940, 1050, 1140].map((x, i) => (
          <g key={i} opacity="0.9">
            <circle cx={x} cy={i % 2 ? 150 : 120} r={26} fill="#0f2b1e" />
            <rect x={x - 3} y={i % 2 ? 168 : 138} width="6" height="22" fill="#0d241a" />
          </g>
        ))}
      </svg>

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

      {/* bushes */}
      <svg className="absolute bottom-[13%] right-[3%] w-44 pointer-events-none" viewBox="0 0 160 80">
        <circle cx="40" cy="60" r="34" fill="#1b4534" />
        <circle cx="90" cy="52" r="40" fill="#20523c" />
        <circle cx="135" cy="64" r="30" fill="#1b4534" />
        <circle cx="70" cy="44" r="5" fill="#ff5347" />
        <circle cx="108" cy="38" r="5" fill="#ff5347" />
        <circle cx="95" cy="62" r="5" fill="#ff5347" />
      </svg>

      {/* grass tufts */}
      {GRASS.map((gt, i) => (
        <GrassTuft key={i} className="absolute bottom-[12.2%] pointer-events-none" style={{ left: `${gt.left}%`, width: gt.w, animationDelay: `${gt.delay}s`, transform: gt.flip ? "scaleX(-1)" : undefined }} />
      ))}

      {/* fireflies */}
      {FIREFLIES.map((f, i) => (
        <div key={i} className="absolute pointer-events-none" style={{ left: `${f.left}%`, top: `${f.top}%` }}>
          <div className="w-[5px] h-[5px] rounded-full bg-[#ffe9ad]" style={{ boxShadow: "0 0 10px 3px rgba(255,233,173,0.7)", animation: `kf-firefly ${f.dur}s ease-in-out ${f.delay}s infinite` }} />
        </div>
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
            <BigTree />
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

      {/* ambient leaves */}
      {leaves.map((l) => (
        <div key={l.id} className="absolute pointer-events-none" style={{ left: `${l.xPct}%`, top: "12%", animation: `kf-leaf ${l.dur}ms ease-in ${l.delay}s forwards` }}>
          <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path d="M20 3 Q22 14 12 19 Q4 15 4 8 Q4 4 20 3 Z" fill="#6cc24a" />
            <path d="M6 16 Q11 10 18 5" stroke="#3f7f3a" strokeWidth="1.4" fill="none" />
          </svg>
        </div>
      ))}

      {/* falling apples */}
      {falls.map((f) => (
        <div key={f.id} className="absolute pointer-events-none" style={{ left: `${f.xPct}%`, top: `${f.yPct}%`, ["--dx" as string]: `${f.dx}px`, ["--dy" as string]: `${f.dy}px`, ["--rot" as string]: `${f.rot}deg`, animation: `kf-apple-fall ${f.dur}ms cubic-bezier(0.45, 0, 0.9, 0.6) forwards` }}>
          <svg viewBox="0 0 30 30" style={{ width: f.size }}>
            <circle cx="15" cy="17" r="11" fill="#ff5347" />
            <ellipse cx="11" cy="13" rx="3" ry="4" fill="#ff9c8f" opacity="0.85" transform="rotate(-22 11 13)" />
            <path d="M15 7 q 1.5 -4 5 -5" stroke="#6b4226" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </div>
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
          onClick={game.catchGolden}
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

      {/* frenzy tint */}
      {frenzy && <div className="absolute inset-0 pointer-events-none z-10" style={{ background: "radial-gradient(circle at 50% 42%, rgba(255,201,77,0.22), transparent 62%)", animation: "kf-frenzy 1.1s ease-in-out infinite" }} />}
      {surge && <div className="absolute inset-0 pointer-events-none z-10" style={{ boxShadow: "inset 0 0 120px rgba(255,83,71,0.35)" }} />}

      {/* vignette */}
      <div className="absolute inset-0 pointer-events-none z-10" style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(4,13,10,0.5) 100%)" }} />

      {/* ---------- HUD ---------- */}
      <div className="absolute top-3 left-3 sm:top-5 sm:left-5 z-30 pointer-events-none">
        <div className="flex items-center gap-2 mb-1">
          <Icon name="leaf" className="w-5 h-5" />
          <span className="font-display tracking-[0.22em] text-[13px] text-[#a8d18a] text-outline-sm">APPLEFALL</span>
        </div>
        <div key={bumpKey} className={`flex items-end gap-2.5 ${bumpKey ? "bump" : ""}`}>
          <Icon name="apple" className="w-9 h-9 sm:w-11 sm:h-11 mb-1 drop-shadow-lg" />
          <span className="font-display text-4xl sm:text-5xl lg:text-6xl leading-none text-cream text-outline tabular-nums">{formatNumber(s.apples)}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5 pointer-events-none">
          <span className="bg-pine-950/70 border border-leaf/30 text-leaf font-bold text-xs sm:text-[13px] px-2.5 py-1 rounded-full backdrop-blur-[2px]">
            {formatAps(derived.aps)} / sec
          </span>
          <span className="bg-pine-950/70 border border-gold/30 text-gold font-bold text-xs sm:text-[13px] px-2.5 py-1 rounded-full">
            +{formatNumber(derived.clickPower)} / click
          </span>
          {s.seeds > 0 && (
            <span className="bg-pine-950/70 border border-gold/40 text-gold font-bold text-xs sm:text-[13px] px-2.5 py-1 rounded-full flex items-center gap-1">
              <Icon name="seed" className="w-4 h-4" /> {s.seeds} seed{s.seeds > 1 ? "s" : ""} · +{s.seeds * 10}%
            </span>
          )}
        </div>
        {/* active buffs */}
        <div className="mt-2 space-y-1.5">
          {s.buffs.filter((b) => b.endsAt > now).map((b, i) => {
            const total = b.kind === "frenzy" ? 30_000 : 20_000;
            const remain = Math.max(0, b.endsAt - now);
            return (
              <div key={i} className={`w-52 rounded-lg overflow-hidden border ${b.kind === "frenzy" ? "border-gold/50 bg-gold/15" : "border-apple/50 bg-apple/15"}`}>
                <div className="flex items-center gap-2 px-2.5 py-1">
                  <Icon name={b.kind === "frenzy" ? "sparkle" : "thunder"} className="w-4 h-4" />
                  <span className={`font-display text-[13px] ${b.kind === "frenzy" ? "text-gold" : "text-[#ff9c8f]"}`}>
                    {b.kind === "frenzy" ? `Frenzy ×${b.mult}` : `Surge ×${b.mult}`}
                  </span>
                  <span className="ml-auto text-[11px] font-bold text-cream/80 tabular-nums">{Math.ceil(remain / 1000)}s</span>
                </div>
                <div className="h-1 bg-black/30">
                  <div className={`h-full ${b.kind === "frenzy" ? "bg-gold" : "bg-apple"}`} style={{ width: `${(remain / total) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* controls */}
      <div className="absolute top-3 right-3 sm:top-5 sm:right-5 z-30 flex items-start gap-2">
        {saveFlash && <span className="mt-2 text-leaf font-bold text-xs bg-pine-950/70 border border-leaf/40 rounded-full px-2.5 py-1">Saved ✓</span>}
        <button onClick={game.toggleMute} className="w-10 h-10 rounded-full bg-bark-800/85 border-2 border-bark-600 flex items-center justify-center hover:border-gold/60 hover:-translate-y-0.5 transition-all shadow-lg" title={s.muted ? "Unmute" : "Mute"}>
          <Icon name={s.muted ? "mute" : "sound"} className="w-5 h-5" />
        </button>
        <button onClick={doSave} className="w-10 h-10 rounded-full bg-bark-800/85 border-2 border-bark-600 flex items-center justify-center hover:border-gold/60 hover:-translate-y-0.5 transition-all shadow-lg" title="Save game">
          <Icon name="save" className="w-5 h-5" />
        </button>
        <button onClick={onRequestReset} className="w-10 h-10 rounded-full bg-bark-800/85 border-2 border-bark-600 flex items-center justify-center hover:border-apple/70 hover:-translate-y-0.5 transition-all shadow-lg" title="Reset game">
          <Icon name="reset" className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
