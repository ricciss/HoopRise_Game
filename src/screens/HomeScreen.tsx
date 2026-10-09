import { View, Text, Pressable } from "react-native";
import { Ratings } from "../game/player";
import { TRAIN_COST } from "../game/training";
import { GAME_COST } from "../game/simulation";
import { SEASON_WEEKS } from "../game/season";
import { useGame, LABELS } from "../store/GameContext";
import GameCard from "../components/GameCard";
import LiveGame from "../components/LiveGame";
import { styles } from "../styles";

export default function HomeScreen() {
  const {
    player,
    week,
    season,
    energy,
    message,
    lastGame,
    liveGame,
    gameWeek,
    trainStat,
    restWeek,
    playGame,
    newCareer,
  } = useGame();

  if (!player) return null;

  // While a game is being played, show only the live view
  if (liveGame) {
    return (
      <View>
        <Text style={styles.name}>{player.name}</Text>
        <Text style={styles.sub}>Game day</Text>
        <LiveGame />
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.name}>{player.name}</Text>
      <Text style={styles.sub}>
        {player.position} · {player.age} years old · {player.heightCm} cm
      </Text>

      <Text style={styles.weekText}>
        Season {season} · Week {week}/{SEASON_WEEKS}
      </Text>
      <Text style={gameWeek ? styles.gameDay : styles.trainDay}>
        {gameWeek ? "Game day!" : "Training week"}
      </Text>

      <View style={styles.ratingRow}>
        <Text style={styles.ratingLabel}>Energy</Text>
        <View style={styles.barBg}>
          <View
            style={[
              styles.barFill,
              styles.energyFill,
              { width: `${energy}%` },
            ]}
          />
        </View>
        <Text style={styles.ratingValue}>{energy}</Text>
      </View>

      <Text style={styles.message}>{message || " "}</Text>

      {lastGame && <GameCard game={lastGame} />}

      {(Object.keys(player.ratings) as (keyof Ratings)[]).map((key) => (
        <View key={key} style={styles.ratingRow}>
          <Text style={styles.ratingLabel}>{LABELS[key]}</Text>
          <View style={styles.barBg}>
            <View
              style={[styles.barFill, { width: `${player.ratings[key]}%` }]}
            />
          </View>
          <Text style={styles.ratingValue}>{player.ratings[key]}</Text>
          {!gameWeek && (
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

      {gameWeek ? (
        <Pressable style={styles.gameButton} onPress={playGame}>
          <Text style={styles.buttonText}>Play game</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.restButton} onPress={restWeek}>
          <Text style={styles.buttonText}>Rest</Text>
        </Pressable>
      )}

      <Pressable style={styles.button} onPress={newCareer}>
        <Text style={styles.buttonText}>New career (deletes save)</Text>
      </Pressable>
    </View>
  );
}