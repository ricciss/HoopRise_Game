
import { View, Text, Pressable } from "react-native";
import { Ratings } from "../game/player";
import { TRAIN_COST } from "../game/training";
import { GAME_COST } from "../game/simulation";
import { SEASON_WEEKS } from "../game/season";
import { WORSEN_CHANCE, describeInjury } from "../game/injuries";
import { useGame, LABELS } from "../store/GameContext";
import GameCard from "../components/GameCard";
import LiveGame from "../components/LiveGame";
import EventCard from "../components/EventCard";
import AnimatedBar from "../components/AnimatedBar";
import PlayerBadge from "../components/PlayerBadge";
import { colors } from "../theme";
import { styles } from "../styles";


// The energy bar turns orange and then red when you get tired
function energyColor(energy: number): string {
  if (energy >= 50) return colors.green;
  if (energy >= 25) return colors.accent;
  return colors.red;
}

export default function HomeScreen() {
  const {
    player,
    week,
    season,
    level,
    energy,
    message,
    lastGame,
    liveGame,
    event,
    injury,
    gameWeek,
    trainStat,
    restWeek,
    playGame,
    sitOut,
    playHurt,
    newCareer,
  } = useGame();

  if (!player) return null;

  // While a game is being played, show only the live view
  if (liveGame) {
    return (
      <View>
        <Text style={styles.name}>{player.name}</Text>
        <Text style={styles.sub}>Game day · {level.name}</Text>
        <LiveGame />
      </View>
    );
  }

  // A random event must be answered before the week continues
  if (event) {
    return (
      <View>
        <Text style={styles.name}>{player.name}</Text>
        <Text style={styles.sub}>
          {level.name} · Season {season} · Week {week}/{SEASON_WEEKS} · Energy{" "}
          {energy}
        </Text>
        <EventCard />
      </View>
    );
  }

  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 22 }}>
        <PlayerBadge name={player.name} position={player.position} />
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={styles.name}>{player.name}</Text>
          <Text style={[styles.sub, { marginBottom: 0 }]}>
            {player.position} · {player.age} years old · {player.heightCm} cm
          </Text>
        </View>
      </View>

      <Text style={styles.weekText}>
        {level.name} · Season {season}
      </Text>
      <View style={styles.ratingRow}>
        <Text style={styles.ratingLabel}>Week</Text>
        <AnimatedBar
          value={(week / SEASON_WEEKS) * 100}
          color={colors.blueLight}
        />
        <Text style={styles.ratingValue}>
          {week}/{SEASON_WEEKS}
        </Text>
      </View>
      <Text style={gameWeek ? styles.gameDay : styles.trainDay}>
        {gameWeek ? "Game day!" : "Training week"}
      </Text>

      <View style={styles.ratingRow}>
        <Text style={styles.ratingLabel}>Energy</Text>
        <AnimatedBar value={energy} color={energyColor(energy)} />
        <Text style={styles.ratingValue}>{energy}</Text>
      </View>

      {injury && (
        <View style={styles.injuryCard}>
          <Text style={styles.injuryTitle}>INJURED</Text>
          <Text style={styles.injuryText}>{describeInjury(injury)}</Text>
          <Text style={styles.injuryText}>
            Training is blocked. Resting heals twice as fast as playing hurt.
          </Text>
        </View>
      )}

      <Text style={styles.message}>{message || " "}</Text>

      {lastGame && <GameCard game={lastGame} />}

      {(Object.keys(player.ratings) as (keyof Ratings)[]).map((key) => (
        <View key={key} style={styles.ratingRow}>
          <Text style={styles.ratingLabel}>{LABELS[key]}</Text>
          <AnimatedBar value={player.ratings[key]} />
          <Text style={styles.ratingValue}>{player.ratings[key]}</Text>
          {!gameWeek && !injury && (
            <Pressable
              style={[
                styles.trainButton,
                energy < TRAIN_COST && styles.trainButtonDisabled,
              ]}
              onPress={() => trainStat(key)}
            >
              <Text style={styles.trainButtonText}>Train</Text>
            </Pressable>
          )}
        </View>
      ))}

      <Text style={styles.hint}>
        Training costs {TRAIN_COST} energy, a game costs {GAME_COST}. Games are
        played every second week.
      </Text>

      {gameWeek && injury ? (
        <View>
          <Pressable style={styles.restButton} onPress={sitOut}>
            <Text style={styles.buttonText}>Sit out (heal faster)</Text>
          </Pressable>
          <Pressable style={styles.hurtButton} onPress={playHurt}>
            <Text style={styles.buttonText}>Play hurt</Text>
          </Pressable>
          <Text style={styles.hint}>
            Playing hurt: weak performance and a{" "}
            {Math.round(WORSEN_CHANCE * 100)}% risk of making the injury worse.
          </Text>
        </View>
      ) : gameWeek ? (
        <Pressable style={styles.gameButton} onPress={playGame}>
          <Text style={styles.buttonText}>Play game</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.restButton} onPress={restWeek}>
          <Text style={styles.buttonText}>
            {injury ? "Rest (heal injury)" : "Rest"}
          </Text>
        </Pressable>
      )}

      <Pressable
        style={[
          styles.button,
          { backgroundColor: colors.surfaceAlt, marginTop: 40 },
        ]}
        onPress={newCareer}
      >
        <Text style={[styles.buttonText, { color: colors.textDim }]}>
          New career (deletes save)
        </Text>
      </Pressable>
    </View>
  );
}