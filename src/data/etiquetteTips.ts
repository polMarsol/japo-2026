// El text (títol + cos) viu a resources.ts sota etiquette.tips.<id>. Aquí
// només hi ha l'estructura (categoria + icona), igual que emergencyPhrases.ts.
import type { IconName } from "../components/Icon";

export type EtiquetteCategory = "food" | "money" | "transport" | "onsen" | "shoes" | "social" | "shrines";

export interface EtiquetteCategoryDef {
  id: EtiquetteCategory;
  icon: IconName;
}

export const ETIQUETTE_CATEGORIES: EtiquetteCategoryDef[] = [
  { id: "food", icon: "restaurant" },
  { id: "money", icon: "payments" },
  { id: "transport", icon: "train" },
  { id: "onsen", icon: "onsen" },
  { id: "shoes", icon: "footprint" },
  { id: "social", icon: "handshake" },
  { id: "shrines", icon: "temple_buddhist" },
];

export interface EtiquetteTip {
  id: string;
  category: EtiquetteCategory;
}

export const ETIQUETTE_TIPS: EtiquetteTip[] = [
  // food
  { id: "chopsticks-vertical", category: "food" },
  { id: "chopsticks-pass", category: "food" },
  { id: "chopsticks-rub", category: "food" },
  { id: "hashioki", category: "food" },
  { id: "slurp-noodles", category: "food" },
  { id: "pour-drinks", category: "food" },
  { id: "itadakimasu", category: "food" },

  // money
  { id: "no-tipping", category: "money" },
  { id: "money-tray", category: "money" },

  // transport
  { id: "phone-silent", category: "transport" },
  { id: "backpack-front", category: "transport" },
  { id: "escalator-side", category: "transport" },
  { id: "no-eating-train", category: "transport" },

  // onsen
  { id: "wash-before", category: "onsen" },
  { id: "no-swimsuit", category: "onsen" },
  { id: "small-towel", category: "onsen" },
  { id: "onsen-tattoos", category: "onsen" },

  // shoes
  { id: "genkan", category: "shoes" },
  { id: "tatami-no-shoes", category: "shoes" },
  { id: "toilet-slippers", category: "shoes" },

  // social
  { id: "bow", category: "social" },
  { id: "no-hugs", category: "social" },
  { id: "no-walking-eating", category: "social" },
  { id: "queueing", category: "social" },
  { id: "quiet-voice", category: "social" },

  // shrines
  { id: "torii-side", category: "shrines" },
  { id: "temizuya", category: "shrines" },
  { id: "hats-off", category: "shrines" },
  { id: "geisha-photos", category: "shrines" },
];
