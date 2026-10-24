import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { Position } from "../game/player";
import { verdictColor } from "../game/legacy";
import { useGame } from "../store/GameContext";
import { styles } from "../styles";

const POSITIONS: Position[] = ["PG", "SG", "SF", "PF", "C"];

export default function CreatePlayerScreen() {
  const { createCareer, pastCareers } = useGame();
  const [name, setName] = useState("");
  const [position, setPosition] = useState<Position>("PG");

  return (
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

      <Pressable
        style={styles.button}
        onPress={() => createCareer(name, position)}
      >
        <Text style={styles.buttonText}>Create player</Text>
      </Pressable>

      {pastCareers.length > 0 && (
        <View style={[styles.gameCard, { marginTop: 30 }]}>
          <Text style={styles.gameTitle}>YOUR PAST CAREERS</Text>
          <View style={{ height: 6 }} />
          {pastCareers.slice(0, 8).map((p) => (
            <View key={p.id} style={styles.careerRow}>
              <Text style={styles.careerName}>
                {p.name} · {p.position}
              </Text>
              <Text style={[styles.careerMeta, { color: verdictColor(p.verdict) }]}>
                {p.verdict} · score {p.score} · {p.titles} title
                {p.titles === 1 ? "" : "s"} · {p.ppg} PPG
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}