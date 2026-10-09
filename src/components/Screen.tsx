import { ReactNode } from "react";
import { Text, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { styles } from "../styles";

export default function Screen({ children }: { children: ReactNode }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>HoopRise</Text>
      {children}
    </ScrollView>
  );
}