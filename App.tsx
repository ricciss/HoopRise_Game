import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { createPlayer, Player, Position, Ratings } from "./src/game/player";
import {
  train,
  rest,
  MAX_ENERGY,
  TRAIN_COST,
  REST_GAIN,
} from "./src/game/training";
import { simulateGame, GameResult, GAME_COST } from "./src/game/simulation";
import {
  SEASON_WEEKS,
  isGameWeek,
  SeasonStats,
  SeasonSummary,
  emptyStats,
  addGame,
  summarize,
  applyAging,
} from "./src/game/season";
import { saveGame, loadGame, clearGame } from "./src/storage";
import { styles } from "./src/styles";

const POSITIONS: Position[] = ["PG", "SG", "SF", "PF", "C"];

const LABELS: Record<keyof Ratings, string> = {
  shooting: "Shooting",
  passing: "Passing",
  defense: "Defense",
  rebounding: "Rebounding",
  speed: "Speed",
  stamina: "Stamina",
};

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState("");
  const [position, setPosition] = useState<Position>("PG");
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

  function handleCreate() {
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

  function handleTrain(stat: keyof Ratings) {
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

  function handleRest() {
    if (isGameWeek(week)) return;
    setEnergy(rest(energy));
    setMessage(`You rested. +${REST_GAIN} energy`);
    advance(seasonStats);
  }

  function handlePlayGame() {
    if (!player || !isGameWeek(week)) return;
    const result = simulateGame(player, energy);
    setLastGame(result);
    setEnergy(Math.max(0, energy - GAME_COST));
    setMessage(result.won ? "Victory!" : "Tough loss.");
    advance(addGame(seasonStats, result));
  }

  function handleNextSeason() {
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

  if (!loaded) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
      </View>
    );
  }

  const gameWeek = isGameWeek(week);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>HoopRise</Text>

      {player === null ? (
        <View>
          <Text style={styles.label}>Player name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter a name"
            placeholderTextColor="#777"
          />

          <Text style={styles.label}>Position</Text>
          <View style={styles.row}>
            {POSITIONS.map((p) => (
              <Pressable
                key={p}
                onPress={() => setPosition(p)}
                style={[styles.chip, position === p && styles.chipActive]}
              >
                <Text style={styles.chipText}>{p}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.button} onPress={handleCreate}>
            <Text style={styles.buttonText}>Create player</Text>
          </Pressable>
        </View>
      ) : seasonSummary ? (
        <View>
          <Text style={styles.name}>{player.name}</Text>
          <Text style={styles.sub}>
            {player.position} · {player.age} years old
          </Text>

          <View style={styles.gameCard}>
            <Text style={styles.gameTitle}>
              SEASON {seasonSummary.season} COMPLETE
            </Text>
            <Text style={styles.gameScore}>
              {seasonSummary.wins} - {seasonSummary.losses}
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{seasonSummary.ppg}</Text>
                <Text style={styles.statLabel}>PPG</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{seasonSummary.rpg}</Text>
                <Text style={styles.statLabel}>RPG</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{seasonSummary.apg}</Text>
                <Text style={styles.statLabel}>APG</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{seasonSummary.games}</Text>
                <Text style={styles.statLabel}>GP</Text>
              </View>
            </View>
          </View>

          <Pressable style={styles.gameButton} onPress={handleNextSeason}>
            <Text style={styles.buttonText}>
              Start season {seasonSummary.season + 1}
            </Text>
          </Pressable>
        </View>
      ) : (
        <View>
          <Text style={styles.name}>{player.name}</Text>
          <Text style={styles.sub}>
            {player.position} · {player.age} years old · {player.heightCm} cm
          </Text>

          <Text style={styles.weekText}>
            Season {season} · Week {week}/{SEASON_WEEKS}
          </Text>
          <Text style={gameWeek ? styles.gameDay : styles.trainDay}>
            {gameWeek ? "Game day!" : "Training week"}
          </Text>

          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>Energy</Text>
            <View style={styles.barBg}>
              <View
                style={[
                  styles.barFill,
                  styles.energyFill,
                  { width: `${energy}%` },
                ]}
              />
            </View>
            <Text style={styles.ratingValue}>{energy}</Text>
          </View>

          <Text style={styles.message}>{message || " "}</Text>

          {lastGame && (
            <View style={styles.gameCard}>
              <Text style={styles.gameTitle}>
                {lastGame.won ? "WIN" : "LOSS"} vs {lastGame.opponent}
              </Text>
              <Text style={styles.gameScore}>
                {lastGame.teamScore} - {lastGame.opponentScore}
              </Text>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{lastGame.points}</Text>
                  <Text style={styles.statLabel}>PTS</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{lastGame.rebounds}</Text>
                  <Text style={styles.statLabel}>REB</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{lastGame.assists}</Text>
                  <Text style={styles.statLabel}>AST</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{lastGame.minutes}</Text>
                  <Text style={styles.statLabel}>MIN</Text>
                </View>
              </View>
            </View>
          )}

          {(Object.keys(player.ratings) as (keyof Ratings)[]).map((key) => (
            <View key={key} style={styles.ratingRow}>
              <Text style={styles.ratingLabel}>{LABELS[key]}</Text>
              <View style={styles.barBg}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${player.ratings[key]}%` },
                  ]}
                />
              </View>
              <Text style={styles.ratingValue}>{player.ratings[key]}</Text>
              {!gameWeek && (
                <Pressable
                  style={[
                    styles.trainButton,
                    energy < TRAIN_COST && styles.trainButtonDisabled,
                  ]}
                  onPress={() => handleTrain(key)}
                >
                  <Text style={styles.trainButtonText}>Train</Text>
                </Pressable>
              )}
            </View>
          ))}

          <Text style={styles.hint}>
            Training costs {TRAIN_COST} energy, a game costs {GAME_COST}. Games
            are played every second week.
          </Text>

          {gameWeek ? (
            <Pressable style={styles.gameButton} onPress={handlePlayGame}>
              <Text style={styles.buttonText}>Play game</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.restButton} onPress={handleRest}>
              <Text style={styles.buttonText}>Rest</Text>
            </Pressable>
          )}

          <Pressable style={styles.button} onPress={() => setPlayer(null)}>
            <Text style={styles.buttonText}>New career (deletes save)</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}