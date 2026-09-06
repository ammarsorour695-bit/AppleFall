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

/* ---------------- the great apple tree (hand-built SVG) ---------------- */

const TREE_APPLES = [
  { x: 112, y: 200, r: 12 }, { x: 148, y: 146, r: 13 }, { x: 186, y: 106, r: 12 },
  { x: 226, y: 86, r: 13 }, { x: 266, y: 116, r: 12 }, { x: 300, y: 162, r: 13 },
  { x: 130, y: 232, r: 11 }, { x: 172, y: 198, r: 12 }, { x: 212, y: 160, r: 13 },
  { x: 252, y: 198, r: 12 }, { x: 288, y: 228, r: 11 }, { x: 206, y: 226, r: 11 },
  { x: 164, y: 252, r: 10 }, { x: 248, y: 250, r: 10 },
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

function GreatTree() {
  return (
    <svg viewBox="0 0 420 520" className="w-full h-full drop-shadow-[0_18px_28px_rgba(0,0,0,0.35)]">
      <ellipse cx="210" cy="496" rx="158" ry="15" fill="rgba(6,20,14,0.45)" />
      {/* roots */}
      <path d="M 176 494 C 160 486 140 486 122 492 C 146 478 168 476 184 480 Z" fill="#5f3d1e" />
      <path d="M 248 494 C 264 486 284 486 302 492 C 278 478 256 476 240 480 Z" fill="#5f3d1e" />
      {/* trunk */}
      <path d="M 180 494 C 188 404 182 350 164 300 L 198 310 C 204 272 204 248 198 218 L 228 218 C 224 250 230 278 242 304 L 266 292 C 247 342 241 404 248 494 Z" fill="#6e4426" />
      <path d="M 190 486 C 196 412 192 362 182 322 M 228 486 C 226 420 230 366 238 326 M 205 300 q 4 -30 2 -56" stroke="#533015" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.85" />
      <path d="M 238 486 C 238 428 242 376 252 332" stroke="#8a5a2f" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.8" />
      {/* knots (a sleepy face) */}
      <ellipse cx="200" cy="392" rx="9" ry="12" fill="#4a2a12" />
      <ellipse cx="200" cy="392" rx="5" ry="7" fill="#33200f" />
      <ellipse cx="226" cy="412" rx="6" ry="8" fill="#4a2a12" />
      <ellipse cx="226" cy="412" rx="3" ry="4.5" fill="#33200f" />
      <path d="M 199 434 q 14 8 28 1" stroke="#4a2a12" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* branches */}
      <path d="M 198 244 L 152 198 M 226 240 L 274 196 M 212 228 L 210 176" stroke="#6e4426" strokeWidth="14" strokeLinecap="round" />
      <path d="M 176 220 L 130 214 M 244 214 L 292 218" stroke="#6e4426" strokeWidth="9" strokeLinecap="round" />
      {/* canopy */}
      <circle cx="210" cy="152" r="124" fill="#28602f" />
      <circle cx="116" cy="198" r="82" fill="#28602f" />
      <circle cx="304" cy="198" r="86" fill="#28602f" />
      <circle cx="146" cy="108" r="74" fill="#28602f" />
      <circle cx="274" cy="108" r="78" fill="#28602f" />
      <circle cx="210" cy="142" r="104" fill="#3a8342" />
      <circle cx="138" cy="180" r="68" fill="#3a8342" />
      <circle cx="282" cy="180" r="70" fill="#3a8342" />
      <circle cx="210" cy="92" r="64" fill="#3a8342" />
      <circle cx="182" cy="122" r="58" fill="#55a84c" />
      <circle cx="256" cy="136" r="52" fill="#55a84c" />
      <circle cx="210" cy="74" r="42" fill="#55a84c" />
      <circle cx="158" cy="98" r="27" fill="#6fc163" opacity="0.9" />
      <circle cx="238" cy="86" r="21" fill="#6fc163" opacity="0.9" />
      <circle cx="290" cy="152" r="19" fill="#6fc163" opacity="0.75" />
      {/* sunset rim light on the sun side */}
      <circle cx="318" cy="176" r="24" fill="#8cc565" opacity="0.85" />
      <circle cx="298" cy="116" r="20" fill="#8cc565" opacity="0.8" />
      <path d="M 352 128 A 124 124 0 0 1 366 238" stroke="#f6c66b" strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.5" />
      {/* apples */}
      {TREE_APPLES.map((a, i) => (
        <TreeApple key={i} {...a} i={i} />
      ))}
      {/* ladder leaning on the trunk */}
      <g stroke="#8a5a2b" strokeWidth="5" strokeLinecap="round">
        <line x1="120" y1="492" x2="178" y2="330" />
        <line x1="146" y1="496" x2="202" y2="336" />
        <line x1="130" y1="466" x2="154" y2="470" />
        <line x1="141" y1="434" x2="164" y2="438" />
        <line x1="152" y1="402" x2="174" y2="406" />
        <line x1="162" y1="370" x2="183" y2="374" />
        <line x1="172" y1="340" x2="192" y2="344" />
      </g>
      {/* rope swing */}
      <g style={{ transformOrigin: "296px 214px", animation: "kf-swing 4.6s ease-in-out infinite" }}>
        <line x1="288" y1="216" x2="284" y2="310" stroke="#c9a35f" strokeWidth="3.5" />
        <line x1="306" y1="216" x2="302" y2="310" stroke="#c9a35f" strokeWidth="3.5" />
        <rect x="276" y="308" width="34" height="8" rx="3" fill="#8a5a2b" />
      </g>
      {/* bird */}
      <g style={{ animation: "kf-bob 2.6s ease-in-out infinite" }}>
        <ellipse cx="130" cy="208" rx="13" ry="10" fill="#e85d4a" />
        <circle cx="140" cy="200" r="6.5" fill="#e85d4a" />
        <path d="M 146 200 l 7 2 l -7 3 Z" fill="#f2b03d" />
        <circle cx="141.5" cy="198.5" r="1.4" fill="#2e2620" />
        <path d="M 120 206 l -9 -4 l 3 8 Z" fill="#c94a38" />
      </g>
      {/* fallen apples at the base */}
      <circle cx="168" cy="488" r="8" fill="#ff5347" />
      <ellipse cx="165" cy="485" rx="2.4" ry="3.2" fill="#ff9c8f" />
      <circle cx="262" cy="492" r="7" fill="#ff5347" />
      <ellipse cx="259.5" cy="489.5" rx="2" ry="2.8" fill="#ff9c8f" />
      <circle cx="250" cy="497" r="6" fill="#d9483f" />
    </svg>
  );
}

