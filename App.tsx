import { View, Text, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { GameProvider, useGame } from "./src/store/GameContext";
import CreatePlayerScreen from "./src/screens/CreatePlayerScreen";
import SeasonSummaryScreen from "./src/screens/SeasonSummaryScreen";
import HomeScreen from "./src/screens/HomeScreen";
import { styles } from "./src/styles";

function Main() {
  const { loaded, player, seasonSummary } = useGame();

  if (!loaded) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>HoopRise</Text>

      {player === null ? (
        <CreatePlayerScreen />
      ) : seasonSummary ? (
        <SeasonSummaryScreen />
      ) : (
        <HomeScreen />
      )}
    </ScrollView>
  );
}

export default function App() {
  return (
    <GameProvider>
      <Main />
    </GameProvider>
  );
}