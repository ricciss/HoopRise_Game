import { useEffect, useRef } from "react";
import { Animated, StyleProp, TextStyle } from "react-native";

// Text that pops bigger for a moment every time its value changes
export default function BumpText({
  value,
  style,
}: {
  value: string | number;
  style?: StyleProp<TextStyle>;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    scale.setValue(1.35);
    const anim = Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      tension: 160,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [value, scale]);

  return (
    <Animated.Text style={[style, { transform: [{ scale }] }]}>
      {value}
    </Animated.Text>
  );
}
