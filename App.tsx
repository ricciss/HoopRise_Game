import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { GameProvider, useGame } from "./src/store/GameContext";
import Screen from "./src/components/Screen";
import CreatePlayerScreen from "./src/screens/CreatePlayerScreen";
import SeasonSummaryScreen from "./src/screens/SeasonSummaryScreen";
import CollegeOffersScreen from "./src/screens/CollegeOffersScreen";
import DraftScreen from "./src/screens/DraftScreen";
import ContractOffersScreen from "./src/screens/ContractOffersScreen";
import PlayoffScreen from "./src/screens/PlayoffScreen";
import CareerEndScreen from "./src/screens/CareerEndScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import StatsScreen from "./src/screens/StatsScreen";
import LeagueScreen from "./src/screens/LeagueScreen";
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

function LeagueTab() {
  return (
    <Screen>
      <LeagueScreen />
    </Screen>
  );
}

function Main() {
  const {
    loaded,
    player,
    retired,
    seasonSummary,
    liveGame,
    offers,
    draft,
    contractOffers,
    playoffs,
  } = useGame();

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

  // The career is over
  if (retired) {
    return (
      <Screen>
        <CareerEndScreen />
      </Screen>
    );
  }

  if (offers) {
    return (
      <Screen>
        <CollegeOffersScreen />
      </Screen>
    );
  }

  if (draft) {
    return (
      <Screen>
        <DraftScreen />
      </Screen>
    );
  }

  if (contractOffers) {
    return (
      <Screen>
        <ContractOffersScreen />
      </Screen>
    );
  }

  // Your playoff run (a game that is being watched is shown on the Home tab)
  if (playoffs && playoffs.active && !liveGame) {
    return (
      <Screen>
        <PlayoffScreen />
      </Screen>
    );
  }

  if (seasonSummary && !liveGame) {
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
        <Tab.Screen name="League" component={LeagueTab} />
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