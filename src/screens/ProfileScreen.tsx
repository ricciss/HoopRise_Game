import { View, Text } from "react-native";
import { Ratings } from "../game/player";
import { perkLines } from "../game/colleges";
import {
  pickLabel,
  proSeasonNumber,
  roleLabel,
  strengthLabel,
  trust,
} from "../game/league";
import { useGame, LABELS } from "../store/GameContext";
import { styles } from "../styles";

export default function ProfileScreen() {
  const { player, college, level, team, draftPick, season } = useGame();
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

      {team && (
        <View style={styles.gameCard}>
          <Text style={styles.gameTitle}>
            {level.id === "pro" ? "YOUR TEAM" : "TEAM"}
          </Text>
          <Text style={styles.eventTitle}>{team.name}</Text>
          <Text style={styles.highlightText}>
            • {strengthLabel(team.strength)}
          </Text>
          <Text style={styles.highlightText}>
            •{" "}
            {draftPick !== null
              ? `Drafted: ${pickLabel(draftPick)}`
              : "Signed as an undrafted free agent"}
          </Text>
          <Text style={styles.highlightText}>• {roleLabel(draftPick)}</Text>
          {level.id === "pro" && (
            <Text style={styles.highlightText}>
              • Playing time:{" "}
              {Math.round(trust(draftPick, proSeasonNumber(season)) * 100)}% of
              full minutes
            </Text>
          )}
        </View>
      )}

      {college && (
        <View style={styles.gameCard}>
          <Text style={styles.gameTitle}>
            {level.id === "college" ? "COLLEGE" : "FORMER COLLEGE"}
          </Text>
          <Text style={styles.eventTitle}>{college.name}</Text>
          {perkLines(college).map((line) => (
            <Text key={line} style={styles.highlightText}>
              • {line}
            </Text>
          ))}
        </View>
      )}

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