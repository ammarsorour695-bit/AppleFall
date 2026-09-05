import type { JSX } from "react";

function Apl({ cx, cy, r, body = "#ff5347", shine = "#ff9c8f", stem = true }: { cx: number; cy: number; r: number; body?: string; shine?: string; stem?: boolean }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={body} />
      <ellipse cx={cx - r * 0.35} cy={cy - r * 0.3} rx={r * 0.28} ry={r * 0.38} fill={shine} opacity="0.75" transform={`rotate(-22 ${cx - r * 0.35} ${cy - r * 0.3})`} />
      {stem && (
        <>
          <path d={`M ${cx} ${cy - r + 1} q ${r * 0.12} ${-r * 0.45} ${r * 0.42} ${-r * 0.6}`} stroke="#6b4226" strokeWidth={Math.max(1.4, r * 0.16)} fill="none" strokeLinecap="round" />
          <ellipse cx={cx + r * 0.55} cy={cy - r * 1.25} rx={r * 0.42} ry={r * 0.2} fill="#63b453" transform={`rotate(-24 ${cx + r * 0.55} ${cy - r * 1.25})`} />
        </>
      )}
    </g>
  );
}

function GoldApl({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#ffc94d" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e09a1f" strokeWidth={r * 0.12} />
      <ellipse cx={cx - r * 0.35} cy={cy - r * 0.3} rx={r * 0.26} ry={r * 0.36} fill="#ffe9ad" opacity="0.9" transform={`rotate(-22 ${cx - r * 0.35} ${cy - r * 0.3})`} />
      <path d={`M ${cx} ${cy - r + 1} q ${r * 0.12} ${-r * 0.45} ${r * 0.42} ${-r * 0.6}`} stroke="#8a5a2b" strokeWidth={Math.max(1.4, r * 0.16)} fill="none" strokeLinecap="round" />
      <ellipse cx={cx + r * 0.55} cy={cy - r * 1.25} rx={r * 0.42} ry={r * 0.2} fill="#8fd45f" transform={`rotate(-24 ${cx + r * 0.55} ${cy - r * 1.25})`} />
    </g>
  );
}

function Spark({ x, y, s = 4, c = "#fff3cf" }: { x: number; y: number; s?: number; c?: string }) {
  return <path d={`M ${x} ${y - s} L ${x + s * 0.28} ${y - s * 0.28} L ${x + s} ${y} L ${x + s * 0.28} ${y + s * 0.28} L ${x} ${y + s} L ${x - s * 0.28} ${y + s * 0.28} L ${x - s} ${y} L ${x - s * 0.28} ${y - s * 0.28} Z`} fill={c} />;
}

