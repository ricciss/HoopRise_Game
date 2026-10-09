import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { createPlayer, Player, Position, Ratings } from "../game/player";
import {
  train,
  rest,
  MAX_ENERGY,
  TRAIN_COST,
  REST_GAIN,
} from "../game/training";
import { simulateGame, GameResult, GAME_COST } from "../game/simulation";
import {
  SEASON_WEEKS,
  isGameWeek,
  SeasonStats,
  SeasonSummary,
  emptyStats,
  addGame,
  summarize,
  applyAging,
} from "../game/season";
import { saveGame, loadGame, clearGame } from "../storage";

export const LABELS: Record<keyof Ratings, string> = {
  shooting: "Shooting",
  passing: "Passing",
  defense: "Defense",
  rebounding: "Rebounding",
  speed: "Speed",
  stamina: "Stamina",
};

interface GameState {
  loaded: boolean;
  player: Player | null;
  week: number;
  season: number;
  energy: number;
  message: string;
  lastGame: GameResult | null;
  seasonSummary: SeasonSummary | null;
   seasonStats: SeasonStats;
  gameWeek: boolean;
  createCareer: (name: string, position: Position) => void;
  trainStat: (stat: keyof Ratings) => void;
  restWeek: () => void;
  playGame: () => void;
  nextSeason: () => void;
  newCareer: () => void;
}

const GameContext = createContext<GameState | null>(null);

export function useGame(): GameState {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [player, setPlayer] = useState<Player | null>(null);
  const [week, setWeek] = useState(1);
  const [season, setSeason] = useState(1);
  const [energy, setEnergy] = useState(MAX_ENERGY);
  const [message, setMessage] = useState("");
  const [lastGame, setLastGame] = useState<GameResult | null>(null);
  const [seasonStats, setSeasonStats] = useState<SeasonStats>(emptyStats());
  const [seasonSummary, setSeasonSummary] = useState<SeasonSummary | null>(
    null
  );

  // Load saved game on startup
  useEffect(() => {
    loadGame().then((data) => {
      if (data) {
        setPlayer(data.player);
        setWeek(Math.min(data.week, SEASON_WEEKS));
        setEnergy(data.energy);
        setLastGame(data.lastGame);
        setSeason(data.season ?? 1);
        setSeasonStats(data.seasonStats ?? emptyStats());
        setSeasonSummary(data.seasonSummary ?? null);
      }
      setLoaded(true);
    });
  }, []);

  // Save after every change (only after the initial load is finished)
  useEffect(() => {
    if (!loaded) return;
    if (player) {
      saveGame({
        player,
        week,
        energy,
        lastGame,
        season,
        seasonStats,
        seasonSummary,
      });
    } else {
      clearGame();
    }
  }, [loaded, player, week, energy, lastGame, season, seasonStats, seasonSummary]);

  // Moves to the next week, or ends the season after the last week
  function advance(nextStats: SeasonStats) {
    if (!player) return;
    setSeasonStats(nextStats);
    if (week >= SEASON_WEEKS) {
      setSeasonSummary(summarize(season, player.age, nextStats));
    } else {
      setWeek(week + 1);
    }
  }

  function createCareer(name: string, position: Position) {
    if (name.trim().length === 0) return;
    setPlayer(createPlayer(name.trim(), position));
    setWeek(1);
    setSeason(1);
    setEnergy(MAX_ENERGY);
    setMessage("");
    setLastGame(null);
    setSeasonStats(emptyStats());
    setSeasonSummary(null);
  }

  function trainStat(stat: keyof Ratings) {
    if (!player || isGameWeek(week)) return;
    if (energy < TRAIN_COST) {
      setMessage("Not enough energy. Rest first.");
      return;
    }
    const result = train(player, stat, energy);
    setPlayer(result.player);
    setEnergy(result.energy);
    setMessage(`${LABELS[stat]} +${result.gain}`);
    advance(seasonStats);
  }

  function restWeek() {
    if (isGameWeek(week)) return;
    setEnergy(rest(energy));
    setMessage(`You rested. +${REST_GAIN} energy`);
    advance(seasonStats);
  }

  function playGame() {
    if (!player || !isGameWeek(week)) return;
    const result = simulateGame(player, energy);
    setLastGame(result);
    setEnergy(Math.max(0, energy - GAME_COST));
    setMessage(result.won ? "Victory!" : "Tough loss.");
    advance(addGame(seasonStats, result));
  }

  function nextSeason() {
    if (!player) return;
    setPlayer(applyAging(player));
    setSeason(season + 1);
    setWeek(1);
    setEnergy(MAX_ENERGY);
    setSeasonStats(emptyStats());
    setSeasonSummary(null);
    setLastGame(null);
    setMessage("A new season begins!");
  }

  function newCareer() {
    setPlayer(null);
  }

  const value: GameState = {
    loaded,
    player,
    week,
    season,
    energy,
    message,
    lastGame,
    seasonSummary,
    seasonStats,
    gameWeek: isGameWeek(week),
    createCareer,
    trainStat,
    restWeek,
    playGame,
    nextSeason,
    newCareer,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}