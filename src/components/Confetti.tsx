import { useEffect, useMemo } from "react";
import { Animated, Easing, View, useWindowDimensions } from "react-native";
import { colors } from "../theme";

const PIECES = 48;
const PALETTE = [
  colors.gold,
  colors.accent,
  colors.blueLight,
  colors.green,
  "#ff6bd6",
  "#ffffff",
];

interface Piece {
  x: number; // start position across the screen
  size: number;
  color: string;
  delay: number;
  duration: number;
  sway: number; // how far it swings left and right
  turns: number; // how many times it spins
  round: boolean;
  t: Animated.Value; // 0 = top, 1 = bottom
}

// Colorful pieces that fall from the top once (for a win)
export default function Confetti() {
  const { width, height } = useWindowDimensions();

  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: PIECES }, () => ({
        x: Math.random() * width,
        size: 8 + Math.random() * 8,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        delay: Math.random() * 700,
        duration: 1900 + Math.random() * 1200,
        sway: 14 + Math.random() * 30,
        turns: 1 + Math.random() * 3,
        round: Math.random() < 0.3,
        t: new Animated.Value(0),
      })),
    [width]
  );

  useEffect(() => {
    const run = Animated.parallel(
      pieces.map((p) =>
        Animated.timing(p.t, {
          toValue: 1,
          duration: p.duration,
          delay: p.delay,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        })
      )
    );
    run.start();
    return () => run.stop();
  }, [pieces]);

  return (
    <View
      pointerEvents="none"
      style={{ position: "absolute", top: 0, left: 0, right: 0, height: 0 }}
    >
      {pieces.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            left: p.x,
            top: -30,
            width: p.size,
            height: p.round ? p.size : p.size * 0.55,
            borderRadius: p.round ? p.size / 2 : 2,
            backgroundColor: p.color,
            opacity: p.t.interpolate({
              inputRange: [0, 0.8, 1],
              outputRange: [1, 1, 0],
            }),
            transform: [
              {
                translateY: p.t.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, height + 60],
                }),
              },
              {
                translateX: p.t.interpolate({
                  inputRange: [0, 0.25, 0.5, 0.75, 1],
                  outputRange: [0, p.sway, 0, -p.sway, 0],
                }),
              },
              {
                rotate: p.t.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", `${p.turns * 360}deg`],
                }),
              },
            ],
          }}
        />
      ))}
    </View>
  );
}
