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
import {
  GameEvent,
  rollEvent,
  findEvent,
  applyEffect,
  describeEffect,
} from "../game/events";
import {
  Injury,
  rollInjury,
  tickInjury,
  worsenInjury,
  describeInjury,
  WORSEN_CHANCE,
} from "../game/injuries";
import { Level, levelForSeason } from "../game/levels";
import { saveGame, loadGame, clearGame } from "../storage";

export const LABELS: Record<keyof Ratings, string> = {
  shooting: "Shooting",
  passing: "Passing",
  defense: "Defense",
  rebounding: "Rebounding",
  speed: "Speed",
  stamina: "Stamina",
};

export interface LiveGameState {
  game: GameResult;
  shown: number; // how many quarters are revealed
}

interface GameState {
  loaded: boolean;
  player: Player | null;
  week: number;
  season: number;
  level: Level;
  energy: number;
  message: string;
  lastGame: GameResult | null;
  seasonStats: SeasonStats;
  seasonSummary: SeasonSummary | null;
  gameWeek: boolean;
  createCareer: (name: string, position: Position) => void;
  trainStat: (stat: keyof Ratings) => void;
  restWeek: () => void;
  playGame: () => void;
  nextSeason: () => void;
  newCareer: () => void;
  liveGame: LiveGameState | null;
  nextQuarter: () => void;
  skipGame: () => void;
  closeGame: () => void;
  event: GameEvent | null;
  chooseEvent: (index: number) => void;
  injury: Injury | null;
  sitOut: () => void;
  playHurt: () => void;
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
  const [liveGame, setLiveGame] = useState<LiveGameState | null>(null);
  const [event, setEvent] = useState<GameEvent | null>(null);
  const [injury, setInjury] = useState<Injury | null>(null);

  // The level (high school, college, pro) depends on the season number
  const level = levelForSeason(season);

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
        setEvent(data.eventId ? findEvent(data.eventId) : null);
        setInjury(data.injury ?? null);
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
        eventId: event ? event.id : null,
        injury,
      });
    } else {
      clearGame();
    }
  }, [
    loaded,
    player,
    week,
    energy,
    lastGame,
    season,
    seasonStats,
    seasonSummary,
    event,
    injury,
  ]);

  // Moves to the next week, or ends the season after the last week
  function advance(nextStats: SeasonStats) {
    if (!player) return;
    setSeasonStats(nextStats);
    if (week >= SEASON_WEEKS) {
      setSeasonSummary(summarize(season, player.age, nextStats));
    } else {
      const nextWeek = week + 1;
      setWeek(nextWeek);
      // Random events only happen in training weeks
      if (!isGameWeek(nextWeek)) {
        setEvent(rollEvent());
      }
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
    setLiveGame(null);
    setEvent(null);
    setInjury(null);
  }

  function trainStat(stat: keyof Ratings) {
    if (!player || isGameWeek(week) || event) return;
    if (injury) {
      setMessage("You are injured. Rest to recover.");
      return;
    }
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
    if (isGameWeek(week) || event) return;
    setEnergy(rest(energy));
    if (injury) {
      const healed = tickInjury(injury, 2);
      setInjury(healed);
      setMessage(
        healed
          ? `You rested and your injury is healing. +${REST_GAIN} energy`
          : `You are healthy again! +${REST_GAIN} energy`
      );
    } else {
      setMessage(`You rested. +${REST_GAIN} energy`);
    }
    advance(seasonStats);
  }

  function playGame() {
    if (!player || !isGameWeek(week) || injury) return;
    const result = simulateGame(player, energy, level);
    setLastGame(result);
    setLiveGame({ game: result, shown: 0 });

    let text = result.won ? "Victory!" : "Tough loss.";
    const hurt = rollInjury(energy);
    if (hurt) {
      setInjury(hurt);
      text += ` Injury: ${describeInjury(hurt)}`;
    }

    setEnergy(Math.max(0, energy - GAME_COST));
    setMessage(text);
    advance(addGame(seasonStats, result));
  }

  // Game week while injured: skip the game and recover faster
  function sitOut() {
    if (!player || !isGameWeek(week) || !injury) return;
    const healed = tickInjury(injury, 2);
    setInjury(healed);
    setEnergy(Math.min(MAX_ENERGY, energy + 20));
    setMessage(
      healed
        ? "You sat out the game and focused on recovery. +20 energy"
        : "You sat out the game and you are healthy again! +20 energy"
    );
    advance(seasonStats);
  }

  // Game week while injured: play anyway, with a bad performance and a risk
  function playHurt() {
    if (!player || !isGameWeek(week) || !injury) return;
    const result = simulateGame(player, Math.min(energy, 20), level);
    setLastGame(result);
    setLiveGame({ game: result, shown: 0 });
    setEnergy(Math.max(0, energy - GAME_COST));

    let text = result.won ? "Victory, even hurt!" : "Tough loss.";
    if (Math.random() < WORSEN_CHANCE) {
      const worse = worsenInjury(injury);
      setInjury(worse);
      text += ` You made the injury worse: ${describeInjury(worse)}`;
    } else {
      const healed = tickInjury(injury, 1);
      setInjury(healed);
      if (!healed) text += " You are healthy again!";
    }

    setMessage(text);
    advance(addGame(seasonStats, result));
  }

  function chooseEvent(index: number) {
    if (!player || !event) return;
    const choice = event.choices[index];
    if (!choice) return;
    const result = applyEffect(player, energy, choice.effect);
    setPlayer(result.player);
    setEnergy(result.energy);
    setMessage(`${choice.result} (${describeEffect(choice.effect)})`);
    setEvent(null);
  }

  function nextSeason() {
    if (!player) return;
    const nextLevel = levelForSeason(season + 1);
    setPlayer(applyAging(player));
    setSeason(season + 1);
    setWeek(1);
    setEnergy(MAX_ENERGY);
    setSeasonStats(emptyStats());
    setSeasonSummary(null);
    setLastGame(null);
    setLiveGame(null);
    setEvent(null);
    setInjury(null);
    setMessage(
      nextLevel.id !== level.id
        ? `Welcome to ${nextLevel.name}! The competition is tougher.`
        : "A new season begins!"
    );
  }

  function newCareer() {
    setPlayer(null);
    setLiveGame(null);
    setEvent(null);
    setInjury(null);
  }

  function nextQuarter() {
    setLiveGame((l) => (l ? { ...l, shown: l.shown + 1 } : l));
  }

  function skipGame() {
    setLiveGame((l) => (l ? { ...l, shown: 4 } : l));
  }

  function closeGame() {
    setLiveGame(null);
  }

  const value: GameState = {
    loaded,
    player,
    week,
    season,
    level,
    energy,
    message,
    lastGame,
    seasonStats,
    seasonSummary,
    gameWeek: isGameWeek(week),
    createCareer,
    trainStat,
    restWeek,
    playGame,
    nextSeason,
    newCareer,
    liveGame,
    nextQuarter,
    skipGame,
    closeGame,
    event,
    chooseEvent,
    injury,
    sitOut,
    playHurt,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}