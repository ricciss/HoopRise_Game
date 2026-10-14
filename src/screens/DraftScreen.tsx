import { View, Text, Pressable } from "react-native";
import { pickLabel, roleLabel, strengthLabel } from "../game/league";
import { useGame } from "../store/GameContext";
import { styles } from "../styles";

export default function DraftScreen() {
  const { player, draft, teams, finishDraft } = useGame();
  if (!player || !draft) return null;

  const team = teams.find((t) => t.id === draft.userTeamId);
  const drafted = draft.userPick !== null;
  const userPick = draft.userPick ?? 0;

  // Top 10 picks plus the picks right around yours
  const visible = draft.board.filter(
    (e) => e.pick <= 10 || (drafted && Math.abs(e.pick - userPick) <= 1)
  );

  return (
    <View>
      <Text style={styles.name}>{player.name}</Text>
      <Text style={styles.sub}>Draft night</Text>

      <View style={styles.gameCard}>
        <Text style={styles.gameTitle}>
          {drafted ? "YOU WERE DRAFTED" : "UNDRAFTED"}
        </Text>
        <Text style={styles.gameScore}>
          {drafted ? `#${userPick}` : "Free agent"}
        </Text>
        <Text style={styles.highlightText}>
          {drafted
            ? `${pickLabel(userPick)} · selected by ${draft.userTeamName}`
            : `No team picked you, but ${draft.userTeamName} signed you.`}
        </Text>
        {team && (
          <Text style={styles.highlightText}>• {strengthLabel(team.strength)}</Text>
        )}
        <Text style={styles.highlightText}>
          • {roleLabel(draft.userPick)}
        </Text>
      </View>

      <View style={styles.gameCard}>
        <Text style={styles.gameTitle}>DRAFT BOARD</Text>
        <View style={{ height: 8 }} />
        {visible.map((e, i) => {
          const prev = i > 0 ? visible[i - 1].pick : e.pick - 1;
          return (
            <View key={e.pick}>
              {e.pick - prev > 1 && <Text style={styles.pickMeta}>   ...</Text>}
              <View style={[styles.pickRow, e.isUser && styles.pickYou]}>
                <Text style={styles.pickNum}>#{e.pick}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pickName}>
                    {e.isUser ? `${e.name} (you)` : e.name}
                  </Text>
                  <Text style={styles.pickMeta}>
                    {e.position} · OVR {e.overall} · {e.teamName}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <Pressable style={styles.gameButton} onPress={finishDraft}>
        <Text style={styles.buttonText}>
          Join {draft.userTeamName}
        </Text>
      </Pressable>
    </View>
  );
}