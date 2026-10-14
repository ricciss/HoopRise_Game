import { Player, Position, Ratings } from "./player";
import { LEVELS } from "./levels";
import { College, COLLEGES, CollegeTier } from "./colleges";

export interface Team {
  id: number;
  name: string;
  strength: number; // 30 (weak) to 70 (strong)
}

export interface DraftPickEntry {
  pick: number; // overall pick, 1-60
  round: number;
  teamId: number;
  teamName: string;
  name: string;
  position: Position;
  overall: number;
  college: string;
  isUser: boolean;
}

export interface DraftResult {
  board: DraftPickEntry[];
  userPick: number | null; // null = undrafted
  userTeamId: number;
  userTeamName: string;
}

const PROSPECT_COUNT = 79; // plus you = 80 players for 60 picks
const POSITIONS: Position[] = ["PG", "SG", "SF", "PF", "C"];

const CITIES = [
  "Harbor City", "Iron Valley", "Northgate", "Desert Springs", "Bayfront",
  "Capital City", "Lakeview", "Summit Ridge", "Riverton", "Stonebridge",
  "Cedar Falls", "Fort Meridian", "Redwood", "Silver Lake", "Granite Bay",
  "Pine Hollow", "Copper Canyon", "Eastport", "Westfield", "Sunset Coast",
  "Crystal Springs", "Ember City", "Falcon Heights", "Golden Plains",
  "Maple Grove", "Mesa Verde", "Ocean Park", "Prairie Gate",
  "Thunder Basin", "Windmere",
];

const NICKNAMES = [
  "Hawks", "Bulls", "Wolves", "Suns", "Sharks", "Kings", "Eagles", "Lions",
  "Titans", "Comets", "Raptors", "Storm", "Knights", "Rockets", "Pilots",
  "Miners", "Mustangs", "Vipers", "Pioneers", "Rangers", "Flames", "Dragons",
  "Bears", "Cougars", "Stallions", "Panthers", "Jets", "Falcons", "Bison",
  "Stingrays",
];

const FIRST_NAMES = [
  "Marcus", "Jaylen", "Tyler", "Devon", "Andre", "Caleb", "Isaiah", "Mason",
  "Noah", "Elijah", "Jordan", "Xavier", "Malik", "Trevor", "Darius", "Colton",
  "Austin", "Dante", "Evan", "Felix", "Gavin", "Hector", "Ivan", "Julian",
  "Kyle", "Leo", "Miles", "Nolan", "Omar", "Peyton", "Quincy", "Reggie",
  "Silas", "Terrence", "Victor", "Wesley", "Zion", "Brandon", "Cedric", "Dominic",
];

const LAST_NAMES = [
  "Walker", "Brooks", "Carter", "Coleman", "Diaz", "Ellis", "Foster", "Grant",
  "Hayes", "Ingram", "Jenkins", "Knight", "Lawson", "Monroe", "Nash", "Owens",
  "Porter", "Quinn", "Reed", "Sanders", "Tucker", "Underwood", "Vaughn",
  "Watkins", "Young", "Abbott", "Barnes", "Clarke", "Dawson", "Everett",
  "Fleming", "Gibson", "Harper", "Irvin", "Jacobs", "Kendrick", "Lopez",
  "Mitchell", "Norris", "Parker",
];

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Roughly normal random number (mean 0, spread 1)
function gauss(): number {
  return (
    (Math.random() + Math.random() + Math.random() + Math.random() - 2) *
    Math.sqrt(3)
  );
}

// ---------- Teams ----------

export function generateTeams(): Team[] {
  const nicknames = shuffle(NICKNAMES);
  return CITIES.map((city, i) => ({
    id: i + 1,
    name: `${city} ${nicknames[i]}`,
    strength: Math.max(30, Math.min(70, Math.round(50 + gauss() * 9))),
  }));
}

// Stronger teams score more per quarter (-1.2 ... +1.2)
export function teamModifier(team: Team): number {
  return (team.strength - 50) * 0.06;
}

export function strengthLabel(strength: number): string {
  if (strength >= 58) return "Strong team: more wins";
  if (strength >= 46) return "Average team";
  return "Weak team: fewer wins";
}

// ---------- Playing time (trust) ----------

// Season 8 (first pro season) = 1. Before that = 0.
export function proSeasonNumber(season: number): number {
  const proStart = LEVELS[0].seasons + LEVELS[1].seasons;
  return Math.max(0, season - proStart);
}

