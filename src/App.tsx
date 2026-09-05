import { useState } from "react";
import { useGame, seedsFor } from "./game/useGame";
import { PRESTIGE_BASE } from "./game/data";
import { formatNumber, formatTime } from "./game/format";
import { Scene } from "./components/Scene";
import { Shop } from "./components/Shop";
import { Modal, ModalButtons, Toasts } from "./components/Overlays";
import { Icon } from "./components/Icons";

type ModalKind = null | "transplant" | "reset";

export default function App() {
  const game = useGame();
  const [modal, setModal] = useState<ModalKind>(null);
  const seeds = seedsFor(game.s.lifetime);

  return (
    <div className="h-full flex flex-col lg:flex-row font-body bg-pine-900 text-cream overflow-hidden">
      <div className="h-[54dvh] shrink-0 lg:h-auto lg:flex-1 flex flex-col min-h-0">
        <Scene game={game} onRequestReset={() => setModal("reset")} />
      </div>
      <div className="flex-1 lg:flex-none lg:h-full flex min-h-0">
        <Shop game={game} onTransplantRequest={() => setModal("transplant")} />
      </div>

      <Toasts toasts={game.toasts} />

      {/* welcome back */}
      {game.offlineInfo && (
        <Modal onClose={game.clearOfflineInfo}>
          <div className="flex items-center gap-3">
            <span className="anim-bob inline-block">
              <Icon name="basket" className="w-12 h-12" />
            </span>
            <div>
              <h3 className="font-display text-2xl text-gold leading-none">Welcome back!</h3>
              <p className="text-xs font-bold text-cream-dim/80 mt-1">You were away {formatTime(game.offlineInfo.seconds)}</p>
            </div>
          </div>
          <p className="mt-4 text-sm font-semibold text-cream-dim">Your helpers kept working while you were gone (at half pace). They harvested:</p>
          <div className="mt-3 rounded-xl bg-pine-900 border-2 border-leaf/40 py-4 text-center">
            <div className="flex items-center justify-center gap-2 font-display text-3xl text-leaf">
              <Icon name="apple" className="w-7 h-7" /> +{formatNumber(game.offlineInfo.gain)}
            </div>
          </div>
          <div className="mt-5">
            <button onClick={game.clearOfflineInfo} className="w-full rounded-xl border-2 border-gold-dark bg-gold py-3 font-display text-lg text-bark-900 hover:brightness-110 active:scale-[0.98] transition-all">
              Back to the orchard
            </button>
          </div>
        </Modal>
      )}

      {/* transplant confirm */}
      {modal === "transplant" && (
        <Modal onClose={() => setModal(null)}>
          <div className="flex items-center gap-3">
            <span className="anim-wiggle inline-block">
              <Icon name="seed" className="w-12 h-12" />
            </span>
            <div>
              <h3 className="font-display text-2xl gold-shimmer leading-tight">Transplant the Grove?</h3>
              <p className="text-xs font-bold text-cream-dim/80 mt-0.5">Uproot everything and start anew — wiser.</p>
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-pine-900 border-2 border-gold/40 p-3.5 space-y-1 text-[13px] font-semibold">
            <div className="flex justify-between"><span className="text-apple">You lose</span><span className="text-cream-dim">apples, helpers, upgrades</span></div>
            <div className="flex justify-between"><span className="text-gold">You gain</span><span className="text-gold font-display">+{seeds} Golden Seed{seeds > 1 ? "s" : ""} (+{seeds * 10}% forever)</span></div>
            <div className="flex justify-between"><span className="text-leaf">You keep</span><span className="text-cream-dim">awards, records, golden apples</span></div>
          </div>
          <p className="mt-3 text-[11px] font-semibold text-cream-dim/70">Next seed at {formatNumber(PRESTIGE_BASE * (seeds + 1) * (seeds + 1))} apples harvested in one run.</p>
          <ModalButtons confirm={`Transplant (+${seeds})`} cancel="Not yet" onConfirm={() => { game.transplant(); setModal(null); }} onCancel={() => setModal(null)} />
        </Modal>
      )}

      {/* hard reset confirm */}
      {modal === "reset" && (
        <Modal onClose={() => setModal(null)}>
          <div className="flex items-center gap-3">
            <Icon name="reset" className="w-10 h-10" />
            <div>
              <h3 className="font-display text-2xl text-apple leading-tight">Burn the orchard down?</h3>
              <p className="text-xs font-bold text-cream-dim/80 mt-0.5">This erases EVERYTHING — progress, seeds, awards.</p>
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-pine-900 border-2 border-apple/40 p-3.5 text-sm font-semibold text-cream-dim">
            <p>
              You currently have <span className="text-cream font-display">{formatNumber(game.s.apples)}</span> apples,{" "}
              <span className="text-gold font-display">{game.s.seeds}</span> golden seeds and{" "}
              <span className="text-leaf font-display">{game.s.achievements.length}</span> awards. All of it will be gone.
            </p>
          </div>
          <ModalButtons danger confirm="Erase everything" cancel="Keep my trees" onConfirm={() => { game.hardReset(); setModal(null); }} onCancel={() => setModal(null)} />
        </Modal>
      )}
    </div>
  );
}
