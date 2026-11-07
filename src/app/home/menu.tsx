import { PiggyBank, BanknoteX, ReceiptText, LucideIcon } from "lucide-react";

export type menuConfig = {
    id: number;
    label: string;
    path: string;
    icon: LucideIcon;
}

export const menuList: menuConfig[] = [
    { id: 1, label: "Savings", path: "/transfer", icon: PiggyBank },
    { id: 2, label: "Debts", path: "/debts", icon: BanknoteX },
    { id: 3, label: "Bills", path: "/transactions/bills", icon: ReceiptText },
]

