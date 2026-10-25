import { View, Text, StyleSheet } from "react-native";
import { GameResult } from "../game/simulation";
import { colors } from "../theme";
import { styles } from "../styles";

export default function GameCard({ game }: { game: GameResult }) {
  const accent = game.won ? colors.green : colors.red;

  return (
    <View style={[styles.gameCard, { borderColor: accent }]}>
      <View style={local.header}>
        <View
          style={[
            local.pill,
            { backgroundColor: game.won ? colors.greenDark : colors.redDark },
          ]}
        >
          <Text style={local.pillText}>{game.won ? "WIN" : "LOSS"}</Text>
        </View>
        <Text style={local.opponent} numberOfLines={1}>
          vs {game.opponent}
        </Text>
      </View>

      <View style={local.scoreRow}>
        <Text
          style={[
            local.score,
            { color: game.won ? colors.text : colors.textMute },
          ]}
        >
          {game.teamScore}
        </Text>
        <Text style={local.dash}>:</Text>
        <Text
          style={[
            local.score,
            { color: game.won ? colors.textMute : colors.text },
          ]}
        >
          {game.opponentScore}
        </Text>
      </View>

      {game.quarters && (
        <View>
          <View style={styles.tableRow}>
            <Text style={styles.tableName} />
            {game.quarters.map((q) => (
              <Text key={q.quarter} style={styles.tableHead}>
                Q{q.quarter}
              </Text>
            ))}
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableName}>You</Text>
            {game.quarters.map((q) => (
              <Text key={q.quarter} style={styles.tableCell}>
                {q.teamScore}
              </Text>
            ))}
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableName}>Opp</Text>
            {game.quarters.map((q) => (
              <Text key={q.quarter} style={styles.tableCell}>
                {q.opponentScore}
              </Text>
            ))}
          </View>
        </View>
      )}

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{game.points}</Text>
          <Text style={styles.statLabel}>PTS</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{game.rebounds}</Text>
          <Text style={styles.statLabel}>REB</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{game.assists}</Text>
          <Text style={styles.statLabel}>AST</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{game.minutes}</Text>
          <Text style={styles.statLabel}>MIN</Text>
        </View>
      </View>

      {game.quarters && (
        <View>
          <View style={styles.divider} />
          {game.quarters.map((q) => (
            <View key={q.quarter}>
              <Text style={styles.quarterTitle}>
                Q{q.quarter} · {q.points} PTS · {q.rebounds} REB · {q.assists}{" "}
                AST
              </Text>
              {q.highlights.length === 0 ? (
                <Text style={styles.highlightText}>Quiet quarter.</Text>
              ) : (
                q.highlights.map((h, i) => (
                  <Text key={i} style={styles.highlightText}>
                    • {h}
                  </Text>
                ))
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const local = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  pill: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 },
  pillText: { color: "#fff", fontSize: 12, fontWeight: "800", letterSpacing: 1 },
  opponent: { flex: 1, color: colors.textDim, fontSize: 15, fontWeight: "700" },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  score: { fontSize: 46, fontWeight: "800", minWidth: 80, textAlign: "center" },
  dash: { color: colors.textMute, fontSize: 36, fontWeight: "800", marginHorizontal: 6 },
});