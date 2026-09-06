import { useState } from "react";
import { ACHIEVEMENTS, GENERATORS, PRESTIGE_BASE, UPGRADES, type Upgrade } from "../game/data";
import { genCost, maxAffordable, seedsFor, type Game } from "../game/useGame";
import { formatAps, formatNumber, formatTime } from "../game/format";
import { Icon } from "./Icons";

type Tab = "orchard" | "upgrades" | "awards";

const TIER_COLOR = ["#c98d4b", "#c9d5e0", "#ffd76a", "#8ef5d0"];

export function Shop({ game, onTransplantRequest }: { game: Game; onTransplantRequest: () => void }) {
  const { s, derived } = game;
  const [tab, setTab] = useState<Tab>("orchard");
  const [selUp, setSelUp] = useState<string | null>(null);

  /* -------- generator visibility -------- */
  const genRows: { gen: (typeof GENERATORS)[number]; mystery: boolean }[] = [];
  let mysteryShown = false;
  for (let idx = 0; idx < GENERATORS.length; idx++) {
    const gen = GENERATORS[idx];
    const owned = s.owned[gen.id] ?? 0;
    if (idx === 0 || owned > 0 || s.lifetime >= gen.baseCost * 0.35 || s.apples >= gen.baseCost * 0.35) {
      genRows.push({ gen, mystery: false });
    } else if (!mysteryShown) {
      genRows.push({ gen, mystery: true });
      mysteryShown = true;
    } else break;
  }

  /* -------- upgrade visibility -------- */
  const visibleUps: { up: Upgrade; mystery: boolean }[] = [];
  let upMysteryShown = false;
  const sortedUps = [...UPGRADES].sort((a, b) => a.cost - b.cost);
  for (const up of sortedUps) {
    const owned = s.upgrades.includes(up.id);
    if (owned || s.lifetime >= up.cost * 0.15 || up.cost <= 1500) {
      visibleUps.push({ up, mystery: false });
    } else if (!upMysteryShown) {
      visibleUps.push({ up, mystery: true });
      upMysteryShown = true;
    } else break;
  }
  const purchasableUps = visibleUps.filter((v) => !v.mystery && !s.upgrades.includes(v.up.id) && s.apples >= v.up.cost).length;
  const selected = selUp ? UPGRADES.find((u) => u.id === selUp) ?? null : null;
  const selectedOwned = selected ? s.upgrades.includes(selected.id) : false;

  const seeds = seedsFor(s.lifetime);
  const prestigePct = Math.min(100, (s.lifetime / PRESTIGE_BASE) * 100);

  return (
    <aside className="w-full lg:w-[400px] xl:w-[430px] shrink-0 bg-bark-900 border-t-4 lg:border-t-0 lg:border-l-4 border-bark-700 flex flex-col min-h-0">
      {/* header */}
      <div className="px-4 pt-4 pb-3 bg-bark-800 border-b-4 border-bark-700">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl text-gold tracking-wide">Grove Market</h2>
          <span className="text-[11px] font-bold text-cream-dim/70 uppercase tracking-widest">trades &amp; awards</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {(
            [
              ["orchard", "tree", "Orchard"],
              ["upgrades", "wrench", `Upgrades${purchasableUps > 0 ? ` · ${purchasableUps}` : ""}`],
              ["awards", "trophy", "Awards"],
            ] as [Tab, string, string][]
          ).map(([t, ic, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 font-display text-[15px] transition-all border-2 ${
                tab === t ? "bg-bark-600 border-gold/50 text-gold -translate-y-0.5 shadow-md" : "bg-bark-700/60 border-transparent text-cream-dim hover:text-cream hover:bg-bark-700"
              }`}
            >
              <Icon name={ic} className="w-5 h-5" />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ------------ ORCHARD TAB ------------ */}
      {tab === "orchard" && (
        <>
          <div className="px-4 py-2.5 flex items-center justify-between bg-bark-800/60 border-b border-bark-700">
            <span className="text-[11px] font-black uppercase tracking-widest text-cream-dim/70">Buy amount</span>
            <div className="flex rounded-lg overflow-hidden border-2 border-bark-600">
              {([1, 10, "max"] as const).map((q) => (
                <button
                  key={String(q)}
                  onClick={() => game.setBuyQty(q)}
                  className={`px-3.5 py-1 font-display text-sm transition-colors ${s.buyQty === q ? "bg-gold text-bark-900" : "bg-bark-700 text-cream-dim hover:text-cream"}`}
                >
                  {q === "max" ? "MAX" : `×${q}`}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto shop-scroll min-h-0 pb-3">
            {genRows.map(({ gen, mystery }) => {
              const owned = s.owned[gen.id] ?? 0;
              const qty = s.buyQty === "max" ? Math.max(1, maxAffordable(gen.baseCost, owned, s.apples)) : s.buyQty;
              const cost = genCost(gen.baseCost, owned, qty);
              const affordable = s.apples >= cost && !(s.buyQty === "max" && maxAffordable(gen.baseCost, owned, s.apples) < 1);
              const unit = gen.baseAps * (derived.genMult[gen.id] ?? 1) * derived.globalMult * derived.frenzyMult;
              const progress = Math.min(100, (s.apples / cost) * 100);

              if (mystery) {
                return (
                  <div key={gen.id} className="mx-3 mt-2.5 rounded-xl bg-bark-800/70 border-2 border-bark-700 border-dashed p-3 flex items-center gap-3 opacity-70">
                    <div className="w-12 h-12 rounded-lg bg-bark-700 flex items-center justify-center">
                      <Icon name="lock" className="w-6 h-6 opacity-60" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-display text-lg text-cream-dim tracking-wide">? ? ?</div>
                      <div className="text-xs text-cream-dim/60 font-semibold">Keep harvesting to discover…</div>
                    </div>
                    <div className="ml-auto font-display text-sm text-cream-dim/50 whitespace-nowrap flex items-center gap-1">
                      <Icon name="apple" className="w-4 h-4 text-apple/70" /> {formatNumber(gen.baseCost)}
                    </div>
                  </div>
                );
              }

              return (
                <button
                  key={gen.id}
                  onClick={() => game.buyGenerator(gen.id)}
                  disabled={!affordable}
                  className={`relative w-[calc(100%-24px)] mx-3 mt-2.5 rounded-xl border-2 p-3 flex items-center gap-3 text-left transition-all overflow-hidden group ${
                    affordable ? "bg-bark-700 border-bark-500 hover:border-gold/70 hover:-translate-y-[2px] hover:shadow-[0_6px_16px_rgba(0,0,0,0.4)] active:translate-y-0" : "bg-bark-800 border-bark-700 opacity-80"
                  }`}
                >
                  <div className={`w-12 h-12 shrink-0 rounded-lg bg-pine-800 ring-1 ring-bark-600 flex items-center justify-center transition-transform ${affordable ? "text-gold group-hover:scale-110 group-hover:-rotate-3" : "text-cream-dim/40 opacity-70"}`}>
                    <Icon name={gen.icon} className="w-9 h-9" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-[17px] leading-tight text-cream flex items-center gap-2">
                      {gen.name}
                      {qty > 1 && <span className="text-[11px] font-body font-black bg-bark-600 text-gold rounded-full px-1.5 py-0.5">×{qty}</span>}
                    </div>
                    <div className="text-[11px] text-cream-dim/75 font-semibold truncate">{gen.desc}</div>
                    <div className="text-[11px] font-bold text-leaf/90 mt-0.5">
                      +{formatAps(unit)}/s each
                      {owned > 0 && <span className="text-cream-dim/60"> · total {formatAps(derived.genAps[gen.id] ?? 0)}/s</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`flex items-center justify-end gap-1 font-display text-[17px] ${affordable ? "text-gold" : "text-[#9a6b58]"}`}>
                      <Icon name="apple" className="w-4 h-4" />
                      {formatNumber(cost)}
                    </div>
                    <div className={`font-display text-2xl leading-none mt-0.5 ${owned > 0 ? "text-cream/90" : "text-cream-dim/30"}`}>{owned}</div>
                  </div>
                  {!affordable && (
                    <div className="absolute bottom-0 left-0 h-[3px] bg-gold/40 transition-[width] duration-300" style={{ width: `${progress}%` }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* prestige footer */}
          <div className="p-3 border-t-4 border-bark-700 bg-bark-800">
            {seeds >= 1 ? (
              <button
                onClick={onTransplantRequest}
                className="w-full rounded-xl border-2 border-gold/60 bg-gradient-to-b from-bark-600 to-bark-700 p-3 text-left hover:-translate-y-0.5 hover:border-gold transition-all shadow-[0_4px_18px_rgba(255,201,77,0.15)]"
              >
                <div className="flex items-center gap-2.5">
                  <span className="anim-wiggle text-gold"><Icon name="seed" className="w-9 h-9" /></span>
                  <div>
                    <div className="font-display text-lg gold-shimmer leading-tight">Transplant the Grove</div>
                    <div className="text-[11px] font-bold text-cream-dim">Reset for <span className="text-gold">+{seeds} Golden Seed{seeds > 1 ? "s" : ""}</span> · +{seeds * 10}% production forever</div>
                  </div>
                </div>
              </button>
            ) : (
              <div className="rounded-xl border-2 border-bark-600 bg-bark-700/50 p-3">
                <div className="flex items-center gap-2.5">
                  <Icon name="seed" className="w-8 h-8 text-cream-dim opacity-40" />
                  <div className="flex-1">
                    <div className="font-display text-[15px] text-cream-dim leading-tight">Golden Seeds</div>
                    <div className="text-[11px] font-bold text-cream-dim/60">Harvest {formatNumber(PRESTIGE_BASE)} apples this run to unlock transplanting</div>
                    <div className="mt-1.5 h-2 rounded-full bg-bark-900 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-gold-dark to-gold transition-[width] duration-500" style={{ width: `${prestigePct}%` }} />
                    </div>
                  </div>
                  <span className="font-display text-sm text-gold/70 tabular-nums">{prestigePct.toFixed(prestigePct < 10 ? 1 : 0)}%</span>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ------------ UPGRADES TAB ------------ */}
      {tab === "upgrades" && (
        <div className="flex-1 overflow-y-auto shop-scroll min-h-0 p-4">
          {/* detail box */}
          <div className="rounded-xl border-2 border-bark-600 bg-bark-800 p-3.5 min-h-[118px] flex flex-col">
            {selected ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg bg-pine-800 ring-1 ring-bark-600 flex items-center justify-center shrink-0">
                    <Icon name={selected.icon} className="w-10 h-10 text-gold" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-display text-lg text-cream leading-tight">{selected.name}</div>
                    <div className="text-xs text-cream-dim/80 font-semibold">{selected.desc}</div>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  {selectedOwned ? (
                    <div className="w-full rounded-lg bg-pine-800 border-2 border-leaf/40 text-leaf font-display text-center py-2">✓ Owned</div>
                  ) : (
                    <button
                      onClick={() => game.buyUpgrade(selected.id)}
                      disabled={s.apples < selected.cost}
                      className={`w-full rounded-lg border-2 py-2 font-display text-lg flex items-center justify-center gap-2 transition-all ${
                        s.apples >= selected.cost ? "bg-gold border-gold text-bark-900 hover:brightness-110 active:scale-[0.98]" : "bg-bark-700 border-bark-600 text-cream-dim/50"
                      }`}
                    >
                      Buy · <Icon name="apple" className="w-5 h-5" /> {formatNumber(selected.cost)}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="m-auto text-center">
                <Icon name="info" className="w-7 h-7 mx-auto opacity-40" />
                <p className="text-xs font-bold text-cream-dim/60 mt-1.5">Select an upgrade below to inspect it</p>
              </div>
            )}
          </div>

          {/* tiles */}
          <div className="mt-4 grid grid-cols-5 gap-2">
            {visibleUps.map(({ up, mystery }) => {
              const owned = s.upgrades.includes(up.id);
              if (owned) return null;
              if (mystery) {
                return (
                  <div key={up.id} className="aspect-square rounded-lg border-2 border-dashed border-bark-600 bg-bark-800/60 flex items-center justify-center">
                    <Icon name="lock" className="w-5 h-5 opacity-40" />
                  </div>
                );
              }
              const can = s.apples >= up.cost;
              const isSel = selUp === up.id;
              return (
                <button
                  key={up.id}
                  onClick={() => setSelUp(up.id)}
                  title={`${up.name} — ${formatNumber(up.cost)}`}
                  className={`aspect-square rounded-lg border-2 flex items-center justify-center transition-all relative ${
                    isSel ? "border-gold bg-bark-600 scale-105 shadow-lg" : can ? "border-bark-500 bg-bark-700 hover:border-gold/60 hover:-translate-y-0.5" : "border-bark-700 bg-bark-800 opacity-60 grayscale hover:opacity-90"
                  }`}
                >
                  <Icon name={up.icon} className={`w-8 h-8 ${can ? "text-gold" : "text-cream-dim/40"}`} />
                  {can && !isSel && <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-gold border-2 border-bark-900" />}
                </button>
              );
            })}
          </div>

          {/* owned upgrades */}
          {s.upgrades.length > 0 && (
            <div className="mt-5">
              <div className="text-[11px] font-black uppercase tracking-widest text-cream-dim/60 mb-2">Purchased · {s.upgrades.length}/{UPGRADES.length}</div>
              <div className="flex flex-wrap gap-1.5">
                {s.upgrades.map((id) => {
                  const up = UPGRADES.find((u) => u.id === id);
                  if (!up) return null;
                  return (
                    <div key={id} title={up.name} className="w-9 h-9 rounded-md bg-pine-800 ring-1 ring-leaf/30 flex items-center justify-center opacity-90">
                      <Icon name={up.icon} className="w-6 h-6 text-leaf" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------ AWARDS TAB ------------ */}
      {tab === "awards" && (
        <div className="flex-1 overflow-y-auto shop-scroll min-h-0 p-4">
          <div className="flex items-center justify-between">
            <div className="font-display text-lg text-cream flex items-center gap-2">
              <Icon name="medal" className="w-6 h-6 text-gold" />
              {s.achievements.length}/{ACHIEVEMENTS.length}
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider text-leaf bg-leaf/10 border border-leaf/30 rounded-full px-2.5 py-1">
              +{s.achievements.length * 2}% production
            </span>
          </div>
          <div className="mt-3 space-y-2">
            {ACHIEVEMENTS.map((a) => {
              const unlocked = s.achievements.includes(a.id);
              return (
                <div key={a.id} className={`rounded-xl border-2 p-2.5 flex items-center gap-3 transition-colors ${unlocked ? "bg-bark-700/80 border-bark-500" : "bg-bark-800/60 border-bark-700 opacity-55"}`}>
                  <div className="w-10 h-10 rounded-lg bg-pine-900 ring-1 ring-bark-600 flex items-center justify-center shrink-0">
                    {unlocked ? (
                      <svg viewBox="0 0 48 48" className="w-7 h-7">
                        <path d="M17 4 h6 l-5 12 h-6 Z M31 4 h-6 l5 12 h6 Z" fill="#c96a5b" />
                        <circle cx="24" cy="26" r="12" fill={TIER_COLOR[a.tier]} stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
                        <path d={`M ${24} ${26 - 6} L ${24 + 1.7} ${26 - 1.7} L ${24 + 6} ${26} L ${24 + 1.7} ${26 + 1.7} L ${24} ${26 + 6} L ${24 - 1.7} ${26 + 1.7} L ${24 - 6} ${26} L ${24 - 1.7} ${26 - 1.7} Z`} fill="rgba(255,255,255,0.75)" />
                      </svg>
                    ) : (
                      <Icon name="lock" className="w-5 h-5 opacity-60" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className={`font-display text-[15px] leading-tight ${unlocked ? "text-cream" : "text-cream-dim"}`}>{unlocked ? a.name : "? ? ?"}</div>
                    <div className="text-[11px] font-semibold text-cream-dim/70">{a.desc}</div>
                  </div>
                  {unlocked && <span className="ml-auto text-leaf font-black text-xs shrink-0">✓ +2%</span>}
                </div>
              );
            })}
          </div>

          {/* stats */}
          <div className="mt-5 rounded-xl border-2 border-bark-600 bg-bark-800 p-3.5">
            <div className="font-display text-[15px] text-gold flex items-center gap-2 mb-2">
              <Icon name="chart" className="w-5 h-5 text-leaf" /> Orchard Ledger
            </div>
            <dl className="space-y-1.5 text-[13px]">
              {(
                [
                  ["Apples this run", formatNumber(s.lifetime)],
                  ["All-time apples", formatNumber(s.allTime)],
                  ["Hand-picked apples", formatNumber(s.handPicked)],
                  ["Tree shakes", s.totalClicks.toLocaleString("en-US")],
                  ["Golden apples caught", String(s.goldenClicked)],
                  ["Helpers employed", String(Object.values(s.owned).reduce((a, b) => a + b, 0))],
                  ["Upgrades purchased", `${s.upgrades.length}/${UPGRADES.length}`],
                  ["Transplants", String(s.transplants)],
                  ["Time in orchard", formatTime(s.playSeconds)],
                ] as [string, string][]
              ).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 border-b border-bark-700/60 pb-1.5 last:border-0">
                  <dt className="font-semibold text-cream-dim/75">{k}</dt>
                  <dd className="font-display text-cream tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </aside>
  );
}
