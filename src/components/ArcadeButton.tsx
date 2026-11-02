import { useRef } from "react";
import {
  Animated,
  Pressable,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { colors, radius } from "../theme";
import { feedback } from "../feedback";

export type ArcadeColor = "orange" | "green" | "blue" | "red" | "gray";

// face = the top of the button, edge = the thick bottom side
const PALETTE: Record<ArcadeColor, { face: string; edge: string }> = {
  orange: { face: colors.accent, edge: "#b84a00" },
  green: { face: "#22c370", edge: "#0f7a44" },
  blue: { face: colors.blue, edge: "#1a54b3" },
  red: { face: colors.red, edge: "#9c1f2d" },
  gray: { face: colors.surfaceAlt, edge: "#1f1a63" },
};

const DEPTH = 6; // how thick the button looks

// A chunky button that is pushed down when you press it and springs back
export default function ArcadeButton({
  label,
  onPress,
  color = "orange",
  disabled = false,
  dimmed = false,
  style,
}: {
  label: string;
  onPress: () => void;
  color?: ArcadeColor;
  disabled?: boolean; // cannot be pressed
  dimmed?: boolean; // looks faded but can still be pressed
  style?: StyleProp<ViewStyle>;
}) {
  const press = useRef(new Animated.Value(0)).current; // 0 up, 1 pushed down
  const palette = PALETTE[color];

  function moveTo(value: number) {
    Animated.spring(press, {
      toValue: value,
      friction: value === 1 ? 12 : 4, // springs back with a little bounce
      tension: value === 1 ? 320 : 220,
      useNativeDriver: true,
    }).start();
  }

  return (
    <Pressable
      disabled={disabled}
      onPressIn={() => {
        feedback.tap();
        moveTo(1);
      }}
      onPressOut={() => moveTo(0)}
      onPress={onPress}
      style={[{ marginTop: 20 }, style]}
    >
      <View style={{ paddingBottom: DEPTH, opacity: disabled || dimmed ? 0.45 : 1 }}>
        {/* The thick edge under the button */}
        <View
          style={{
            position: "absolute",
            top: DEPTH,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: radius.button,
            backgroundColor: palette.edge,
          }}
        />
        {/* The top face that moves down */}
        <Animated.View
          style={{
            borderRadius: radius.button,
            backgroundColor: palette.face,
            paddingVertical: 15,
            alignItems: "center",
            overflow: "hidden",
            transform: [
              {
                translateY: press.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, DEPTH - 1],
                }),
              },
            ],
          }}
        >
          <View
            style={{
              position: "absolute",
              top: 4,
              left: 16,
              right: 16,
              height: 4,
              borderRadius: 2,
              backgroundColor: "rgba(255,255,255,0.3)",
            }}
          />
          <Text
            style={{
              color: "#ffffff",
              fontSize: 17,
              fontWeight: "900",
              letterSpacing: 1,
              textTransform: "uppercase",
              textShadowColor: palette.edge,
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 0,
            }}
          >
            {label}
          </Text>
        </Animated.View>
      </View>
    </Pressable>
  );
}
