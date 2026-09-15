"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const COLORS = ["#38bdf8", "#fb7185", "#34d399", "#fbbf24", "#a78bfa", "#f472b6"];

interface ConfettiPiece {
  id: number;
  x: number;
  rotate: number;
  color: string;
  delay: number;
}

function generatePieces(count: number): ConfettiPiece[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 320,
    rotate: Math.random() * 360,
    color: COLORS[i % COLORS.length],
    delay: Math.random() * 0.2,
  }));
}

/**
 * A short confetti-style burst plus a congratulatory banner, shown once
 * when a user crosses their daily goal. Purely presentational. Random
 * layout is generated once via a lazy useState initializer (not useMemo,
 * which must stay pure).
 */
export default function Celebration({ show }: { show: boolean }) {
  const [pieces] = useState<ConfettiPiece[]>(() => generatePieces(28));

  return (
    <AnimatePresence>
      {show && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-start justify-center">
          <div className="relative mt-24 h-0 w-0">
            {pieces.map((p) => (
              <motion.span
                key={p.id}
                className="absolute h-3 w-2 rounded-sm"
                style={{ backgroundColor: p.color }}
                initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                animate={{ x: p.x, y: 260, opacity: 0, rotate: p.rotate }}
                transition={{ duration: 1.6, delay: p.delay, ease: "easeOut" }}
              />
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 40, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 200, damping: 16 }}
            className="mt-8 rounded-2xl bg-white/95 px-6 py-3 text-center shadow-xl dark:bg-slate-800/95"
          >
            <p className="text-lg font-bold text-sky-600 dark:text-sky-300">
              🎉 Goal reached! Great hydrating.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
