import { motion } from "framer-motion";

interface WaterGlassProps {
  percent: number; // 0-100+ (can exceed 100)
  ozSoFar: number;
  goalOz: number;
}

export default function WaterGlass({ percent, ozSoFar, goalOz }: WaterGlassProps) {
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-56 w-36 overflow-hidden rounded-b-3xl rounded-t-xl border-4 border-sky-200 bg-sky-50 shadow-inner dark:border-sky-900 dark:bg-slate-800">
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-sky-500 to-sky-300"
          initial={{ height: 0 }}
          animate={{ height: `${clamped}%` }}
          transition={{ type: "spring", stiffness: 60, damping: 14 }}
        >
          <motion.div
            className="absolute -top-2 left-0 right-0 h-4 bg-sky-300/70"
            style={{ borderRadius: "50%" }}
            animate={{ x: [0, 8, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-sky-700 dark:text-sky-300">
          {Math.round(ozSoFar * 10) / 10} fl oz
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          of {goalOz} fl oz goal ({Math.round(percent)}%)
        </p>
      </div>
    </div>
  );
}
