import { neon } from "@neondatabase/serverless";
import { computeGoalOz } from "./goal";
import type { DrinkType, FoodItem, Gender, LogEntry, UserProfile } from "./types";

/**
 * This is a static site with no server component at all (GitHub Pages +
 * Neon, nothing else - same pattern as this project's sibling apps
 * Maverick-tracker and TravelChecklist). That means this connection string
 * ships in the JS bundle anyone downloads when they open the page: there is
 * no server-side secret here, and no login gate. Anyone who has this app's
 * URL and opens their browser's dev tools can read this string and get full
 * read/write/delete access to this Neon database.
 *
 * That trade-off was made deliberately for a small household tool with
 * nothing sensitive in it (just fluid-ounce log entries). If that ever
 * changes, the two ways back out are: (1) put a real server back in front
 * of this (see git history before this commit for the previous Next.js +
 * Render version), or (2) switch to Supabase and use Row Level Security
 * with its public "anon" key instead of a raw Postgres credential - see
 * this project's sibling app `careconnect` for that pattern.
 */
const DATABASE_URL =
  "postgresql://neondb_owner:npg_hQTIor59Ewte@ep-solitary-cell-ar9bcc0f-pooler.c-4.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const sql = neon(DATABASE_URL, {
  disableWarningInBrowsers: true,
  fullResults: true,
});

interface RawResult {
  rows: unknown[];
  fields: { name: string }[];
}

// Neon's driver can return either plain objects or [fields + row-arrays]
// depending on query shape; normalize to plain objects either way.
function toObjects<T>(result: RawResult): T[] {
  const fieldNames = result.fields.map((f) => f.name);
  return result.rows.map((row) => {
    if (!Array.isArray(row)) return row as T;
    const obj: Record<string, unknown> = {};
    fieldNames.forEach((name, i) => (obj[name] = row[i]));
    return obj as T;
  });
}

export const MAX_PROFILES = 4;

// ── Users / profiles ──────────────────────────────────────────────

interface UserRow {
  id: number;
  name: string;
  avatar_color: string;
  gender: string;
  height_in: number;
  weight_lb: number;
  computed_goal_oz: number;
  goal_override_oz: number | null;
  created_at: string;
}

function mapUser(r: UserRow): UserProfile {
  return {
    id: r.id,
    name: r.name,
    avatarColor: r.avatar_color,
    gender: r.gender as Gender,
    heightIn: r.height_in,
    weightLb: r.weight_lb,
    computedGoalOz: r.computed_goal_oz,
    goalOverrideOz: r.goal_override_oz,
    createdAt: r.created_at,
  };
}

export async function getProfiles(): Promise<UserProfile[]> {
  const result = (await sql`SELECT * FROM users ORDER BY created_at`) as RawResult;
  return toObjects<UserRow>(result).map(mapUser);
}

export async function getProfile(id: number): Promise<UserProfile | null> {
  const result = (await sql`SELECT * FROM users WHERE id = ${id}`) as RawResult;
  const rows = toObjects<UserRow>(result);
  return rows.length ? mapUser(rows[0]) : null;
}

export async function createProfile(input: {
  name: string;
  avatarColor: string;
  gender: Gender;
  heightIn: number;
  weightLb: number;
}): Promise<UserProfile> {
  const existing = await getProfiles();
  if (existing.length >= MAX_PROFILES) {
    throw new Error(`Maximum of ${MAX_PROFILES} profiles reached.`);
  }
  const computedGoalOz = computeGoalOz(input.gender, input.heightIn, input.weightLb);
  const result = (await sql`
    INSERT INTO users (name, avatar_color, gender, height_in, weight_lb, computed_goal_oz)
    VALUES (${input.name}, ${input.avatarColor}, ${input.gender}, ${input.heightIn}, ${input.weightLb}, ${computedGoalOz})
    RETURNING *
  `) as RawResult;
  return mapUser(toObjects<UserRow>(result)[0]);
}

export async function updateProfile(
  id: number,
  patch: Partial<{
    name: string;
    avatarColor: string;
    gender: Gender;
    heightIn: number;
    weightLb: number;
    goalOverrideOz: number | null;
  }>
): Promise<UserProfile> {
  const current = await getProfile(id);
  if (!current) throw new Error("Profile not found");

  const merged = { ...current, ...patch };
  let computedGoalOz = current.computedGoalOz;
  if (patch.gender !== undefined || patch.heightIn !== undefined || patch.weightLb !== undefined) {
    computedGoalOz = computeGoalOz(merged.gender, merged.heightIn, merged.weightLb);
  }

  const result = (await sql`
    UPDATE users SET
      name = ${merged.name},
      avatar_color = ${merged.avatarColor},
      gender = ${merged.gender},
      height_in = ${merged.heightIn},
      weight_lb = ${merged.weightLb},
      computed_goal_oz = ${computedGoalOz},
      goal_override_oz = ${merged.goalOverrideOz}
    WHERE id = ${id}
    RETURNING *
  `) as RawResult;
  return mapUser(toObjects<UserRow>(result)[0]);
}

export async function deleteProfile(id: number): Promise<void> {
  await sql`DELETE FROM users WHERE id = ${id}`;
}

// ── Drink types ────────────────────────────────────────────────────

interface DrinkRow {
  id: number;
  name: string;
  icon: string;
  default_oz: number;
  is_custom: number;
}

