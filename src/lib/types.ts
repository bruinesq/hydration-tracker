export type Gender = "male" | "female" | "other";

export interface UserProfile {
  id: number;
  name: string;
  avatarColor: string;
  gender: Gender;
  heightIn: number;
  weightLb: number;
  computedGoalOz: number;
  goalOverrideOz: number | null;
  createdAt: string;
}

export interface DrinkType {
  id: number;
  name: string;
  icon: string;
  defaultOz: number;
  isCustom: number;
}

export interface FoodItem {
  id: number;
  name: string;
  category: string | null;
  servingLabel: string;
  ozPerServing: number;
  sourceNote: string | null;
}

export interface LogEntry {
  id: number;
  userId: number;
  entryType: "drink" | "food" | "medication";
  referenceId: number | null;
  label: string;
  ozAmount: number;
  loggedAt: string;
}

export interface Medication {
  id: number;
  userId: number;
  name: string;
  createdAt: string;
}

export function effectiveGoal(user: UserProfile): number {
  return user.goalOverrideOz ?? user.computedGoalOz;
}

export const AVATAR_COLORS = [
  "#38bdf8", // sky
  "#fb7185", // rose
  "#34d399", // emerald
  "#fbbf24", // amber
  "#a78bfa", // violet
  "#f472b6", // pink
];
