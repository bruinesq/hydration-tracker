"use client";

import { useState } from "react";

interface ManualEntryFormProps {
  onAdd: (label: string, ozAmount: number) => void;
  disabled?: boolean;
}

/**
 * Free-form "Other" entry for anything not covered by the quick-add drink
 * buttons or the food picker - the user types a name and a fluid-oz amount
 * directly.
 */
export default function ManualEntryForm({ onAdd, disabled }: ManualEntryFormProps) {
  const [label, setLabel] = useState("");
  const [oz, setOz] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(oz);
    if (!label.trim()) {
      setError("Give it a name (e.g. \"Smoothie\").");
      return;
    }
    if (!amount || amount <= 0) {
      setError("Enter a fluid-oz amount greater than 0.");
      return;
    }
    setError(null);
    onAdd(label.trim(), amount);
    setLabel("");
    setOz("");
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
    >
      <p className="mb-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
        Other (log anything by hand)
      </p>
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[140px] flex-1">
          <label className="mb-1 block text-xs text-slate-500" htmlFor="manual-label">
            What was it?
          </label>
          <input
            id="manual-label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Smoothie"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-400 dark:border-slate-600 dark:bg-slate-900"
          />
        </div>
        <div className="w-24">
          <label className="mb-1 block text-xs text-slate-500" htmlFor="manual-oz">
            Fl oz
          </label>
          <input
            id="manual-oz"
            type="number"
            min={0.1}
            step={0.5}
            value={oz}
            onChange={(e) => setOz(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-400 dark:border-slate-600 dark:bg-slate-900"
          />
        </div>
        <button
          type="submit"
          disabled={disabled}
          className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600 disabled:opacity-50"
        >
          Log it
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-rose-500">{error}</p>}
    </form>
  );
}
