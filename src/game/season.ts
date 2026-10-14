import { Player, Ratings } from "./player";
import { GameResult } from "./simulation";

export const SEASON_WEEKS = 20; // 10 games per season, 2 weeks per game

// Every second week is a game week
export function isGameWeek(week: number): boolean {
  return week % 2 === 0;
}

export interface SeasonStats {
  games: number;
  wins: number;
  points: number;
  rebounds: number;
  assists: number;
}

export function emptyStats(): SeasonStats {
  return { games: 0, wins: 0, points: 0, rebounds: 0, assists: 0 };
}

export function addGame(stats: SeasonStats, game: GameResult): SeasonStats {
  return {
    games: stats.games + 1,
    wins: stats.wins + (game.won ? 1 : 0),
    points: stats.points + game.points,
    rebounds: stats.rebounds + game.rebounds,
    assists: stats.assists + game.assists,
  };
}

export interface SeasonSummary {
  season: number;
  age: number;
  games: number;
  wins: number;
  losses: number;
  ppg: number;
  rpg: number;
  apg: number;
}

function avg(total: number, games: number): number {
  return games === 0 ? 0 : Math.round((total / games) * 10) / 10;
}

export function summarize(
  season: number,
  age: number,
  stats: SeasonStats
): SeasonSummary {
  return {
    season,
    age,
    games: stats.games,
    wins: stats.wins,
    losses: stats.games - stats.wins,
    ppg: avg(stats.points, stats.games),
    rpg: avg(stats.rebounds, stats.games),
    apg: avg(stats.assists, stats.games),
  };
}

// Player gets one year older. After 30 the ratings slowly decline.
export function applyAging(player: Player): Player {
  const age = player.age + 1;
  const ratings = { ...player.ratings };

  if (age >= 30) {
    const maxDrop = age >= 34 ? 3 : age >= 32 ? 2 : 1;
    (Object.keys(ratings) as (keyof Ratings)[]).forEach((key) => {
      const drop = Math.floor(Math.random() * (maxDrop + 1));
      ratings[key] = Math.max(1, ratings[key] - drop);
    });
  }

  return { ...player, age, ratings };
}