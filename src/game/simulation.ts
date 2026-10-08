import { Player } from "./player";

export const GAME_COST = 20;

export interface GameResult {
  opponent: string;
  teamScore: number;
  opponentScore: number;
  won: boolean;
  minutes: number;
  points: number;
  rebounds: number;
  assists: number;
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

// Random whole number around "mean", at most "spread" away
function around(mean: number, spread: number): number {
  const value = mean + (Math.random() * 2 - 1) * spread;
  return Math.max(0, Math.round(value));
}

export function simulateGame(player: Player, energy: number): GameResult {
  const r = player.ratings;

  // Tired players perform worse
  const fatigue = energy >= 50 ? 1 : energy >= 25 ? 0.92 : 0.82;

  const minutes = Math.min(36, Math.round((20 + r.stamina * 0.25) * fatigue));
  const share = minutes / 36;

  // Shooting
  const attempts = around(minutes * 0.45, 3);
  const fgChance = Math.min(0.65, (0.28 + r.shooting * 0.004) * fatigue);
  let points = 0;
  for (let i = 0; i < attempts; i++) {
    const isThree = Math.random() < 0.3;
    const chance = isThree ? fgChance - 0.1 : fgChance;
    if (Math.random() < chance) {
      points += isThree ? 3 : 2;
    }
  }

  // Free throws
  const ftAttempts = around(share * 4, 2);
  const ftChance = 0.5 + r.shooting * 0.003;
  for (let i = 0; i < ftAttempts; i++) {
    if (Math.random() < ftChance) points += 1;
  }

  const rebounds = around(r.rebounding * 0.14 * share * fatigue, 2);
  const assists = around(r.passing * 0.1 * share * fatigue, 2);

  // Team result
  const avg =
    (r.shooting + r.passing + r.defense + r.rebounding + r.speed + r.stamina) / 6;
  const teammates = around(68 + (avg - 45) * 0.5, 10);
  let teamScore = points + teammates;
  let opponentScore = around(86, 10);

  // No ties
  if (teamScore === opponentScore) {
    if (Math.random() < 0.5) teamScore += 2;
    else opponentScore += 2;
  }

  return {
    opponent: OPPONENTS[Math.floor(Math.random() * OPPONENTS.length)],
    teamScore,
    opponentScore,
    won: teamScore > opponentScore,
    minutes,
    points,
    rebounds,
    assists,
  };
}