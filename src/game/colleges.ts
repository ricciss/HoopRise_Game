import { Player, Ratings } from "./player";

export type CollegeTier = "elite" | "good" | "small";

export interface College {
  id: string;
  name: string;
  tier: CollegeTier;
  teamMod: number; // extra team points per quarter (strong or weak team)
  minutesMod: number; // multiplies the minutes you play
  development: number; // chance of +1 extra rating point per training
  spotlight: number; // 1-3, draft stock (used in a later step)
}

const PERKS: Record<
  CollegeTier,
  Pick<College, "teamMod" | "minutesMod" | "development" | "spotlight">
> = {
  elite: { teamMod: 1, minutesMod: 0.9, development: 0, spotlight: 3 },
  good: { teamMod: 0, minutesMod: 1, development: 0.25, spotlight: 2 },
  small: { teamMod: -1, minutesMod: 1.07, development: 0.5, spotlight: 1 },
};

function make(id: string, name: string, tier: CollegeTier): College {
  return { id, name, tier, ...PERKS[tier] };
}

export const COLLEGES: College[] = [
  make("highland", "Highland University Titans", "elite"),
  make("capitol", "Capitol State Royals", "elite"),
  make("pacific", "Pacific Coast Warriors", "elite"),
  make("lakeside", "Lakeside College Rams", "good"),
  make("mountain", "Mountain Tech Falcons", "good"),
  make("riverbend", "Riverbend Owls", "good"),
  make("ridgemont", "Ridgemont Blazers", "good"),
  make("prairie", "Prairie College Bison", "small"),
  make("cedar", "Cedar Valley Hornets", "small"),
  make("stonebridge", "Stonebridge Foxes", "small"),
  make("harborpoint", "Harbor Point Seagulls", "small"),
];

export const TIER_LABEL: Record<CollegeTier, string> = {
  elite: "ELITE PROGRAM",
  good: "SOLID PROGRAM",
  small: "SMALL PROGRAM",
};

export function findCollege(id: string): College | null {
  return COLLEGES.find((c) => c.id === id) ?? null;
}

// Better players get better offers
export function generateOffers(player: Player): College[] {
  const keys = Object.keys(player.ratings) as (keyof Ratings)[];
  const top3 =
    keys
      .map((k) => player.ratings[k])
      .sort((a, b) => b - a)
      .slice(0, 3)
      .reduce((sum, n) => sum + n, 0) / 3;

  const tiers: CollegeTier[] =
    top3 >= 58
      ? ["elite", "good", "small"]
      : top3 >= 53
      ? ["good", "good", "small"]
      : ["good", "small", "small"];

  const used = new Set<string>();
  return tiers.map((tier) => {
    const options = COLLEGES.filter((c) => c.tier === tier && !used.has(c.id));
    const chosen = options[Math.floor(Math.random() * options.length)];
    used.add(chosen.id);
    return chosen;
  });
}

// Short text lines that describe what the college offers
export function perkLines(college: College): string[] {
  const team =
    college.teamMod > 0
      ? "Strong team: more wins"
      : college.teamMod < 0
      ? "Weak team: fewer wins"
      : "Average team";
  const minutes =
    college.minutesMod < 1
      ? "Deep bench: fewer minutes"
      : college.minutesMod > 1
      ? "Lots of playing time"
      : "Regular playing time";
  const coaching =
    college.development >= 0.5
      ? "Great coaching: much faster growth"
      : college.development > 0
      ? "Good coaching: faster growth"
      : "Standard coaching";
  const spotlight = `Draft spotlight: ${"★".repeat(college.spotlight)}${"☆".repeat(
    3 - college.spotlight
  )}`;
  return [team, minutes, coaching, spotlight];
}