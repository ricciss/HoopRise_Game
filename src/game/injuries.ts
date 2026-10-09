export type Severity = "light" | "medium" | "severe";

export interface Injury {
  name: string;
  severity: Severity;
  // Recovery points left. Resting heals 2 per week, playing hurt heals 1.
  weeksLeft: number;
}

export const BASE_INJURY_CHANCE = 0.05;
export const WORSEN_CHANCE = 0.3;
export const MAX_RECOVERY = 12;

const NAMES: Record<Severity, string[]> = {
  light: ["Sprained ankle", "Bruised thigh", "Jammed finger"],
  medium: ["Strained hamstring", "Sore knee", "Groin strain"],
  severe: ["Torn ligament", "Stress fracture", "Dislocated shoulder"],
};

const RANGE: Record<Severity, [number, number]> = {
  light: [2, 3],
  medium: [4, 6],
  severe: [7, 10],
};

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

function severityFor(weeks: number): Severity {
  return weeks <= 3 ? "light" : weeks <= 6 ? "medium" : "severe";
}

// Tired players get hurt more often (energy before the game)
export function injuryChance(energy: number): number {
  if (energy < 25) return BASE_INJURY_CHANCE + 0.07;
  if (energy < 50) return BASE_INJURY_CHANCE + 0.03;
  return BASE_INJURY_CHANCE;
}

export function rollInjury(energy: number): Injury | null {
  if (Math.random() >= injuryChance(energy)) return null;

  const roll = Math.random();
  const severity: Severity =
    roll < 0.6 ? "light" : roll < 0.9 ? "medium" : "severe";
  const [min, max] = RANGE[severity];
  const weeksLeft = min + Math.floor(Math.random() * (max - min + 1));

  return { name: pick(NAMES[severity]), severity, weeksLeft };
}

// Heals the injury. Returns null when fully recovered.
export function tickInjury(injury: Injury, points: number): Injury | null {
  const weeksLeft = injury.weeksLeft - points;
  if (weeksLeft <= 0) return null;
  return { ...injury, weeksLeft, severity: severityFor(weeksLeft) };
}

export function worsenInjury(injury: Injury): Injury {
  const weeksLeft = Math.min(MAX_RECOVERY, injury.weeksLeft + 3);
  return { ...injury, weeksLeft, severity: severityFor(weeksLeft) };
}

// How many weeks of resting are still needed
export function restWeeksNeeded(injury: Injury): number {
  return Math.ceil(injury.weeksLeft / 2);
}

export function describeInjury(injury: Injury): string {
  const weeks = restWeeksNeeded(injury);
  return `${injury.name} (${injury.severity}, about ${weeks} week${
    weeks === 1 ? "" : "s"
  } of rest)`;
}