"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import WaterGlass from "@/components/WaterGlass";
import Bubbles from "@/components/Bubbles";
import Celebration from "@/components/Celebration";
import QuickAddButton from "@/components/QuickAddButton";
import FoodPicker from "@/components/FoodPicker";
import ProfileAvatar from "@/components/ProfileAvatar";
import type { DrinkType, FoodItem, LogEntry, UserProfile } from "@/lib/types";
import { effectiveGoal } from "@/lib/types";

export default function DashboardPage() {
  const params = useParams<{ userId: string }>();
  const userId = Number(params.userId);

  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [drinkTypes, setDrinkTypes] = useState<DrinkType[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [todayLogs, setTodayLogs] = useState<LogEntry[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const hasCelebrated = useRef(false);

  async function loadAll() {
    const [profilesRes, drinksRes, foodsRes, logsRes] = await Promise.all([
      fetch("/api/profiles").then((r) => r.json()),
      fetch("/api/drink-types").then((r) => r.json()),
      fetch("/api/food-items").then((r) => r.json()),
      fetch(`/api/logs?userId=${userId}`).then((r) => r.json()),
    ]);
    setProfiles(profilesRes);
    setUser(profilesRes.find((p: UserProfile) => p.id === userId) ?? null);
    setDrinkTypes(drinksRes);
    setFoods(foodsRes);
    setTodayLogs(logsRes);
  }

  useEffect(() => {
    hasCelebrated.current = false;
    // Standard fetch-on-mount pattern: loadAll() awaits its requests before
    // calling any setState, so this doesn't cause a synchronous cascading
    // render - safe to suppress this rule here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

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
    const res = await fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, entryType, referenceId, label, ozAmount }),
    });
    if (res.ok) {
      const created = await res.json();
      setTodayLogs((prev) => [created, ...prev]);
    }
  }

  async function deleteLog(id: number) {
    setTodayLogs((prev) => prev.filter((l) => l.id !== id));
    await fetch(`/api/logs/${id}`, { method: "DELETE" });
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

      <header className="z-10 flex items-center justify-between">
        <Link href="/" className="text-sm text-sky-500 hover:underline">
          ← Switch profile
        </Link>
        <Link
          href={`/u/${userId}/history`}
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
            Goal auto-estimated from gender/height/weight - not medical advice, editable in{" "}
            <Link href="/profiles/manage" className="underline">
              Manage profiles
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="z-10 flex justify-center">
        <WaterGlass percent={percent} ozSoFar={totalOz} goalOz={goal} />
      </div>

      <section className="z-10">
        <h2 className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
          Quick add a drink
        </h2>
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
        <h2 className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
          Logged today
        </h2>
        {todayLogs.length === 0 && (
          <p className="text-sm text-slate-400">Nothing logged yet today.</p>
        )}
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
                  onClick={() => deleteLog(l.id)}
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
              <Link key={p.id} href={`/u/${p.id}`} title={p.name}>
                <ProfileAvatar name={p.name} color={p.avatarColor} size={32} />
              </Link>
            ))}
        </section>
      )}
    </main>
  );
}