// Share of full minutes you get. High picks are trusted more, and everybody
// earns more trust every pro season.
export function trust(draftPick: number | null, proSeason: number): number {
  const base =
    draftPick === null
      ? 0.8
      : draftPick <= 14
      ? 1
      : draftPick <= 30
      ? 0.92
      : 0.85;
  return Math.min(1, base + 0.04 * Math.max(0, proSeason - 1));
}

export function roleLabel(draftPick: number | null): string {
  if (draftPick === null) return "Fighting for a spot: few minutes at first";
  if (draftPick <= 14) return "Franchise prospect: full playing time";
  if (draftPick <= 30) return "Rotation player: slightly fewer minutes at first";
  return "Bench role: limited minutes at first";
}

export function pickLabel(pick: number): string {
  return pick <= 30
    ? `Round 1, Pick ${pick}`
    : `Round 2, Pick ${pick - 30}`;
}

// ---------- Draft ----------

interface Entrant {
  name: string;
  position: Position;
  overall: number;
  college: string;
  isUser: boolean;
  score: number;
}

function draftScore(
  top3: number,
  overall: number,
  ppg: number,
  spotlight: number
): number {
  return 0.55 * top3 + 0.25 * overall + 0.5 * ppg + 3.5 * spotlight;
}

function makeProspect(taken: Set<string>): Entrant {
  const top3 = 67 + gauss() * 5.5;
  const overall = top3 - 16 + gauss() * 2;
  const ppg = Math.max(4, 17 + (top3 - 68) * 0.45 + gauss() * 3);

  const r = Math.random();
  const tier: CollegeTier = r < 0.4 ? "small" : r < 0.8 ? "good" : "elite";
  const college: College = pick(COLLEGES.filter((c) => c.tier === tier));

  let name = "";
  for (let i = 0; i < 20; i++) {
    name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    if (!taken.has(name)) break;
  }
  taken.add(name);

  return {
    name,
    position: pick(POSITIONS),
    overall: Math.round(overall),
    college: college.name,
    isUser: false,
    score:
      draftScore(top3, overall, ppg, college.spotlight) + gauss() * 2.5,
  };
}

// Runs the whole draft at once. ppg = your average points in college.
export function runDraft(
  player: Player,
  ppg: number,
  college: College | null,
  teams: Team[]
): DraftResult {
  const keys = Object.keys(player.ratings) as (keyof Ratings)[];
  const values = keys.map((k) => player.ratings[k]);
  const overall = values.reduce((a, b) => a + b, 0) / values.length;
  const top3 =
    [...values]
      .sort((a, b) => b - a)
      .slice(0, 3)
      .reduce((a, b) => a + b, 0) / 3;
  const spotlight = college ? college.spotlight : 1;

  const user: Entrant = {
    name: player.name,
    position: player.position,
    overall: Math.round(overall),
    college: college ? college.name : "Unknown",
    isUser: true,
    score: draftScore(top3, overall, ppg, spotlight) + gauss() * 2.5,
  };

  const taken = new Set<string>([player.name]);
  const entrants: Entrant[] = [user];
  for (let i = 0; i < PROSPECT_COUNT; i++) {
    entrants.push(makeProspect(taken));
  }
  entrants.sort((a, b) => b.score - a.score);

  // Weak teams pick first (with a bit of luck)
  const order = teams
    .map((t) => ({ t, key: t.strength + gauss() * 4 }))
    .sort((a, b) => a.key - b.key)
    .map((x) => x.t);

  const board: DraftPickEntry[] = entrants.slice(0, 60).map((e, i) => {
    const team = order[i % order.length];
    return {
      pick: i + 1,
      round: i < order.length ? 1 : 2,
      teamId: team.id,
      teamName: team.name,
      name: e.name,
      position: e.position,
      overall: e.overall,
      college: e.college,
      isUser: e.isUser,
    };
  });

  const index = board.findIndex((e) => e.isUser);
  if (index >= 0) {
    return {
      board,
      userPick: index + 1,
      userTeamId: board[index].teamId,
      userTeamName: board[index].teamName,
    };
  }

  // Undrafted: you sign with one of the 10 weakest teams
  const weakest = [...teams]
    .sort((a, b) => a.strength - b.strength)
    .slice(0, 10);
  const signed = pick(weakest);
  return {
    board,
    userPick: null,
    userTeamId: signed.id,
    userTeamName: signed.name,
  };
}