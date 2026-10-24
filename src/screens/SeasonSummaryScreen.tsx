import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { levelForSeason } from "../game/levels";
import { formatMoney } from "../game/market";
import { PLAYOFF_SPOTS, rankStandings } from "../game/standings";
import { resultText, userResult } from "../game/playoffs";
import { canRetire, mustRetire } from "../game/legacy";
import { useGame } from "../store/GameContext";
import { styles } from "../styles";

export default function SeasonSummaryScreen() {
  const {
    player,
    seasonSummary,
    level,
    contract,
    teams,
    team,
    standings,
    playoffs,
    nextSeason,
    openOffers,
    openDraft,
    openContractOffers,
    retire,
  } = useGame();
  const [confirming, setConfirming] = useState(false);
  if (!player || !seasonSummary) return null;

  const upcoming = levelForSeason(seasonSummary.season + 1);
  const movingUp = upcoming.id !== level.id;
  const toCollege = movingUp && upcoming.id === "college";
  const toPro = movingUp && upcoming.id === "pro";
  const contractEnded =
    level.id === "pro" && contract !== null && contract.yearsLeft === 0;

  // Retirement: possible from a certain age, forced at the maximum age
  const mayRetire = canRetire(player.age);
  const forced = mustRetire(player.age);

  // Where your team finished in the league
  const ranked = rankStandings(standings, teams);
  const mine =
    level.id === "pro" && team
      ? ranked.find((r) => r.teamId === team.id) ?? null
      : null;

  // How your playoff run ended
  const finished = playoffs !== null && !playoffs.active;
  const result = playoffs && finished ? userResult(playoffs) : null;
  const champion =
    playoffs && finished
      ? teams.find((t) => t.id === playoffs.champion) ?? null
      : null;

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

      {mine && (
        <View style={{ marginBottom: 12 }}>
          <Text style={styles.gameDay}>
            League finish: #{mine.rank} of {ranked.length} ({mine.wins}-
            {mine.losses})
          </Text>
          <Text style={styles.hint}>
            {mine.rank <= PLAYOFF_SPOTS
              ? "Your team finished in a playoff spot."
              : `Only the top ${PLAYOFF_SPOTS} teams reach the playoffs.`}
          </Text>
        </View>
      )}

      {result && (
        <View style={{ marginBottom: 12 }}>
          <Text
            style={result === "champion" ? styles.trainDay : styles.gameDay}
          >
            Playoffs: {resultText(result)}
          </Text>
          {champion && result !== "champion" && (
            <Text style={styles.hint}>Champion: {champion.name}</Text>
          )}
        </View>
      )}

      {level.id === "pro" && contract && (
        <View style={{ marginBottom: 12 }}>
          <Text style={styles.trainDay}>
            Paid: {formatMoney(contract.salary)} this season
          </Text>
          {contractEnded ? (
            <Text style={styles.gameDay}>
              Your contract has expired. Teams are making offers.
            </Text>
          ) : (
            <Text style={styles.hint}>
              Contract: {contract.yearsLeft} season
              {contract.yearsLeft === 1 ? "" : "s"} left
            </Text>
          )}
        </View>
      )}

      {movingUp && (
        <View>
          <Text style={styles.gameDay}>Next level: {upcoming.name}</Text>
          <Text style={styles.hint}>
            {toPro
              ? "Your college career is over. Draft night decides which team you join."
              : "The competition gets tougher, so expect fewer wins at first."}
          </Text>
        </View>
      )}

      {!forced &&
        (toCollege ? (
          <Pressable style={styles.gameButton} onPress={openOffers}>
            <Text style={styles.buttonText}>See college offers</Text>
          </Pressable>
        ) : toPro ? (
          <Pressable style={styles.gameButton} onPress={openDraft}>
            <Text style={styles.buttonText}>Go to the draft</Text>
          </Pressable>
        ) : contractEnded ? (
          <Pressable style={styles.gameButton} onPress={openContractOffers}>
            <Text style={styles.buttonText}>See contract offers</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.gameButton} onPress={nextSeason}>
            <Text style={styles.buttonText}>
              {movingUp
                ? `Move up to ${upcoming.name}`
                : `Start season ${seasonSummary.season + 1}`}
            </Text>
          </Pressable>
        ))}

      {mayRetire && !forced && !confirming && (
        <Pressable style={styles.hurtButton} onPress={() => setConfirming(true)}>
          <Text style={styles.buttonText}>Retire from basketball</Text>
        </Pressable>
      )}

      {mayRetire && (forced || confirming) && (
        <View>
          <Text style={styles.hint}>
            {forced
              ? `At ${player.age} it is time to hang up the sneakers. Your career ends here.`
              : "Retiring ends your career. This cannot be undone."}
          </Text>
          <Pressable style={styles.hurtButton} onPress={retire}>
            <Text style={styles.buttonText}>
              {forced ? "End my career" : "Yes, retire"}
            </Text>
          </Pressable>
          {!forced && (
            <Pressable
              style={styles.button}
              onPress={() => setConfirming(false)}
            >
              <Text style={styles.buttonText}>Keep playing</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}