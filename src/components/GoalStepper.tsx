"use client";

import { useState } from "react";

interface GoalStepperProps {
  userId: number;
  computedGoalOz: number;
  currentGoalOz: number;
  isOverridden: boolean;
  onChange: (newGoalOz: number, isOverridden: boolean) => void;
}

const STEP_OZ = 5;
const MIN_OZ = 20;
const MAX_OZ = 400;

/**
 * A quick +/- stepper next to the water glass for adjusting today's goal by
 * hand. Persists via the same goalOverrideOz field Manage Profiles uses, so
 * there's one source of truth - this is just a faster place to nudge it
 * from. "Reset to auto" clears the override back to the computed estimate.
 */
export default function GoalStepper({
  userId,
  computedGoalOz,
  currentGoalOz,
  isOverridden,
  onChange,
}: GoalStepperProps) {
  const [busy, setBusy] = useState(false);

  async function patchGoal(goalOverrideOz: number | null) {
    setBusy(true);
    try {
      const res = await fetch(`/api/profiles/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalOverrideOz }),
      });
      if (res.ok) {
        const updated = await res.json();
        const effective = updated.goalOverrideOz ?? updated.computedGoalOz;
        onChange(effective, updated.goalOverrideOz != null);
      }
    } finally {
      setBusy(false);
    }
  }

  function adjust(delta: number) {
    const next = Math.min(MAX_OZ, Math.max(MIN_OZ, currentGoalOz + delta));
    if (next === currentGoalOz) return;
    patchGoal(next);
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => adjust(-STEP_OZ)}
          disabled={busy || currentGoalOz <= MIN_OZ}
          aria-label="Decrease daily goal"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg font-bold text-sky-600 shadow-sm transition hover:bg-sky-50 disabled:opacity-40 dark:bg-slate-800 dark:text-sky-300 dark:hover:bg-slate-700"
        >
          −
        </button>
        <span className="w-24 text-center text-xs text-slate-500 dark:text-slate-400">
          goal: <span className="font-semibold text-slate-700 dark:text-slate-200">{currentGoalOz}</span> fl oz
        </span>
        <button
          type="button"
          onClick={() => adjust(STEP_OZ)}
          disabled={busy || currentGoalOz >= MAX_OZ}
          aria-label="Increase daily goal"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg font-bold text-sky-600 shadow-sm transition hover:bg-sky-50 disabled:opacity-40 dark:bg-slate-800 dark:text-sky-300 dark:hover:bg-slate-700"
        >
          +
        </button>
      </div>
      {isOverridden && (
        <button
          type="button"
          disabled={busy}
          onClick={() => patchGoal(null)}
          className="text-[11px] text-slate-400 underline-offset-2 hover:underline"
        >
          reset to auto ({computedGoalOz} fl oz)
        </button>
      )}
    </div>
  );
}
