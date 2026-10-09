import { View, Text } from "react-native";
import { Ratings } from "../game/player";
import { useGame, LABELS } from "../store/GameContext";
import { styles } from "../styles";

export default function ProfileScreen() {
  const { player } = useGame();
  if (!player) return null;

  const keys = Object.keys(player.ratings) as (keyof Ratings)[];
  const overall = Math.round(
    keys.reduce((sum, k) => sum + player.ratings[k], 0) / keys.length
  );

  return (
    <View>
      <Text style={styles.name}>{player.name}</Text>
      <Text style={styles.sub}>
        {player.position} · {player.age} years old · {player.heightCm} cm
      </Text>

      <View style={styles.gameCard}>
        <Text style={styles.gameTitle}>OVERALL</Text>
        <Text style={styles.gameScore}>{overall}</Text>
      </View>

      {keys.map((key) => (
        <View key={key} style={styles.ratingRow}>
          <Text style={styles.ratingLabel}>{LABELS[key]}</Text>
          <View style={styles.barBg}>
            <View
              style={[styles.barFill, { width: `${player.ratings[key]}%` }]}
            />
          </View>
          <Text style={styles.ratingValue}>{player.ratings[key]}</Text>
        </View>
      ))}
    </View>
  );
}