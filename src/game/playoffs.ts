import { Team } from "./league";
import { PLAYOFF_SPOTS, RankedRow } from "./standings";

export interface PlayoffMatch {
  a: number; // team id (higher seed)
  b: number;
  winner: number | null;
}

export interface Playoffs {
  season: number;
  rounds: PlayoffMatch[][]; // 4 quarterfinals, 2 semifinals, 1 final
  round: number; // current round (0-2)
  userTeamId: number;
  qualified: boolean;
  userOutRound: number | null; // round where you lost
  champion: number | null;
  active: boolean; // true while you still have a game to play
}

export type PlayoffResult =
  | "champion"
  | "final"
  | "semifinal"
  | "quarterfinal"
  | "missed";

export const ROUND_NAMES = ["Quarterfinal", "Semifinal", "Final"];

// Same formula as the regular season
const WIN_SCALE = 15;

function winChance(a: Team, b: Team): number {
  return 1 / (1 + Math.exp(-(a.strength - b.strength) / WIN_SCALE));
}

function simulateMatch(m: PlayoffMatch, teams: Team[]): number {
  const a = teams.find((t) => t.id === m.a);
  const b = teams.find((t) => t.id === m.b);
  if (!a || !b) return m.a;
  return Math.random() < winChance(a, b) ? m.a : m.b;
}

function pairWinners(winners: number[]): PlayoffMatch[] {
  const out: PlayoffMatch[] = [];
  for (let i = 0; i + 1 < winners.length; i += 2) {
    out.push({ a: winners[i], b: winners[i + 1], winner: null });
  }
  return out;
}

// 1 vs 8, 4 vs 5, 2 vs 7, 3 vs 6
function firstRound(seeds: number[]): PlayoffMatch[] {
  const order: [number, number][] = [
    [0, 7],
    [3, 4],
    [1, 6],
    [2, 5],
  ];
  return order.map(([i, j]) => ({ a: seeds[i], b: seeds[j], winner: null }));
}

// Plays all remaining rounds without you
function simulateRest(p: Playoffs, teams: Team[]): Playoffs {
  const rounds = p.rounds.map((r) => r.map((m) => ({ ...m })));
  let round = p.round;
  while (true) {
    rounds[round] = rounds[round].map((m) =>
      m.winner !== null ? m : { ...m, winner: simulateMatch(m, teams) }
    );
    const winners = rounds[round].map((m) => m.winner as number);
    if (round === 2) {
      return { ...p, rounds, round, champion: winners[0], active: false };
    }
    rounds[round + 1] = pairWinners(winners);
    round += 1;
  }
}

// Called when the regular season ends
export function startPlayoffs(
  season: number,
  ranked: RankedRow[],
  teams: Team[],
  userTeamId: number
): Playoffs {
  const seeds = ranked.slice(0, PLAYOFF_SPOTS).map((r) => r.teamId);
  const qualified = seeds.includes(userTeamId);
  const p: Playoffs = {
    season,
    rounds: [firstRound(seeds)],
    round: 0,
    userTeamId,
    qualified,
    userOutRound: null,
    champion: null,
    active: qualified,
  };
  return qualified ? p : simulateRest(p, teams);
}

// Your game in the current round
export function userMatch(p: Playoffs): PlayoffMatch | null {
  const matches = p.rounds[p.round] ?? [];
  return (
    matches.find(
      (m) =>
        m.winner === null && (m.a === p.userTeamId || m.b === p.userTeamId)
    ) ?? null
  );
}

export function userOpponentId(p: Playoffs): number | null {
  const m = userMatch(p);
  if (!m) return null;
  return m.a === p.userTeamId ? m.b : m.a;
}

// Call after you played your game of the current round
export function advancePlayoffs(
  p: Playoffs,
  teams: Team[],
  userWon: boolean
): Playoffs {
  const rounds = p.rounds.map((r) => r.map((m) => ({ ...m })));
  const matches = rounds[p.round];

  for (const m of matches) {
    if (m.winner !== null) continue;
    const hasUser = m.a === p.userTeamId || m.b === p.userTeamId;
    if (hasUser) {
      m.winner = userWon
        ? p.userTeamId
        : m.a === p.userTeamId
        ? m.b
        : m.a;
    } else {
      m.winner = simulateMatch(m, teams);
    }
  }

  const base: Playoffs = { ...p, rounds };

  // You lost: the rest of the bracket is played without you
  if (!userWon) {
    return simulateRest({ ...base, userOutRound: p.round }, teams);
  }
  // You won the final
  if (p.round === 2) {
    return { ...base, champion: p.userTeamId, active: false };
  }
  // You move on
  rounds[p.round + 1] = pairWinners(matches.map((m) => m.winner as number));
  return { ...base, round: p.round + 1 };
}

// Only call when the playoffs are finished (active = false)
export function userResult(p: Playoffs): PlayoffResult {
  if (!p.qualified) return "missed";
  if (p.champion === p.userTeamId) return "champion";
  if (p.userOutRound === 2) return "final";
  if (p.userOutRound === 1) return "semifinal";
  return "quarterfinal";
}

export function resultText(r: PlayoffResult): string {
  switch (r) {
    case "champion":
      return "Champions!";
    case "final":
      return "Lost in the final";
    case "semifinal":
      return "Lost in the semifinals";
    case "quarterfinal":
      return "Lost in the quarterfinals";
    default:
      return "Missed the playoffs";
  }
}