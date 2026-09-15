import {
  pgTable,
  serial,
  varchar,
  text,
  real,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

// Up to 4 profiles are enforced in application logic (see app/api/profiles/route.ts),
// not as a DB constraint, so the cap can be changed later without a migration.
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  avatarColor: varchar("avatar_color", { length: 20 }).notNull().default("#38bdf8"),
  gender: varchar("gender", { length: 20 }).notNull(), // 'male' | 'female' | 'other'
  heightIn: real("height_in").notNull(),
  weightLb: real("weight_lb").notNull(),
  computedGoalOz: real("computed_goal_oz").notNull(),
  goalOverrideOz: real("goal_override_oz"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const drinkTypes = pgTable("drink_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  icon: varchar("icon", { length: 10 }).notNull().default("💧"),
  defaultOz: real("default_oz").notNull().default(8),
  isCustom: integer("is_custom").notNull().default(0),
});

export const foodItems = pgTable("food_items", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 80 }).notNull(),
  category: varchar("category", { length: 40 }),
  servingLabel: varchar("serving_label", { length: 60 }).notNull(),
  ozPerServing: real("oz_per_serving").notNull(),
  sourceNote: text("source_note"),
});

export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  entryType: varchar("entry_type", { length: 10 }).notNull(), // 'drink' | 'food'
  referenceId: integer("reference_id"),
  label: varchar("label", { length: 80 }).notNull(),
  ozAmount: real("oz_amount").notNull(),
  loggedAt: timestamp("logged_at", { withTimezone: true }).defaultNow().notNull(),
});
