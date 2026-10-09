import { View, Text } from "react-native";
import { summarize } from "../game/season";
import { useGame } from "../store/GameContext";
import GameCard from "../components/GameCard";
import { styles } from "../styles";

export default function StatsScreen() {
  const { player, season, seasonStats, lastGame, liveGame } = useGame();
  if (!player) return null;

  const s = summarize(season, player.age, seasonStats);

  return (
    <View>
      <Text style={styles.name}>Stats</Text>
      <Text style={styles.sub}>Season {season}</Text>

      <View style={styles.gameCard}>
        <Text style={styles.gameTitle}>SEASON AVERAGES</Text>
        <Text style={styles.gameScore}>
          {s.wins} - {s.losses}
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{s.ppg}</Text>
            <Text style={styles.statLabel}>PPG</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{s.rpg}</Text>
            <Text style={styles.statLabel}>RPG</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{s.apg}</Text>
            <Text style={styles.statLabel}>APG</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{s.games}</Text>
            <Text style={styles.statLabel}>GP</Text>
          </View>
        </View>
      </View>

      {lastGame && !liveGame ? (
        <GameCard game={lastGame} />
      ) : (
        <Text style={styles.hint}>No games played yet this season.</Text>
      )}
    </View>
  );
}