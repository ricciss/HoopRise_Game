import { useEffect, useRef } from "react";
import { Animated, Easing, Text } from "react-native";
import { colors } from "../theme";
import { feedback } from "../feedback";

// The big VICTORY / DEFEAT text that slams onto the screen
export default function ResultBanner({
  won,
  opponent,
}: {
  won: boolean;
  opponent: string;
}) {
  const slam = useRef(new Animated.Value(0)).current; // 0 = big and invisible
  const pulse = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (won) feedback.win();
    else feedback.lose();
    const slamIn = Animated.spring(slam, {
      toValue: 1,
      friction: 5,
      tension: 110,
      useNativeDriver: true,
    });
    // A win keeps pulsing gently, a loss shakes once
    const after = won
      ? Animated.loop(
          Animated.sequence([
            Animated.timing(pulse, {
              toValue: 1,
              duration: 700,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(pulse, {
              toValue: 0,
              duration: 700,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
          ])
        )
      : Animated.sequence([
          Animated.delay(350),
          Animated.timing(shake, {
            toValue: 1,
            duration: 380,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]);
    slamIn.start();
    after.start();
    return () => {
      slamIn.stop();
      after.stop();
    };
  }, [won, slam, pulse, shake]);

  const color = won ? colors.gold : colors.red;

  return (
    <Animated.View
      style={{
        alignItems: "center",
        marginBottom: 14,
        opacity: slam.interpolate({
          inputRange: [0, 0.3, 1],
          outputRange: [0, 1, 1],
        }),
        transform: [
          {
            scale: Animated.multiply(
              slam.interpolate({ inputRange: [0, 1], outputRange: [3, 1] }),
              pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] })
            ),
          },
          {
            rotate: slam.interpolate({
              inputRange: [0, 1],
              outputRange: ["-14deg", won ? "-3deg" : "0deg"],
            }),
          },
          {
            translateX: shake.interpolate({
              inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
              outputRange: [0, -12, 12, -8, 8, 0],
            }),
          },
        ],
      }}
    >
      <Text
        style={{
          color,
          fontSize: 48,
          fontWeight: "900",
          letterSpacing: 2,
          textShadowColor: won ? colors.accent : colors.redDark,
          textShadowOffset: { width: 0, height: 3 },
          textShadowRadius: 14,
        }}
      >
        {won ? "VICTORY!" : "DEFEAT"}
      </Text>
      <Text
        style={{
          color: colors.textDim,
          fontSize: 14,
          fontWeight: "700",
          letterSpacing: 1,
        }}
      >
        vs {opponent}
      </Text>
    </Animated.View>
  );
}
