import { ReactNode } from "react";
import { View, Text, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "../styles";

export default function Screen({ children }: { children: ReactNode }) {
  // Keeps the content below the notch / status bar on every phone
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar style="light" />
      <View style={styles.brandRow}>
        <View style={styles.brandDot} />
        <Text style={styles.title}>HoopRise</Text>
      </View>
      {children}
    </ScrollView>
  );
}