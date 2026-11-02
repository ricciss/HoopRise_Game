import { ReactNode, useEffect, useRef } from "react";
import { Animated } from "react-native";

// Makes its content spring up from below when it appears
export default function PopIn({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.spring(v, {
      toValue: 1,
      delay,
      friction: 6,
      tension: 120,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [v, delay]);

  return (
    <Animated.View
      style={{
        opacity: v.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 1, 1],
        }),
        transform: [
          {
            translateY: v.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }),
          },
          {
            scale: v.interpolate({
              inputRange: [0, 1],
              outputRange: [0.9, 1],
            }),
          },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}
