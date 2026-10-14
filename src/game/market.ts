import { Player, Ratings } from "./player";
import { Team } from "./league";

// A contract you currently have. Money is in millions of dollars.
export interface Contract {
  teamId: number;
  teamName: string;
  salary: number; // per season
  years: number; // total length
  yearsLeft: number;
}

export interface ContractOffer {
  teamId: number;
  teamName: string;
  salary: number;
  years: number;
  label: string;
}

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

// Roughly normal random number (mean 0, spread 1)
function gauss(): number {
  return (
    (Math.random() + Math.random() + Math.random() + Math.random() - 2) *
    Math.sqrt(3)
  );
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function formatMoney(millions: number): string {
  return `$${millions.toFixed(1)}M`;
}

// ---------- Rookie contract ----------

// Pick 1 = $10.5M, pick 30 = $2.5M, second round about $1.0-1.3M
export function rookieSalary(pick: number | null): number {
  if (pick === null) return 0.9;
  if (pick <= 30) return round1(10.5 - (pick - 1) * (8 / 29));
  return round1(1.3 - (pick - 31) * (0.3 / 29));
}

export function rookieYears(pick: number | null): number {
  return pick !== null && pick <= 30 ? 3 : 2;
}

// ---------- Market value and offers ----------

// What teams think you are worth (per season)
export function marketValue(player: Player, ppg: number): number {
  const keys = Object.keys(player.ratings) as (keyof Ratings)[];
  const top3 =
    keys
      .map((k) => player.ratings[k])
      .sort((a, b) => b - a)
      .slice(0, 3)
      .reduce((sum, n) => sum + n, 0) / 3;

  let value = (top3 - 62) * 1.6 + (ppg - 15) * 0.4;
  if (player.age >= 33) value *= 0.7;
  else if (player.age >= 31) value *= 0.85;
  return Math.max(1, Math.min(50, value));
}

function makeOffer(
  team: Team,
  market: number,
  factor: number,
  years: number,
  label: string
): ContractOffer {
  // A little randomness so offers are never identical
  const salary = market * factor * (0.94 + Math.random() * 0.12);
  return {
    teamId: team.id,
    teamName: team.name,
    salary: Math.max(1, Math.min(55, round1(salary))),
    years,
    label,
  };
}

export function generateContractOffers(
  player: Player,
  ppg: number,
  teams: Team[],
  currentTeamId: number | null
): ContractOffer[] {
  const market = marketValue(player, ppg);
  const current = teams.find((t) => t.id === currentTeamId) ?? null;
  const others = teams
    .filter((t) => t.id !== currentTeamId)
    .sort((a, b) => b.strength - a.strength);

  const offers: ContractOffer[] = [];
  if (current) {
    offers.push(makeOffer(current, market, 1.0, 3, "Stay with your team"));
  }
  if (others.length >= 20) {
    offers.push(
      makeOffer(
        pick(others.slice(0, 5)),
        market,
        0.85,
        3,
        "Contender: more wins, less money"
      )
    );
    offers.push(
      makeOffer(
        pick(others.slice(-5)),
        market,
        1.2,
        4,
        "Rebuilding team: more money, fewer wins"
      )
    );
    offers.push(
      makeOffer(
        pick(others.slice(10, 20)),
        market,
        1.0,
        2,
        "Mid-table team: short deal"
      )
    );
  }
  return offers;
}

// ---------- League changes ----------

// Teams get a bit stronger or weaker every season
export function driftTeams(teams: Team[]): Team[] {
  return teams.map((t) => ({
    ...t,
    strength: Math.max(30, Math.min(70, t.strength + Math.round(gauss() * 2.5))),
  }));
}