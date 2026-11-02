import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGame } from "../store/GameContext";
import { colors } from "../theme";

const HIDDEN = -170; // above the screen
const SHOW_MS = 3200;

// A gold card that drops in from the top when an achievement is unlocked
export default function AchievementToast() {
  const { toast, clearToast } = useGame();
  const insets = useSafeAreaInsets();
  // clearToast changes on every render, so keep it in a ref
  const clearRef = useRef(clearToast);
  clearRef.current = clearToast;
  const slide = useRef(new Animated.Value(HIDDEN)).current;
  const shine = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!toast) return;
    slide.setValue(HIDDEN);
    shine.setValue(0);

    const slideIn = Animated.spring(slide, {
      toValue: 0,
      friction: 6,
      tension: 90,
      useNativeDriver: true,
    });
    const pop = Animated.loop(
      Animated.sequence([
        Animated.timing(shine, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(shine, {
          toValue: 0,
          duration: 600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    slideIn.start();
    pop.start();

    // After a few seconds the card flies back up
    const timer = setTimeout(() => {
      Animated.timing(slide, {
        toValue: HIDDEN,
        duration: 260,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => clearRef.current());
    }, SHOW_MS);

    return () => {
      slideIn.stop();
      pop.stop();
      clearTimeout(timer);
    };
  }, [toast, slide, shine]);

  if (!toast) return null;

  const title =
    toast.names.length <= 3
      ? toast.names.join(" · ")
      : `${toast.names.length} achievements`;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        top: insets.top + 8,
        left: 16,
        right: 16,
        transform: [{ translateY: slide }],
      }}
    >
      <Pressable onPress={clearToast}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.surface,
            borderRadius: 20,
            borderWidth: 3,
            borderColor: colors.gold,
            paddingVertical: 12,
            paddingHorizontal: 14,
          }}
        >
          <Animated.View
            style={{
              width: 46,
              height: 46,
              borderRadius: 23,
              backgroundColor: colors.gold,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
              transform: [
                {
                  scale: shine.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.12],
                  }),
                },
                {
                  rotate: shine.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["-8deg", "8deg"],
                  }),
                },
              ],
            }}
          >
            <Ionicons name="trophy" size={26} color={colors.accent} />
          </Animated.View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.gold,
                fontSize: 12,
                fontWeight: "900",
                letterSpacing: 1.5,
              }}
            >
              ACHIEVEMENT UNLOCKED
            </Text>
            <Text
              numberOfLines={2}
              style={{ color: colors.text, fontSize: 17, fontWeight: "800" }}
            >
              {title}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
