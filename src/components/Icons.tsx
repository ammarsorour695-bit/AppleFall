/**
 * Every glyph in the game is a Font Awesome 6 icon (loaded via CDN in index.html).
 * No emoji, no images — icons are vector fonts, styled through normal CSS.
 */

const MAP: Record<string, string> = {
  // HUD / UI
  apple: "fa-apple-whole",
  goldapple: "fa-apple-whole",
  leaf: "fa-leaf",
  seed: "fa-seedling",
  tree: "fa-tree",
  wrench: "fa-screwdriver-wrench",
  trophy: "fa-trophy",
  chart: "fa-chart-line",
  lock: "fa-lock",
  info: "fa-circle-info",
  medal: "fa-medal",
  basket: "fa-basket-shopping",
  save: "fa-floppy-disk",
  reset: "fa-rotate-left",
  sound: "fa-volume-high",
  mute: "fa-volume-xmark",
  sparkle: "fa-wand-magic-sparkles",
  thunder: "fa-bolt",
  // generators
  can: "fa-faucet-drip",
  compost: "fa-recycle",
  ladybug: "fa-bug",
  hive: "fa-bugs",
  scarecrow: "fa-hat-wizard",
  ladder: "fa-stairs",
  dog: "fa-dog",
  crew: "fa-people-group",
  tractor: "fa-tractor",
  press: "fa-wine-bottle",
  bakery: "fa-bread-slice",
  dome: "fa-warehouse",
  sprinkler: "fa-shower",
  golem: "fa-chess-rook",
  druid: "fa-fire",
  rainbow: "fa-rainbow",
  cloud: "fa-cloud",
  timesap: "fa-hourglass-half",
  star: "fa-star",
  world: "fa-earth-americas",
  // upgrades
  hand: "fa-hand-pointer",
  glove: "fa-mitten",
  note: "fa-music",
  hands: "fa-hands",
  baton: "fa-wand-magic-sparkles",
  boot: "fa-shoe-prints",
  trampoline: "fa-person-falling",
  fertilizer: "fa-flask",
  rain: "fa-cloud-rain",
  moon: "fa-moon",
  clover: "fa-clover",
  momentum: "fa-gauge-high",
  avalanche: "fa-hill-avalanche",
  butter: "fa-cow",
};

export function Icon({ name, className = "w-8 h-8" }: { name: string; className?: string }) {
  const fa = MAP[name] ?? "fa-circle-question";
  return <i aria-hidden="true" className={`fa-solid ${fa} ${className}`} />;
}
