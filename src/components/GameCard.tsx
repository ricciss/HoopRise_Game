import { View, Text } from "react-native";
import { GameResult } from "../game/simulation";
import { styles } from "../styles";

export default function GameCard({ game }: { game: GameResult }) {
  return (
    <View style={styles.gameCard}>
      <Text style={styles.gameTitle}>
        {game.won ? "WIN" : "LOSS"} vs {game.opponent}
      </Text>
      <Text style={styles.gameScore}>
        {game.teamScore} - {game.opponentScore}
      </Text>

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