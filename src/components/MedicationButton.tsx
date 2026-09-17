import { motion } from "framer-motion";

interface MedicationButtonProps {
  name: string;
  takenAt: string | null; // ISO timestamp if taken today, else not yet taken
  onToggle: () => void;
  disabled?: boolean;
}

/**
 * A daily medication tile. Tapping it logs "taken" (with a timestamp,
 * mirroring how a fluid quick-add entry gets one) and greys the tile out;
 * tapping an already-taken tile again undoes it, in case of a mistake -
 * same delete-to-undo pattern as the rest of the app's logged entries.
 * "Taken" resets automatically at local midnight since it's derived from
 * today's logs, not a persistent flag on the medication itself.
 */
export default function MedicationButton({ name, takenAt, onToggle, disabled }: MedicationButtonProps) {
  const taken = takenAt != null;

  return (
    <motion.button
      type="button"
      disabled={disabled}
      whileTap={{ scale: 0.94 }}
      onClick={onToggle}
      className={`flex flex-col items-center gap-1 rounded-2xl border px-4 py-3 shadow-sm transition disabled:opacity-50 ${
        taken
          ? "border-slate-300 bg-slate-200 text-slate-400 dark:border-slate-600 dark:bg-slate-700/60 dark:text-slate-500"
          : "border-violet-300 bg-violet-200 text-slate-700 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
      }`}
    >
      <span className="text-2xl">{taken ? "✅" : "💊"}</span>
      <span className={`text-sm font-semibold ${taken ? "line-through" : ""}`}>{name}</span>
      <span className="text-xs">
        {taken
          ? new Date(takenAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
          : "Tap when taken"}
      </span>
    </motion.button>
  );
}
