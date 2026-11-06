import type { Metadata } from "next";
import "./globals.css";
import { DM_Sans } from "next/font/google";
import { cn } from "@/lib/utils";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "StackSpend — Daily Expense Tracker",
  description: "Track and manage your daily expenses effortlessly.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
	return (
		<html lang="en" className={cn("h-full antialiased", "font-sans", dmSans.variable)}>
		<body className="min-h-full flex flex-col bg-background text-foreground font-sans">
			{children}
		</body>
		</html>
	);
}