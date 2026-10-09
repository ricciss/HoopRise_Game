import { Player, Ratings } from "./player";

export const MAX_ENERGY = 100;
export const TRAIN_COST = 25;
export const REST_GAIN = 40;

export interface TrainResult {
  player: Player;
  energy: number;
  gain: number;
}

export function train(
  player: Player,
  stat: keyof Ratings,
  energy: number
): TrainResult {
  if (energy < TRAIN_COST) {
    return { player, energy, gain: 0 };
  }

  const current = player.ratings[stat];

  // The higher the rating, the slower it grows
  const base = current < 50 ? 3 : current < 70 ? 2 : 1;

  // Young players develop faster, older players slower
  const ageBonus = player.age <= 21 ? 1 : player.age >= 28 ? -1 : 0;
  const maxGain = Math.max(1, base + ageBonus);

  const roll = 1 + Math.floor(Math.random() * maxGain);
  const gain = Math.min(99 - current, roll);

  return {
    player: {
      ...player,
      ratings: { ...player.ratings, [stat]: current + gain },
    },
    energy: energy - TRAIN_COST,
    gain,
  };
}

export function rest(energy: number): number {
  return Math.min(MAX_ENERGY, energy + REST_GAIN);
}