function mapDrink(r: DrinkRow): DrinkType {
  return { id: r.id, name: r.name, icon: r.icon, defaultOz: r.default_oz, isCustom: r.is_custom };
}

// Quick-add display order/visibility, independent of insertion order in the
// database (12 oz Water was added after the original seed, so its id sorts
// last - this puts it in the right spot regardless). Hidden entries stay in
// the database untouched; they're just left out of the quick-add menu.
const DRINK_DISPLAY_ORDER: Record<string, number> = {
  "Water (12 oz)": 0,
  Coffee: 1,
  Tea: 2,
  Juice: 3,
};
const HIDDEN_DRINK_NAMES = new Set(["Water", "Soda", "Sports Drink", "Milk"]);
// Display-only relabeling - the underlying row name stays "Water (12 oz)"
// (so it keeps sorting/matching correctly and past log labels are
// unaffected), but the quick-add button just shows "Water" since the
// sublabel underneath it already reads "12 fl oz".
const DRINK_DISPLAY_NAME: Record<string, string> = {
  "Water (12 oz)": "Water",
};

export async function getDrinkTypes(): Promise<DrinkType[]> {
  const result = (await sql`SELECT * FROM drink_types ORDER BY id`) as RawResult;
  return toObjects<DrinkRow>(result)
    .map(mapDrink)
    .filter((d) => !HIDDEN_DRINK_NAMES.has(d.name))
    .sort((a, b) => (DRINK_DISPLAY_ORDER[a.name] ?? 99) - (DRINK_DISPLAY_ORDER[b.name] ?? 99))
    .map((d) => ({ ...d, name: DRINK_DISPLAY_NAME[d.name] ?? d.name }));
}

// ── Food items ─────────────────────────────────────────────────────

interface FoodRow {
  id: number;
  name: string;
  category: string | null;
  serving_label: string;
  oz_per_serving: number;
  source_note: string | null;
}

function mapFood(r: FoodRow): FoodItem {
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    servingLabel: r.serving_label,
    ozPerServing: r.oz_per_serving,
    sourceNote: r.source_note,
  };
}

export async function getFoodItems(): Promise<FoodItem[]> {
  const result = (await sql`SELECT * FROM food_items ORDER BY id`) as RawResult;
  return toObjects<FoodRow>(result).map(mapFood);
}

// ── Logs ───────────────────────────────────────────────────────────

interface LogRow {
  id: number;
  user_id: number;
  entry_type: string;
  reference_id: number | null;
  label: string;
  oz_amount: number;
  logged_at: string;
}

function mapLog(r: LogRow): LogEntry {
  return {
    id: r.id,
    userId: r.user_id,
    entryType: r.entry_type as "drink" | "food",
    referenceId: r.reference_id,
    label: r.label,
    ozAmount: r.oz_amount,
    loggedAt: r.logged_at,
  };
}

/**
 * `dayStartMs` is the start of the caller's LOCAL calendar day (see
 * src/lib/date.ts#localDayStartMs), computed in the browser - this always
 * matches the viewer's own timezone rather than guessing.
 */
export async function getLogsForDay(userId: number, dayStartMs: number): Promise<LogEntry[]> {
  const dayStart = new Date(dayStartMs).toISOString();
  const dayEnd = new Date(dayStartMs + 24 * 60 * 60 * 1000).toISOString();
  const result = (await sql`
    SELECT * FROM logs
    WHERE user_id = ${userId} AND logged_at >= ${dayStart} AND logged_at < ${dayEnd}
    ORDER BY logged_at DESC
  `) as RawResult;
  return toObjects<LogRow>(result).map(mapLog);
}

export async function createLog(input: {
  userId: number;
  entryType: "drink" | "food";
  referenceId: number | null;
  label: string;
  ozAmount: number;
}): Promise<LogEntry> {
  const result = (await sql`
    INSERT INTO logs (user_id, entry_type, reference_id, label, oz_amount)
    VALUES (${input.userId}, ${input.entryType}, ${input.referenceId}, ${input.label}, ${input.ozAmount})
    RETURNING *
  `) as RawResult;
  return mapLog(toObjects<LogRow>(result)[0]);
}

export async function deleteLog(id: number): Promise<void> {
  await sql`DELETE FROM logs WHERE id = ${id}`;
}

/**
 * Roughly the last 90 days of raw entries for a user, plus their current
 * goal. Deliberately NOT bucketed into calendar days here - that happens
 * client-side against the browser's own local calendar (see
 * src/lib/date.ts#localDateKey), otherwise an evening log could land on the
 * wrong day for anyone west of UTC.
 */
const HISTORY_WINDOW_DAYS = 90;

export async function getSummary(
  userId: number
): Promise<{ goal: number; entries: { ozAmount: number; loggedAt: string }[] }> {
  const user = await getProfile(userId);
  if (!user) throw new Error("Profile not found");

  const windowStart = new Date(Date.now() - HISTORY_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const result = (await sql`
    SELECT oz_amount, logged_at FROM logs
    WHERE user_id = ${userId} AND logged_at >= ${windowStart}
  `) as RawResult;
  const entries = toObjects<{ oz_amount: number; logged_at: string }>(result).map((r) => ({
    ozAmount: r.oz_amount,
    loggedAt: r.logged_at,
  }));

  const goal = user.goalOverrideOz ?? user.computedGoalOz;
  return { goal, entries };
}
