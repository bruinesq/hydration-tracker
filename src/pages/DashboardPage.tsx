import { Link, useParams } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import WaterGlass from "@/components/WaterGlass";
import Bubbles from "@/components/Bubbles";
import Celebration from "@/components/Celebration";
import QuickAddButton from "@/components/QuickAddButton";
import FoodPicker from "@/components/FoodPicker";
import ManualEntryForm from "@/components/ManualEntryForm";
import GoalStepper from "@/components/GoalStepper";
import ReminderPopup from "@/components/ReminderPopup";
import ProfileAvatar from "@/components/ProfileAvatar";
import { createLog, deleteLog, getDrinkTypes, getFoodItems, getLogsForDay, getProfiles } from "@/lib/db";
import type { DrinkType, FoodItem, LogEntry, UserProfile } from "@/lib/types";
import { effectiveGoal } from "@/lib/types";
import { localDateKey, localDayStartMs } from "@/lib/date";

const REMINDER_WINDOW_START_HOUR = 7; // 7am
const REMINDER_WINDOW_END_HOUR = 19; // 7pm
const REMINDER_INTERVAL_MS = 3 * 60 * 60 * 1000; // 3 hours
const CHECK_INTERVAL_MS = 60 * 1000; // poll once a minute

export default function DashboardPage() {
  const params = useParams<{ userId: string }>();
  const userId = Number(params.userId);

  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [drinkTypes, setDrinkTypes] = useState<DrinkType[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [todayLogs, setTodayLogs] = useState<LogEntry[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | "unsupported">(
    "default"
  );
  const hasCelebrated = useRef(false);
  const loadedDateKey = useRef<string>(localDateKey(new Date()));
  const lastReminderAt = useRef<number | null>(null);

  const loadAll = useCallback(async () => {
    loadedDateKey.current = localDateKey(new Date());
    const dayStartMs = localDayStartMs();
    const [profilesRes, drinksRes, foodsRes, logsRes] = await Promise.all([
      getProfiles(),
      getDrinkTypes(),
      getFoodItems(),
      getLogsForDay(userId, dayStartMs),
    ]);
    setProfiles(profilesRes);
    setUser(profilesRes.find((p) => p.id === userId) ?? null);
    setDrinkTypes(drinksRes);
    setFoods(foodsRes);
    setTodayLogs(logsRes);
  }, [userId]);

  useEffect(() => {
    hasCelebrated.current = false;
    loadAll();
  }, [loadAll]);

  // Daily reset: the meter is always just "today's logs" (see loadAll), so
  // there's nothing to reset in the database - but if this tab is left open
  // past midnight, poll for the local calendar day changing and refetch so
  // the glass drops back to empty without needing a manual refresh.
  useEffect(() => {
    const interval = setInterval(() => {
      const nowKey = localDateKey(new Date());
      if (nowKey !== loadedDateKey.current) {
        loadAll();
      }
    }, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loadAll]);

  useEffect(() => {
    // Deliberately effect-based rather than a lazy useState initializer:
    // this reads a browser-only API (Notification), and doing it in an
    // effect avoids any risk of it running before the DOM/window is ready.
    if (typeof window === "undefined" || !("Notification" in window)) {
      setNotifPermission("unsupported");
      return;
    }
    setNotifPermission(Notification.permission);
  }, []);

  // Hydration reminder: if it's between 7am-7pm and nothing has been logged
  // in the last 3 hours (and we haven't already reminded in the last 3
  // hours), nudge the user. This only fires while this tab is open - a true
  // notification when the browser is fully closed would need a service
  // worker + push subscriptions, which is a bigger addition.
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const hour = now.getHours();
      if (hour < REMINDER_WINDOW_START_HOUR || hour >= REMINDER_WINDOW_END_HOUR) return;

      const mostRecentLogMs =
        todayLogs.length > 0 ? new Date(todayLogs[0].loggedAt).getTime() : undefined;
      const sevenAmToday = new Date(now);
      sevenAmToday.setHours(REMINDER_WINDOW_START_HOUR, 0, 0, 0);
      const baselineMs = mostRecentLogMs ?? sevenAmToday.getTime();

      const sinceLastLog = now.getTime() - baselineMs;
      const sinceLastReminder = lastReminderAt.current
        ? now.getTime() - lastReminderAt.current
        : Infinity;

      if (sinceLastLog >= REMINDER_INTERVAL_MS && sinceLastReminder >= REMINDER_INTERVAL_MS) {
        lastReminderAt.current = now.getTime();
        if (notifPermission === "granted") {
          new Notification("💧 Time to hydrate!", {
            body: "You haven't logged anything in a few hours.",
          });
        }
        setShowReminder(true);
        setTimeout(() => setShowReminder(false), 8000);
      }
    }, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [todayLogs, notifPermission]);

  const totalOz = todayLogs.reduce((sum, l) => sum + l.ozAmount, 0);
  const goal = user ? effectiveGoal(user) : 0;
  const percent = goal > 0 ? (totalOz / goal) * 100 : 0;

  useEffect(() => {
    if (goal > 0 && totalOz >= goal && !hasCelebrated.current) {
      hasCelebrated.current = true;
      setShowCelebration(true);
      const t = setTimeout(() => setShowCelebration(false), 2200);
      return () => clearTimeout(t);
    }
  }, [totalOz, goal]);

  async function addLog(entryType: "drink" | "food", referenceId: number | null, label: string, ozAmount: number) {
    const created = await createLog({ userId, entryType, referenceId, label, ozAmount });
    setTodayLogs((prev) => [created, ...prev]);
  }

  async function removeLog(id: number) {
    setTodayLogs((prev) => prev.filter((l) => l.id !== id));
    await deleteLog(id);
  }

  function requestNotifications() {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    Notification.requestPermission().then(setNotifPermission);
  }

  if (!user) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </main>
    );
  }

  return (
    <main className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 overflow-hidden px-4 py-8">
      <Bubbles count={8} />
      <Celebration show={showCelebration} />
      <ReminderPopup show={showReminder} onDismiss={() => setShowReminder(false)} />

      <header className="z-10 flex items-center justify-between">
        <Link to="/" className="text-sm text-sky-500 hover:underline">
          ← Switch profile
        </Link>
        <Link
          to={`/u/${userId}/history`}
          className="text-sm text-slate-400 hover:text-slate-600 hover:underline dark:hover:text-slate-200"
        >
          History →
        </Link>
      </header>

      <div className="z-10 flex items-center gap-3">
        <ProfileAvatar name={user.name} color={user.avatarColor} size={48} />
        <div>
          <h1 className="text-xl font-bold">{user.name}&apos;s hydration today</h1>
          <p className="text-xs text-slate-400">
            Goal auto-estimated from gender/height/weight - not medical advice, adjustable below or in{" "}
            <Link to="/profiles/manage" className="underline">
              Manage profiles
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="z-10 flex flex-col items-center gap-3">
        <WaterGlass percent={percent} ozSoFar={totalOz} goalOz={goal} />
        <GoalStepper
          userId={userId}
          computedGoalOz={user.computedGoalOz}
          currentGoalOz={goal}
          isOverridden={user.goalOverrideOz != null}
          onChange={(newGoal, isOverridden) =>
            setUser((prev) => (prev ? { ...prev, goalOverrideOz: isOverridden ? newGoal : null } : prev))
          }
        />
        {notifPermission === "default" && (
          <button
            type="button"
            onClick={requestNotifications}
            className="text-[11px] text-slate-400 underline-offset-2 hover:underline"
          >
            🔔 Enable hydration reminder notifications
          </button>
        )}
      </div>

      <section className="z-10">
        <h2 className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">Quick add a drink</h2>
        <div className="flex flex-wrap gap-3">
          {drinkTypes.map((d) => (
            <QuickAddButton
              key={d.id}
              icon={d.icon}
              label={d.name}
              sublabel={`${d.defaultOz} fl oz`}
              onClick={() => addLog("drink", d.id, d.name, d.defaultOz)}
            />
          ))}
        </div>
      </section>

      <section className="z-10">
        <FoodPicker
          foods={foods}
          onAdd={(food, servings) =>
            addLog("food", food.id, `${food.name} (${servings}x ${food.servingLabel})`, food.ozPerServing * servings)
          }
        />
      </section>

      <section className="z-10">
        <ManualEntryForm onAdd={(label, ozAmount) => addLog("drink", null, label, ozAmount)} />
      </section>

      <section className="z-10">
        <h2 className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">Logged today</h2>
        {todayLogs.length === 0 && <p className="text-sm text-slate-400">Nothing logged yet today.</p>}
        <ul className="flex flex-col gap-2">
          {todayLogs.map((l) => (
            <li
              key={l.id}
              className="flex items-center justify-between rounded-xl bg-white/80 px-4 py-2 text-sm shadow-sm dark:bg-slate-800/80"
            >
              <span>{l.label}</span>
              <span className="flex items-center gap-3">
                <span className="font-semibold text-sky-600 dark:text-sky-300">
                  {Math.round(l.ozAmount * 10) / 10} fl oz
                </span>
                <button
                  onClick={() => removeLog(l.id)}
                  className="text-xs text-slate-400 hover:text-rose-500"
                  aria-label="Remove entry"
                >
                  ✕
                </button>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {profiles.length > 1 && (
        <section className="z-10 mt-2 flex items-center gap-3 border-t border-slate-100 pt-4 dark:border-slate-700">
          <span className="text-xs text-slate-400">Switch to:</span>
          {profiles
            .filter((p) => p.id !== userId)
            .map((p) => (
              <Link key={p.id} to={`/u/${p.id}`} title={p.name}>
                <ProfileAvatar name={p.name} color={p.avatarColor} size={32} />
              </Link>
            ))}
        </section>
      )}
    </main>
  );
}
