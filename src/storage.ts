import AsyncStorage from "@react-native-async-storage/async-storage";
import { Player } from "./game/player";
import { GameResult } from "./game/simulation";
import { SeasonStats, SeasonSummary } from "./game/season";

const KEY = "hooprise_save_v1";

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
}

export async function saveGame(data: SaveData): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Could not save game", e);
  }
}

export async function loadGame(): Promise<SaveData | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SaveData) : null;
  } catch (e) {
    console.warn("Could not load game", e);
    return null;
  }
}

export async function clearGame(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch (e) {
    console.warn("Could not clear save", e);
  }
}