/* ---------------- scenery pieces ---------------- */

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

function MiniTree({ x, y, s, c }: { x: number; y: number; s: number; c: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-2.5" y="0" width="5" height="16" fill="#0d241a" />
      <circle cx="0" cy="-14" r="17" fill={c} />
      <circle cx="-9" cy="-7" r="10" fill={c} />
      <circle cx="9" cy="-7" r="10" fill={c} />
    </g>
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
    if (p.g === 0 && p.u === 0 && p.a === 0 && p.t === 0 && (g > 0 || u > 0 || a > 0 || s.transplants > 0)) {
      /* first hydration tick after loading a save — no fanfare */
    } else {
      if (g > p.g) playSfx("buy");
      if (u > p.u) playSfx("upgrade");
      if (a > p.a) playSfx("achieve");
      if (s.transplants > p.t) playSfx("transplant");
    }
    prevCounts.current = { g, u, a, t: s.transplants };
  }, [s.owned, s.upgrades.length, s.achievements.length, s.transplants]);

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
    <div ref={sceneRef} className="relative flex-1 min-h-0 overflow-hidden select-none" style={{ background: "linear-gradient(to bottom, #07181c 0%, #0e3128 30%, #1c5741 52%, #8fae5e 70%, #f2a94f 79%, #e2863f 84%, #3c8a46 84.4%, #2b6a37 92%, #1f4f2a 100%)" }}>
      <style>{`
        .px-frame-a { animation: kf-pxA 0.6s steps(1, end) infinite; }
        .px-frame-b { animation: kf-pxB 0.6s steps(1, end) infinite; }
        @keyframes kf-pxA { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes kf-pxB { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes kf-ring { 0% { transform: translate(-50%,-50%) scale(0.35); opacity: 0.9; } 100% { transform: translate(-50%,-50%) scale(2.4); opacity: 0; } }
        @keyframes kf-swing { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
        @keyframes kf-flicker { 0%, 100% { opacity: 0.9; } 40% { opacity: 0.6; } 55% { opacity: 1; } 72% { opacity: 0.7; } }
      `}</style>

      {/* stars */}
      {STARS.map((st, i) => (
        <div key={i} className="absolute rounded-full bg-[#fff3cf] pointer-events-none" style={{ left: `${st.left}%`, top: `${st.top}%`, width: st.s, height: st.s, animation: `kf-twinkle ${st.dur}s ease-in-out ${st.delay}s infinite` }} />
      ))}

      {/* sun with rotating rays */}
      <div className="absolute pointer-events-none" style={{ left: "66%", top: "62%" }}>
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

      {/* hills + distant orchard rows + barn */}
      <svg className="absolute bottom-[15%] left-0 w-full pointer-events-none" viewBox="0 0 1200 240" preserveAspectRatio="none" style={{ height: "36%" }}>
        <path d="M0 240 L0 130 Q 200 40 420 120 Q 640 190 830 100 Q 1010 25 1200 110 L1200 240 Z" fill="#143726" />
        <path d="M0 240 L0 185 Q 260 105 520 175 Q 780 245 1000 160 Q 1110 122 1200 150 L1200 240 Z" fill="#1b4534" />
        {/* far orchard rows */}
        <g opacity="0.9">
          <MiniTree x={80} y={150} s={0.8} c="#0f2b1e" />
          <MiniTree x={150} y={132} s={0.9} c="#0f2b1e" />
          <MiniTree x={225} y={124} s={0.8} c="#0f2b1e" />
          <MiniTree x={300} y={134} s={0.85} c="#0f2b1e" />
          <MiniTree x={372} y={152} s={0.75} c="#0f2b1e" />
          <MiniTree x={905} y={122} s={0.85} c="#0f2b1e" />
          <MiniTree x={975} y={138} s={0.8} c="#0f2b1e" />
          <MiniTree x={1045} y={152} s={0.9} c="#0f2b1e" />
          <MiniTree x={1120} y={160} s={0.8} c="#0f2b1e" />
        </g>
        <g opacity="0.95">
          <MiniTree x={110} y={206} s={1.15} c="#123222" />
          <MiniTree x={205} y={196} s={1.2} c="#123222" />
          <MiniTree x={300} y={196} s={1.1} c="#123222" />
          <MiniTree x={395} y={204} s={1.15} c="#123222" />
          <MiniTree x={760} y={222} s={1.2} c="#123222" />
          <MiniTree x={860} y={208} s={1.1} c="#123222" />
          <MiniTree x={1085} y={196} s={1.15} c="#123222" />
        </g>
        {/* barn with a lit window */}
        <g>
          <path d="M 560 205 L 560 165 L 600 142 L 640 165 L 640 205 Z" fill="#3d2417" />
          <path d="M 552 168 L 600 138 L 648 168 L 640 168 L 600 146 L 560 168 Z" fill="#2a1810" />
          <rect x="590" y="176" width="20" height="29" fill="#241407" />
          <rect x="566" y="170" width="14" height="12" fill="#ffd98a" style={{ animation: "kf-flicker 3.4s ease-in-out infinite" }} />
          <rect x="620" y="170" width="14" height="12" fill="#ffd98a" style={{ animation: "kf-flicker 4.1s ease-in-out 1.2s infinite" }} />
        </g>
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
            <GreatTree />
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
      {frenzy && <div className="absolute inset-0 pointer-events-none z-10" style={{ background: "radial-gradient(circle at 50% 42%, rgba(255,201,77,0.22), transparent 62%)", animation: "kf-frenzy 1.1s ease-in-out infinite" }} />}
      {surge && <div className="absolute inset-0 pointer-events-none z-10" style={{ boxShadow: "inset 0 0 120px rgba(255,83,71,0.35)" }} />}

      {/* vignette */}
      <div className="absolute inset-0 pointer-events-none z-10" style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(4,13,10,0.45) 100%)" }} />

      {/* ---------- HUD ---------- */}
      <div className="absolute top-3 left-3 sm:top-5 sm:left-5 z-30 pointer-events-none">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-leaf"><Icon name="leaf" className="w-5 h-5" /></span>
          <span className="font-display tracking-[0.22em] text-[13px] text-[#a8d18a] text-outline-sm">APPLEFALL</span>
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
