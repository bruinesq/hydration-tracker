// One-off admin script: adds any new drink types / food items to Neon.
// Not part of the deployed app - run by hand from your own machine with
// `npm run seed` whenever DRINKS/FOODS below gain new entries. Safe to
// re-run any time: it only inserts rows whose `name` isn't already there,
// so it never touches existing rows, overrides, or logged history.
import { neon } from "@neondatabase/serverless";

const DATABASE_URL =
  "postgresql://neondb_owner:npg_hQTIor59Ewte@ep-solitary-cell-ar9bcc0f-pooler.c-4.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const sql = neon(DATABASE_URL);

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

const FOODS = [
  { name: "Cooked White Rice", category: "Grains", servingLabel: "1 cup", ozPerServing: 3.5, sourceNote: "Cooked rice is roughly 68-70% water by weight." },
  { name: "Brewed Coffee", category: "Beverages", servingLabel: "8 fl oz cup", ozPerServing: 7.5, sourceNote: "Counted near 1:1 with its volume; moderate caffeine has only a minor diuretic effect." },
  { name: "Vietnamese Pho (bowl)", category: "Soups", servingLabel: "1 typical bowl", ozPerServing: 20, sourceNote: "Broth-heavy soup; noodles also retain significant water. Varies by bowl size." },
  { name: "Ramen (bowl w/ broth)", category: "Soups", servingLabel: "1 typical bowl", ozPerServing: 16, sourceNote: "Varies by broth style and how much is served." },
  { name: "Watermelon", category: "Fruit", servingLabel: "1 cup", ozPerServing: 4.5, sourceNote: "Roughly 92% water by weight." },
  { name: "Chicken Soup", category: "Soups", servingLabel: "1 cup", ozPerServing: 7, sourceNote: "Mostly broth." },
  { name: "Yogurt", category: "Dairy", servingLabel: "1 cup", ozPerServing: 6, sourceNote: "Roughly 85% water by weight." },
  { name: "Orange", category: "Fruit", servingLabel: "1 medium", ozPerServing: 3, sourceNote: "Roughly 87% water by weight." },
  { name: "Cucumber", category: "Vegetables", servingLabel: "1 cup sliced", ozPerServing: 4, sourceNote: "Roughly 96% water by weight - one of the highest of any food." },
  { name: "Apple", category: "Fruit", servingLabel: "1 medium", ozPerServing: 2.5, sourceNote: "Roughly 86% water by weight." },
];

async function seedDrinks() {
  const existing = await sql`SELECT name FROM drink_types`;
  const existingNames = new Set(existing.map((r) => r.name));
  const missing = DRINKS.filter((item) => !existingNames.has(item.name));

  if (missing.length === 0) {
    console.log(`Drink types: all ${DRINKS.length} already present, nothing to add.`);
    return;
  }
  for (const item of missing) {
    await sql`INSERT INTO drink_types (name, icon, default_oz, is_custom) VALUES (${item.name}, ${item.icon}, ${item.defaultOz}, 0)`;
  }
  console.log(`Drink types: added ${missing.length} new (${missing.map((m) => m.name).join(", ")}).`);
}

async function seedFoods() {
  const existing = await sql`SELECT name FROM food_items`;
  const existingNames = new Set(existing.map((r) => r.name));
  const missing = FOODS.filter((item) => !existingNames.has(item.name));

  if (missing.length === 0) {
    console.log(`Food items: all ${FOODS.length} already present, nothing to add.`);
    return;
  }
  for (const item of missing) {
    await sql`INSERT INTO food_items (name, category, serving_label, oz_per_serving, source_note) VALUES (${item.name}, ${item.category}, ${item.servingLabel}, ${item.ozPerServing}, ${item.sourceNote})`;
  }
  console.log(`Food items: added ${missing.length} new (${missing.map((m) => m.name).join(", ")}).`);
}

async function main() {
  await seedDrinks();
  await seedFoods();
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
