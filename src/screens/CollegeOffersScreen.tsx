import { View, Text } from "react-native";
import ArcadeButton from "../components/ArcadeButton";
import { TIER_LABEL, perkLines } from "../game/colleges";
import { useGame } from "../store/GameContext";
import { styles } from "../styles";

export default function CollegeOffersScreen() {
  const { player, offers, chooseCollege } = useGame();
  if (!player || !offers) return null;

  return (
    <View>
      <Text style={styles.name}>{player.name}</Text>
      <Text style={styles.sub}>College offers</Text>
      <Text style={styles.hint}>
        Choose carefully. A strong team wins more but gives you fewer minutes
        and slower growth. A small program is the opposite.
      </Text>

      <View style={{ height: 16 }} />

      {offers.map((college) => (
        <View key={college.id} style={styles.gameCard}>
          <Text style={styles.eventTag}>{TIER_LABEL[college.tier]}</Text>
          <Text style={styles.eventTitle}>{college.name}</Text>
          {perkLines(college).map((line) => (
            <Text key={line} style={styles.highlightText}>
              • {line}
            </Text>
          ))}
          <ArcadeButton
            label="Sign with this college"
            color="blue"
            onPress={() => chooseCollege(college.id)}
          />
        </View>
      ))}
    </View>
  );
}