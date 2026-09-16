import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ProfileAvatar from "@/components/ProfileAvatar";
import Bubbles from "@/components/Bubbles";
import { getProfiles, MAX_PROFILES } from "@/lib/db";
import type { UserProfile } from "@/lib/types";
import { effectiveGoal } from "@/lib/types";

export default function HomePage() {
  const [profiles, setProfiles] = useState<UserProfile[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProfiles()
      .then(setProfiles)
      .catch(() => setError("Couldn't reach the database."));
  }, []);

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-16">
      <Bubbles />

      <motion.h1
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 mb-2 text-4xl font-extrabold text-sky-600 dark:text-sky-300"
      >
        💧 HydrationTracker
      </motion.h1>
      <p className="z-10 mb-10 text-slate-500 dark:text-slate-400">Who&apos;s drinking?</p>

      {error && <p className="z-10 text-sm text-rose-500">{error}</p>}

      {profiles === null && !error && (
        <p className="z-10 text-sm text-slate-400">Loading profiles...</p>
      )}

      {profiles !== null && profiles.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="z-10 flex flex-col items-center gap-4 rounded-2xl bg-white/80 p-8 text-center shadow-lg backdrop-blur dark:bg-slate-800/80"
        >
          <span className="text-5xl">🥤</span>
          <p className="max-w-xs text-slate-600 dark:text-slate-300">
            No profiles yet. Add your first one to start tracking hydration.
          </p>
          <Link
            to="/profiles/new"
            className="rounded-full bg-sky-500 px-6 py-2 font-semibold text-white shadow-md transition hover:bg-sky-600"
          >
            Add your first profile
          </Link>
        </motion.div>
      )}

      {profiles !== null && profiles.length > 0 && (
        <div className="z-10 flex flex-wrap items-center justify-center gap-6">
          {profiles.map((p) => (
            <motion.div key={p.id} whileHover={{ y: -4 }} whileTap={{ scale: 0.96 }}>
              <Link
                to={`/u/${p.id}`}
                className="flex flex-col items-center gap-2 rounded-2xl bg-white/80 px-6 py-5 shadow-md backdrop-blur transition hover:shadow-xl dark:bg-slate-800/80"
              >
                <ProfileAvatar name={p.name} color={p.avatarColor} size={64} />
                <span className="font-semibold">{p.name}</span>
                <span className="text-xs text-slate-400">Goal: {effectiveGoal(p)} fl oz/day</span>
              </Link>
            </motion.div>
          ))}

          {profiles.length < MAX_PROFILES && (
            <Link
              to="/profiles/new"
              className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-sky-200 px-6 py-5 text-sky-400 transition hover:border-sky-400 hover:text-sky-500 dark:border-slate-600"
            >
              <span className="text-3xl">+</span>
              <span className="text-sm font-medium">Add profile</span>
            </Link>
          )}
        </div>
      )}

      {profiles !== null && profiles.length > 0 && (
        <Link
          to="/profiles/manage"
          className="z-10 mt-10 text-sm text-slate-400 underline-offset-4 hover:text-slate-600 hover:underline dark:hover:text-slate-200"
        >
          Manage profiles
        </Link>
      )}
    </main>
  );
}
