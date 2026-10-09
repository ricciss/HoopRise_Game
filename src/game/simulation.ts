import { Player, Ratings } from "./player";

export const GAME_COST = 20;

export interface QuarterResult {
  quarter: number;
  teamScore: number;
  opponentScore: number;
  minutes: number;
  points: number;
  rebounds: number;
  assists: number;
  highlights: string[];
}

export interface GameResult {
  opponent: string;
  teamScore: number;
  opponentScore: number;
  won: boolean;
  minutes: number;
  points: number;
  rebounds: number;
  assists: number;
  // Optional so older saves still load
  quarters?: QuarterResult[];
}

const OPPONENTS = [
  "Harbor Hawks",
  "Iron City Bulls",
  "Northside Wolves",
  "Desert Suns",
  "Bay Sharks",
  "Capital Kings",
  "Lakeview Eagles",
  "Summit Lions",
];

const TWO_POINT_PLAYS = [
  "Hits a mid-range jumper",
  "Finishes at the rim",
  "Scores on a fast break",
];

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

// Random whole number around "mean", at most "spread" away
function around(mean: number, spread: number): number {
  const value = mean + (Math.random() * 2 - 1) * spread;
  return Math.max(0, Math.round(value));
}

function simulateQuarter(
  quarter: number,
  minutes: number,
  r: Ratings,
  fatigue: number,
  teamAvg: number
): QuarterResult {
  // Players get more tired in later quarters, low stamina makes it worse
  const tired = ((100 - r.stamina) / 100) * 0.05 * (quarter - 1);
  const form = fatigue * (1 - tired);
  const share = minutes / 36;

  let points = 0;
  const plays: string[] = [];

  // Field goals: better shooters also take more shots
  const attempts = around(minutes * (0.34 + r.shooting * 0.0035), 1.5);
  const fgChance = Math.min(0.65, (0.28 + r.shooting * 0.004) * form);
  for (let i = 0; i < attempts; i++) {
    const isThree = Math.random() < 0.3;
    const chance = isThree ? fgChance - 0.1 : fgChance;
    if (Math.random() < chance) {
      points += isThree ? 3 : 2;
      plays.push(isThree ? "Drains a three-pointer" : pick(TWO_POINT_PLAYS));
    }
  }

  // Free throws
  const ftAttempts = around(minutes / 9, 1);
  const ftChance = 0.5 + r.shooting * 0.003;
  for (let i = 0; i < ftAttempts; i++) {
    if (Math.random() < ftChance) points += 1;
  }

  const rebounds = around(r.rebounding * 0.14 * share * form, 1);
  const assists = around(r.passing * 0.1 * share * form, 1);

  // Highlights: summary lines first, then individual plays
  const highlights: string[] = [];
  if (points >= 10) highlights.push(`On fire: ${points} points this quarter`);
  if (rebounds >= 4) highlights.push("Dominates the glass");
  if (assists >= 3) highlights.push("Running the offense");
  for (const play of plays) {
    if (highlights.length >= 3) break;
    highlights.push(play);
  }

  // Rebounds and assists help the team win, defense holds the opponent down
  const impact = rebounds * 0.2 + assists * 0.3;
  const teammates = around(17 + (teamAvg - 45) * 0.08, 4);
  const opponentScore = around(22 - (r.defense - 45) * 0.07, 4);

  return {
    quarter,
    teamScore: Math.round(points + teammates + impact),
    opponentScore,
    minutes,
    points,
    rebounds,
    assists,
    highlights,
  };
}

export function simulateGame(player: Player, energy: number): GameResult {
  const r = player.ratings;

  // Tired players perform worse
  const fatigue = energy >= 50 ? 1 : energy >= 25 ? 0.92 : 0.82;

  const totalMinutes = Math.min(
    36,
    Math.round((20 + r.stamina * 0.25) * fatigue)
  );
  const base = Math.floor(totalMinutes / 4);
  const extra = totalMinutes % 4;

  const teamAvg =
    (r.shooting + r.passing + r.defense + r.rebounding + r.speed + r.stamina) /
    6;

  const quarters: QuarterResult[] = [];
  for (let q = 1; q <= 4; q++) {
    const minutes = base + (q <= extra ? 1 : 0);
    quarters.push(simulateQuarter(q, minutes, r, fatigue, teamAvg));
  }

  let teamScore = quarters.reduce((s, q) => s + q.teamScore, 0);
  let opponentScore = quarters.reduce((s, q) => s + q.opponentScore, 0);

  // No ties: the last quarter decides
  if (teamScore === opponentScore) {
    const last = quarters[3];
    if (Math.random() < 0.5) {
      last.teamScore += 2;
      teamScore += 2;
    } else {
      last.opponentScore += 2;
      opponentScore += 2;
    }
  }

  return {
    opponent: pick(OPPONENTS),
    teamScore,
    opponentScore,
    won: teamScore > opponentScore,
    minutes: totalMinutes,
    points: quarters.reduce((s, q) => s + q.points, 0),
    rebounds: quarters.reduce((s, q) => s + q.rebounds, 0),
    assists: quarters.reduce((s, q) => s + q.assists, 0),
    quarters,
  };
}