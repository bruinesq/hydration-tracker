"use client";

import { useMemo, useState } from "react";
import type { FoodItem } from "@/lib/types";

interface FoodPickerProps {
  foods: FoodItem[];
  onAdd: (food: FoodItem, servings: number) => void;
  disabled?: boolean;
}

export default function FoodPicker({ foods, onAdd, disabled }: FoodPickerProps) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [servings, setServings] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return foods;
    return foods.filter((f) => f.name.toLowerCase().includes(q));
  }, [foods, query]);

  const selected = foods.find((f) => f.id === selectedId) ?? null;

  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <p className="mb-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
        Log food (converted to fluid oz)
      </p>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search foods (e.g. pho, rice, coffee)..."
        className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 dark:border-slate-600 dark:bg-slate-900"
      />
      <div className="mb-3 max-h-40 overflow-y-auto rounded-lg border border-slate-100 dark:border-slate-700">
        {filtered.length === 0 && (
          <p className="p-3 text-sm text-slate-400">No matching foods.</p>
        )}
        {filtered.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setSelectedId(f.id)}
            className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition ${
              selectedId === f.id
                ? "bg-emerald-100 dark:bg-emerald-900/40"
                : "hover:bg-slate-50 dark:hover:bg-slate-700/40"
            }`}
          >
            <span>
              {f.name} <span className="text-slate-400">· {f.servingLabel}</span>
            </span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-300">
              {f.ozPerServing} fl oz
            </span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-500" htmlFor="servings">
            Servings
          </label>
          <input
            id="servings"
            type="number"
            min={0.25}
            step={0.25}
            value={servings}
            onChange={(e) => setServings(Number(e.target.value))}
            className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-900"
          />
          <button
            type="button"
            disabled={disabled || servings <= 0}
            onClick={() => {
              onAdd(selected, servings);
              setSelectedId(null);
              setQuery("");
              setServings(1);
            }}
            className="ml-auto rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:opacity-50"
          >
            Add {Math.round(selected.ozPerServing * servings * 10) / 10} fl oz
          </button>
        </div>
      )}
      {selected?.sourceNote && (
        <p className="mt-2 text-xs italic text-slate-400">{selected.sourceNote}</p>
      )}
    </div>
  );
}
