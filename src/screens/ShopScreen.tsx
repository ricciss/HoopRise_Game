import { useState, useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { ITEMS, buyBlockReason, AD_SECONDS, AD_REWARD } from "../game/shop";
import { MAX_ENERGY } from "../game/training";
import { useGame } from "../store/GameContext";
import { colors } from "../theme";
import { styles } from "../styles";

export default function ShopScreen() {
  const { player, coins, energy, injury, buyItem, claimAdReward } = useGame();
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
        <Pressable
          style={[styles.gameButton, adLeft !== null && { opacity: 0.4 }]}
          onPress={() => adLeft === null && setAdLeft(AD_SECONDS)}
        >
          <Text style={styles.buttonText}>
            {adLeft === null
              ? `Watch ad (+${AD_REWARD} coins)`
              : `Ad playing... ${adLeft}`}
          </Text>
        </Pressable>
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
            <Pressable
              style={[styles.restButton, reason !== null && { opacity: 0.4 }]}
              onPress={() => setNote(buyItem(item.id))}
            >
              <Text style={styles.buttonText}>Buy for {item.price} coins</Text>
            </Pressable>
            {reason && <Text style={styles.hint}>{reason}</Text>}
          </View>
        );
      })}
    </View>
  );
}
