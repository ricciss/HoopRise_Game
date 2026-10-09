export type LevelId = "highschool" | "college" | "pro";

export interface Level {
  id: LevelId;
  name: string;
  seasons: number; // how many seasons the player stays at this level
  opponentScore: number; // opponent points per quarter (before defense)
  shootingMod: number; // easier or harder to score
  opponents: string[];
}

export const LEVELS: Level[] = [
  {
    id: "highschool",
    name: "High School",
    seasons: 3,
    opponentScore: 21,
    shootingMod: 0.03,
    opponents: [
      "Central High Tigers",
      "Westview Eagles",
      "Lincoln Lions",
      "Riverside Bulls",
      "Oak Park Wolves",
      "St. Mary's Knights",
      "Hillcrest Hawks",
      "Eastside Panthers",
    ],
  },
  {
    id: "college",
    name: "College",
    seasons: 4,
    opponentScore: 22.5,
    shootingMod: 0,
    opponents: [
      "State Wildcats",
      "Tech Yellow Jackets",
      "City University Bears",
      "Northern Huskies",
      "Valley Cardinals",
      "Coastal Pirates",
      "Midwest Spartans",
      "Pacific Waves",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    seasons: Infinity,
    opponentScore: 23.5,
    shootingMod: -0.02,
    opponents: [
      "Harbor Hawks",
      "Iron City Bulls",
      "Northside Wolves",
      "Desert Suns",
      "Bay Sharks",
      "Capital Kings",
      "Lakeview Eagles",
      "Summit Lions",
    ],
  },
];

// Season 1-3 = High School, 4-7 = College, 8+ = Pro
export function levelForSeason(season: number): Level {
  let left = season;
  for (const level of LEVELS) {
    if (left <= level.seasons) return level;
    left -= level.seasons;
  }
  return LEVELS[LEVELS.length - 1];
}