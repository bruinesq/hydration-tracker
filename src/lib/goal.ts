export type Gender = "male" | "female" | "other";

/**
 * Personalized daily fluid goal estimate.
 *
 * Starting point: U.S. National Academies (NASEM) Dietary Reference Intake for
 * total water (all beverages + food combined), healthy adults, temperate
 * climate, average activity level:
 *   - Men (19+):   ~125 fl oz/day, reference body weight ~154 lb
 *   - Women (19+): ~91 fl oz/day,  reference body weight ~126 lb
 *
 * We scale that baseline by the user's actual weight relative to the
 * reference weight for their gender, then apply a small secondary
 * adjustment for height (taller frames tend to have more lean body mass,
 * which modestly increases fluid needs).
 *
 * IMPORTANT: this is a general wellness estimate, not medical advice. It
 * does not account for activity level, climate, pregnancy, medications, or
 * medical conditions that change fluid needs. Always show this caveat next
 * to the computed goal, and let the user override it.
 */
const PROFILE_BY_GENDER: Record<Gender, { baseOz: number; refWeightLb: number; refHeightIn: number }> = {
  male: { baseOz: 125, refWeightLb: 154, refHeightIn: 69.5 },
  female: { baseOz: 91, refWeightLb: 126, refHeightIn: 64 },
  // "other"/unspecified: blend of the male and female reference points above.
  other: { baseOz: 108, refWeightLb: 140, refHeightIn: 66.75 },
};

const MIN_GOAL_OZ = 60;
const MAX_GOAL_OZ = 200;

export function computeGoalOz(gender: Gender, heightIn: number, weightLb: number): number {
  const profile = PROFILE_BY_GENDER[gender] ?? PROFILE_BY_GENDER.other;

  const weightRatio = weightLb > 0 ? weightLb / profile.refWeightLb : 1;
  const heightAdjustment =
    1 + 0.1 * ((heightIn - profile.refHeightIn) / profile.refHeightIn);

  let goal = profile.baseOz * weightRatio * heightAdjustment;
  goal = Math.min(MAX_GOAL_OZ, Math.max(MIN_GOAL_OZ, goal));

  // Round to the nearest 5 fl oz for a clean, easy-to-read number.
  return Math.round(goal / 5) * 5;
}
