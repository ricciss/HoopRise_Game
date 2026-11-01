// Services you pay for with career earnings (money is in millions of dollars).
// Only pros have a salary, so only pros can buy them.
import { ContractOffer } from "./market";

export type ServiceId = "trainer" | "doctor" | "agent";

// Which services are active right now
export interface Perks {
  trainer: boolean; // lasts one season
  doctor: boolean; // lasts one season
  agent: boolean; // lasts until the next contract negotiation
}

export const NO_PERKS: Perks = { trainer: false, doctor: false, agent: false };

export interface Service {
  id: ServiceId;
  name: string;
  description: string;
  share: number; // price as a share of your yearly salary
}

// Same strength as a "good" college: +1 rating point in 25% of trainings
export const TRAINER_DEV = 0.25;
// The doctor halves the injury chance
export const DOCTOR_SCALE = 0.5;
// The agent makes contract offers 10% better
export const AGENT_BONUS = 1.1;

const MIN_PRICE = 0.2;
const MAX_SALARY = 55; // same limit as in contract offers

export const SERVICES: Service[] = [
  {
    id: "trainer",
    name: "Personal trainer",
    description: "This season each training has a 25% chance of +1 extra point.",
    share: 0.2,
  },
  {
    id: "doctor",
    name: "Team doctor",
    description: "This season you get injured only half as often.",
    share: 0.12,
  },
  {
    id: "agent",
    name: "Agent",
    description: "Your next contract offers are about 10% better.",
    share: 0.08,
  },
];

export function findService(id: ServiceId): Service | null {
  return SERVICES.find((s) => s.id === id) ?? null;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

// What the service costs with your current salary
export function servicePrice(service: Service, salary: number): number {
  return Math.max(MIN_PRICE, round1(salary * service.share));
}

// Why the service cannot be bought right now, or null when it can
export function serviceBlockReason(
  service: Service,
  perks: Perks,
  earnings: number,
  salary: number | null
): string | null {
  if (salary === null) return "Available once you turn pro.";
  if (perks[service.id]) return "Already active.";
  if (earnings < servicePrice(service, salary)) {
    return "Not enough career earnings.";
  }
  return null;
}

// Makes contract offers better when you have an agent
export function applyAgent(offers: ContractOffer[]): ContractOffer[] {
  return offers.map((o) => ({
    ...o,
    salary: Math.min(MAX_SALARY, round1(o.salary * AGENT_BONUS)),
  }));
}

// The money left after paying (avoids tiny rounding errors)
export function payFor(earnings: number, price: number): number {
  return Math.max(0, round1(earnings - price));
}
