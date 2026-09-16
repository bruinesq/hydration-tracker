"use client";

import { AnimatePresence, motion } from "framer-motion";

interface ReminderPopupProps {
  show: boolean;
  onDismiss: () => void;
}

/**
 * In-app "time to hydrate" popup. Shown regardless of whether the browser's
 * Notification permission was granted, so there's always at least an
 * in-page reminder even if OS-level notifications aren't available/allowed.
 */
export default function ReminderPopup({ show, onDismiss }: ReminderPopupProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 220, damping: 20 }}
          className="fixed left-1/2 top-4 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-sky-200 bg-white/95 p-4 shadow-xl backdrop-blur dark:border-sky-900 dark:bg-slate-800/95"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">💧</span>
            <div className="flex-1">
              <p className="font-semibold text-sky-700 dark:text-sky-300">Time to hydrate!</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                You haven&apos;t logged anything in a few hours.
              </p>
            </div>
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss reminder"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
