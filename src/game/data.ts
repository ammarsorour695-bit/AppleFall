export interface Generator {
  id: string;
  name: string;
  desc: string;
  baseCost: number;
  baseAps: number;
  icon: string;
}

export type UpgradeKind = "click" | "gen" | "global" | "synergy";

export interface Upgrade {
  id: string;
  name: string;
  desc: string;
  cost: number;
  kind: UpgradeKind;
  target?: string; // generator id for kind === 'gen'
  mult?: number; // multiplier for click / gen / global
  pct?: number; // % of APS added to clicks for synergy
  icon: string;
}

export interface RunStats {
  lifetime: number; // apples earned this transplant run
  allTime: number; // apples earned across all time
  totalClicks: number;
  goldenClicked: number;
  handPicked: number; // apples earned by clicking
  owned: Record<string, number>;
  ownedGenerators: number;
  upgradesOwned: number;
  achievementsOwned: number;
  seeds: number;
  transplants: number;
  aps: number;
  playSeconds: number;
}

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  tier: 0 | 1 | 2 | 3;
  test: (s: RunStats) => boolean;
}

/* ---------------------------------- generators ---------------------------------- */

export const GENERATORS: Generator[] = [
  { id: "can", name: "Watering Can", desc: "A trusty tin can. Drips patience onto thirsty roots.", baseCost: 15, baseAps: 0.1, icon: "can" },
  { id: "compost", name: "Compost Heap", desc: "Smells terrible. Apples absolutely love it.", baseCost: 100, baseAps: 1, icon: "compost" },
  { id: "ladybug", name: "Ladybug Squad", desc: "Tiny bodyguards that eat every aphid in sight.", baseCost: 600, baseAps: 5, icon: "ladybug" },
  { id: "hive", name: "Beehive", desc: "Fuzzy pollinators working overtime, no breaks.", baseCost: 3_500, baseAps: 20, icon: "hive" },
  { id: "scarecrow", name: "Scarecrow", desc: "Stoic. Unblinking. The crows have filed complaints.", baseCost: 15_000, baseAps: 65, icon: "scarecrow" },
  { id: "ladder", name: "Picking Ladder", desc: "Reaches the shy apples hiding at the very top.", baseCost: 60_000, baseAps: 200, icon: "ladder" },
  { id: "dog", name: "Farm Dog", desc: "Herds apples, your sanity, and the occasional squirrel.", baseCost: 250_000, baseAps: 700, icon: "dog" },
  { id: "crew", name: "Picker Crew", desc: "A cheerful team with baskets, hats, and fast hands.", baseCost: 1_100_000, baseAps: 2_400, icon: "crew" },
  { id: "tractor", name: "Old Red Tractor", desc: "Rattles, coughs, and somehow outworks everything.", baseCost: 5_000_000, baseAps: 8_000, icon: "tractor" },
  { id: "press", name: "Cider Press", desc: "Squeezes the orchard's soul into golden barrels.", baseCost: 24_000_000, baseAps: 26_000, icon: "press" },
  { id: "bakery", name: "Pie Bakery", desc: "The scent alone triples foot traffic to the grove.", baseCost: 110_000_000, baseAps: 85_000, icon: "bakery" },
  { id: "dome", name: "Greenhouse Dome", desc: "Apples grow smugly under climate-controlled glass.", baseCost: 550_000_000, baseAps: 280_000, icon: "dome" },
  { id: "sprinkler", name: "Sprinkler Grid", desc: "Rain on demand. The clouds are jealous.", baseCost: 2_700_000_000, baseAps: 900_000, icon: "sprinkler" },
  { id: "golem", name: "Apple Golem", desc: "Cobbled from cores and clay. Gentle, mostly.", baseCost: 13_000_000_000, baseAps: 2_900_000, icon: "golem" },
  { id: "druid", name: "Druid Circle", desc: "Robed gardeners chanting growth spells at dawn.", baseCost: 65_000_000_000, baseAps: 9_500_000, icon: "druid" },
  { id: "rainbow", name: "Rainbow Roots", desc: "Roots that sip color straight from the sky.", baseCost: 320_000_000_000, baseAps: 31_000_000, icon: "rainbow" },
  { id: "cloud", name: "Cloud Orchard", desc: "Trees planted on clouds. Harvested with kites.", baseCost: 1_600_000_000_000, baseAps: 100_000_000, icon: "cloud" },
  { id: "timesap", name: "Time Sapling", desc: "Grows yesterday's apples tomorrow, ahead of schedule.", baseCost: 8_000_000_000_000, baseAps: 330_000_000, icon: "timesap" },
  { id: "star", name: "Star Nursery", desc: "Seedlings raised on pure bottled starlight.", baseCost: 40_000_000_000_000, baseAps: 1_100_000_000, icon: "star" },
  { id: "world", name: "The World Tree", desc: "Its branches hold every apple that ever will be.", baseCost: 2_000_000_000_000_000, baseAps: 3_600_000_000, icon: "world" },
];

