"use client";

import Image, { type StaticImageData } from "next/image";
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

				return (
					<Button
						key={pocket.id}
						type="button"
						variant="outline"
						onClick={() => onSelectPocket(pocket.id)}
						aria-pressed={isSelected}
						className={`h-9 py-2 transition-all cursor-pointer ${
							isSelected
								? "border-teal-mid bg-teal/10 font-semibold"
								: "opacity-70 hover:opacity-100"
						}`}
					>
						{logo ? (
							<Image
								src={logo}
								alt={`${pocket.name}-logo`}
								className="h-full w-auto object-contain"
							/>
						) : (
							<span className="text-xs font-semibold uppercase text-teal-deep">
								{pocket.name}
							</span>
						)}
					</Button>
				);
			})}
		</section>
	);
}
