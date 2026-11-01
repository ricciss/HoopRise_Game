// The shop: what you can buy with coins, and the rules for buying it

export type ItemId = "energy" | "physio";

export interface ShopItem {
  id: ItemId;
  name: string;
  description: string;
  price: number;
}

// Test ad (a real ad network comes later)
export const AD_SECONDS = 3;
export const AD_REWARD = 20;

export const ENERGY_DRINK_GAIN = 40; // same as one week of rest
export const PHYSIO_POINTS = 4; // recovery points, about 2 weeks of rest

export const ITEMS: ShopItem[] = [
  {
    id: "energy",
    name: "Energy drink",
    description: `Restores ${ENERGY_DRINK_GAIN} energy right now, without skipping a week.`,
    price: 40,
  },
  {
    id: "physio",
    name: "Physio session",
    description: "Speeds up injury recovery by about 2 weeks of rest.",
    price: 60,
  },
];

// Coin packs. Test mode: no real money is charged.
export interface CoinPack {
  id: string;
  name: string;
  coins: number;
  price: string; // shown as text only
}

export const PACKS: CoinPack[] = [
  { id: "small", name: "Pocket change", coins: 100, price: "€0.99" },
  { id: "medium", name: "Gym bag", coins: 300, price: "€2.49" },
  { id: "large", name: "Trophy case", coins: 800, price: "€5.99" },
];

export function findPack(id: string): CoinPack | null {
  return PACKS.find((p) => p.id === id) ?? null;
}

export function findItem(id: ItemId): ShopItem | null {
  return ITEMS.find((i) => i.id === id) ?? null;
}

// Why the item cannot be bought right now, or null when it can
export function buyBlockReason(
  item: ShopItem,
  coins: number,
  energy: number,
  maxEnergy: number,
  injured: boolean
): string | null {
  if (coins < item.price) return "Not enough coins.";
  if (item.id === "energy" && energy >= maxEnergy) {
    return "Your energy is already full.";
  }
  if (item.id === "physio" && !injured) {
    return "You are not injured.";
  }
  return null;
}
