"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface Bubble {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
}

function generateBubbles(count: number): Bubble[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: 8 + Math.random() * 22,
    duration: 10 + Math.random() * 10,
    delay: Math.random() * 10,
    drift: (Math.random() - 0.5) * 60,
  }));
}

/**
 * Purely decorative floating bubbles for dashboard backgrounds. Random
 * layout is generated once via a lazy useState initializer (not useMemo,
 * which must stay pure) so it doesn't reshuffle on re-render.
 */
export default function Bubbles({ count = 14 }: { count?: number }) {
  const [bubbles] = useState<Bubble[]>(() => generateBubbles(count));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {bubbles.map((b) => (
        <motion.span
          key={b.id}
          className="absolute rounded-full bg-sky-300/30 dark:bg-sky-400/20"
          style={{ left: `${b.left}%`, width: b.size, height: b.size, bottom: -40 }}
          animate={{
            y: ["0vh", "-110vh"],
            x: [0, b.drift],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: b.duration,
            delay: b.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
