"use client";

import { useCallback, useState } from "react";
import { Plus, Trash2, WalletMinimal } from "lucide-react";
import type { Pocket } from "@/db/schema";
import { PocketCard, PocketCardSkeleton } from "@/components/PocketCard";
import {
  ElasticScroll,
  ElasticScrollItem,
} from "@/components/ui/elastic-scroll";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toast, useActionToast } from "@/components/ui/toast";
import { getPocketBadgeTone, getPocketInitials } from "@/lib/pockets";
import { AddPocketDrawer } from "./AddPocketDrawer";
import { DisablePocketDialog } from "./DisablePocketDialog";

interface PocketsManagerProps {
  pockets: Pocket[];
  userName: string;
}

export default function PocketsManager({
  pockets,
  userName,
}: PocketsManagerProps) {
  const [isBalanceVisible, setIsBalanceVisible] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [pocketToDisable, setPocketToDisable] = useState<Pocket | null>(null);
  const { toast, triggerToast, closeToast } = useActionToast(null);

  const handleCloseAdd = useCallback(() => {
    setIsAddOpen(false);
  }, []);

  const handleCreated = useCallback(
    (pocketName: string) => {
      setIsAddOpen(false);
      triggerToast(`Pocket "${pocketName}" added.`, "success");
    },
    [triggerToast],
  );

  const handleCloseDisable = useCallback(() => {
    setPocketToDisable(null);
  }, []);

  const handleDisabled = useCallback(
    (pocketName: string) => {
      setPocketToDisable(null);
      triggerToast(`Pocket "${pocketName}" disabled.`, "success");
    },
    [triggerToast],
  );

  return (
		<div className="flex-1 flex flex-col gap-5">
		{pockets.length > 0 && (
			<section aria-label="Pocket cards preview">
			<ElasticScroll className="-mx-4 px-4 w-[calc(100%+2rem)] gap-4 py-1">
				{pockets.map((pocket, index) => (
				<ElasticScrollItem key={pocket.id} className="w-full">
					<PocketCard
					pocket={pocket}
					userName={userName}
					index={index}
					isVisible={isBalanceVisible}
					onToggleVisibility={() =>
						setIsBalanceVisible((prev) => !prev)
					}
					/>
				</ElasticScrollItem>
				))}
			</ElasticScroll>
			</section>
		)}

		<section aria-labelledby="pockets-count-heading" className="flex flex-col gap-2.5">
			<div className="flex items-center justify-between text-sm font-semibold text-subtext px-1">
				<h2 id="pockets-count-heading">Pocket Lists</h2>
				<span>
					{pockets.length} entries
				</span>
			</div>

			{pockets.length > 0 ? (
			<ul
				role="list"
				aria-labelledby="pockets-count-heading"
				className="flex flex-col rounded-2xl bg-white shadow-lg border border-grey300/40 divide-y divide-grey300/50 overflow-hidden"
			>
				{pockets.map((pocket, index) => {
				const initials = getPocketInitials(pocket.name);
				const tone = getPocketBadgeTone(index);

				return (
					<li
					key={pocket.id}
					className="min-h-16 px-4 py-3 flex items-center gap-3.5"
					>
					<span
						aria-hidden="true"
						className={`size-10 shrink-0 rounded-xl flex items-center justify-center text-sm font-bold tracking-tight ${tone.bgClass} ${tone.textClass}`}
					>
						{initials}
					</span>

					<span className="flex-1 min-w-0 truncate text-base font-bold text-teal-deep">
						{pocket.name}
					</span>

					<Button
						type="button"
						variant="icon"
						size="icon"
						aria-label={`Disable ${pocket.name} pocket`}
						onClick={() => setPocketToDisable(pocket)}
						className="size-11 min-h-11 min-w-11 shrink-0 rounded-xl bg-error/10 text-error hover:bg-error/15 active:bg-error/20 cursor-pointer flex items-center justify-center focus-visible:ring-2 focus-visible:ring-teal"
					>
						<Trash2 className="size-4.5" aria-hidden="true" />
					</Button>
					</li>
				);
				})}
			</ul>
			) : (
			<div className="rounded-2xl bg-white shadow-lg border border-grey300/40 p-6 flex flex-col items-center text-center gap-2.5">
				<span className="size-12 rounded-2xl bg-teal/10 text-teal-deep flex items-center justify-center">
				<WalletMinimal className="size-6" aria-hidden="true" />
				</span>
				<p className="text-base font-bold text-teal-deep">
				No active pockets yet
				</p>
				<p className="text-sm text-subtext max-w-xs">
				Add a pocket for your bank account, e-wallet, or cash to start
				tracking balances.
				</p>
			</div>
			)}
		</section>

		<div className="mt-auto pt-4 pb-2">
			<Button
			type="button"
			variant="solid"
			size="lg"
			onClick={() => setIsAddOpen(true)}
			className="w-full min-h-12 rounded-xl bg-teal-deep hover:bg-teal-mid active:bg-teal-deep text-white font-semibold text-base shadow-sm cursor-pointer gap-2"
			>
			<Plus className="size-5" aria-hidden="true" />
			<span>Add pocket</span>
			</Button>
		</div>

		<AddPocketDrawer
			isOpen={isAddOpen}
			onClose={handleCloseAdd}
			onCreated={handleCreated}
		/>

		<DisablePocketDialog
			pocket={pocketToDisable}
			onClose={handleCloseDisable}
			onDisabled={handleDisabled}
		/>

		{toast.isOpen && (
			<Toast
			key={toast.id}
			variant={toast.variant}
			position="top-center"
			isOpen={toast.isOpen}
			onClose={closeToast}
			message={toast.message}
			/>
		)}
		</div>
	);
}

export function PocketsManagerSkeleton() {
	return (
		<div
		aria-label="Loading pockets"
		className="flex-1 flex flex-col gap-5"
		>
		<PocketCardSkeleton />

		<div className="flex flex-col gap-2.5">
			<Skeleton className="h-4 w-20 rounded-md bg-grey300/40 mx-1" />
			<div className="rounded-2xl bg-white shadow-lg border border-grey300/40 divide-y divide-grey300/50 overflow-hidden">
			{[1, 2, 3, 4].map((row) => (
				<div
				key={row}
				className="min-h-16 px-4 py-3 flex items-center gap-3.5"
				>
				<Skeleton className="size-10 shrink-0 rounded-xl bg-grey300/40" />
				<Skeleton className="h-4 w-28 rounded-md bg-grey300/40 flex-1 max-w-[140px]" />
				<Skeleton className="size-11 shrink-0 rounded-xl bg-grey300/40 ml-auto" />
				</div>
			))}
			</div>
		</div>

		<div className="mt-auto pt-4 pb-2">
			<Skeleton className="h-12 w-full rounded-2xl bg-grey300/40" />
		</div>
		</div>
	);
}