/* ----------------------------------- upgrades ----------------------------------- */

export const UPGRADES: Upgrade[] = [
  // click power
  { id: "u_thumb", name: "Polished Thumb", desc: "Clicks are twice as snappy.", cost: 100, kind: "click", mult: 2, icon: "hand" },
  { id: "u_gloves", name: "Garden Gloves", desc: "Grip improved. Clicks ×2.", cost: 1_200, kind: "click", mult: 2, icon: "glove" },
  { id: "u_rhythm", name: "Picker's Rhythm", desc: "Shake to the beat. Clicks ×2.", cost: 13_000, kind: "click", mult: 2, icon: "note" },
  { id: "u_twohand", name: "Two-Handed Shake", desc: "Double the arms, double the apples. Clicks ×2.", cost: 150_000, kind: "click", mult: 2, icon: "hands" },
  { id: "u_conductor", name: "Orchard Conductor", desc: "The whole grove shakes on your downbeat. Clicks ×3.", cost: 1_700_000, kind: "click", mult: 3, icon: "baton" },
  { id: "u_stomp", name: "Seismic Stomp", desc: "Boots that rattle apples loose underground. Clicks ×3.", cost: 20_000_000, kind: "click", mult: 3, icon: "boot" },
  { id: "u_trampoline", name: "Treetop Trampoline", desc: "Bounce above the canopy and body-slam it. Clicks ×3.", cost: 230_000_000, kind: "click", mult: 3, icon: "trampoline" },
  { id: "u_thunder", name: "Thunder Clap", desc: "Your clap is weather now. Clicks ×4.", cost: 2_600_000_000, kind: "click", mult: 4, icon: "thunder" },

  // generator doublers
  { id: "u_can2", name: "Rust-Proof Tin", desc: "Watering Cans are twice as effective.", cost: 1_000, kind: "gen", target: "can", mult: 2, icon: "can" },
  { id: "u_compost2", name: "Worm Penthouse", desc: "Compost Heaps are twice as effective.", cost: 5_000, kind: "gen", target: "compost", mult: 2, icon: "compost" },
  { id: "u_lady2", name: "Ladybug Legion", desc: "Ladybug Squads are twice as effective.", cost: 30_000, kind: "gen", target: "ladybug", mult: 2, icon: "ladybug" },
  { id: "u_bee2", name: "Queen's Decree", desc: "Beehives are twice as effective.", cost: 175_000, kind: "gen", target: "hive", mult: 2, icon: "hive" },
  { id: "u_crow2", name: "Fresh Straw", desc: "Scarecrows are twice as effective.", cost: 750_000, kind: "gen", target: "scarecrow", mult: 2, icon: "scarecrow" },
  { id: "u_ladder2", name: "Steel Rungs", desc: "Picking Ladders are twice as effective.", cost: 3_000_000, kind: "gen", target: "ladder", mult: 2, icon: "ladder" },
  { id: "u_dog2", name: "Golden Retriever", desc: "Farm Dogs are twice as effective.", cost: 12_000_000, kind: "gen", target: "dog", mult: 2, icon: "dog" },
  { id: "u_crew2", name: "Coffee Breaks", desc: "Picker Crews are twice as effective.", cost: 55_000_000, kind: "gen", target: "crew", mult: 2, icon: "crew" },
  { id: "u_trac2", name: "Turbo Tires", desc: "Tractors are twice as effective.", cost: 250_000_000, kind: "gen", target: "tractor", mult: 2, icon: "tractor" },
  { id: "u_press2", name: "Oak Barrels", desc: "Cider Presses are twice as effective.", cost: 1_200_000_000, kind: "gen", target: "press", mult: 2, icon: "press" },
  { id: "u_bake2", name: "Secret Recipe", desc: "Pie Bakeries are twice as effective.", cost: 5_500_000_000, kind: "gen", target: "bakery", mult: 2, icon: "bakery" },
  { id: "u_dome2", name: "Smart Glass", desc: "Greenhouse Domes are twice as effective.", cost: 27_000_000_000, kind: "gen", target: "dome", mult: 2, icon: "dome" },
  { id: "u_spr2", name: "Pressure Valves", desc: "Sprinkler Grids are twice as effective.", cost: 130_000_000_000, kind: "gen", target: "sprinkler", mult: 2, icon: "sprinkler" },
  { id: "u_golem2", name: "Granite Core", desc: "Apple Golems are twice as effective.", cost: 650_000_000_000, kind: "gen", target: "golem", mult: 2, icon: "golem" },

  // global
  { id: "u_fert", name: "Miracle Fertilizer", desc: "ALL apple production ×1.5.", cost: 1_000_000, kind: "global", mult: 1.5, icon: "fertilizer" },
  { id: "u_rain", name: "Sweet Rain", desc: "ALL apple production ×1.5.", cost: 100_000_000, kind: "global", mult: 1.5, icon: "rain" },
  { id: "u_moon", name: "Harvest Moon", desc: "ALL apple production ×1.5.", cost: 10_000_000_000, kind: "global", mult: 1.5, icon: "moon" },
  { id: "u_clover", name: "Four-Leaf Grove", desc: "ALL apple production ×2.", cost: 1_000_000_000_000, kind: "global", mult: 2, icon: "clover" },

  // synergy
  { id: "u_momentum", name: "Apple Momentum", desc: "Clicks also gain +2% of your apples per second.", cost: 5_000_000, kind: "synergy", pct: 0.02, icon: "momentum" },
  { id: "u_avalanche", name: "Apple Avalanche", desc: "Clicks also gain +5% of your apples per second.", cost: 5_000_000_000, kind: "synergy", pct: 0.05, icon: "avalanche" },
  { id: "u_butter", name: "Apple Butter Fingers", desc: "Clicks also gain +10% of your apples per second.", cost: 500_000_000_000, kind: "synergy", pct: 0.1, icon: "butter" },
];

