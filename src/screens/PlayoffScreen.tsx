import { View, Text, Pressable } from "react-native";
import { ROUND_NAMES, userMatch, userOpponentId } from "../game/playoffs";
import { useGame } from "../store/GameContext";
import { styles } from "../styles";

export default function PlayoffScreen() {
  const { player, playoffs, teams, energy, injury, message, playPlayoffGame } =
    useGame();
  if (!player || !playoffs) return null;

  const names = new Map<number, string>(teams.map((t) => [t.id, t.name]));
  const opponentId = userOpponentId(playoffs);
  const roundName = ROUND_NAMES[playoffs.round];

  return (
    <View>
      <Text style={styles.name}>{player.name}</Text>
      <Text style={styles.sub}>Playoffs · {roundName}</Text>

      <Text style={styles.message}>{message || " "}</Text>

      {userMatch(playoffs) && opponentId !== null && (
        <View style={styles.gameCard}>
          <Text style={styles.gameTitle}>NEXT GAME</Text>
          <Text style={styles.eventTitle}>
            vs {names.get(opponentId) ?? "Unknown"}
          </Text>
          <Text style={styles.highlightText}>
            • You rest between rounds: +40 energy (now {energy})
          </Text>
          <Text style={styles.highlightText}>
            • One game decides who moves on
          </Text>
          {injury && (
            <Text style={styles.highlightText}>
              • You are injured: you will play hurt, but you heal a little
            </Text>
          )}
        </View>
      )}

      <Pressable style={styles.gameButton} onPress={playPlayoffGame}>
        <Text style={styles.buttonText}>
          Play the {roundName.toLowerCase()}
        </Text>
      </Pressable>

      <View style={[styles.gameCard, { marginTop: 20 }]}>
        <Text style={styles.gameTitle}>BRACKET</Text>
        {playoffs.rounds.map((matches, ri) => (
          <View key={ri}>
            <Text style={styles.matchTitle}>
              {ROUND_NAMES[ri].toUpperCase()}
            </Text>
            {matches.map((m, i) => {
              const hasUser =
                m.a === playoffs.userTeamId || m.b === playoffs.userTeamId;
              return (
                <View
                  key={i}
                  style={[styles.matchRow, hasUser && styles.pickYou]}
                >
                  <Text
                    style={[
                      styles.matchTeam,
                      m.winner === m.a && styles.matchWinner,
                    ]}
                  >
                    {names.get(m.a)}
                    {m.winner === m.a ? "  ✓" : ""}
                  </Text>
                  <Text
                    style={[
                      styles.matchTeam,
                      m.winner === m.b && styles.matchWinner,
                    ]}
                  >
                    {names.get(m.b)}
                    {m.winner === m.b ? "  ✓" : ""}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}