"use client";

import { useState } from "react";
import type { Pocket } from "@/db/schema";
import {
  ElasticScroll,
  ElasticScrollItem,
} from "@/components/ui/elastic-scroll";
import { PocketCard } from "@/components/PocketCard";

interface CardsProps {
  pockets: Pocket[];
  userName: string;
}

export default function Cards({ pockets, userName }: CardsProps) {
	const [isVisible, setIsVisible] = useState(false);

	return (
		<ElasticScroll fullBleed className="gap-4 py-3">
		{pockets.map((pocket, index) => (
			<ElasticScrollItem key={pocket.id} className="w-full">
			<PocketCard
				pocket={pocket}
				userName={userName}
				index={index}
				isVisible={isVisible}
				onToggleVisibility={() => setIsVisible((prev) => !prev)}
			/>
			</ElasticScrollItem>
		))}
		</ElasticScroll>
	);
}
