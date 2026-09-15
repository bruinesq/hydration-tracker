"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface DaySummary {
  date: string;
  totalOz: number;
}

export default function HistoryPage() {
  const params = useParams<{ userId: string }>();
  const userId = Number(params.userId);
  const [goal, setGoal] = useState(0);
  const [days, setDays] = useState<DaySummary[]>([]);

  useEffect(() => {
    fetch(`/api/summary/${userId}`)
      .then((r) => r.json())
      .then((data) => {
        setGoal(data.goal ?? 0);
        setDays(data.days ?? []);
      });
  }, [userId]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8">
      <Link href={`/u/${userId}`} className="mb-6 text-sm text-sky-500 hover:underline">
        ← Back to today
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-sky-600 dark:text-sky-300">History</h1>

      {days.length === 0 && (
        <p className="text-sm text-slate-400">No logged days yet.</p>
      )}

      <div className="flex flex-col gap-2">
        {days.map((d, i) => {
          const pct = goal > 0 ? Math.min(100, (d.totalOz / goal) * 100) : 0;
          const met = d.totalOz >= goal;
          return (
            <div
              key={d.date}
              className="flex items-center gap-3 rounded-xl bg-white/80 p-3 shadow-sm dark:bg-slate-800/80"
            >
              <span className="w-24 shrink-0 text-sm text-slate-500">{d.date}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: i * 0.03, duration: 0.5 }}
                  className={`h-full rounded-full ${met ? "bg-emerald-400" : "bg-sky-400"}`}
                />
              </div>
              <span className="w-24 shrink-0 text-right text-sm font-medium">
                {d.totalOz} / {goal} oz {met ? "🎉" : ""}
              </span>
            </div>
          );
        })}
      </div>
    </main>
  );
}
