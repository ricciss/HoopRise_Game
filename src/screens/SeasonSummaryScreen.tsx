import { View, Text, Pressable } from "react-native";
import { levelForSeason } from "../game/levels";
import { useGame } from "../store/GameContext";
import { styles } from "../styles";

export default function SeasonSummaryScreen() {
  const { player, seasonSummary, level, nextSeason, openOffers } = useGame();
  if (!player || !seasonSummary) return null;

  const upcoming = levelForSeason(seasonSummary.season + 1);
  const movingUp = upcoming.id !== level.id;
  const toCollege = movingUp && upcoming.id === "college";

  return (
    <View>
      <Text style={styles.name}>{player.name}</Text>
      <Text style={styles.sub}>
        {player.position} · {player.age} years old · {level.name}
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

      {movingUp && (
        <View>
          <Text style={styles.gameDay}>Next level: {upcoming.name}</Text>
          <Text style={styles.hint}>
            The competition gets tougher, so expect fewer wins at first.
          </Text>
        </View>
      )}

      {toCollege ? (
        <Pressable style={styles.gameButton} onPress={openOffers}>
          <Text style={styles.buttonText}>See college offers</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.gameButton} onPress={nextSeason}>
          <Text style={styles.buttonText}>
            {movingUp
              ? `Move up to ${upcoming.name}`
              : `Start season ${seasonSummary.season + 1}`}
          </Text>
        </Pressable>
      )}
    </View>
  );
}