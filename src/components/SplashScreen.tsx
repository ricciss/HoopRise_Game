import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { colors } from "../theme";

const BALL = 96; // ball size
const FALL = 130; // how far the ball drops
const BAR_WIDTH = 220;
const SEAM = "#3a1a08"; // the black lines of the ball

const LETTERS = "HOOPRISE".split("");

const TIPS = [
  "Rest when your energy is low.",
  "Train the stat your position needs most.",
  "Tired players get injured more often.",
  "Win games to earn coins.",
  "Finish the season to reach the playoffs.",
];

// The ball drawn with plain views: orange circle with black seams
function Ball() {
  const inner = BALL - 6;
  const seam = { position: "absolute" as const, backgroundColor: SEAM };
  const arc = {
    position: "absolute" as const,
    top: 0,
    width: inner,
    height: inner,
    borderRadius: inner / 2,
    borderWidth: 3,
    borderColor: SEAM,
  };
  return (
    <View
      style={{
        width: BALL,
        height: BALL,
        borderRadius: BALL / 2,
        backgroundColor: colors.accent,
        borderWidth: 3,
        borderColor: SEAM,
        overflow: "hidden",
      }}
    >
      <View style={[seam, { left: inner / 2 - 1.5, width: 3, height: inner }]} />
      <View style={[seam, { top: inner / 2 - 1.5, height: 3, width: inner }]} />
      <View style={[arc, { left: -inner * 0.72 }]} />
      <View style={[arc, { left: inner * 0.72 }]} />
      <View
        style={{
          position: "absolute",
          top: 10,
          left: 16,
          width: 22,
          height: 12,
          borderRadius: 6,
          backgroundColor: "rgba(255,255,255,0.28)",
          transform: [{ rotate: "-30deg" }],
        }}
      />
    </View>
  );
}

export default function SplashScreen() {
  const { width, height } = useWindowDimensions();

  const drop = useRef(new Animated.Value(0)).current; // 0 top, 1 ground
  const squash = useRef(new Animated.Value(0)).current; // 1 = flattened
  const spin = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const tagline = useRef(new Animated.Value(0)).current;
  const letters = useRef(LETTERS.map(() => new Animated.Value(0))).current;
  const [tip, setTip] = useState(0);

  useEffect(() => {
    // The bouncing ball: fall, squash on the floor, rise again
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(drop, {
          toValue: 1,
          duration: 430,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(squash, {
          toValue: 1,
          duration: 70,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(squash, {
            toValue: 0,
            duration: 110,
            useNativeDriver: true,
          }),
          Animated.timing(drop, {
            toValue: 0,
            duration: 450,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    const rotate = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    // Letters of the logo spring in one after another
    const logo = Animated.stagger(
      80,
      letters.map((v) =>
        Animated.spring(v, {
          toValue: 1,
          friction: 5,
          tension: 140,
          useNativeDriver: true,
        })
      )
    );
    const bar = Animated.timing(progress, {
      toValue: 1,
      duration: 2000,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    });
    const text = Animated.timing(tagline, {
      toValue: 1,
      duration: 500,
      delay: 900,
      useNativeDriver: true,
    });

    bounce.start();
    rotate.start();
    logo.start();
    bar.start();
    text.start();
    const timer = setInterval(() => setTip((t) => (t + 1) % TIPS.length), 1100);

    return () => {
      bounce.stop();
      rotate.stop();
      logo.stop();
      bar.stop();
      text.stop();
      clearInterval(timer);
    };
  }, [drop, squash, spin, progress, tagline, letters]);

  const ballStyle = {
    transform: [
      {
        translateY: Animated.add(
          Animated.multiply(drop, FALL),
          Animated.multiply(squash, BALL * 0.12)
        ),
      },
      { scaleX: squash.interpolate({ inputRange: [0, 1], outputRange: [1, 1.22] }) },
      { scaleY: squash.interpolate({ inputRange: [0, 1], outputRange: [1, 0.78] }) },
    ],
  };
  const spinStyle = {
    transform: [
      {
        rotate: spin.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "360deg"],
        }),
      },
    ],
  };
  const shadowStyle = {
    opacity: drop.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.5] }),
    transform: [
      { scaleX: drop.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] }) },
    ],
  };
  const courtSize = Math.min(width * 0.95, 420);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <StatusBar style="light" />

      {/* Court lines in the background */}
      <View
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.35,
        }}
      >
        <View
          style={{
            position: "absolute",
            width: courtSize,
            height: courtSize,
            borderRadius: courtSize / 2,
            borderWidth: 3,
            borderColor: colors.border,
          }}
        />
        <View
          style={{
            position: "absolute",
            top: height * 0.5,
            left: 0,
            right: 0,
            height: 3,
            backgroundColor: colors.border,
          }}
        />
      </View>

      {/* Logo */}
      <View style={{ flexDirection: "row", marginBottom: 6 }}>
        {LETTERS.map((letter, i) => (
          <Animated.Text
            key={i}
            style={{
              fontSize: 46,
              fontWeight: "900",
              color: i < 4 ? colors.text : colors.accent,
              textShadowColor: i < 4 ? colors.blue : colors.gold,
              textShadowRadius: 12,
              opacity: letters[i].interpolate({
                inputRange: [0, 0.4, 1],
                outputRange: [0, 1, 1],
              }),
              transform: [
                {
                  translateY: letters[i].interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
                {
                  scale: letters[i].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.4, 1],
                  }),
                },
              ],
            }}
          >
            {letter}
          </Animated.Text>
        ))}
      </View>
      <Animated.Text
        style={{
          color: colors.textDim,
          fontSize: 14,
          fontWeight: "700",
          letterSpacing: 3,
          opacity: tagline,
          marginBottom: 36,
        }}
      >
        BASKETBALL CAREER
      </Animated.Text>

      {/* Bouncing ball and its shadow */}
      <View style={{ width: BALL, height: BALL + FALL, marginBottom: 30 }}>
        <Animated.View
          style={[
            {
              position: "absolute",
              bottom: -6,
              left: BALL * 0.05,
              width: BALL * 0.9,
              height: 14,
              borderRadius: 7,
              backgroundColor: "#000000",
            },
            shadowStyle,
          ]}
        />
        <Animated.View style={ballStyle}>
          <Animated.View style={spinStyle}>
            <Ball />
          </Animated.View>
        </Animated.View>
      </View>

      {/* Loading bar and tips */}
      <View
        style={{
          width: BAR_WIDTH,
          height: 14,
          borderRadius: 7,
          backgroundColor: colors.surfaceAlt,
          overflow: "hidden",
          borderWidth: 2,
          borderColor: colors.border,
        }}
      >
        <Animated.View
          style={{
            width: BAR_WIDTH,
            height: 14,
            backgroundColor: colors.accent,
            transform: [
              {
                translateX: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-BAR_WIDTH, 0],
                }),
              },
            ],
          }}
        />
      </View>
      <Text
        style={{
          color: colors.textMute,
          fontSize: 13,
          marginTop: 16,
          height: 20,
          paddingHorizontal: 24,
          textAlign: "center",
        }}
      >
        {TIPS[tip]}
      </Text>
    </View>
  );
}
