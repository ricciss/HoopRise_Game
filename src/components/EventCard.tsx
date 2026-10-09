import { View, Text, Pressable } from "react-native";
import { describeEffect } from "../game/events";
import { useGame } from "../store/GameContext";
import { styles } from "../styles";

export default function EventCard() {
  const { event, chooseEvent } = useGame();
  if (!event) return null;

  return (
    <View style={styles.eventCard}>
      <Text style={styles.eventTag}>EVENT</Text>
      <Text style={styles.eventTitle}>{event.title}</Text>
      <Text style={styles.eventText}>{event.text}</Text>

      {event.choices.map((choice, i) => (
        <Pressable
          key={i}
          style={styles.choiceButton}
          onPress={() => chooseEvent(i)}
        >
          <Text style={styles.choiceLabel}>{choice.label}</Text>
          <Text style={styles.choiceEffect}>{describeEffect(choice.effect)}</Text>
        </Pressable>
      ))}
    </View>
  );
}