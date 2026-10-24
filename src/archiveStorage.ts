import { getDb } from "./storage";
import { CareerSummary } from "./game/legacy";

// A finished career in the archive (a row in the career_archive table)
export interface ArchivedCareer {
  id: number;
  name: string;
  position: string;
  retireAge: number;
  proSeasons: number;
  titles: number;
  ppg: number;
  earnings: number;
  score: number;
  verdict: string;
}

interface ArchiveRow {
  id: number;
  name: string;
  position: string;
  retire_age: number;
  pro_seasons: number;
  titles: number;
  ppg: number;
  earnings: number;
  score: number;
  verdict: string;
}

async function db() {
  const database = await getDb();
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS career_archive (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      position TEXT NOT NULL,
      retire_age INTEGER NOT NULL,
      pro_seasons INTEGER NOT NULL,
      titles INTEGER NOT NULL,
      ppg REAL NOT NULL,
      earnings REAL NOT NULL,
      score INTEGER NOT NULL,
      verdict TEXT NOT NULL
    );
  `);
  return database;
}

export async function archiveCareer(c: CareerSummary): Promise<void> {
  try {
    const database = await db();
    await database.runAsync(
      `INSERT INTO career_archive
        (name, position, retire_age, pro_seasons, titles, ppg, earnings, score, verdict)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      c.name,
      c.position,
      c.retireAge,
      c.proSeasons,
      c.titles,
      c.ppg,
      c.earnings,
      c.score,
      c.verdict
    );
  } catch (e) {
    console.warn("Could not archive career", e);
  }
}

// Best careers first
export async function loadArchive(): Promise<ArchivedCareer[]> {
  try {
    const database = await db();
    const rows = await database.getAllAsync<ArchiveRow>(
      "SELECT * FROM career_archive ORDER BY score DESC, id DESC"
    );
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      position: r.position,
      retireAge: r.retire_age,
      proSeasons: r.pro_seasons,
      titles: r.titles,
      ppg: r.ppg,
      earnings: r.earnings,
      score: r.score,
      verdict: r.verdict,
    }));
  } catch (e) {
    console.warn("Could not load archive", e);
    return [];
  }
}