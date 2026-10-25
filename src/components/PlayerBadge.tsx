

import { Text, View } from "react-native";

// Every position has its own jersey color
const POSITION_COLORS: Record<string, string> = {
  PG: "#2f6fe0",
  SG: "#2fbf71",
  SF: "#ff8c00",
  PF: "#9b59b6",
  C: "#e5534b",
};

export default function PlayerBadge({
  name,
  position,
  size = 64,
}: {
  name: string;
  position: string;
  size?: number;
}) {
  const initials =
    name
      .split(" ")
      .filter((w) => w.length > 0)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  return (
    <View
      style={{
        width: size,
        height: size * 1.15,
        borderRadius: size * 0.22,
        backgroundColor: POSITION_COLORS[position] ?? "#ff8c00",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.25)",
      }}
    >
      <Text style={{ color: "#fff", fontSize: size * 0.38, fontWeight: "800" }}>
        {initials}
      </Text>
      <Text
        style={{
          color: "rgba(255,255,255,0.85)",
          fontSize: size * 0.18,
          fontWeight: "700",
          marginTop: 1,
        }}
      >
        {position}
      </Text>
    </View>
  );
}