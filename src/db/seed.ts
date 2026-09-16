import { db } from "./index";
import { drinkTypes, foodItems } from "./schema";

const DRINKS = [
  { name: "Water", icon: "💧", defaultOz: 8 },
  { name: "Water (12 oz)", icon: "💧", defaultOz: 12 },
  { name: "Coffee", icon: "☕", defaultOz: 8 },
  { name: "Tea", icon: "🍵", defaultOz: 8 },
  { name: "Soda", icon: "🥤", defaultOz: 12 },
  { name: "Juice", icon: "🧃", defaultOz: 8 },
  { name: "Sports Drink", icon: "🏃", defaultOz: 16 },
  { name: "Milk", icon: "🥛", defaultOz: 8 },
];

// Practical estimates for a personal tracker, not lab-grade nutrition facts.
// Each row keeps a short source note so the numbers stay traceable and easy
// to double-check or tune later.
const FOODS = [
  {
    name: "Cooked White Rice",
    category: "Grains",
    servingLabel: "1 cup",
    ozPerServing: 3.5,
    sourceNote: "Cooked rice is roughly 68-70% water by weight.",
  },
  {
    name: "Brewed Coffee",
    category: "Beverages",
    servingLabel: "8 fl oz cup",
    ozPerServing: 7.5,
    sourceNote: "Counted near 1:1 with its volume; moderate caffeine has only a minor diuretic effect.",
  },
  {
    name: "Vietnamese Pho (bowl)",
    category: "Soups",
    servingLabel: "1 typical bowl",
    ozPerServing: 20,
    sourceNote: "Broth-heavy soup; noodles also retain significant water. Varies by bowl size.",
  },
  {
    name: "Ramen (bowl w/ broth)",
    category: "Soups",
    servingLabel: "1 typical bowl",
    ozPerServing: 16,
    sourceNote: "Varies by broth style and how much is served.",
  },
  {
    name: "Watermelon",
    category: "Fruit",
    servingLabel: "1 cup",
    ozPerServing: 4.5,
    sourceNote: "Roughly 92% water by weight.",
  },
  {
    name: "Chicken Soup",
    category: "Soups",
    servingLabel: "1 cup",
    ozPerServing: 7,
    sourceNote: "Mostly broth.",
  },
  {
    name: "Yogurt",
    category: "Dairy",
    servingLabel: "1 cup",
    ozPerServing: 6,
    sourceNote: "Roughly 85% water by weight.",
  },
  {
    name: "Orange",
    category: "Fruit",
    servingLabel: "1 medium",
    ozPerServing: 3,
    sourceNote: "Roughly 87% water by weight.",
  },
  {
    name: "Cucumber",
    category: "Vegetables",
    servingLabel: "1 cup sliced",
    ozPerServing: 4,
    sourceNote: "Roughly 96% water by weight - one of the highest of any food.",
  },
  {
    name: "Apple",
    category: "Fruit",
    servingLabel: "1 medium",
    ozPerServing: 2.5,
    sourceNote: "Roughly 86% water by weight.",
  },
];

/**
 * Inserts only the rows whose `name` isn't already present, so this script
 * can be re-run safely after adding new items to DRINKS/FOODS above -
 * existing rows (and any edits made to them later via the app) are left
 * alone.
 */
async function seedMissing<T extends { name: string }>(
  table: typeof drinkTypes | typeof foodItems,
  items: T[],
  label: string
) {
  const existing = await db.select({ name: table.name }).from(table);
  const existingNames = new Set(existing.map((r) => r.name));
  const missing = items.filter((item) => !existingNames.has(item.name));

  if (missing.length === 0) {
    console.log(`${label}: all ${items.length} already present, nothing to add.`);
    return;
  }

  await db.insert(table).values(missing as never);
  console.log(`${label}: added ${missing.length} new (${missing.map((m) => m.name).join(", ")}).`);
}

async function main() {
  await seedMissing(drinkTypes, DRINKS.map((d) => ({ ...d, isCustom: 0 })), "Drink types");
  await seedMissing(foodItems, FOODS, "Food items");
}

main()
  .then(() => {
    console.log("Seed complete.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
