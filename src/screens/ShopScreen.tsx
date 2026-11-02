import { useState, useEffect } from "react";
import { View, Text, Alert } from "react-native";
import ArcadeButton from "../components/ArcadeButton";
import {
  ITEMS,
  PACKS,
  CoinPack,
  buyBlockReason,
  AD_SECONDS,
  AD_REWARD,
} from "../game/shop";
import { MAX_ENERGY } from "../game/training";
import { SERVICES, servicePrice, serviceBlockReason } from "../game/services";
import { formatMoney } from "../game/market";
import { useGame } from "../store/GameContext";
import { colors } from "../theme";
import { styles } from "../styles";

export default function ShopScreen() {
  const {
    player,
    coins,
    energy,
    injury,
    buyItem,
    claimAdReward,
    buyPack,
    earnings,
    contract,
    perks,
    buyService,
  } = useGame();
  // The result of the last purchase attempt
  const [note, setNote] = useState("");
  // Seconds left of the test ad, or null when no ad is playing
  const [adLeft, setAdLeft] = useState<number | null>(null);

  useEffect(() => {
    if (adLeft === null) return;
    if (adLeft <= 0) {
      setNote(claimAdReward());
      setAdLeft(null);
      return;
    }
    const timer = setTimeout(() => setAdLeft(adLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [adLeft]);

  // Asks for confirmation first, like a real store would
  function confirmPack(pack: CoinPack) {
    Alert.alert(
      "Test purchase",
      `${pack.name}: ${pack.coins} coins for ${pack.price}.\n\nTest mode: no real money is charged.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Buy", onPress: () => setNote(buyPack(pack.id)) },
      ]
    );
  }

  if (!player) return null;

  return (
    <View>
      <Text style={styles.name}>Shop</Text>
      <Text style={styles.sub}>
        Earn coins by playing games and finishing seasons.
      </Text>

      <View
        style={{
          alignSelf: "flex-start",
          backgroundColor: colors.accentSoft,
          borderRadius: 999,
          paddingHorizontal: 14,
          paddingVertical: 6,
          marginBottom: 8,
        }}
      >
        <Text style={{ color: colors.gold, fontWeight: "700" }}>
          {coins} coins
        </Text>
      </View>
      <Text style={styles.hint}>
        Energy {energy}/{MAX_ENERGY}
        {injury ? " · Injured" : ""}
      </Text>

      <Text style={styles.message}>{note || " "}</Text>

      <View style={styles.gameCard}>
        <Text style={styles.gameTitle}>FREE COINS</Text>
        <Text style={styles.highlightText}>
          Test ad: watch for {AD_SECONDS} seconds to earn {AD_REWARD} coins.
        </Text>
        <ArcadeButton
          label={
            adLeft === null
              ? `Watch ad (+${AD_REWARD} coins)`
              : `Ad playing... ${adLeft}`
          }
          color="blue"
          disabled={adLeft !== null}
          onPress={() => setAdLeft(AD_SECONDS)}
        />
      </View>

      <View style={styles.gameCard}>
        <Text style={styles.gameTitle}>COIN PACKS (TEST MODE)</Text>
        <Text style={styles.highlightText}>
          Prices are for show only. Nothing is charged.
        </Text>
        {PACKS.map((pack) => (
          <ArcadeButton
            key={pack.id}
            label={`${pack.name} · ${pack.coins} coins · ${pack.price}`}
            color="orange"
            onPress={() => confirmPack(pack)}
            style={{ marginTop: 12 }}
          />
        ))}
      </View>

      <View style={styles.gameCard}>
        <Text style={styles.gameTitle}>CAREER SERVICES</Text>
        <Text style={styles.highlightText}>
          Paid with career earnings: {formatMoney(earnings)}
        </Text>
        {SERVICES.map((service) => {
          const salary = contract ? contract.salary : null;
          const reason = serviceBlockReason(service, perks, earnings, salary);
          return (
            <View key={service.id} style={{ marginTop: 14 }}>
              <Text style={{ color: colors.text, fontWeight: "700" }}>
                {service.name}
                {perks[service.id] ? " · active" : ""}
              </Text>
              <Text style={styles.highlightText}>{service.description}</Text>
              <ArcadeButton
                label={
                  salary === null
                    ? "Pros only"
                    : `Hire for ${formatMoney(servicePrice(service, salary))}`
                }
                color="orange"
                dimmed={reason !== null}
                onPress={() => setNote(buyService(service.id))}
                style={{ marginTop: 10 }}
              />
              {reason && <Text style={styles.hint}>{reason}</Text>}
            </View>
          );
        })}
      </View>

      {ITEMS.map((item) => {
        const reason = buyBlockReason(
          item,
          coins,
          energy,
          MAX_ENERGY,
          injury !== null
        );
        return (
          <View key={item.id} style={styles.gameCard}>
            <Text style={styles.gameTitle}>{item.name.toUpperCase()}</Text>
            <Text style={styles.highlightText}>{item.description}</Text>
            <ArcadeButton
              label={`Buy for ${item.price} coins`}
              color="green"
              dimmed={reason !== null}
              onPress={() => setNote(buyItem(item.id))}
            />
            {reason && <Text style={styles.hint}>{reason}</Text>}
          </View>
        );
      })}
    </View>
  );
}
