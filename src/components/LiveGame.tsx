import { View, Text, Pressable } from "react-native";
import { useGame } from "../store/GameContext";
import GameCard from "./GameCard";
import { styles } from "../styles";

export default function LiveGame() {
  const { liveGame, nextQuarter, skipGame, closeGame, seasonSummary } =
    useGame();
  if (!liveGame) return null;

  const { game, shown } = liveGame;
  const quarters = game.quarters ?? [];

  // Game finished: show the full result card
  if (shown >= quarters.length) {
    return (
      <View>
        <GameCard game={game} />
        <Pressable style={styles.gameButton} onPress={closeGame}>
          <Text style={styles.buttonText}>
            {seasonSummary ? "See season summary" : "Continue"}
          </Text>
        </Pressable>
      </View>
    );
  }

  const visible = quarters.slice(0, shown);
  const you = visible.reduce((s, q) => s + q.teamScore, 0);
  const opp = visible.reduce((s, q) => s + q.opponentScore, 0);
  const pts = visible.reduce((s, q) => s + q.points, 0);
  const reb = visible.reduce((s, q) => s + q.rebounds, 0);
  const ast = visible.reduce((s, q) => s + q.assists, 0);
  const min = visible.reduce((s, q) => s + q.minutes, 0);

  return (
    <View>
      <View style={styles.gameCard}>
        <Text style={styles.gameTitle}>LIVE vs {game.opponent}</Text>
        <Text style={styles.gameScore}>
          {you} - {opp}
        </Text>

        {shown > 0 && (
          <View>
            <View style={styles.tableRow}>
              <Text style={styles.tableName} />
              {visible.map((q) => (
                <Text key={q.quarter} style={styles.tableHead}>
                  Q{q.quarter}
                </Text>
              ))}
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableName}>You</Text>
              {visible.map((q) => (
                <Text key={q.quarter} style={styles.tableCell}>
                  {q.teamScore}
                </Text>
              ))}
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableName}>Opp</Text>
              {visible.map((q) => (
                <Text key={q.quarter} style={styles.tableCell}>
                  {q.opponentScore}
                </Text>
              ))}
            </View>
          </View>
        )}

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{pts}</Text>
            <Text style={styles.statLabel}>PTS</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{reb}</Text>
            <Text style={styles.statLabel}>REB</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{ast}</Text>
            <Text style={styles.statLabel}>AST</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{min}</Text>
            <Text style={styles.statLabel}>MIN</Text>
          </View>
        </View>

        {shown > 0 && <View style={styles.divider} />}
        {visible.map((q) => (
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

      <Pressable style={styles.gameButton} onPress={nextQuarter}>
        <Text style={styles.buttonText}>
          {shown === 0 ? "Tip off" : `Next quarter (Q${shown + 1})`}
        </Text>
      </Pressable>

      <Pressable style={styles.button} onPress={skipGame}>
        <Text style={styles.buttonText}>Skip to end</Text>
      </Pressable>
    </View>
  );
}