"use client";

import Image, { type StaticImageData } from "next/image";
import { Banknote, type LucideIcon } from "lucide-react";
import type { Pocket } from "@/db/schema";
import { Button } from "@/components/ui/button";

import bcaLogo from "../../public/assets/BCA.webp";
import bniLogo from "../../public/assets/BNI.webp";
import mandiriLogo from "../../public/assets/mandiri.webp";
import spayLogo from "../../public/assets/spay.webp";

export const POCKET_LOGO_MAP: Record<string, StaticImageData> = {
	bca: bcaLogo,
	bni: bniLogo,
	mandiri: mandiriLogo,
	spay: spayLogo,
};

export const POCKET_ICON_MAP: Record<string, LucideIcon> = {
	cash: Banknote,
};

export interface PocketSelectorProps {
	pockets: Pocket[];
	selectedPocketId: string;
	onSelectPocket: (pocketId: string) => void;
	className?: string;
}

export function PocketSelector({
	pockets,
	selectedPocketId,
	onSelectPocket,
	className = "",
}: PocketSelectorProps) {
	return (
		<section
			aria-label="Pilih Pocket Sumber Dana"
			className={`flex items-center gap-2 overflow-x-auto pb-1 shrink-0 ${className}`}
		>
			{pockets.map((pocket) => {
				const isSelected = selectedPocketId === pocket.id;
				const logo = POCKET_LOGO_MAP[pocket.name.toLowerCase()];
				const PocketIcon = POCKET_ICON_MAP[pocket.name.toLowerCase()];

				return (
					<Button
						key={pocket.id}
						type="button"
						variant="outline"
						onClick={() => onSelectPocket(pocket.id)}
						aria-pressed={isSelected}
						className={`min-h-11 h-11 min-w-11 px-3 py-2 shrink-0 transition-all cursor-pointer ${
							isSelected
								? "border-teal-mid bg-teal/10 ring-1 ring-teal-mid font-semibold"
								: "border-grey300 opacity-80 hover:opacity-100"
						}`}
					>
						{logo ? (
							<Image
								src={logo}
								alt={`${pocket.name}-logo`}
								className="h-5 w-auto object-contain"
							/>
						) : (
							<span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-teal-deep">
								{PocketIcon && (
									<PocketIcon
										className="size-4 shrink-0 text-teal-deep"
										aria-hidden="true"
									/>
								)}
								<span>{pocket.name}</span>
							</span>
						)}
					</Button>
				);
			})}
		</section>
	);
}
