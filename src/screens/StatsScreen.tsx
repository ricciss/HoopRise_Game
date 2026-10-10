import { View, Text } from "react-native";
import { summarize } from "../game/season";
import { useGame } from "../store/GameContext";
import GameCard from "../components/GameCard";
import { styles } from "../styles";

const LEVEL_SHORT: Record<string, string> = {
  highschool: "HS",
  college: "COL",
  pro: "PRO",
};

export default function StatsScreen() {
  const { player, season, seasonStats, lastGame, liveGame, history } =
    useGame();
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

      <View style={styles.gameCard}>
        <Text style={styles.gameTitle}>CAREER HISTORY</Text>
        {history.length === 0 ? (
          <Text style={styles.highlightText}>
            Finished seasons will appear here.
          </Text>
        ) : (
          <View style={{ marginTop: 8 }}>
            <View style={styles.tableRow}>
              <Text style={styles.historyHead}>SEASON</Text>
              <Text style={styles.historyHead}>LEVEL</Text>
              <Text style={styles.historyHead}>W-L</Text>
              <Text style={styles.historyHead}>PPG</Text>
              <Text style={styles.historyHead}>RPG</Text>
              <Text style={styles.historyHead}>APG</Text>
              <Text style={styles.historyHead}>OVR</Text>
            </View>
            {history.map((r) => (
              <View key={r.season} style={styles.tableRow}>
                <Text style={styles.historyCell}>{r.season}</Text>
                <Text style={styles.historyCell}>
                  {LEVEL_SHORT[r.levelId] ?? r.levelId}
                </Text>
                <Text style={styles.historyCell}>
                  {r.wins}-{r.losses}
                </Text>
                <Text style={styles.historyCell}>{r.ppg}</Text>
                <Text style={styles.historyCell}>{r.rpg}</Text>
                <Text style={styles.historyCell}>{r.apg}</Text>
                <Text style={styles.historyCell}>{r.overall}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}