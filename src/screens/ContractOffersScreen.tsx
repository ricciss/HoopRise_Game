import { View, Text } from "react-native";
import ArcadeButton from "../components/ArcadeButton";
import { strengthLabel } from "../game/league";
import { formatMoney } from "../game/market";
import { useGame } from "../store/GameContext";
import { styles } from "../styles";

export default function ContractOffersScreen() {
  const { player, contractOffers, teams, chooseContract } = useGame();
  if (!player || !contractOffers) return null;

  return (
    <View>
      <Text style={styles.name}>{player.name}</Text>
      <Text style={styles.sub}>Contract offers · age {player.age}</Text>
      <Text style={styles.hint}>
        Money or wins? Strong teams pay less but win more. Weak teams pay more.
      </Text>

      <View style={{ height: 16 }} />

      {contractOffers.map((offer, i) => {
        const team = teams.find((t) => t.id === offer.teamId);
        return (
          <View key={i} style={styles.gameCard}>
            <Text style={styles.eventTag}>{offer.label.toUpperCase()}</Text>
            <Text style={styles.eventTitle}>{offer.teamName}</Text>
            <Text style={styles.highlightText}>
              • {formatMoney(offer.salary)} per season for {offer.years} years
            </Text>
            <Text style={styles.highlightText}>
              • Total: {formatMoney(offer.salary * offer.years)}
            </Text>
            {team && (
              <Text style={styles.highlightText}>
                • {strengthLabel(team.strength)}
              </Text>
            )}
            <ArcadeButton
              label="Sign this contract"
              color="blue"
              onPress={() => chooseContract(i)}
            />
          </View>
        );
      })}
    </View>
  );
}