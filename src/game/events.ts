import { Player, Ratings } from "./player";
import { LevelId } from "./levels";
import { MAX_ENERGY } from "./training";

// Chance that a training week starts with an event
export const EVENT_CHANCE = 0.3;

export interface EventEffect {
  energy?: number;
  ratings?: Partial<Ratings>;
  money?: number; // millions of dollars (pros only)
}

// A risky choice: it works out with a chance, otherwise it does not
export interface EventGamble {
  chance: number;
  win: EventEffect;
  winText: string;
  lose: EventEffect;
  loseText: string;
}

export interface EventChoice {
  label: string;
  effect: EventEffect;
  result: string;
  gamble?: EventGamble;
}

export interface GameEvent {
  id: string;
  levels: LevelId[];
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

const ALL: LevelId[] = ["highschool", "college", "pro"];

export const EVENTS: GameEvent[] = [
  // ---------- Events at every level ----------
  {
    id: "extra_session",
    levels: ALL,
    title: "Extra session",
    text: "Your coach asks if you want to stay after practice and work on your shot.",
    choices: [
      {
        label: "Stay and shoot",
        effect: { energy: -10, ratings: { shooting: 1 } },
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
    levels: ALL,
    title: "Pickup game",
    text: "Some friends invite you to a pickup game at the park.",
    choices: [
      {
        label: "Join the game",
        effect: { energy: -10, ratings: { passing: 1 } },
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
    levels: ALL,
    title: "Film study",
    text: "The team posted game film. You could study it tonight.",
    choices: [
      {
        label: "Study all night",
        effect: { energy: -10, ratings: { defense: 1 } },
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
    levels: ALL,
    title: "Veteran mentor",
    text: "An experienced teammate offers to show you how to fight for position under the basket.",
    choices: [
      {
        label: "Learn from him",
        effect: { energy: -5, ratings: { rebounding: 1 } },
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
    levels: ALL,
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
    levels: ALL,
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
    levels: ALL,
    title: "Sprint challenge",
    text: "A teammate challenges you to a sprint race after practice.",
    choices: [
      {
        label: "Accept the challenge",
        effect: { energy: -10, ratings: { speed: 1 } },
        result: "You pushed each other to the limit.",
      },
      {
        label: "Decline",
        effect: { energy: 5 },
        result: "You saved your legs.",
      },
    ],
  },

  // ---------- High school ----------
  {
    id: "scout_visit",
    levels: ["highschool"],
    title: "Scout in the stands",
    text: "A college scout came to watch your practice.",
    choices: [
      {
        label: "Show off your shot",
        effect: {},
        result: "",
        gamble: {
          chance: 0.5,
          win: { ratings: { shooting: 1 }, energy: 5 },
          winText: "The scout wrote your name down. What a confidence boost!",
          lose: { energy: -10 },
          loseText: "You forced your shots and ran out of gas.",
        },
      },
      {
        label: "Stick to the basics",
        effect: { energy: -5, ratings: { defense: 1 } },
        result: "Solid, fundamental work.",
      },
    ],
  },
  {
    id: "summer_camp",
    levels: ["highschool"],
    title: "Summer camp invite",
    text: "You are invited to an elite basketball summer camp.",
    choices: [
      {
        label: "Go to the camp",
        effect: { energy: -15, ratings: { passing: 1, defense: 1 } },
        result: "Long days, but you picked up a lot.",
      },
      {
        label: "Stay home",
        effect: { energy: 15 },
        result: "You relaxed at home and recharged.",
      },
    ],
  },
  {
    id: "growth_spurt",
    levels: ["highschool"],
    title: "Growth spurt",
    text: "You grew a few centimetres over the summer.",
    choices: [
      {
        label: "Work with the strength coach",
        effect: { energy: -10, ratings: { rebounding: 1 } },
        result: "You learned to use your new size.",
      },
      {
        label: "Just enjoy it",
        effect: { energy: 10 },
        result: "You enjoyed the extra height.",
      },
    ],
  },
  {
    id: "rival_1v1",
    levels: ["highschool"],
    title: "Rival's challenge",
    text: "A rival from another school dares you to a one-on-one.",
    choices: [
      {
        label: "Accept the challenge",
        effect: {},
        result: "",
        gamble: {
          chance: 0.5,
          win: { ratings: { speed: 1 }, energy: 5 },
          winText: "You outran him and won easily.",
          lose: { energy: -10, ratings: { shooting: -1 } },
          loseText: "He got the better of you today.",
        },
      },
      {
        label: "Walk away",
        effect: { energy: 5 },
        result: "You ignored the trash talk.",
      },
    ],
  },

  // ---------- College ----------
  {
    id: "captain_vote",
    levels: ["college"],
    title: "Captain vote",
    text: "Your teammates want you to be the team captain.",
    choices: [
      {
        label: "Accept the role",
        effect: { energy: -10, ratings: { passing: 1 } },
        result: "You took the lead and the team followed.",
      },
      {
        label: "Stay low",
        effect: { energy: 5 },
        result: "You let someone else lead.",
      },
    ],
  },
  {
    id: "early_practice",
    levels: ["college"],
    title: "6 a.m. practice",
    text: "Coach scheduled a very early practice.",
    choices: [
      {
        label: "Go all in",
        effect: { energy: -15, ratings: { stamina: 1 } },
        result: "You pushed through the early morning.",
      },
      {
        label: "Take it easy",
        effect: { energy: 5 },
        result: "You paced yourself.",
      },
    ],
  },
  {
    id: "alumni_mentor",
    levels: ["college"],
    title: "Alumni visit",
    text: "A famous alumnus visits the team.",
    choices: [
      {
        label: "Ask for advice",
        effect: { energy: -10, ratings: { defense: 1, shooting: 1 } },
        result: "He shared his best tricks.",
      },
      {
        label: "Just watch",
        effect: {},
        result: "You enjoyed the show.",
      },
    ],
  },
  {
    id: "pro_workout",
    levels: ["college"],
    title: "Private workout",
    text: "A pro scout invites you to a private workout.",
    choices: [
      {
        label: "Go for it",
        effect: {},
        result: "",
        gamble: {
          chance: 0.5,
          win: { ratings: { shooting: 1, passing: 1 } },
          winText: "You impressed the scout.",
          lose: { energy: -15 },
          loseText: "Nerves got the better of you.",
        },
      },
      {
        label: "Decline",
        effect: { energy: 5 },
        result: "You stayed in your routine.",
      },
    ],
  },
  {
    id: "rivalry_hype",
    levels: ["college"],
    title: "Rivalry week",
    text: "The whole campus is buzzing about the rivalry game.",
    choices: [
      {
        label: "Soak it in",
        effect: { energy: 10 },
        result: "The crowd's energy lifted you.",
      },
      {
        label: "Study their film",
        effect: { energy: -10, ratings: { defense: 1 } },
        result: "You learned their favourite plays.",
      },
    ],
  },

  // ---------- Pros ----------
  {
    id: "shoe_deal",
    levels: ["pro"],
    title: "Sneaker deal",
    text: "A shoe company offers you a sponsorship.",
    choices: [
      {
        label: "Sign the deal",
        effect: { energy: -10, money: 0.5 },
        result: "You signed and shot the commercial.",
      },
      {
        label: "Negotiate harder",
        effect: {},
        result: "",
        gamble: {
          chance: 0.5,
          win: { money: 1.2 },
          winText: "They agreed to a much bigger deal!",
          lose: { energy: -5, money: 0.2 },
          loseText: "They offered less than before.",
        },
      },
    ],
  },
  {
    id: "personal_trainer",
    levels: ["pro"],
    title: "Personal trainer",
    text: "A top trainer offers you private sessions.",
    choices: [
      {
        label: "Hire him",
        effect: { money: -0.3, energy: -10, ratings: { speed: 1, stamina: 1 } },
        result: "Expensive, but worth it.",
      },
      {
        label: "Skip it",
        effect: { energy: 5 },
        result: "You kept your money.",
      },
    ],
  },
  {
    id: "chef",
    levels: ["pro"],
    title: "Personal chef",
    text: "A chef could improve your recovery.",
    choices: [
      {
        label: "Hire the chef",
        effect: { money: -0.15, energy: 20 },
        result: "Great food and great sleep.",
      },
      {
        label: "Cook yourself",
        effect: { energy: 5 },
        result: "You made pasta again.",
      },
    ],
  },
  {
    id: "investment",
    levels: ["pro"],
    title: "Business tip",
    text: "A friend pitches you a business deal.",
    choices: [
      {
        label: "Invest",
        effect: {},
        result: "",
        gamble: {
          chance: 0.5,
          win: { money: 0.8 },
          winText: "The business took off!",
          lose: { money: -0.5 },
          loseText: "The business went under.",
        },
      },
      {
        label: "Keep your money",
        effect: {},
        result: "You stayed careful.",
      },
    ],
  },
  {
    id: "media",
    levels: ["pro"],
    title: "Press interview",
    text: "Reporters want an interview after practice.",
    choices: [
      {
        label: "Speak confidently",
        effect: {},
        result: "",
        gamble: {
          chance: 0.6,
          win: { energy: 10 },
          winText: "You nailed it and the fans love you.",
          lose: { energy: -10 },
          loseText: "You stumbled over your words.",
        },
      },
      {
        label: "No comment",
        effect: {},
        result: "You walked past the cameras.",
      },
    ],
  },
  {
    id: "gala",
    levels: ["pro"],
    title: "Sponsor gala",
    text: "Your team's sponsors host a gala tonight.",
    choices: [
      {
        label: "Attend",
        effect: { energy: -15, money: 0.4 },
        result: "A long night, but a nice appearance fee.",
      },
      {
        label: "Stay home",
        effect: { energy: 5 },
        result: "You rested instead.",
      },
    ],
  },
];

// Picks a random event for this level (never the same one twice in a row)
export function rollEvent(
  level: LevelId,
  lastId: string | null
): GameEvent | null {
  if (Math.random() >= EVENT_CHANCE) return null;
  const options = EVENTS.filter(
    (e) => e.levels.includes(level) && e.id !== lastId
  );
  if (options.length === 0) return null;
  return options[Math.floor(Math.random() * options.length)];
}

export function findEvent(id: string): GameEvent | null {
  return EVENTS.find((e) => e.id === id) ?? null;
}

// Decides what a choice does (a risky choice is rolled here)
export function resolveChoice(choice: EventChoice): {
  effect: EventEffect;
  text: string;
} {
  if (choice.gamble) {
    const won = Math.random() < choice.gamble.chance;
    return won
      ? { effect: choice.gamble.win, text: choice.gamble.winText }
      : { effect: choice.gamble.lose, text: choice.gamble.loseText };
  }
  return { effect: choice.effect, text: choice.result };
}

// How much money a choice can cost you at most (millions)
export function choiceCost(choice: EventChoice): number {
  const amounts = [choice.effect.money ?? 0];
  if (choice.gamble) {
    amounts.push(choice.gamble.win.money ?? 0, choice.gamble.lose.money ?? 0);
  }
  return Math.max(0, ...amounts.map((m) => -m));
}

export function applyEffect(
  player: Player,
  energy: number,
  effect: EventEffect
): { player: Player; energy: number; money: number } {
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
  return {
    player: { ...player, ratings },
    energy: newEnergy,
    money: effect.money ?? 0,
  };
}

function signed(n: number): string {
  return n > 0 ? `+${n}` : `${n}`;
}

export function formatAmount(millions: number): string {
  return `$${Number(millions.toFixed(2))}M`;
}

// Short text like "+1 Shooting, -10 energy, +$0.5M"
export function describeEffect(effect: EventEffect): string {
  const parts: string[] = [];
  if (effect.ratings) {
    (Object.keys(effect.ratings) as (keyof Ratings)[]).forEach((key) => {
      const change = effect.ratings?.[key] ?? 0;
      if (change !== 0) parts.push(`${signed(change)} ${RATING_NAMES[key]}`);
    });
  }
  if (effect.energy) parts.push(`${signed(effect.energy)} energy`);
  if (effect.money) {
    parts.push(
      `${effect.money > 0 ? "+" : "-"}${formatAmount(Math.abs(effect.money))}`
    );
  }
  return parts.length > 0 ? parts.join(", ") : "no effect";
}

// What the button shows under a choice
export function describeChoice(choice: EventChoice): string {
  if (choice.gamble) {
    const g = choice.gamble;
    return `Risky: ${Math.round(g.chance * 100)}% ${describeEffect(
      g.win
    )}, otherwise ${describeEffect(g.lose)}`;
  }
  return describeEffect(choice.effect);
}