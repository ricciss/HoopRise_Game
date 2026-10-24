import { View, Text, Pressable } from "react-native";
import { verdictColor, verdictText } from "../game/legacy";
import { pickLabel } from "../game/league";
import { formatMoney } from "../game/market";
import { useGame } from "../store/GameContext";
import { styles } from "../styles";

export default function CareerEndScreen() {
  const { careerSummary: c, pastCareers, newCareer } = useGame();
  if (!c) return null;

  return (
    <View>
      <Text style={styles.name}>{c.name}</Text>
      <Text style={styles.sub}>
        {c.position} · retired at {c.retireAge}
      </Text>

      <View style={styles.gameCard}>
        <Text style={styles.gameTitle}>CAREER COMPLETE</Text>
        <Text style={[styles.verdictText, { color: verdictColor(c.verdict) }]}>
          {c.verdict.toUpperCase()}
        </Text>
        <Text style={styles.highlightText}>{verdictText(c.verdict)}</Text>
        <Text style={styles.highlightText}>Legacy score: {c.score}</Text>
      </View>

      <View style={styles.gameCard}>
        <Text style={styles.gameTitle}>PRO CAREER</Text>
        <Text style={styles.gameScore}>
          {c.wins} - {c.losses}
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{c.ppg}</Text>
            <Text style={styles.statLabel}>PPG</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{c.rpg}</Text>
            <Text style={styles.statLabel}>RPG</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{c.apg}</Text>
            <Text style={styles.statLabel}>APG</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{c.proGames}</Text>
            <Text style={styles.statLabel}>GP</Text>
          </View>
        </View>
      </View>

      <View style={styles.gameCard}>
        <Text style={styles.gameTitle}>HIGHLIGHTS</Text>
        <View style={{ height: 6 }} />
        <Text style={styles.highlightText}>
          • Championships: {c.titles}
        </Text>
        <Text style={styles.highlightText}>
          • Playoff appearances: {c.playoffApps}
        </Text>
        <Text style={styles.highlightText}>
          • Pro seasons: {c.proSeasons}
        </Text>
        <Text style={styles.highlightText}>
          • Peak overall: {c.peakOverall}
        </Text>
        {c.bestSeason && (
          <Text style={styles.highlightText}>
            • Best season: {c.bestSeason.ppg} PPG (season {c.bestSeason.season})
          </Text>
        )}
        <Text style={styles.highlightText}>
          • Career earnings: {formatMoney(c.earnings)}
        </Text>
        <Text style={styles.highlightText}>
          • Draft:{" "}
          {c.draftPick !== null ? pickLabel(c.draftPick) : "Undrafted"}
        </Text>
        {c.college && (
          <Text style={styles.highlightText}>• College: {c.college}</Text>
        )}
        {c.teams.length > 0 && (
          <Text style={styles.highlightText}>
            • Teams: {c.teams.join(", ")}
          </Text>
        )}
      </View>

      {pastCareers.length > 0 && (
        <View style={styles.gameCard}>
          <Text style={styles.gameTitle}>BEST CAREERS</Text>
          <View style={{ height: 6 }} />
          {pastCareers.slice(0, 5).map((p, i) => (
            <View key={p.id} style={styles.careerRow}>
              <Text style={styles.careerName}>
                {i + 1}. {p.name} · {p.position}
              </Text>
              <Text style={[styles.careerMeta, { color: verdictColor(p.verdict) }]}>
                {p.verdict} · score {p.score} · {p.titles} title
                {p.titles === 1 ? "" : "s"} · {p.ppg} PPG
              </Text>
            </View>
          ))}
        </View>
      )}

      <Pressable style={styles.gameButton} onPress={newCareer}>
        <Text style={styles.buttonText}>Start a new career</Text>
      </Pressable>
    </View>
  );
}