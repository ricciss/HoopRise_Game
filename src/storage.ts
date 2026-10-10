import * as SQLite from "expo-sqlite";
import { Player } from "./game/player";
import { GameResult } from "./game/simulation";
import { SeasonStats, SeasonSummary } from "./game/season";
import { Injury } from "./game/injuries";

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
}

// One finished season (a row in the season_history table)
export interface SeasonRecord {
  season: number;
  age: number;
  levelId: string;
  college: string | null;
  games: number;
  wins: number;
  losses: number;
  ppg: number;
  rpg: number;
  apg: number;
  overall: number;
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

// Deletes the whole career: the save and the season history
export async function clearGame(): Promise<void> {
  try {
    const db = await getDb();
    await db.execAsync("DELETE FROM save; DELETE FROM season_history;");
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