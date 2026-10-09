import { View, Text, Pressable } from "react-native";
import { useGame } from "../store/GameContext";
import { styles } from "../styles";

export default function SeasonSummaryScreen() {
  const { player, seasonSummary, nextSeason } = useGame();
  if (!player || !seasonSummary) return null;

  return (
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

      <Pressable style={styles.gameButton} onPress={nextSeason}>
        <Text style={styles.buttonText}>
          Start season {seasonSummary.season + 1}
        </Text>
      </Pressable>
    </View>
  );
}