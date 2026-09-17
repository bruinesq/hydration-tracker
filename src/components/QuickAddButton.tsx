import { motion } from "framer-motion";
import { useState } from "react";

interface QuickAddButtonProps {
  icon: string;
  label: string;
  sublabel: string;
  onClick: () => void;
  disabled?: boolean;
}

export default function QuickAddButton({ icon, label, sublabel, onClick, disabled }: QuickAddButtonProps) {
  const [rippleKey, setRippleKey] = useState(0);

  return (
    <motion.button
      type="button"
      disabled={disabled}
      whileTap={{ scale: 0.94 }}
      onClick={() => {
        setRippleKey((k) => k + 1);
        onClick();
      }}
      className="relative flex flex-col items-center gap-1 overflow-hidden rounded-2xl border border-sky-300 bg-sky-200 px-4 py-3 shadow-sm transition hover:shadow-md disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800"
    >
      <motion.span
        key={rippleKey}
        className="pointer-events-none absolute inset-0 rounded-2xl bg-sky-300/40"
        initial={{ opacity: 0.6, scale: 0 }}
        animate={{ opacity: 0, scale: 2.2 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
      <span className="text-2xl">{icon}</span>
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
      <span className="text-xs text-slate-400">{sublabel}</span>
    </motion.button>
  );
}
