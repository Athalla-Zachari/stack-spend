import {
  PiggyBank,
  BanknoteX,
  ReceiptText,
  CalendarClock,
  CircleDollarSign,
  ArrowLeftRight,
  Hamburger,
  ShoppingBag,
  Wrench,
  Gamepad2,
  Banknote,
  CircleEllipsis,
  Utensils,
  Car,
  Coffee,
  HeartPulse,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";

export type menuConfig = {
  id: number;
  label: string;
  path: string;
  icon: LucideIcon;
};

export const menuList: menuConfig[] = [
  { id: 1, label: "Savings", path: "/transactions", icon: PiggyBank },
  { id: 2, label: "Debts", path: "/debts", icon: BanknoteX },
  { id: 3, label: "Bills", path: "/transactions/bills", icon: ReceiptText },
  { id: 4, label: "History", path: "/history", icon: CalendarClock },
];

export type historyConfig = {
  icon: LucideIcon;
  bgColor: string;
  iconColor: string;
};

export const defaultHistoryList: historyConfig = {
  icon: CircleEllipsis,
  bgColor: "bg-grey300",
  iconColor: "text-charcoal",
};

export const historyConfigMap: Record<string, historyConfig> = {
  // Food & Beverage
  food: { icon: Utensils, bgColor: "bg-aqua", iconColor: "text-teal-deep" },
  coffee: { icon: Coffee, bgColor: "bg-warning", iconColor: "text-teal-deep" },
  beverages: { icon: Hamburger, bgColor: "bg-aqua-light", iconColor: "text-teal-deep" },
  groceries: { icon: ShoppingBag, bgColor: "bg-aqua-light", iconColor: "text-teal-deep" },

  // Transport
  transport: { icon: Car, bgColor: "bg-violet", iconColor: "text-white" },
  transportation: { icon: Car, bgColor: "bg-violet", iconColor: "text-white" },

  // Entertainment & Shopping
  entertainment: { icon: Gamepad2, bgColor: "bg-aqua-light", iconColor: "text-teal-deep" },
  shopping: { icon: ShoppingBag, bgColor: "bg-aqua-light", iconColor: "text-teal-deep" },

  // Financial & Income
  salary: { icon: CircleDollarSign, bgColor: "bg-lime", iconColor: "text-teal-deep" },
  transfer: { icon: ArrowLeftRight, bgColor: "bg-lime", iconColor: "text-teal-deep" },
  debts: { icon: BanknoteX, bgColor: "bg-error", iconColor: "text-white" },

  // Utilities & Bills
  bills: { icon: ReceiptText, bgColor: "bg-warning", iconColor: "text-teal-deep" },
  maintenance: { icon: Wrench, bgColor: "bg-warning", iconColor: "text-teal-deep" },
  withdrawal: { icon: Banknote, bgColor: "bg-warning", iconColor: "text-teal-deep" },

  // Health & Education
  health: { icon: HeartPulse, bgColor: "bg-green", iconColor: "text-white" },
  education: { icon: GraduationCap, bgColor: "bg-violet", iconColor: "text-white" },
};

export const fallbackCategoryPalette: string[] = [
  "bg-aqua",
  "bg-violet",
  "bg-warning",
  "bg-teal",
  "bg-pink",
  "bg-green",
  "bg-lime",
  "bg-teal-mid",
];

export function getCategoryConfig(categoryName?: string | null): historyConfig {
  if (!categoryName) return defaultHistoryList;
  const key = categoryName.trim().toLowerCase();
  return historyConfigMap[key] ?? defaultHistoryList;
}

export function getCategoryColor(
  categoryName?: string | null,
  fallbackIndex = 0,
): string {
  if (!categoryName) {
    return fallbackCategoryPalette[fallbackIndex % fallbackCategoryPalette.length];
  }
  const key = categoryName.trim().toLowerCase();
  const config = historyConfigMap[key];
  if (config && config.bgColor && config.bgColor !== defaultHistoryList.bgColor) {
    return config.bgColor;
  }
  return fallbackCategoryPalette[fallbackIndex % fallbackCategoryPalette.length];
}
