import { Player, Ratings } from "./player";
import { MAX_ENERGY } from "./training";

export const EVENT_CHANCE = 0.4;

export interface EventEffect {
  energy?: number;
  ratings?: Partial<Ratings>;
}

export interface EventChoice {
  label: string;
  effect: EventEffect;
  result: string;
}

export interface GameEvent {
  id: string;
  title: string;
  text: string;
  choices: EventChoice[];
}

const RATING_NAMES: Record<keyof Ratings, string> = {
  shooting: "Shooting",
  passing: "Passing",
  defense: "Defense",
  rebounding: "Rebounding",
  speed: "Speed",
  stamina: "Stamina",
};

export const EVENTS: GameEvent[] = [
  {
    id: "extra_session",
    title: "Extra session",
    text: "Your coach asks if you want to stay after practice and work on your shot.",
    choices: [
      {
        label: "Stay and shoot",
        effect: { energy: -15, ratings: { shooting: 2 } },
        result: "You put up shots until the gym lights went off.",
      },
      {
        label: "Go home",
        effect: { energy: 10 },
        result: "You went home and recovered.",
      },
    ],
  },
  {
    id: "pickup_game",
    title: "Pickup game",
    text: "Some friends invite you to a pickup game at the park.",
    choices: [
      {
        label: "Join the game",
        effect: { energy: -10, ratings: { passing: 2 } },
        result: "Fast, loose basketball. You made some great passes.",
      },
      {
        label: "Stay home",
        effect: { energy: 10 },
        result: "A quiet evening on the couch.",
      },
    ],
  },
  {
    id: "film_study",
    title: "Film study",
    text: "The team posted game film. You could study it tonight.",
    choices: [
      {
        label: "Study all night",
        effect: { energy: -10, ratings: { defense: 2 } },
        result: "You spotted the habits of your opponents.",
      },
      {
        label: "Sleep early",
        effect: { energy: 15 },
        result: "You went to bed early and woke up fresh.",
      },
    ],
  },
  {
    id: "mentor",
    title: "Veteran mentor",
    text: "An experienced teammate offers to show you how to fight for position under the basket.",
    choices: [
      {
        label: "Learn from him",
        effect: { energy: -5, ratings: { rebounding: 2 } },
        result: "He showed you tricks you never knew.",
      },
      {
        label: "Politely decline",
        effect: {},
        result: "You decided to do it your own way.",
      },
    ],
  },
  {
    id: "diet",
    title: "Nutrition plan",
    text: "The team nutritionist suggests a strict diet for the next weeks.",
    choices: [
      {
        label: "Follow the plan",
        effect: { energy: -5, ratings: { stamina: 1 } },
        result: "Discipline now, results later.",
      },
      {
        label: "Eat what you like",
        effect: { energy: 10 },
        result: "A big meal and a happy mood.",
      },
    ],
  },
  {
    id: "party",
    title: "Party invitation",
    text: "Your teammates are going out tonight and want you to come.",
    choices: [
      {
        label: "Go to the party",
        effect: { energy: -20, ratings: { stamina: -1 } },
        result: "Fun night, but you feel it the next day.",
      },
      {
        label: "Stay in and stretch",
        effect: { energy: 5, ratings: { speed: 1 } },
        result: "You skipped the party and took care of your body.",
      },
    ],
  },
  {
    id: "sprint_challenge",
    title: "Sprint challenge",
    text: "A teammate challenges you to a sprint race after practice.",
    choices: [
      {
        label: "Accept the challenge",
        effect: { energy: -15, ratings: { speed: 2 } },
        result: "You pushed each other to the limit.",
      },
      {
        label: "Decline",
        effect: { energy: 5 },
        result: "You saved your legs.",
      },
    ],
  },
];

export function rollEvent(): GameEvent | null {
  if (Math.random() >= EVENT_CHANCE) return null;
  return EVENTS[Math.floor(Math.random() * EVENTS.length)];
}

export function findEvent(id: string): GameEvent | null {
  return EVENTS.find((e) => e.id === id) ?? null;
}

export function applyEffect(
  player: Player,
  energy: number,
  effect: EventEffect
): { player: Player; energy: number } {
  const ratings = { ...player.ratings };
  if (effect.ratings) {
    (Object.keys(effect.ratings) as (keyof Ratings)[]).forEach((key) => {
      const change = effect.ratings?.[key] ?? 0;
      ratings[key] = Math.max(1, Math.min(99, ratings[key] + change));
    });
  }
  const newEnergy = Math.max(
    0,
    Math.min(MAX_ENERGY, energy + (effect.energy ?? 0))
  );
  return { player: { ...player, ratings }, energy: newEnergy };
}

function signed(n: number): string {
  return n > 0 ? `+${n}` : `${n}`;
}

// Short text like "+2 Shooting, -15 energy"
export function describeEffect(effect: EventEffect): string {
  const parts: string[] = [];
  if (effect.ratings) {
    (Object.keys(effect.ratings) as (keyof Ratings)[]).forEach((key) => {
      const change = effect.ratings?.[key] ?? 0;
      if (change !== 0) parts.push(`${signed(change)} ${RATING_NAMES[key]}`);
    });
  }
  if (effect.energy) parts.push(`${signed(effect.energy)} energy`);
  return parts.length > 0 ? parts.join(", ") : "no effect";
}