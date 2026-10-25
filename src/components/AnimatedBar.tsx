import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { colors } from "../theme";

// A progress bar that grows smoothly when the screen opens or the value changes
export default function AnimatedBar({
  value,
  color = colors.accent,
}: {
  value: number; // 0 to 100
  color?: string;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // width cannot use the native driver
    }).start();
  }, [value, anim]);

  const width = anim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
    extrapolate: "clamp",
  });

  return (
    <View style={local.bg}>
      <Animated.View style={[local.fill, { width, backgroundColor: color }]} />
    </View>
  );
}

const local = StyleSheet.create({
  bg: {
    flex: 1,
    height: 10,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 5,
    overflow: "hidden",
  },
  fill: { height: 10, borderRadius: 5 },
});