import { PiggyBank, BanknoteX, ReceiptText, LucideIcon, CalendarClock } from "lucide-react";
import {
  CircleDollarSign,
  ArrowLeftRight,
  Hamburger,
  ShoppingBag,
  Wrench,
  Gamepad2,
  Banknote,
  CircleEllipsis,
} from "lucide-react"

export type menuConfig = {
    id: number;
    label: string;
    path: string;
    icon: LucideIcon;
}

export const menuList: menuConfig[] = [
    { id: 1, label: "Savings", path: "/transactions", icon: PiggyBank },
    { id: 2, label: "Debts", path: "/debts", icon: BanknoteX },
    { id: 3, label: "Bills", path: "/transactions/bills", icon: ReceiptText },
    { id: 4, label: "History", path: "/history", icon: CalendarClock },
]

export type historyConfig = {
    icon: LucideIcon;
    bgColor: string;
    iconColor: string;
}

export const defaultHistoryList: historyConfig = {
    icon: CircleEllipsis,
    bgColor: "bg-grey300",
    iconColor: "text-charcoal"
}

export const historyConfigMap: Record<string, historyConfig> = {
    groceries:
     {icon: ShoppingBag, bgColor: "bg-aqua-light", iconColor: "text-teal-deep"},
    beverages:
     {icon: Hamburger, bgColor: "bg-aqua-light", iconColor: "text-teal-deep"},
    entertainment:
      {icon: Gamepad2, bgColor: "bg-aqua-light", iconColor: "text-teal-deep"},
    salary:
     {icon: CircleDollarSign, bgColor: "bg-lime", iconColor: "text-teal-deep"},
    transfer:
     {icon: ArrowLeftRight, bgColor: "bg-lime", iconColor: "text-teal-deep"},
    bills:
     {icon: ReceiptText, bgColor: "bg-warning", iconColor: "text-teal-deep"},
    maintenance:
     {icon: Wrench, bgColor: "bg-warning", iconColor: "text-teal-deep"},
    withdrawal:
     {icon: Banknote, bgColor: "bg-warning", iconColor: "text-teal-deep"},
}