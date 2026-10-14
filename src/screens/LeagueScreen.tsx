import { View, Text } from "react-native";
import { PLAYOFF_SPOTS, rankStandings } from "../game/standings";
import { useGame } from "../store/GameContext";
import { styles } from "../styles";

export default function LeagueScreen() {
  const { player, level, season, teams, team, standings } = useGame();
  if (!player) return null;

  if (level.id !== "pro") {
    return (
      <View>
        <Text style={styles.name}>League</Text>
        <Text style={styles.sub}>{level.name}</Text>
        <Text style={styles.hint}>
          The 30-team league starts when you turn pro. Until then you play
          against {level.name.toLowerCase()} teams.
        </Text>
      </View>
    );
  }

  const ranked = rankStandings(standings, teams);
  const names = new Map<number, string>(teams.map((t) => [t.id, t.name]));
  const mine = team ? ranked.find((r) => r.teamId === team.id) : null;
  const gamesPlayed = mine ? mine.wins + mine.losses : 0;

  return (
    <View>
      <Text style={styles.name}>League</Text>
      <Text style={styles.sub}>
        Season {season} · {gamesPlayed} games played
      </Text>

      <View style={styles.gameCard}>
        <Text style={styles.gameTitle}>STANDINGS</Text>
        <Text style={styles.hint}>Top {PLAYOFF_SPOTS} make the playoffs</Text>
        <View style={{ height: 8 }} />
        {ranked.map((r) => (
          <View key={r.teamId}>
            <View
              style={[
                styles.standRow,
                team !== null && r.teamId === team.id && styles.pickYou,
              ]}
            >
              <Text style={styles.standRank}>{r.rank}</Text>
              <Text style={styles.standName}>{names.get(r.teamId)}</Text>
              <Text style={styles.standRecord}>
                {r.wins}-{r.losses}
              </Text>
            </View>
            {r.rank === PLAYOFF_SPOTS && (
              <View style={styles.playoffLine}>
                <Text style={styles.pickMeta}>Playoff line</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}