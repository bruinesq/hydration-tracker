import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProfileAvatar from "@/components/ProfileAvatar";
import { deleteProfile, getProfiles, updateProfile } from "@/lib/db";
import type { UserProfile } from "@/lib/types";
import { effectiveGoal } from "@/lib/types";

export default function ManageProfilesPage() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [overrideValue, setOverrideValue] = useState("");

  function load() {
    getProfiles().then(setProfiles);
  }

  useEffect(load, []);

  async function saveOverride(id: number) {
    const value = overrideValue.trim();
    await updateProfile(id, { goalOverrideOz: value === "" ? null : Number(value) });
    setEditingId(null);
    load();
  }

  async function handleDelete(id: number) {
    await deleteProfile(id);
    setConfirmDeleteId(null);
    load();
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-12">
      <Link to="/" className="mb-6 text-sm text-sky-500 hover:underline">
        ← Back
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-sky-600 dark:text-sky-300">Manage profiles</h1>

      <div className="flex flex-col gap-4">
        {profiles.map((p) => (
          <div
            key={p.id}
            className="flex flex-col gap-3 rounded-2xl bg-white/90 p-4 shadow-sm dark:bg-slate-800/90"
          >
            <div className="flex items-center gap-3">
              <ProfileAvatar name={p.name} color={p.avatarColor} size={44} />
              <div className="flex-1">
                <p className="font-semibold">{p.name}</p>
                <p className="text-xs text-slate-400">
                  {p.gender} · {Math.floor(p.heightIn / 12)}&apos;{Math.round(p.heightIn % 12)}&quot; ·{" "}
                  {p.weightLb} lb
                </p>
              </div>
              <p className="text-sm font-medium text-sky-600 dark:text-sky-300">
                {effectiveGoal(p)} fl oz/day
              </p>
            </div>

            {editingId === p.id ? (
              <div className="flex items-center gap-2 pl-14">
                <label className="text-xs text-slate-500">Override goal (fl oz, blank = auto):</label>
                <input
                  type="number"
                  defaultValue={p.goalOverrideOz ?? ""}
                  onChange={(e) => setOverrideValue(e.target.value)}
                  className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-900"
                  placeholder={`${p.computedGoalOz}`}
                />
                <button
                  onClick={() => saveOverride(p.id)}
                  className="rounded-lg bg-sky-500 px-3 py-1 text-xs font-semibold text-white hover:bg-sky-600"
                >
                  Save
                </button>
                <button onClick={() => setEditingId(null)} className="text-xs text-slate-400 hover:underline">
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 pl-14 text-sm">
                <button
                  onClick={() => {
                    setEditingId(p.id);
                    setOverrideValue(p.goalOverrideOz != null ? String(p.goalOverrideOz) : "");
                  }}
                  className="text-sky-500 hover:underline"
                >
                  Edit goal
                </button>

                {confirmDeleteId === p.id ? (
                  <span className="flex items-center gap-2 text-rose-500">
                    Delete {p.name} and all their history?
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="rounded-lg bg-rose-500 px-2 py-1 text-xs font-semibold text-white hover:bg-rose-600"
                    >
                      Yes, delete
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="text-xs text-slate-400 hover:underline"
                    >
                      Cancel
                    </button>
                  </span>
                ) : (
                  <button onClick={() => setConfirmDeleteId(p.id)} className="text-rose-400 hover:underline">
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {profiles.length === 0 && <p className="text-sm text-slate-400">No profiles yet.</p>}
      </div>

      {profiles.length < 4 && (
        <Link
          to="/profiles/new"
          className="mt-6 self-start rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-600"
        >
          + Add profile
        </Link>
      )}
    </main>
  );
}
