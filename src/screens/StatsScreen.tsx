import { View, Text } from "react-native";
import { summarize } from "../game/season";
import { useGame } from "../store/GameContext";
import { styles } from "../styles";

export default function StatsScreen() {
  const { player, season, seasonStats, lastGame } = useGame();
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

      {lastGame ? (
        <View style={styles.gameCard}>
          <Text style={styles.gameTitle}>
            LAST GAME: {lastGame.won ? "WIN" : "LOSS"} vs {lastGame.opponent}
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
      ) : (
        <Text style={styles.hint}>No games played yet this season.</Text>
      )}
    </View>
  );
}