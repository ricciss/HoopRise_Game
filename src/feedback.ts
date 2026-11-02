// Sound effects and vibration, with settings to switch them off
import * as Haptics from "expo-haptics";
import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from "expo-audio";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SOUNDS = {
  tap: require("../assets/sounds/tap.wav"),
  coin: require("../assets/sounds/coin.wav"),
  win: require("../assets/sounds/win.wav"),
  lose: require("../assets/sounds/lose.wav"),
  unlock: require("../assets/sounds/unlock.wav"),
};

type SoundName = keyof typeof SOUNDS;

const SETTINGS_KEY = "hooprise_feedback_settings";

let soundOn = true;
let hapticsOn = true;
const players: Partial<Record<SoundName, AudioPlayer>> = {};

// Call once when the app starts
export async function loadFeedbackSettings(): Promise<void> {
  try {
    // Play sounds even when the phone is on silent
    await setAudioModeAsync({ playsInSilentMode: true });
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const data = JSON.parse(raw) as { soundOn?: boolean; hapticsOn?: boolean };
      soundOn = data.soundOn !== false;
      hapticsOn = data.hapticsOn !== false;
    }
  } catch (e) {
    console.warn("Could not load feedback settings", e);
  }
}

export function getFeedbackSettings(): { soundOn: boolean; hapticsOn: boolean } {
  return { soundOn, hapticsOn };
}

function saveSettings() {
  AsyncStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify({ soundOn, hapticsOn })
  ).catch(() => {});
}

export function setSoundOn(on: boolean) {
  soundOn = on;
  saveSettings();
}

export function setHapticsOn(on: boolean) {
  hapticsOn = on;
  saveSettings();
}

function playSound(name: SoundName) {
  if (!soundOn) return;
  try {
    let player = players[name];
    if (!player) {
      player = createAudioPlayer(SOUNDS[name]);
      players[name] = player;
    }
    const ready = player;
    // Rewind first so the same sound can play again quickly
    ready
      .seekTo(0)
      .then(() => ready.play())
      .catch(() => {});
  } catch (e) {
    console.warn("Could not play sound", e);
  }
}

function vibrate(run: () => Promise<void>) {
  if (!hapticsOn) return;
  run().catch(() => {});
}

export const feedback = {
  // A button was pressed
  tap() {
    vibrate(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
    playSound("tap");
  },
  // A game was won
  win() {
    vibrate(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    );
    playSound("win");
  },
  // A game was lost
  lose() {
    vibrate(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    );
    playSound("lose");
  },
  // Coins were earned or spent
  coin() {
    vibrate(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
    playSound("coin");
  },
  // An achievement was unlocked
  unlock() {
    vibrate(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    );
    playSound("unlock");
  },
};
