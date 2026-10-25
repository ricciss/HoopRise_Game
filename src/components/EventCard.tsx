import { View, Text, Pressable } from "react-native";
import { choiceCost, describeChoice, formatAmount } from "../game/events";
import { useGame } from "../store/GameContext";
import { styles } from "../styles";

export default function EventCard() {
  const { event, chooseEvent, earnings } = useGame();
  if (!event) return null;

  return (
    <View style={styles.eventCard}>
      <Text style={styles.eventTag}>EVENT</Text>
      <Text style={styles.eventTitle}>{event.title}</Text>
      <Text style={styles.eventText}>{event.text}</Text>

      {event.choices.map((choice, i) => {
        const cost = choiceCost(choice);
        const locked = cost > earnings;
        return (
          <Pressable
            key={i}
            style={[styles.choiceButton, locked && { opacity: 0.4 }]}
            onPress={() => chooseEvent(i)}
          >
            <Text style={styles.choiceLabel}>{choice.label}</Text>
            <Text
              style={[
                styles.choiceEffect,
                choice.gamble && !locked && { color: "#ff8c00" },
              ]}
            >
              {locked
                ? `Needs ${formatAmount(cost)} of career earnings`
                : describeChoice(choice)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}