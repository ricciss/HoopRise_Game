import { Player, Position } from "./player";
import { SeasonRecord, ChampionRecord } from "../storage";

// You can retire from this age, and the career ends by itself at the maximum age
export const RETIRE_MIN_AGE = 33;
export const RETIRE_MAX_AGE = 38;

export type Verdict =
  | "Journeyman"
  | "Role player"
  | "Starter"
  | "All-Star"
  | "Superstar"
  | "Hall of Famer";

export function canRetire(age: number): boolean {
  return age >= RETIRE_MIN_AGE;
}

export function mustRetire(age: number): boolean {
  return age >= RETIRE_MAX_AGE;
}

// Lowest legacy score of each verdict
const LIMITS: [number, Verdict][] = [
  [120, "Hall of Famer"],
  [100, "Superstar"],
  [80, "All-Star"],
  [63, "Starter"],
  [50, "Role player"],
  [0, "Journeyman"],
];

export function verdictFor(score: number): Verdict {
  for (const [limit, verdict] of LIMITS) {
    if (score >= limit) return verdict;
  }
  return "Journeyman";
}

export function verdictText(verdict: Verdict): string {
  switch (verdict) {
    case "Hall of Famer":
      return "One of the greatest ever. Your jersey hangs in the rafters.";
    case "Superstar":
      return "A legend that every fan remembers.";
    case "All-Star":
      return "A star who played in the biggest games for years.";
    case "Starter":
      return "A reliable starter with a long and respected career.";
    case "Role player":
      return "You found your place in the league and made the most of it.";
    default:
      return "A quiet career, but you made it to the pros.";
  }
}

export function verdictColor(verdict: string): string {
  if (verdict === "Hall of Famer" || verdict === "Superstar") return "#f1c40f";
  if (verdict === "All-Star") return "#ff8c00";
  if (verdict === "Starter") return "#3ddc84";
  return "#aaaaaa";
}

export interface CareerSummary {
  name: string;
  position: Position;
  retireAge: number;
  seasons: number;
  proSeasons: number;
  proGames: number;
  ppg: number;
  rpg: number;
  apg: number;
  wins: number;
  losses: number;
  peakOverall: number;
  bestSeason: { season: number; ppg: number } | null;
  titles: number;
  playoffApps: number;
  earnings: number; // millions of dollars
  teams: string[];
  draftPick: number | null;
  college: string | null;
  score: number;
  verdict: Verdict;
}

export function buildCareerSummary(input: {
  player: Player;
  history: SeasonRecord[];
  champions: ChampionRecord[];
  earnings: number;
  draftPick: number | null;
  college: string | null;
}): CareerSummary {
  const pro = input.history.filter((r) => r.levelId === "pro");
  const games = pro.reduce((sum, r) => sum + r.games, 0);

  // Averages are weighted by the number of games in each season
  const average = (key: "ppg" | "rpg" | "apg"): number =>
    games === 0
      ? 0
      : Math.round(
          (pro.reduce((sum, r) => sum + r[key] * r.games, 0) / games) * 10
        ) / 10;

  let best: { season: number; ppg: number } | null = null;
  for (const r of pro) {
    if (best === null || r.ppg > best.ppg) {
      best = { season: r.season, ppg: r.ppg };
    }
  }

  const titles = input.champions.filter(
    (c) => c.userResult === "champion"
  ).length;
  const playoffApps = input.champions.filter(
    (c) => c.userResult !== "missed"
  ).length;

  const teams: string[] = [];
  for (const r of pro) {
    if (r.college && !teams.includes(r.college)) teams.push(r.college);
  }

  // Legacy score: production, titles, playoff runs and longevity
  const production = pro.reduce((sum, r) => sum + r.ppg + r.rpg + r.apg, 0);
  const score = Math.round(
    production / 12 + titles * 12 + playoffApps * 1.5 + pro.length
  );

  return {
    name: input.player.name,
    position: input.player.position,
    retireAge: input.player.age,
    seasons: input.history.length,
    proSeasons: pro.length,
    proGames: games,
    ppg: average("ppg"),
    rpg: average("rpg"),
    apg: average("apg"),
    wins: pro.reduce((sum, r) => sum + r.wins, 0),
    losses: pro.reduce((sum, r) => sum + r.losses, 0),
    peakOverall: Math.max(0, ...input.history.map((r) => r.overall)),
    bestSeason: best,
    titles,
    playoffApps,
    earnings: input.earnings,
    teams,
    draftPick: input.draftPick,
    college: input.college,
    score,
    verdict: verdictFor(score),
  };
}