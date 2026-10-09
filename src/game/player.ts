export type Position = "PG" | "SG" | "SF" | "PF" | "C";

export interface Ratings {
  shooting: number;
  passing: number;
  defense: number;
  rebounding: number;
  speed: number;
  stamina: number;
}

export interface Player {
  name: string;
  position: Position;
  age: number;
  heightCm: number;
  ratings: Ratings;
}

export const START_AGE = 16;

// Young players start a bit weaker than the base values
const YOUNG_PENALTY = 4;

const BASE: Record<Position, Ratings> = {
  PG: { shooting: 45, passing: 55, defense: 40, rebounding: 25, speed: 55, stamina: 45 },
  SG: { shooting: 55, passing: 40, defense: 40, rebounding: 30, speed: 50, stamina: 45 },
  SF: { shooting: 45, passing: 40, defense: 45, rebounding: 40, speed: 45, stamina: 45 },
  PF: { shooting: 35, passing: 30, defense: 50, rebounding: 55, speed: 35, stamina: 45 },
  C:  { shooting: 30, passing: 25, defense: 55, rebounding: 60, speed: 30, stamina: 45 },
};

const HEIGHT: Record<Position, number> = {
  PG: 185, SG: 193, SF: 200, PF: 206, C: 211,
};

// Random number from -5 to +5
function jitter(): number {
  return Math.floor(Math.random() * 11) - 5;
}

function clamp(n: number): number {
  return Math.max(1, Math.min(99, n));
}

export function createPlayer(name: string, position: Position): Player {
  const base = BASE[position];
  const ratings = {} as Ratings;
  (Object.keys(base) as (keyof Ratings)[]).forEach((key) => {
    ratings[key] = clamp(base[key] - YOUNG_PENALTY + jitter());
  });

  return {
    name,
    position,
    age: START_AGE,
    heightCm: HEIGHT[position] + jitter(),
    ratings,
  };
}