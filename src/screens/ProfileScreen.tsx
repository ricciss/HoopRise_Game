import { useState } from "react";
import { View, Text, Switch } from "react-native";
import { Ratings } from "../game/player";
import { perkLines } from "../game/colleges";
import {
  pickLabel,
  proSeasonNumber,
  roleLabel,
  strengthLabel,
  trust,
} from "../game/league";
import { formatMoney } from "../game/market";
import { ACHIEVEMENTS } from "../game/achievements";
import { useGame, LABELS } from "../store/GameContext";
import AnimatedBar from "../components/AnimatedBar";
import PlayerBadge from "../components/PlayerBadge";
import { colors } from "../theme";
import {
  feedback,
  getFeedbackSettings,
  setSoundOn,
  setHapticsOn,
} from "../feedback";
import { styles } from "../styles";

export default function ProfileScreen() {
  const {
    player,
    college,
    level,
    team,
    draftPick,
    season,
    contract,
    earnings,
    contractHistory,
    champions,
    achievements,
  } = useGame();
  const [sound, setSound] = useState(getFeedbackSettings().soundOn);
  const [haptics, setHaptics] = useState(getFeedbackSettings().hapticsOn);
  if (!player) return null;

  const keys = Object.keys(player.ratings) as (keyof Ratings)[];
  const overall = Math.round(
    keys.reduce((sum, k) => sum + player.ratings[k], 0) / keys.length
  );

  const titles = champions.filter((c) => c.userResult === "champion");
  const appearances = champions.filter((c) => c.userResult !== "missed");

  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 22 }}>
        <PlayerBadge name={player.name} position={player.position} size={72} />
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={styles.name}>{player.name}</Text>
          <Text style={[styles.sub, { marginBottom: 0 }]}>
            {player.position} · {player.age} years old · {player.heightCm} cm
          </Text>
        </View>
      </View>

      <View style={styles.gameCard}>
        <Text style={styles.gameTitle}>OVERALL</Text>
        <Text style={styles.gameScore}>{overall}</Text>
        <AnimatedBar value={overall} />
      </View>

      {champions.length > 0 && (
        <View style={styles.gameCard}>
          <Text style={styles.gameTitle}>TROPHY CASE</Text>
          <Text style={styles.eventTitle}>
            {titles.length} championship{titles.length === 1 ? "" : "s"}
          </Text>
          <Text style={styles.highlightText}>
            • Playoff appearances: {appearances.length}
          </Text>
          {titles.map((c) => (
            <Text key={c.season} style={styles.highlightText}>
              • Champion in season {c.season}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.gameCard}>
        <Text style={styles.gameTitle}>
          ACHIEVEMENTS · {achievements.length}/{ACHIEVEMENTS.length}
        </Text>
        {ACHIEVEMENTS.map((a) => {
          const done = achievements.includes(a.id);
          return (
            <View key={a.id} style={{ marginTop: 10, opacity: done ? 1 : 0.5 }}>
              <Text
                style={{
                  color: done ? colors.gold : colors.textDim,
                  fontWeight: "700",
                }}
              >
                {done ? "★ " : "○ "}
                {a.name}
              </Text>
              <Text style={styles.highlightText}>{a.description}</Text>
            </View>
          );
        })}
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

      {contract && (
        <View style={styles.gameCard}>
          <Text style={styles.gameTitle}>CONTRACT</Text>
          <Text style={styles.eventTitle}>
            {formatMoney(contract.salary)} per season
          </Text>
          <Text style={styles.highlightText}>• {contract.teamName}</Text>
          <Text style={styles.highlightText}>
            • {contract.yearsLeft} of {contract.years} seasons left
          </Text>
          <Text style={styles.highlightText}>
            • Career earnings: {formatMoney(earnings)}
          </Text>
          {contractHistory.length > 1 && (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.gameTitle}>PAST CONTRACTS</Text>
              {contractHistory.map((c) => (
                <Text key={c.season} style={styles.highlightText}>
                  • From season {c.season}: {c.teamName}, {formatMoney(c.salary)}{" "}
                  x {c.years}
                </Text>
              ))}
            </View>
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
          <AnimatedBar value={player.ratings[key]} />
          <Text style={styles.ratingValue}>{player.ratings[key]}</Text>
        </View>
      ))}

      <View style={[styles.gameCard, { marginTop: 10 }]}>
        <Text style={styles.gameTitle}>SETTINGS</Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 12,
          }}
        >
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700" }}>
            Sound effects
          </Text>
          <Switch
            value={sound}
            onValueChange={(on) => {
              setSound(on);
              setSoundOn(on);
              if (on) feedback.tap();
            }}
            trackColor={{ false: colors.surfaceAlt, true: colors.green }}
            thumbColor="#ffffff"
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 12,
          }}
        >
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700" }}>
            Vibration
          </Text>
          <Switch
            value={haptics}
            onValueChange={(on) => {
              setHaptics(on);
              setHapticsOn(on);
              if (on) feedback.tap();
            }}
            trackColor={{ false: colors.surfaceAlt, true: colors.green }}
            thumbColor="#ffffff"
          />
        </View>
      </View>
    </View>
  );
}