export function Icon({ name, className = "w-8 h-8" }: { name: string; className?: string }): JSX.Element {
  let inner: JSX.Element;
  switch (name) {
    case "apple":
      inner = <Apl cx={24} cy={27} r={15} />;
      break;
    case "goldapple":
      inner = (
        <g>
          <GoldApl cx={24} cy={27} r={14} />
          <Spark x={10} y={12} s={5} />
          <Spark x={38} y={20} s={4} />
          <Spark x={33} y={40} s={3} />
        </g>
      );
      break;
    case "can":
      inner = (
        <g>
          <path d="M10 20 L28 16 L30 34 Q20 38 12 34 Z" fill="#7fb3c8" />
          <path d="M10 20 L28 16 L29 22 L11 26 Z" fill="#a5d0de" />
          <path d="M28 18 L38 10 L41 13 L30 26" fill="#5f93a8" />
          <rect x="37" y="7" width="7" height="8" rx="2" fill="#4a7a8e" transform="rotate(40 40 11)" />
          <path d="M14 17 Q12 8 20 8 Q26 8 25 15" stroke="#4a7a8e" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="43" cy="20" r="1.6" fill="#8fd7f2" />
          <circle cx="40" cy="25" r="1.6" fill="#8fd7f2" />
          <circle cx="44" cy="28" r="1.4" fill="#8fd7f2" />
        </g>
      );
      break;
    case "compost":
      inner = (
        <g>
          <path d="M6 38 Q10 20 24 18 Q38 20 42 38 Z" fill="#6e4a26" />
          <path d="M6 38 Q14 30 24 32 Q34 30 42 38 Z" fill="#57381b" />
          <circle cx="17" cy="28" r="1.8" fill="#8f6434" />
          <circle cx="27" cy="24" r="1.8" fill="#8f6434" />
          <circle cx="33" cy="31" r="1.8" fill="#8f6434" />
          <path d="M18 14 q3 -3 0 -6 M28 12 q3 -3 0 -6" stroke="#b9c9b0" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
        </g>
      );
      break;
    case "ladybug":
      inner = (
        <g>
          <circle cx="24" cy="15" r="6.5" fill="#2e2620" />
          <path d="M20 10 q-3 -4 -6 -4 M28 10 q3 -4 6 -4" stroke="#2e2620" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <ellipse cx="24" cy="29" rx="14" ry="12.5" fill="#e8412f" />
          <line x1="24" y1="17" x2="24" y2="41" stroke="#2e2620" strokeWidth="2" />
          <circle cx="16.5" cy="24" r="2.4" fill="#2e2620" />
          <circle cx="31.5" cy="24" r="2.4" fill="#2e2620" />
          <circle cx="18" cy="34" r="2.2" fill="#2e2620" />
          <circle cx="30" cy="34" r="2.2" fill="#2e2620" />
        </g>
      );
      break;
    case "hive":
      inner = (
        <g>
          <rect x="12" y="8" width="20" height="8" rx="4" fill="#e8b84b" />
          <rect x="9" y="15" width="26" height="8" rx="4" fill="#d9a63a" />
          <rect x="12" y="22" width="20" height="8" rx="4" fill="#c9932e" />
          <rect x="15" y="29" width="14" height="8" rx="4" fill="#b78324" />
          <circle cx="22" cy="33" r="2.6" fill="#5c3f12" />
          <ellipse cx="38" cy="12" rx="4" ry="3" fill="#f2c94c" />
          <path d="M35 12 h6 M35.5 10 h5" stroke="#4a3410" strokeWidth="1.1" />
          <ellipse cx="38" cy="8" rx="3" ry="1.6" fill="#cfe8f5" opacity="0.9" />
        </g>
      );
      break;
    case "scarecrow":
      inner = (
        <g>
          <line x1="24" y1="16" x2="24" y2="44" stroke="#7a5226" strokeWidth="3.4" strokeLinecap="round" />
          <line x1="10" y1="24" x2="38" y2="24" stroke="#7a5226" strokeWidth="3.4" strokeLinecap="round" />
          <path d="M14 24 L10 32 M34 24 L38 32" stroke="#d9b45c" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="24" cy="13" r="7" fill="#e8c877" />
          <circle cx="21.5" cy="12.5" r="1.1" fill="#4a3410" />
          <circle cx="26.5" cy="12.5" r="1.1" fill="#4a3410" />
          <path d="M21 16.5 q3 2 6 0" stroke="#4a3410" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M15 8 L33 8 L30 2 L18 2 Z" fill="#8a5a2b" />
          <rect x="12" y="7.4" width="24" height="3" rx="1.5" fill="#a06c33" />
        </g>
      );
      break;
    case "ladder":
      inner = (
        <g>
          <line x1="16" y1="12" x2="13" y2="44" stroke="#c98d4b" strokeWidth="3.4" strokeLinecap="round" />
          <line x1="32" y1="12" x2="35" y2="44" stroke="#c98d4b" strokeWidth="3.4" strokeLinecap="round" />
          <line x1="15.4" y1="19" x2="32.6" y2="19" stroke="#e0a763" strokeWidth="3" strokeLinecap="round" />
          <line x1="14.7" y1="27" x2="33.3" y2="27" stroke="#e0a763" strokeWidth="3" strokeLinecap="round" />
          <line x1="14" y1="35" x2="34" y2="35" stroke="#e0a763" strokeWidth="3" strokeLinecap="round" />
          <Apl cx={24} cy={9} r={6} />
        </g>
      );
      break;
    case "dog":
      inner = (
        <g>
          <circle cx="24" cy="26" r="14" fill="#c98d4b" />
          <path d="M11 20 Q6 28 10 36 Q15 34 14 24 Z" fill="#8a5a2b" />
          <path d="M37 20 Q42 28 38 36 Q33 34 34 24 Z" fill="#8a5a2b" />
          <path d="M14 14 Q18 6 24 8 Q22 14 16 16 Z" fill="#8a5a2b" />
          <ellipse cx="24" cy="31" rx="7" ry="5.6" fill="#e8c896" />
          <ellipse cx="24" cy="29" rx="2.6" ry="2" fill="#3a2812" />
          <circle cx="18.5" cy="23" r="1.8" fill="#3a2812" />
          <circle cx="29.5" cy="23" r="1.8" fill="#3a2812" />
          <path d="M24 33 q0 3 -2.5 3.5" stroke="#3a2812" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </g>
      );
      break;
    case "crew":
      inner = (
        <g>
          <circle cx="15" cy="14" r="6" fill="#e8b48a" />
          <path d="M8 11 h14 l-2 -5 h-10 Z" fill="#d9b45c" />
          <path d="M8 28 q0 -8 7 -8 q7 0 7 8 Z" fill="#5b8fc9" />
          <circle cx="34" cy="18" r="5" fill="#c98d5f" />
          <path d="M27 30 q0 -7 7 -7 q7 0 7 7 Z" fill="#c96a5b" />
          <Apl cx={24} cy={38} r={6.5} />
          <path d="M16 30 q6 6 14 2" stroke="#e8b48a" strokeWidth="3.4" fill="none" strokeLinecap="round" />
        </g>
      );
      break;
    case "tractor":
      inner = (
        <g>
          <rect x="8" y="18" width="22" height="12" rx="3" fill="#d9483b" />
          <path d="M24 18 L28 8 L38 8 L40 18 Z" fill="#b5372c" />
          <rect x="30" y="10" width="7" height="7" rx="1.5" fill="#bfe3ee" />
          <rect x="12" y="12" width="3" height="7" rx="1.5" fill="#6e6e6e" />
          <circle cx="14" cy="33" r="8" fill="#3a3a3a" />
          <circle cx="14" cy="33" r="4" fill="#8a8a8a" />
          <circle cx="35" cy="35" r="5.5" fill="#3a3a3a" />
          <circle cx="35" cy="35" r="2.6" fill="#8a8a8a" />
        </g>
      );
      break;
    case "press":
      inner = (
        <g>
          <rect x="12" y="16" width="24" height="24" rx="5" fill="#8a5a2b" />
          <rect x="12" y="20" width="24" height="3.4" fill="#6e441d" />
          <rect x="12" y="31" width="24" height="3.4" fill="#6e441d" />
          <rect x="21" y="6" width="6" height="10" rx="2" fill="#5c5c5c" />
          <rect x="16" y="4" width="16" height="4" rx="2" fill="#7a7a7a" />
          <path d="M36 34 q5 2 4 7" stroke="#6e441d" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="40" cy="44" r="2.4" fill="#e8b84b" />
        </g>
      );
      break;
    case "bakery":
      inner = (
        <g>
          <path d="M8 30 L40 30 L36 42 L12 42 Z" fill="#c9c9c9" />
          <path d="M10 30 Q12 18 24 18 Q36 18 38 30 Z" fill="#e8a44b" />
          <path d="M14 28 L20 20 M20 30 L28 20 M26 30 L34 22 M16 22 L22 29 M24 19 L31 29" stroke="#c07f2e" strokeWidth="2" strokeLinecap="round" />
          <path d="M18 12 q3 -3 0 -6 M28 12 q3 -3 0 -6" stroke="#d9d0bd" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.9" />
        </g>
      );
      break;
    case "dome":
      inner = (
        <g>
          <rect x="6" y="38" width="36" height="4" rx="2" fill="#8a8f7a" />
          <path d="M8 38 Q8 12 24 12 Q40 12 40 38 Z" fill="#a8dbe8" opacity="0.55" />
          <path d="M8 38 Q8 12 24 12 Q40 12 40 38" fill="none" stroke="#cfeef5" strokeWidth="2.4" />
          <path d="M14 38 Q14 16 24 13 M34 38 Q34 16 24 13 M9.5 28 h29" stroke="#cfeef5" strokeWidth="1.6" fill="none" opacity="0.8" />
          <path d="M24 38 v-9 M24 30 q-5 -2 -6 -8 q6 0 6 5 q0 -5 6 -5 q-1 6 -6 8" fill="#4caf50" />
        </g>
      );
      break;
    case "sprinkler":
      inner = (
        <g>
          <rect x="21.5" y="24" width="5" height="18" rx="2" fill="#7a8a94" />
          <rect x="17" y="18" width="14" height="7" rx="3.5" fill="#5f707a" />
          <path d="M18 16 Q10 8 4 12 M30 16 Q38 8 44 12 M20 14 Q16 4 10 4 M28 14 Q32 4 38 4" stroke="#6fc3e8" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeDasharray="1 6" />
          <circle cx="6" cy="16" r="1.7" fill="#6fc3e8" />
          <circle cx="42" cy="16" r="1.7" fill="#6fc3e8" />
          <circle cx="12" cy="6" r="1.7" fill="#6fc3e8" />
          <circle cx="36" cy="6" r="1.7" fill="#6fc3e8" />
        </g>
      );
      break;
    case "golem":
      inner = (
        <g>
          <path d="M12 44 L14 24 Q14 12 24 12 Q34 12 34 24 L36 44 Z" fill="#8f978f" />
          <path d="M16 44 L18 28 Q18 18 24 18 Q30 18 30 28 L32 44 Z" fill="#767e76" />
          <circle cx="20" cy="24" r="2.2" fill="#8ef58a" />
          <circle cx="28" cy="24" r="2.2" fill="#8ef58a" />
          <path d="M20 31 q4 3 8 0" stroke="#5c645c" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M24 12 q-1 -5 3 -7 M24 12 q2 -4 0 -7" stroke="#6b4226" strokeWidth="2" fill="none" strokeLinecap="round" />
          <ellipse cx="29" cy="5.5" rx="3.4" ry="1.7" fill="#63b453" transform="rotate(-20 29 5.5)" />
        </g>
      );
      break;
    case "druid":
      inner = (
        <g>
          <rect x="10" y="10" width="6" height="32" rx="2" fill="#7f8fa3" />
          <rect x="32" y="10" width="6" height="32" rx="2" fill="#7f8fa3" />
          <rect x="8" y="6" width="32" height="6" rx="2.5" fill="#93a3b5" />
          <path d="M18 22 l4 4 -4 4 M30 22 l-4 4 4 4" stroke="#8ef5d0" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <circle cx="24" cy="26" r="3" fill="#8ef5d0" opacity="0.9" />
          <path d="M14 42 h20" stroke="#5f6f5f" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
      break;
    case "rainbow":
      inner = (
        <g>
          <path d="M8 30 Q8 12 24 12 Q40 12 40 30" stroke="#e85d4a" strokeWidth="3.6" fill="none" />
          <path d="M12 30 Q12 16 24 16 Q36 16 36 30" stroke="#f2b03d" strokeWidth="3.6" fill="none" />
          <path d="M16 30 Q16 20 24 20 Q32 20 32 30" stroke="#5fae52" strokeWidth="3.6" fill="none" />
          <path d="M24 32 v6 M24 38 q-4 0 -8 4 M24 38 q4 0 8 4 M24 35 q-3 -1 -6 -4 M24 35 q3 -1 6 -4" stroke="#8a5a2b" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        </g>
      );
      break;
    case "cloud":
      inner = (
        <g>
          <path d="M10 22 Q4 22 6 15 Q8 8 16 9 Q18 3 26 4 Q34 3 35 10 Q43 10 42 17 Q42 22 36 22 Z" fill="#eef4f7" />
          <line x1="14" y1="22" x2="14" y2="30" stroke="#b5c4c9" strokeWidth="1.6" />
          <line x1="24" y1="22" x2="24" y2="34" stroke="#b5c4c9" strokeWidth="1.6" />
          <line x1="34" y1="22" x2="34" y2="29" stroke="#b5c4c9" strokeWidth="1.6" />
          <Apl cx={14} cy={35} r={5} />
          <Apl cx={24} cy={39.5} r={5.5} />
          <Apl cx={34} cy={34} r={4.6} />
        </g>
      );
      break;
    case "timesap":
      inner = (
        <g>
          <path d="M12 4 h24 M12 44 h24 M14 4 Q14 18 24 24 Q14 30 14 44 M34 4 Q34 18 24 24 Q34 30 34 44" stroke="#d9b45c" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M24 38 v-9 M24 30 q-4 -2 -5 -6 q5 0 5 4 q0 -4 5 -4 q-1 4 -5 6" fill="#4caf50" />
          <circle cx="24" cy="12" r="4.4" fill="#cfe8f5" stroke="#8ab4c4" strokeWidth="1.6" />
          <path d="M24 9.6 v2.6 l1.8 1.2" stroke="#4a6a7a" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </g>
      );
      break;
    case "star":
      inner = (
        <g>
          <path d="M24 3 l4.7 9.8 10.8 1.4 -7.9 7.5 2 10.7 -9.6 -5.2 -9.6 5.2 2 -10.7 -7.9 -7.5 10.8 -1.4 Z" fill="#ffd76a" stroke="#e0a52e" strokeWidth="1.6" />
          <path d="M14 44 h20 l-2.4 -8 h-15.2 Z" fill="#b5652e" />
          <path d="M24 36 v-5 M24 32 q-3 -1 -4 -4 q4 0 4 3 q0 -3 4 -3 q-1 3 -4 4" fill="#5fae52" />
        </g>
      );
      break;
    case "world":
      inner = (
        <g>
          <circle cx="24" cy="18" r="14" fill="#f2c14e" opacity="0.35" />
          <circle cx="24" cy="18" r="10.5" fill="#6cc24a" />
          <circle cx="19" cy="15" r="4" fill="#8fd45f" />
          <path d="M22 44 v-14 q-6 -2 -8 -8 M26 44 v-12 q6 -2 8 -7 M22 32 q2 -2 4 0" stroke="#8a5a2b" strokeWidth="3.4" fill="none" strokeLinecap="round" />
          <Apl cx={19} cy={20} r={2.6} stem={false} />
          <Apl cx={29} cy={16} r={2.6} stem={false} />
          <Apl cx={26} cy={24} r={2.4} stem={false} />
          <path d="M16 44 h16" stroke="#5f8f4f" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
      break;
    case "hand":
      inner = (
        <g>
          <path d="M14 44 v-16 q0 -4 3 -6 l8 -12 q2 -3 5 -1 q2 2 0 5 l-5 8 h8 q4 0 4 4 v12 q0 6 -6 6 Z" fill="#e8b48a" />
          <path d="M19 20 l7 -10" stroke="#c98d5f" strokeWidth="1.8" strokeLinecap="round" />
          <Spark x={38} y={10} s={5} c="#ffd76a" />
          <Spark x={41} y={20} s={3.4} c="#ffd76a" />
        </g>
      );
      break;
    case "glove":
      inner = (
        <g>
          <path d="M12 44 v-18 q0 -3 2.4 -4 L22 8 q2 -3 5 -1.4 q2.4 1.6.8 4.6 L24 18 h7 q4 0 4 4 v14 q0 8 -8 8 Z" fill="#5fae52" />
          <rect x="12" y="38" width="23" height="6" rx="2" fill="#3f7f3a" />
          <path d="M18 22 l4 -7" stroke="#3f7f3a" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      );
      break;
    case "note":
      inner = (
        <g>
          <path d="M18 38 V12 l18 -4 v24" stroke="#ffd76a" strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <ellipse cx="14.5" cy="38" rx="5.5" ry="4.4" fill="#ffd76a" />
          <ellipse cx="32.5" cy="32" rx="5.5" ry="4.4" fill="#ffd76a" />
        </g>
      );
      break;
    case "hands":
      inner = (
        <g>
          <path d="M6 44 v-14 q0 -3 2.6 -4.4 L15 12 q2 -3 4.8 -1.2 q2.2 1.6.7 4.4 L17 21 h6 q3.6 0 3.6 3.6 V44 Z" fill="#e8b48a" />
          <path d="M42 44 v-14 q0 -3 -2.6 -4.4 L33 12 q-2 -3 -4.8 -1.2 q-2.2 1.6 -.7 4.4 L31 21 h-6" stroke="#e8b48a" strokeWidth="0" fill="#c98d5f" />
          <Apl cx={24} cy={10} r={6} />
        </g>
      );
      break;
    case "baton":
      inner = (
        <g>
          <line x1="8" y1="40" x2="34" y2="14" stroke="#e8dcc0" strokeWidth="3.4" strokeLinecap="round" />
          <circle cx="35" cy="13" r="3.4" fill="#ffd76a" />
          <Spark x={42} y={8} s={4.4} c="#ffd76a" />
          <Spark x={40} y={22} s={3} c="#fff3cf" />
          <Spark x={26} y={6} s={3} c="#fff3cf" />
        </g>
      );
      break;
    case "boot":
      inner = (
        <g>
          <path d="M12 6 h12 v18 q0 4 4 6 l8 4 q3 2 3 6 v4 h-27 Z" fill="#8a5a2b" />
          <path d="M12 38 h27 v4 h-27 Z" fill="#5c3a17" />
          <path d="M12 12 h12" stroke="#5c3a17" strokeWidth="2.4" />
          <path d="M6 10 l-4 -3 M7 18 l-5 0 M8 26 l-4 3" stroke="#d9d0bd" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />
        </g>
      );
      break;
    case "trampoline":
      inner = (
        <g>
          <ellipse cx="24" cy="34" rx="17" ry="5" fill="#3a4a5a" />
          <ellipse cx="24" cy="32.5" rx="17" ry="5" fill="#6fc3e8" />
          <ellipse cx="24" cy="32.5" rx="11" ry="3" fill="#4aa3c8" />
          <line x1="10" y1="36" x2="8" y2="45" stroke="#3a4a5a" strokeWidth="3" strokeLinecap="round" />
          <line x1="38" y1="36" x2="40" y2="45" stroke="#3a4a5a" strokeWidth="3" strokeLinecap="round" />
          <Apl cx={24} cy={12} r={6} />
          <path d="M18 22 q6 4 12 0" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.7" />
        </g>
      );
      break;
    case "thunder":
      inner = (
        <g>
          <path d="M10 16 Q6 16 7 10 Q9 4 16 5 Q18 0 25 1 Q32 0 33 6 Q40 6 39 12 Q39 16 33 16 Z" fill="#8f97a8" />
          <path d="M26 16 L18 30 h6 L20 44 L34 26 h-7 L32 16 Z" fill="#ffd76a" stroke="#e0a52e" strokeWidth="1.4" />
        </g>
      );
      break;
    case "fertilizer":
      inner = (
        <g>
          <path d="M12 12 h24 l3 30 q-15 4 -30 0 Z" fill="#b5a06a" />
          <path d="M12 12 q12 -6 24 0 l-1 8 q-11 -5 -22 0 Z" fill="#8f7c4a" />
          <path d="M24 36 v-8 M24 30 q-5 -2 -6 -7 q6 0 6 5 q0 -5 6 -5 q-1 5 -6 7" fill="#4caf50" />
        </g>
      );
      break;
    case "rain":
      inner = (
        <g>
          <path d="M10 22 Q4 22 6 15 Q8 8 16 9 Q18 3 26 4 Q34 3 35 10 Q43 10 42 17 Q42 22 36 22 Z" fill="#b5c9d9" />
          <path d="M14 27 q-2 4 0 6 q2 -2 0 -6 M24 29 q-2 4 0 6 q2 -2 0 -6 M34 27 q-2 4 0 6 q2 -2 0 -6" fill="#6fc3e8" />
          <path d="M14 38 q-2 4 0 6 q2 -2 0 -6 M24 40 q-2 4 0 6 q2 -2 0 -6 M34 38 q-2 4 0 6 q2 -2 0 -6" fill="#6fc3e8" />
        </g>
      );
      break;
    case "moon":
      inner = (
        <g>
          <path d="M32 5 A 18 18 0 1 0 32 43 A 15 15 0 1 1 32 5 Z" fill="#ffd76a" />
          <circle cx="20" cy="18" r="2.4" fill="#e0a52e" opacity="0.6" />
          <circle cx="16" cy="28" r="1.8" fill="#e0a52e" opacity="0.6" />
          <Spark x={39} y={12} s={4} c="#fff3cf" />
          <Spark x={41} y={30} s={3} c="#fff3cf" />
        </g>
      );
      break;
    case "clover":
      inner = (
        <g>
          <circle cx="17" cy="15" r="8" fill="#5fae52" />
          <circle cx="31" cy="15" r="8" fill="#5fae52" />
          <circle cx="14" cy="27" r="8" fill="#4c9445" />
          <circle cx="30" cy="27" r="8" fill="#ffd76a" />
          <path d="M24 24 q2 10 -2 20" stroke="#3f7f3a" strokeWidth="3.4" fill="none" strokeLinecap="round" />
        </g>
      );
      break;
    case "momentum":
      inner = (
        <g>
          <Apl cx={30} cy={26} r={12} />
          <path d="M4 18 h12 M2 26 h10 M4 34 h12" stroke="#ffd76a" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
      break;
    case "avalanche":
      inner = (
        <g>
          <Apl cx={14} cy={12} r={7} />
          <Apl cx={33} cy={20} r={8} />
          <Apl cx={20} cy={36} r={9} />
          <path d="M40 6 l4 4 M42 14 l4 3 M36 38 l3 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        </g>
      );
      break;
    case "butter":
      inner = (
        <g>
          <rect x="12" y="14" width="24" height="26" rx="4" fill="#e8b84b" />
          <rect x="12" y="14" width="24" height="7" rx="3" fill="#c9932e" />
          <rect x="16" y="25" width="16" height="11" rx="2" fill="#fff3cf" />
          <Apl cx={24} cy={30.5} r={3.4} stem={false} />
          <rect x="18" y="8" width="12" height="6" rx="2" fill="#8a5a2b" />
        </g>
      );
      break;
    case "seed":
      inner = (
        <g>
          <path d="M24 6 Q34 16 34 28 A10 10 0 0 1 14 28 Q14 16 24 6 Z" fill="#ffd76a" stroke="#e0a52e" strokeWidth="2" />
          <ellipse cx="20" cy="22" rx="2.4" ry="4" fill="#fff3cf" opacity="0.85" transform="rotate(-16 20 22)" />
          <Spark x={39} y={10} s={4.4} />
          <Spark x={9} y={16} s={3} />
        </g>
      );
      break;
    case "trophy":
      inner = (
        <g>
          <path d="M14 6 h20 v12 q0 8 -10 8 q-10 0 -10 -8 Z" fill="#ffd76a" />
          <path d="M14 9 h-6 q0 9 7 10 M34 9 h6 q0 9 -7 10" stroke="#e0a52e" strokeWidth="2.6" fill="none" />
          <rect x="21" y="26" width="6" height="6" fill="#e0a52e" />
          <rect x="15" y="32" width="18" height="5" rx="2" fill="#c9932e" />
          <rect x="18" y="10" width="4" height="8" rx="2" fill="#fff3cf" opacity="0.7" />
        </g>
      );
      break;
    case "medal":
      inner = (
        <g>
          <path d="M17 4 h6 l-5 12 h-6 Z M31 4 h-6 l5 12 h6 Z" fill="#c96a5b" />
          <circle cx="24" cy="26" r="12" fill="#ffd76a" stroke="#e0a52e" strokeWidth="2.4" />
          <Spark x={24} y={26} s={6} c="#fff3cf" />
        </g>
      );
      break;
    case "lock":
      inner = (
        <g>
          <path d="M15 20 v-5 a9 9 0 0 1 18 0 v5" stroke="#8f97a8" strokeWidth="4" fill="none" />
          <rect x="11" y="20" width="26" height="20" rx="4" fill="#7f8fa3" />
          <circle cx="24" cy="29" r="3" fill="#3a4a5a" />
          <rect x="22.6" y="30" width="2.8" height="6" rx="1.4" fill="#3a4a5a" />
        </g>
      );
      break;
    case "sound":
      inner = (
        <g>
          <path d="M8 19 h7 l9 -8 v26 l-9 -8 h-7 Z" fill="#d8c49a" />
          <path d="M30 17 q5 7 0 14 M35 13 q8 11 0 22" stroke="#d8c49a" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        </g>
      );
      break;
    case "mute":
      inner = (
        <g>
          <path d="M8 19 h7 l9 -8 v26 l-9 -8 h-7 Z" fill="#8a7a5a" />
          <path d="M31 19 l10 10 M41 19 l-10 10" stroke="#d96a5b" strokeWidth="3.2" strokeLinecap="round" />
        </g>
      );
      break;
    case "save":
      inner = (
        <g>
          <rect x="8" y="8" width="32" height="32" rx="5" fill="#7f8fa3" />
          <rect x="14" y="8" width="18" height="11" rx="2" fill="#c9d5e0" />
          <rect x="25" y="10" width="4" height="7" fill="#7f8fa3" />
          <rect x="13" y="25" width="22" height="15" rx="2" fill="#eef2f5" />
        </g>
      );
      break;
    case "reset":
      inner = (
        <g>
          <path d="M38 24 a14 14 0 1 1 -5 -10.6" stroke="#d8c49a" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M34 4 l6 8 -9 2 Z" fill="#d8c49a" />
        </g>
      );
      break;
    case "basket":
      inner = (
        <g>
          <path d="M10 20 h28 l-3.4 20 q-.6 3 -3.6 3 h-14 q-3 0 -3.6 -3 Z" fill="#b5652e" />
          <path d="M10 20 h28 M13 28 h22 M15 36 h18" stroke="#8a4a1e" strokeWidth="2.2" />
          <Apl cx={18} cy={16} r={5.4} />
          <Apl cx={29} cy={15} r={5.4} />
        </g>
      );
      break;
    case "tree":
      inner = (
        <g>
          <circle cx="24" cy="17" r="12" fill="#5fae52" />
          <circle cx="15" cy="22" r="8" fill="#4c9445" />
          <circle cx="33" cy="22" r="8" fill="#6cc24a" />
          <path d="M22 44 v-15 q-4 -1 -6 -5 M26 44 v-14 q4 -2 5 -5" stroke="#8a5a2b" strokeWidth="3.6" fill="none" strokeLinecap="round" />
          <Apl cx={20} cy={16} r={3} stem={false} />
          <Apl cx={29} cy={21} r={3} stem={false} />
        </g>
      );
      break;
    case "wrench":
      inner = (
        <g>
          <path d="M40 14 a9 9 0 0 1 -12 11 L16 37 a4.4 4.4 0 0 1 -6.2 -6.2 L22 19 A9 9 0 0 1 33 7 l-5 5 2 5 5 2 Z" fill="#8f97a8" />
          <circle cx="12.5" cy="33.5" r="1.8" fill="#3a4a5a" />
        </g>
      );
      break;
    case "chart":
      inner = (
        <g>
          <rect x="8" y="26" width="7" height="16" rx="2" fill="#6cc24a" />
          <rect x="19" y="18" width="7" height="24" rx="2" fill="#ffd76a" />
          <rect x="30" y="9" width="7" height="33" rx="2" fill="#ff8a5b" />
          <path d="M6 44 h36" stroke="#d8c49a" strokeWidth="2.6" strokeLinecap="round" />
        </g>
      );
      break;
    case "close":
      inner = <path d="M14 14 L34 34 M34 14 L14 34" stroke="#d8c49a" strokeWidth="4.6" strokeLinecap="round" />;
      break;
    case "info":
      inner = (
        <g>
          <circle cx="24" cy="24" r="17" fill="none" stroke="#d8c49a" strokeWidth="3.4" />
          <circle cx="24" cy="15.5" r="2.6" fill="#d8c49a" />
          <rect x="21.6" y="21" width="4.8" height="13" rx="2.4" fill="#d8c49a" />
        </g>
      );
      break;
    case "leaf":
      inner = (
        <g>
          <path d="M38 8 Q40 30 24 38 Q10 32 10 18 Q10 10 38 8 Z" fill="#5fae52" />
          <path d="M14 32 Q22 22 34 12" stroke="#3f7f3a" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </g>
      );
      break;
    case "sparkle":
      inner = (
        <g>
          <Spark x={24} y={22} s={12} c="#ffd76a" />
          <Spark x={38} y={36} s={5} c="#fff3cf" />
          <Spark x={11} y={34} s={4} c="#fff3cf" />
        </g>
      );
      break;
    case "timer":
      inner = (
        <g>
          <circle cx="24" cy="26" r="16" fill="#eef2f5" stroke="#8f97a8" strokeWidth="3.2" />
          <rect x="20" y="4" width="8" height="4" rx="1.6" fill="#8f97a8" />
          <path d="M24 26 V15 M24 26 l7 5" stroke="#3a4a5a" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
      break;
    default:
      inner = (
        <g>
          <circle cx="24" cy="24" r="17" fill="#472c14" />
          <text x="24" y="31" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#d8c49a" fontFamily="Nunito, sans-serif">?</text>
        </g>
      );
  }
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      {inner}
    </svg>
  );
}
