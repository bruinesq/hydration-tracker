import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import HistoryChart, { type DayTotal } from "@/components/HistoryChart";
import { getSummary } from "@/lib/db";
import { formatDateLabel, localDateKey } from "@/lib/date";

interface RawEntry {
  ozAmount: number;
  loggedAt: string;
}

export default function HistoryPage() {
  const params = useParams<{ userId: string }>();
  const userId = Number(params.userId);
  const [goal, setGoal] = useState(0);
  const [entries, setEntries] = useState<RawEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getSummary(userId).then((data) => {
      setGoal(data.goal ?? 0);
      setEntries(data.entries ?? []);
      setLoaded(true);
    });
  }, [userId]);

  // Bucket by LOCAL calendar day (the browser's timezone), not UTC - see
  // src/lib/date.ts. Otherwise an evening log can land on the wrong day.
  const days: DayTotal[] = useMemo(() => {
    const byDay = new Map<string, number>();
    for (const e of entries) {
      const key = localDateKey(new Date(e.loggedAt));
      byDay.set(key, (byDay.get(key) ?? 0) + e.ozAmount);
    }
    return Array.from(byDay.entries())
      .map(([date, totalOz]) => ({
        date,
        label: formatDateLabel(date),
        totalOz: Math.round(totalOz * 10) / 10,
      }))
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .slice(-30);
  }, [entries]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8">
      <Link to={`/u/${userId}`} className="mb-6 text-sm text-sky-500 hover:underline">
        ← Back to today
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-sky-600 dark:text-sky-300">History</h1>

      {loaded && (
        <div className="mb-8 rounded-2xl bg-white/80 p-4 shadow-sm dark:bg-slate-800/80">
          <HistoryChart data={days} goal={goal} />
        </div>
      )}

      {loaded && days.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">All days</p>
          {[...days].reverse().map((d) => {
            const met = d.totalOz >= goal;
            return (
              <div
                key={d.date}
                className="flex items-center justify-between rounded-lg bg-white/60 px-3 py-1.5 text-sm dark:bg-slate-800/60"
              >
                <span className="text-slate-500 dark:text-slate-400">{d.label}</span>
                <span className="font-medium">
                  {d.totalOz} / {goal} fl oz {met ? "🎉" : ""}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
