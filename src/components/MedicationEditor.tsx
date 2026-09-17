import { useState } from "react";
import type { Medication } from "@/lib/types";

interface MedicationEditorProps {
  medications: Medication[];
  onAdd: (name: string) => void;
  onRemove: (id: number) => void;
  onClose: () => void;
}

/**
 * Inline add/remove panel for a profile's daily medication list, opened via
 * the pencil icon next to "Quick Add". Medications are entirely free-form -
 * add or remove any time, no fixed catalog like the drink/food lists.
 */
export default function MedicationEditor({ medications, onAdd, onRemove, onClose }: MedicationEditorProps) {
  const [name, setName] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setName("");
  }

  return (
    <div className="rounded-2xl border border-violet-300 bg-violet-100 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Edit medications</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-violet-500 px-3 py-1 text-xs font-semibold text-white hover:bg-violet-600"
        >
          Done
        </button>
      </div>

      <ul className="mb-3 flex flex-col gap-1.5">
        {medications.map((m) => (
          <li
            key={m.id}
            className="flex items-center justify-between rounded-lg bg-white/80 px-3 py-1.5 text-sm dark:bg-slate-900/60"
          >
            <span>{m.name}</span>
            <button
              type="button"
              onClick={() => onRemove(m.id)}
              className="text-xs text-rose-500 hover:underline"
              aria-label={`Remove ${m.name}`}
            >
              Remove
            </button>
          </li>
        ))}
        {medications.length === 0 && <li className="text-sm text-slate-500">No medications added yet.</li>}
      </ul>

      <form onSubmit={submit} className="flex items-center gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Metformin"
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 dark:border-slate-600 dark:bg-slate-900"
        />
        <button
          type="submit"
          className="rounded-lg bg-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-600"
        >
          Add
        </button>
      </form>
    </div>
  );
}
