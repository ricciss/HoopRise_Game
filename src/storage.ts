import * as SQLite from "expo-sqlite";
import { Player } from "./game/player";
import { GameResult } from "./game/simulation";
import { SeasonStats, SeasonSummary } from "./game/season";
import { Injury } from "./game/injuries";
import { Team, DraftPickEntry, DraftResult } from "./game/league";
import { Contract, ContractOffer } from "./game/market";

export interface SaveData {
  player: Player;
  week: number;
  energy: number;
  lastGame: GameResult | null;
  // Optional so older saves still load
  season?: number;
  seasonStats?: SeasonStats;
  seasonSummary?: SeasonSummary | null;
  eventId?: string | null;
  injury?: Injury | null;
  collegeId?: string | null;
  offerIds?: string[] | null;
  teamId?: number | null;
  draftPick?: number | null;
  draft?: DraftResult | null; // draft result waiting to be confirmed
  contract?: Contract | null;
  earnings?: number;
  contractOffers?: ContractOffer[] | null; // offers waiting for a decision
}

// One finished season (a row in the season_history table)
export interface SeasonRecord {
  season: number;
  age: number;
  levelId: string;
  college: string | null; // college or pro team name
  games: number;
  wins: number;
  losses: number;
  ppg: number;
  rpg: number;
  apg: number;
  overall: number;
}

// One signed contract (a row in the contracts table)
export interface ContractRecord {
  season: number; // first season of the contract
  teamName: string;
  salary: number;
  years: number;
}

interface HistoryRow {
  season: number;
  age: number;
  level_id: string;
  college: string | null;
  games: number;
  wins: number;
  losses: number;
  ppg: number;
  rpg: number;
  apg: number;
  overall: number;
}

interface ContractRow {
  season: number;
  team_name: string;
  salary: number;
  years: number;
}

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

// Opens the database once and creates the tables if they do not exist
function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync("hooprise.db");
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS save (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          data TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS season_history (
          season INTEGER PRIMARY KEY,
          age INTEGER NOT NULL,
          level_id TEXT NOT NULL,
          college TEXT,
          games INTEGER NOT NULL,
          wins INTEGER NOT NULL,
          losses INTEGER NOT NULL,
          ppg REAL NOT NULL,
          rpg REAL NOT NULL,
          apg REAL NOT NULL,
          overall INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS teams (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          strength INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS draft_class (
          pick INTEGER PRIMARY KEY,
          round INTEGER NOT NULL,
          team_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          position TEXT NOT NULL,
          overall INTEGER NOT NULL,
          college TEXT NOT NULL,
          is_user INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS contracts (
          season INTEGER PRIMARY KEY,
          team_name TEXT NOT NULL,
          salary REAL NOT NULL,
          years INTEGER NOT NULL
        );
      `);
      return db;
    })();
  }
  return dbPromise;
}

export async function saveGame(data: SaveData): Promise<void> {
  try {
    const db = await getDb();
    await db.runAsync(
      "INSERT OR REPLACE INTO save (id, data) VALUES (1, ?)",
      JSON.stringify(data)
    );
  } catch (e) {
    console.warn("Could not save game", e);
  }
}

export async function loadGame(): Promise<SaveData | null> {
  try {
    const db = await getDb();
    const row = await db.getFirstAsync<{ data: string }>(
      "SELECT data FROM save WHERE id = 1"
    );
    return row ? (JSON.parse(row.data) as SaveData) : null;
  } catch (e) {
    console.warn("Could not load game", e);
    return null;
  }
}

// Deletes the whole career: save, history, league, draft and contracts
export async function clearGame(): Promise<void> {
  try {
    const db = await getDb();
    await db.execAsync(
      "DELETE FROM save; DELETE FROM season_history; DELETE FROM teams; DELETE FROM draft_class; DELETE FROM contracts;"
    );
  } catch (e) {
    console.warn("Could not clear save", e);
  }
}

export async function addSeasonRecord(r: SeasonRecord): Promise<void> {
  try {
    const db = await getDb();
    await db.runAsync(
      `INSERT OR REPLACE INTO season_history
        (season, age, level_id, college, games, wins, losses, ppg, rpg, apg, overall)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      r.season,
      r.age,
      r.levelId,
      r.college,
      r.games,
      r.wins,
      r.losses,
      r.ppg,
      r.rpg,
      r.apg,
      r.overall
    );
  } catch (e) {
    console.warn("Could not save season record", e);
  }
}

export async function loadHistory(): Promise<SeasonRecord[]> {
  try {
    const db = await getDb();
    const rows = await db.getAllAsync<HistoryRow>(
      "SELECT * FROM season_history ORDER BY season"
    );
    return rows.map((r) => ({
      season: r.season,
      age: r.age,
      levelId: r.level_id,
      college: r.college,
      games: r.games,
      wins: r.wins,
      losses: r.losses,
      ppg: r.ppg,
      rpg: r.rpg,
      apg: r.apg,
      overall: r.overall,
    }));
  } catch (e) {
    console.warn("Could not load history", e);
    return [];
  }
}

export async function saveTeams(teams: Team[]): Promise<void> {
  try {
    const db = await getDb();
    await db.runAsync("DELETE FROM teams");
    for (const t of teams) {
      await db.runAsync(
        "INSERT INTO teams (id, name, strength) VALUES (?, ?, ?)",
        t.id,
        t.name,
        t.strength
      );
    }
  } catch (e) {
    console.warn("Could not save teams", e);
  }
}

export async function loadTeams(): Promise<Team[]> {
  try {
    const db = await getDb();
    return await db.getAllAsync<Team>(
      "SELECT id, name, strength FROM teams ORDER BY id"
    );
  } catch (e) {
    console.warn("Could not load teams", e);
    return [];
  }
}

export async function saveDraftClass(board: DraftPickEntry[]): Promise<void> {
  try {
    const db = await getDb();
    await db.runAsync("DELETE FROM draft_class");
    for (const e of board) {
      await db.runAsync(
        `INSERT INTO draft_class
          (pick, round, team_id, name, position, overall, college, is_user)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        e.pick,
        e.round,
        e.teamId,
        e.name,
        e.position,
        e.overall,
        e.college,
        e.isUser ? 1 : 0
      );
    }
  } catch (e) {
    console.warn("Could not save draft class", e);
  }
}

export async function saveContractRecord(r: ContractRecord): Promise<void> {
  try {
    const db = await getDb();
    await db.runAsync(
      `INSERT OR REPLACE INTO contracts (season, team_name, salary, years)
       VALUES (?, ?, ?, ?)`,
      r.season,
      r.teamName,
      r.salary,
      r.years
    );
  } catch (e) {
    console.warn("Could not save contract", e);
  }
}

export async function loadContractHistory(): Promise<ContractRecord[]> {
  try {
    const db = await getDb();
    const rows = await db.getAllAsync<ContractRow>(
      "SELECT season, team_name, salary, years FROM contracts ORDER BY season"
    );
    return rows.map((r) => ({
      season: r.season,
      teamName: r.team_name,
      salary: r.salary,
      years: r.years,
    }));
  } catch (e) {
    console.warn("Could not load contracts", e);
    return [];
  }
}