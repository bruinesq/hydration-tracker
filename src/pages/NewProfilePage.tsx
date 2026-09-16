import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { createProfile } from "@/lib/db";
import { AVATAR_COLORS } from "@/lib/types";
import type { Gender } from "@/lib/types";

export default function NewProfilePage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>("female");
  const [feet, setFeet] = useState(5);
  const [inches, setInches] = useState(4);
  const [weightLb, setWeightLb] = useState(140);
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const heightIn = feet * 12 + inches;

    try {
      const created = await createProfile({ name, gender, heightIn, weightLb, avatarColor });
      navigate(`/u/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-white/90 p-6 shadow-lg backdrop-blur dark:bg-slate-800/90"
      >
        <h1 className="mb-1 text-2xl font-bold text-sky-600 dark:text-sky-300">Add a profile</h1>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          Used only to estimate a personalized daily fluid goal. Not medical advice - you can
          always override the goal later.
        </p>

        <label className="mb-1 block text-sm font-medium">Name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
          placeholder="e.g. Jon"
        />

        <label className="mb-1 block text-sm font-medium">Gender</label>
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value as Gender)}
          className="mb-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
        >
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="other">Other / prefer not to say</option>
        </select>

        <label className="mb-1 block text-sm font-medium">Height</label>
        <div className="mb-4 flex items-center gap-2">
          <input
            type="number"
            min={3}
            max={8}
            value={feet}
            onChange={(e) => setFeet(Number(e.target.value))}
            className="w-20 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
          />
          <span className="text-sm text-slate-500">ft</span>
          <input
            type="number"
            min={0}
            max={11}
            value={inches}
            onChange={(e) => setInches(Number(e.target.value))}
            className="w-20 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
          />
          <span className="text-sm text-slate-500">in</span>
        </div>

        <label className="mb-1 block text-sm font-medium">Weight (lb)</label>
        <input
          type="number"
          min={40}
          max={600}
          value={weightLb}
          onChange={(e) => setWeightLb(Number(e.target.value))}
          className="mb-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
        />

        <label className="mb-1 block text-sm font-medium">Avatar color</label>
        <div className="mb-6 flex gap-2">
          {AVATAR_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setAvatarColor(c)}
              className={`h-8 w-8 rounded-full transition ${
                avatarColor === c ? "ring-2 ring-offset-2 ring-slate-400" : ""
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Choose color ${c}`}
            />
          ))}
        </div>

        {error && <p className="mb-4 text-sm text-rose-500">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-sky-500 py-2 font-semibold text-white shadow-md transition hover:bg-sky-600 disabled:opacity-50"
        >
          {submitting ? "Creating..." : "Create profile"}
        </button>
      </motion.form>
    </main>
  );
}