/* ---------------------------------- achievements --------------------------------- */

const g = (id: string, n: number) => (s: RunStats) => (s.owned[id] ?? 0) >= n;

export const ACHIEVEMENTS: Achievement[] = [
  { id: "a_click1", name: "Knock Knock", desc: "Click the tree 1 time.", tier: 0, test: (s) => s.totalClicks >= 1 },
  { id: "a_click100", name: "Persistent Pest", desc: "Click the tree 100 times.", tier: 0, test: (s) => s.totalClicks >= 100 },
  { id: "a_click1k", name: "Woodpecker", desc: "Click the tree 1,000 times.", tier: 1, test: (s) => s.totalClicks >= 1_000 },
  { id: "a_click10k", name: "Demolition Crew", desc: "Click the tree 10,000 times.", tier: 2, test: (s) => s.totalClicks >= 10_000 },
  { id: "a_apple100", name: "Snack Time", desc: "Harvest 100 apples in one run.", tier: 0, test: (s) => s.lifetime >= 100 },
  { id: "a_apple10k", name: "Bushel Boss", desc: "Harvest 10,000 apples in one run.", tier: 0, test: (s) => s.lifetime >= 10_000 },
  { id: "a_apple1m", name: "Millionaire Orchardist", desc: "Harvest 1 million apples in one run.", tier: 1, test: (s) => s.lifetime >= 1_000_000 },
  { id: "a_apple1b", name: "Pomologist Prime", desc: "Harvest 1 billion apples in one run.", tier: 2, test: (s) => s.lifetime >= 1_000_000_000 },
  { id: "a_apple1t", name: "Trillion Trunks", desc: "Harvest 1 trillion apples in one run.", tier: 3, test: (s) => s.lifetime >= 1_000_000_000_000 },
  { id: "a_aps10", name: "Passive Income", desc: "Reach 10 apples per second.", tier: 0, test: (s) => s.aps >= 10 },
  { id: "a_aps1k", name: "Apple Industry", desc: "Reach 1,000 apples per second.", tier: 1, test: (s) => s.aps >= 1_000 },
  { id: "a_aps1m", name: "Apple Singularity", desc: "Reach 1 million apples per second.", tier: 2, test: (s) => s.aps >= 1_000_000 },
  { id: "a_aps1b", name: "Fruit of the Cosmos", desc: "Reach 1 billion apples per second.", tier: 3, test: (s) => s.aps >= 1_000_000_000 },
  { id: "a_hand1k", name: "Hand Picked", desc: "Earn 1,000 apples purely by clicking.", tier: 0, test: (s) => s.handPicked >= 1_000 },
  { id: "a_hand1m", name: "Calloused Palms", desc: "Earn 1 million apples purely by clicking.", tier: 1, test: (s) => s.handPicked >= 1_000_000 },
  { id: "a_own10", name: "Small Holding", desc: "Own 10 orchard helpers.", tier: 0, test: (s) => s.ownedGenerators >= 10 },
  { id: "a_own50", name: "Estate Manager", desc: "Own 50 orchard helpers.", tier: 1, test: (s) => s.ownedGenerators >= 50 },
  { id: "a_own150", name: "Apple Baron", desc: "Own 150 orchard helpers.", tier: 2, test: (s) => s.ownedGenerators >= 150 },
  { id: "a_upg5", name: "Tinkerer", desc: "Purchase 5 upgrades.", tier: 0, test: (s) => s.upgradesOwned >= 5 },
  { id: "a_upg15", name: "Engineer of Groves", desc: "Purchase 15 upgrades.", tier: 1, test: (s) => s.upgradesOwned >= 15 },
  { id: "a_gold1", name: "Lucky Bite", desc: "Catch a golden apple.", tier: 1, test: (s) => s.goldenClicked >= 1 },
  { id: "a_gold10", name: "Gold Rush", desc: "Catch 10 golden apples.", tier: 2, test: (s) => s.goldenClicked >= 10 },
  { id: "a_seed1", name: "Rebirth", desc: "Transplant your grove for Golden Seeds.", tier: 2, test: (s) => s.transplants >= 1 },
  { id: "a_can25", name: "Water Bearer", desc: "Own 25 Watering Cans.", tier: 1, test: g("can", 25) },
  { id: "a_world1", name: "Yggdrasil Jr.", desc: "Plant The World Tree.", tier: 3, test: g("world", 1) },
  { id: "a_play2h", name: "Rooted", desc: "Spend 2 hours tending the orchard.", tier: 1, test: (s) => s.playSeconds >= 7_200 },
];

export const ACHIEVEMENT_BONUS = 0.02; // +2% production each
export const SEED_BONUS = 0.1; // +10% production per golden seed
export const COST_GROWTH = 1.15;
export const PRESTIGE_BASE = 1_000_000_000;
