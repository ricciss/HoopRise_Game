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
  const [energy, setEnergy] = useState(MAX_ENERGY);
  const [message, setMessage] = useState("");
  const [lastGame, setLastGame] = useState<GameResult | null>(null);

  // Load saved game on startup
  useEffect(() => {
    loadGame().then((data) => {
      if (data) {
        setPlayer(data.player);
        setWeek(data.week);
        setEnergy(data.energy);
        setLastGame(data.lastGame);
      }
      setLoaded(true);
    });
  }, []);

  // Save after every change (only after the initial load is finished)
  useEffect(() => {
    if (!loaded) return;
    if (player) {
      saveGame({ player, week, energy, lastGame });
    } else {
      clearGame();
    }
  }, [loaded, player, week, energy, lastGame]);

  function handleCreate() {
    if (name.trim().length === 0) return;
    setPlayer(createPlayer(name.trim(), position));
    setWeek(1);
    setEnergy(MAX_ENERGY);
    setMessage("");
    setLastGame(null);
  }

  function handleTrain(stat: keyof Ratings) {
    if (!player) return;
    if (energy < TRAIN_COST) {
      setMessage("Not enough energy. Rest first.");
      return;
    }
    const result = train(player, stat, energy);
    setPlayer(result.player);
    setEnergy(result.energy);
    setWeek(week + 1);
    setMessage(`${LABELS[stat]} +${result.gain}`);
  }

  function handleRest() {
    setEnergy(rest(energy));
    setWeek(week + 1);
    setMessage(`You rested. +${REST_GAIN} energy`);
  }

  function handlePlayGame() {
    if (!player) return;
    const result = simulateGame(player, energy);
    setLastGame(result);
    setEnergy(Math.max(0, energy - GAME_COST));
    setWeek(week + 1);
    setMessage(result.won ? "Victory!" : "Tough loss.");
  }

  if (!loaded) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
      </View>
    );
  }

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
      ) : (
        <View>
          <Text style={styles.name}>{player.name}</Text>
          <Text style={styles.sub}>
            {player.position} · {player.age} years old · {player.heightCm} cm
          </Text>

          <Text style={styles.weekText}>Week {week}</Text>
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
              <Pressable
                style={[
                  styles.trainButton,
                  energy < TRAIN_COST && styles.trainButtonDisabled,
                ]}
                onPress={() => handleTrain(key)}
              >
                <Text style={styles.trainButtonText}>Train</Text>
              </Pressable>
            </View>
          ))}

          <Text style={styles.hint}>
            Training costs {TRAIN_COST} energy, a game costs {GAME_COST}. Each
            action takes one week.
          </Text>

          <Pressable style={styles.gameButton} onPress={handlePlayGame}>
            <Text style={styles.buttonText}>Play game</Text>
          </Pressable>

          <Pressable style={styles.restButton} onPress={handleRest}>
            <Text style={styles.buttonText}>Rest</Text>
          </Pressable>

          <Pressable style={styles.button} onPress={() => setPlayer(null)}>
            <Text style={styles.buttonText}>New career (deletes save)</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}