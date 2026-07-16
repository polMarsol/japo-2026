import type { IconName } from "../components/Icon";

export type ExpenseCategory =
  | "food"
  | "transport"
  | "accommodation"
  | "activities"
  | "shopping"
  | "other";

export const EXPENSE_CATEGORIES: { key: ExpenseCategory; icon: IconName }[] = [
  { key: "food", icon: "restaurant" },
  { key: "transport", icon: "directions_bus" },
  { key: "accommodation", icon: "hotel" },
  { key: "activities", icon: "local_activity" },
  { key: "shopping", icon: "shopping_bag" },
  { key: "other", icon: "payments" },
];

export function categoryIcon(key: string): IconName {
  return EXPENSE_CATEGORIES.find((c) => c.key === key)?.icon ?? "payments";
}
