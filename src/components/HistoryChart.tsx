"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface DayTotal {
  date: string; // "YYYY-MM-DD", local calendar day
  label: string; // short display label, e.g. "Mon, Sep 15"
  totalOz: number;
}

interface HistoryChartProps {
  data: DayTotal[];
  goal: number;
}

const COLOR_MET = "#0ca30c"; // status "good" - validated dataviz palette
const COLOR_UNDER = "#3987e5"; // sequential blue, step 400
const COLOR_GRID = "#e1e0d9";
const COLOR_AXIS_TEXT = "#898781";
const COLOR_REFERENCE = "#94a3b8";

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: DayTotal }>;
}

function ChartTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-lg dark:border-slate-600 dark:bg-slate-800">
      <p className="font-semibold text-slate-700 dark:text-slate-200">{point.label}</p>
      <p className="text-slate-500 dark:text-slate-400">{point.totalOz} fl oz logged</p>
    </div>
  );
}

/**
 * Daily-totals bar chart. Bars are colored by whether that day met the goal
 * (status "good" green) or not (sequential blue) - a status distinction,
 * not an arbitrary categorical one, so a two-swatch text legend (rather
 * than a boxed legend) is enough to name it per the dataviz guidance for a
 * small, fixed set of meaningful colors.
 */
export default function HistoryChart({ data, goal }: HistoryChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-400 dark:border-slate-700">
        No logged days yet - your history will show up here.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COLOR_MET }} />
          Met goal
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COLOR_UNDER }} />
          Under goal
        </span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="20%">
          <CartesianGrid vertical={false} stroke={COLOR_GRID} strokeDasharray="0" />
          <XAxis
            dataKey="label"
            tick={{ fill: COLOR_AXIS_TEXT, fontSize: 11 }}
            axisLine={{ stroke: COLOR_GRID }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: COLOR_AXIS_TEXT, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <ReferenceLine y={goal} stroke={COLOR_REFERENCE} strokeDasharray="4 4" />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(148,163,184,0.12)" }} />
          <Bar dataKey="totalOz" radius={[4, 4, 0, 0]} maxBarSize={24}>
            {data.map((d) => (
              <Cell key={d.date} fill={d.totalOz >= goal ? COLOR_MET : COLOR_UNDER} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
