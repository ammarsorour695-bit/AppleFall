import type { ReactNode } from "react";
import type { Toast } from "../game/useGame";
import { Icon } from "./Icons";

export function Toasts({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-4 left-4 z-50 space-y-2 pointer-events-none max-w-[320px]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 rounded-xl border-2 px-3.5 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.5)] ${
            t.kind === "achieve" ? "bg-pine-800 border-leaf/50" : t.kind === "gold" ? "bg-bark-700 border-gold/60" : "bg-bark-700 border-bark-500"
          }`}
          style={{ animation: "kf-toast-in 0.35s cubic-bezier(0.2, 0.9, 0.3, 1.2) both" }}
        >
          <span className={t.kind === "achieve" ? "anim-wiggle" : ""}>
            <Icon name={t.kind === "achieve" ? "medal" : t.kind === "gold" ? "goldapple" : "sparkle"} className={`w-8 h-8 shrink-0 ${t.kind === "info" ? "text-leaf" : "text-gold"}`} />
          </span>
          <div className="min-w-0">
            <div className={`font-display text-[15px] leading-tight ${t.kind === "gold" ? "text-gold" : t.kind === "achieve" ? "text-leaf" : "text-cream"}`}>{t.title}</div>
            <div className="text-[11px] font-semibold text-cream-dim/85 leading-snug">{t.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Modal({ children, onClose }: { children: ReactNode; onClose?: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-bark-800 border-4 border-bark-600 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] max-w-md w-full p-6" style={{ animation: "kf-rise-in 0.28s cubic-bezier(0.2, 0.9, 0.3, 1.15) both" }}>
        {children}
      </div>
    </div>
  );
}

export function ModalButtons({ confirm, cancel, onConfirm, onCancel, danger }: { confirm: string; cancel: string; onConfirm: () => void; onCancel: () => void; danger?: boolean }) {
  return (
    <div className="mt-5 grid grid-cols-2 gap-2.5">
      <button onClick={onCancel} className="rounded-xl border-2 border-bark-500 bg-bark-700 py-2.5 font-display text-cream-dim hover:text-cream hover:border-bark-500/80 transition-colors">
        {cancel}
      </button>
      <button
        onClick={onConfirm}
        className={`rounded-xl border-2 py-2.5 font-display transition-all active:scale-[0.97] ${
          danger ? "bg-apple-dark border-apple text-cream hover:brightness-110" : "bg-gold border-gold-dark text-bark-900 hover:brightness-110"
        }`}
      >
        {confirm}
      </button>
    </div>
  );
}
