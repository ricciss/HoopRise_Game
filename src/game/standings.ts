import { Team } from "./league";

export interface StandingRow {
  teamId: number;
  wins: number;
  losses: number;
  played: boolean; // already played against you this season
}

export interface RankedRow extends StandingRow {
  rank: number;
}

export const PLAYOFF_SPOTS = 8;

// How much team strength decides a game (bigger = more upsets)
const WIN_SCALE = 15;

function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function newStandings(teams: Team[]): StandingRow[] {
  return teams.map((t) => ({
    teamId: t.id,
    wins: 0,
    losses: 0,
    played: false,
  }));
}

// Picks a team you have not played yet this season
export function pickOpponent(
  standings: StandingRow[],
  teams: Team[],
  userTeamId: number
): Team | null {
  const others = teams.filter((t) => t.id !== userTeamId);
  const fresh = others.filter((t) => {
    const row = standings.find((s) => s.teamId === t.id);
    return !row || !row.played;
  });
  const pool = fresh.length > 0 ? fresh : others;
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

function winChance(a: Team, b: Team): number {
  return 1 / (1 + Math.exp(-(a.strength - b.strength) / WIN_SCALE));
}

// Plays one league week. userWon = null means you did not play, so your
// team's result is decided by team strength.
export function playLeagueWeek(
  standings: StandingRow[],
  teams: Team[],
  userTeamId: number,
  opponentId: number,
  userWon: boolean | null
): StandingRow[] {
  const rows = new Map<number, StandingRow>(
    standings.map((r) => [r.teamId, { ...r }])
  );

  function record(id: number, won: boolean) {
    const row = rows.get(id);
    if (!row) return;
    if (won) row.wins += 1;
    else row.losses += 1;
  }

  const user = teams.find((t) => t.id === userTeamId);
  const opponent = teams.find((t) => t.id === opponentId);
  if (user && opponent) {
    const won =
      userWon !== null ? userWon : Math.random() < winChance(user, opponent);
    record(userTeamId, won);
    record(opponentId, !won);
    const oppRow = rows.get(opponentId);
    if (oppRow) oppRow.played = true;
  }

  // Everybody else plays each other
  const rest = shuffle(
    teams.filter((t) => t.id !== userTeamId && t.id !== opponentId)
  );
  for (let i = 0; i + 1 < rest.length; i += 2) {
    const aWins = Math.random() < winChance(rest[i], rest[i + 1]);
    record(rest[i].id, aWins);
    record(rest[i + 1].id, !aWins);
  }

  return standings.map((s) => rows.get(s.teamId) ?? s);
}

// Sorted table: most wins first, then fewest losses, then team strength
export function rankStandings(
  standings: StandingRow[],
  teams: Team[]
): RankedRow[] {
  const strength = new Map<number, number>(
    teams.map((t) => [t.id, t.strength])
  );
  return [...standings]
    .sort(
      (a, b) =>
        b.wins - a.wins ||
        a.losses - b.losses ||
        (strength.get(b.teamId) ?? 0) - (strength.get(a.teamId) ?? 0) ||
        a.teamId - b.teamId
    )
    .map((r, i) => ({ ...r, rank: i + 1 }));
}