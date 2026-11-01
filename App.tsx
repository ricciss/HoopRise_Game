import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
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
import ShopScreen from "./src/screens/ShopScreen";
import { colors } from "./src/theme";
import { styles } from "./src/styles";

const Tab = createBottomTabNavigator();

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.surface,
    border: colors.border,
  },
};

type IconName = keyof typeof Ionicons.glyphMap;

// [icon when selected, icon when not selected]
const ICONS: Record<string, [IconName, IconName]> = {
  Home: ["home", "home-outline"],
  Profile: ["person", "person-outline"],
  Stats: ["stats-chart", "stats-chart-outline"],
  League: ["trophy", "trophy-outline"],
  Shop: ["cart", "cart-outline"],
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

function ShopTab() {
  return (
    <Screen>
      <ShopScreen />
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
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textMute,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
          tabBarLabelStyle: { fontSize: 12, fontWeight: "700" },
          tabBarIcon: ({ color, size, focused }) => {
            const icons = ICONS[route.name] ?? ICONS.Home;
            return (
              <Ionicons
                name={focused ? icons[0] : icons[1]}
                size={size}
                color={color}
              />
            );
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeTab} />
        <Tab.Screen name="Profile" component={ProfileTab} />
        <Tab.Screen name="Stats" component={StatsTab} />
        <Tab.Screen name="League" component={LeagueTab} />
        <Tab.Screen name="Shop" component={ShopTab} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <GameProvider>
        <Main />
      </GameProvider>
    </SafeAreaProvider>
  );
}