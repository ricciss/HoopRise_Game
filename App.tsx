import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { GameProvider, useGame } from "./src/store/GameContext";
import Screen from "./src/components/Screen";
import CreatePlayerScreen from "./src/screens/CreatePlayerScreen";
import SeasonSummaryScreen from "./src/screens/SeasonSummaryScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import StatsScreen from "./src/screens/StatsScreen";
import { styles } from "./src/styles";

const Tab = createBottomTabNavigator();

const theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: "#111", card: "#111" },
};

function HomeTab() {
  return (
    <Screen>
      <HomeScreen />
    </Screen>
  );
}

function ProfileTab() {
  return (
    <Screen>
      <ProfileScreen />
    </Screen>
  );
}

function StatsTab() {
  return (
    <Screen>
      <StatsScreen />
    </Screen>
  );
}

function Main() {
  const { loaded, player, seasonSummary } = useGame();

  if (!loaded) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
      </View>
    );
  }

  if (player === null) {
    return (
      <Screen>
        <CreatePlayerScreen />
      </Screen>
    );
  }

  if (seasonSummary) {
    return (
      <Screen>
        <SeasonSummaryScreen />
      </Screen>
    );
  }

  return (
    <NavigationContainer theme={theme}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#ff8c00",
          tabBarInactiveTintColor: "#777",
          tabBarStyle: { backgroundColor: "#111", borderTopColor: "#222" },
          tabBarLabelStyle: { fontSize: 14, fontWeight: "bold" },
          tabBarIcon: () => null,
        }}
      >
        <Tab.Screen name="Home" component={HomeTab} />
        <Tab.Screen name="Profile" component={ProfileTab} />
        <Tab.Screen name="Stats" component={StatsTab} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GameProvider>
      <Main />
    </GameProvider>
  );
}