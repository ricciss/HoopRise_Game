import { useState } from "react";
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
  const [name, setName] = useState("");
  const [position, setPosition] = useState<Position>("PG");
  const [player, setPlayer] = useState<Player | null>(null);
  const [week, setWeek] = useState(1);
  const [energy, setEnergy] = useState(MAX_ENERGY);
  const [message, setMessage] = useState("");

  function handleCreate() {
    if (name.trim().length === 0) return;
    setPlayer(createPlayer(name.trim(), position));
    setWeek(1);
    setEnergy(MAX_ENERGY);
    setMessage("");
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
            Training costs {TRAIN_COST} energy. Each action takes one week.
          </Text>

          <Pressable style={styles.restButton} onPress={handleRest}>
            <Text style={styles.buttonText}>Rest</Text>
          </Pressable>

          <Pressable style={styles.button} onPress={() => setPlayer(null)}>
            <Text style={styles.buttonText}>Create another</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}