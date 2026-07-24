export type PackingCategory = "docs" | "tech" | "clothing" | "health" | "other";

export interface PackingItem {
  id: string;
  category: PackingCategory;
}

export const PACKING_CATEGORIES: PackingCategory[] = ["docs", "tech", "clothing", "health", "other"];

export const PACKING_ITEMS: PackingItem[] = [
  { id: "passport", category: "docs" },
  { id: "bank-cards", category: "docs" },
  { id: "cash-yen", category: "docs" },
  { id: "travel-insurance", category: "docs" },
  { id: "international-license", category: "docs" },
  { id: "esim-wifi", category: "tech" },
  { id: "suica-card", category: "tech" },
  { id: "plug-adapter", category: "tech" },
  { id: "powerbank", category: "tech" },
  { id: "power-strip", category: "tech" },
  { id: "walking-shoes", category: "clothing" },
  { id: "water-shoes", category: "clothing" },
  { id: "swimsuit", category: "clothing" },
  { id: "socks", category: "clothing" },
  { id: "pants", category: "clothing" },
  { id: "tshirts", category: "clothing" },
  { id: "underwear", category: "clothing" },
  { id: "light-jacket", category: "clothing" },
  { id: "rain-jacket", category: "clothing" },
  { id: "pajamas", category: "clothing" },
  { id: "laundry-bag", category: "clothing" },
  { id: "uv-shirt", category: "clothing" },
  { id: "phone-waterproof-case", category: "health" },
  { id: "microfiber-towel", category: "health" },
  { id: "personal-medication", category: "health" },
  { id: "first-aid-kit", category: "health" },
  { id: "motion-sickness-pills", category: "health" },
  { id: "hand-towel", category: "health" },
  { id: "tissues-wipes", category: "health" },
  { id: "reef-safe-sunscreen", category: "health" },
  { id: "aloe-vera-gel", category: "health" },
  { id: "day-backpack", category: "other" },
  { id: "trash-bags", category: "other" },
  { id: "eki-stamp-notebook", category: "other" },
  { id: "coin-purse", category: "other" },
];
