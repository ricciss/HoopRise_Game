// Achievements: goals the player unlocks during a career.
// Pure logic: it only looks at the data it is given.
import type { Ratings } from "./player";
import type { GameResult } from "./simulation";
import type { SeasonRecord, ChampionRecord } from "../storage";

// Everything the achievements need to know
export interface AchievementInput {
  lastGame: GameResult | null; // the most recent game
  history: SeasonRecord[]; // finished seasons
  champions: ChampionRecord[]; // how every pro season ended
  overall: number; // average of all ratings
  earnings: number; // career earnings, millions of dollars
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  check: (i: AchievementInput) => boolean;
}

// Average of the six ratings, rounded
export function overallOf(ratings: Ratings): number {
  const values = Object.values(ratings);
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

// How many of points, rebounds and assists reached 10 in one game
function tens(g: GameResult): number {
  return [g.points, g.rebounds, g.assists].filter((v) => v >= 10).length;
}

function bestSeason(
  history: SeasonRecord[],
  test: (r: SeasonRecord) => boolean
): boolean {
  return history.some(test);
}

function titles(champions: ChampionRecord[]): number {
  return champions.filter((c) => c.userResult === "champion").length;
}

export const ACHIEVEMENTS: Achievement[] = [
  // ----- Single games -----
  {
    id: "first_win",
    name: "First Win",
    description: "Win a game.",
    check: (i) => i.lastGame !== null && i.lastGame.won,
  },
  {
    id: "big_night",
    name: "Big Night",
    description: "Score 30 points in a game.",
    check: (i) => i.lastGame !== null && i.lastGame.points >= 30,
  },
  {
    id: "unstoppable",
    name: "Unstoppable",
    description: "Score 40 points in a game.",
    check: (i) => i.lastGame !== null && i.lastGame.points >= 40,
  },
  {
    id: "double_double",
    name: "Double-Double",
    description: "Reach 10 in two stats (points, rebounds, assists) in a game.",
    check: (i) => i.lastGame !== null && tens(i.lastGame) >= 2,
  },
  {
    id: "triple_double",
    name: "Triple-Double",
    description: "Reach 10 points, 10 rebounds and 10 assists in one game.",
    check: (i) => i.lastGame !== null && tens(i.lastGame) >= 3,
  },

  // ----- Seasons -----
  {
    id: "winning_season",
    name: "Winning Season",
    description: "Finish a season with more wins than losses.",
    check: (i) => bestSeason(i.history, (r) => r.wins > r.losses),
  },
  {
    id: "perfect_season",
    name: "Perfect Season",
    description: "Win every game of a season.",
    check: (i) => bestSeason(i.history, (r) => r.games >= 10 && r.losses === 0),
  },
  {
    id: "scoring_machine",
    name: "Scoring Machine",
    description: "Average 25 points per game in a season.",
    check: (i) => bestSeason(i.history, (r) => r.ppg >= 25),
  },
  {
    id: "glass_cleaner",
    name: "Glass Cleaner",
    description: "Average 10 rebounds per game in a season.",
    check: (i) => bestSeason(i.history, (r) => r.rpg >= 10),
  },
  {
    id: "floor_general",
    name: "Floor General",
    description: "Average 8 assists per game in a season.",
    check: (i) => bestSeason(i.history, (r) => r.apg >= 8),
  },

  // ----- Career -----
  {
    id: "turn_pro",
    name: "Welcome to the League",
    description: "Play your first professional season.",
    check: (i) => bestSeason(i.history, (r) => r.levelId === "pro"),
  },
  {
    id: "champion",
    name: "Champion",
    description: "Win a championship.",
    check: (i) => titles(i.champions) >= 1,
  },
  {
    id: "dynasty",
    name: "Dynasty",
    description: "Win 3 championships.",
    check: (i) => titles(i.champions) >= 3,
  },
  {
    id: "rising_star",
    name: "Rising Star",
    description: "Reach an overall rating of 70.",
    check: (i) => i.overall >= 70,
  },
  {
    id: "elite",
    name: "Elite",
    description: "Reach an overall rating of 80.",
    check: (i) => i.overall >= 80,
  },
  {
    id: "franchise_player",
    name: "Franchise Player",
    description: "Reach an overall rating of 90.",
    check: (i) => i.overall >= 90,
  },
  {
    id: "nine_figures",
    name: "Nine Figures",
    description: "Hold $100M in career earnings.",
    check: (i) => i.earnings >= 100,
  },
  {
    id: "veteran",
    name: "Veteran",
    description: "Play 10 seasons.",
    check: (i) => i.history.length >= 10,
  },
];

export function findAchievement(id: string): Achievement | null {
  return ACHIEVEMENTS.find((a) => a.id === id) ?? null;
}

// The achievements that are reached now but not unlocked yet
export function newlyUnlocked(
  input: AchievementInput,
  unlocked: string[]
): Achievement[] {
  return ACHIEVEMENTS.filter(
    (a) => !unlocked.includes(a.id) && a.check(input)
  );
}
