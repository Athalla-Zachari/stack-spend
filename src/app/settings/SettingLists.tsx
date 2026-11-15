"use client";

import { Fragment } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { settingSections, type settingSectionConfig } from "@/components/style-config";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/actions/auth";
import { Skeleton } from "@/components/ui/skeleton";

interface SettingListsProps {
	sections?: settingSectionConfig[];
}

export default function SettingLists({
	sections = settingSections,
}: SettingListsProps) {
	return (
		<section
			aria-label="Settings"
			className="flex flex-col gap-2.5 w-full"
		>
			{sections.map((section) => {
				const headingId = `settings-${section.id}-heading`;

				return (
					<Fragment key={section.id}>
						<h2
							id={headingId}
							className="text-sm font-semibold text-subtext px-1"
						>
							{section.title}
						</h2>

						<ul
							aria-labelledby={headingId}
							className="flex flex-col rounded-2xl bg-white shadow-lg divide-y divide-grey300/50 overflow-hidden"
						>
							{section.items.map((item) => {
								const Icon = item.icon;
								return (
									<li key={item.id}>
										<Link
											href={item.path}
											className="min-h-14 px-4 py-3 flex items-center gap-3 hover:bg-mist/70 active:bg-mist transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal"
										>
											<span className="size-10 shrink-0 rounded-xl bg-teal/10 text-teal-deep flex items-center justify-center">
												<Icon className="size-5" aria-hidden="true" />
											</span>
											<span className="flex-1 min-w-0 truncate text-sm sm:text-base font-semibold text-teal-deep">
												{item.label}
											</span>
											<ChevronRight
												className="size-5 shrink-0 text-subtext"
												aria-hidden="true"
											/>
										</Link>
									</li>
								);
							})}
						</ul>
					</Fragment>
				);
			})}

			<section className="w-full py-7">
				<Button
					type="button"
					variant="solid"
					size="lg"
					className="bg-red-700 hover:bg-red-700/90 w-full cursor-pointer"
					onClick={() => logoutAction()}
				>
					Logout
				</Button>
			</section>
		</section>
	);
}

export function SettingListsSkeleton() {
	return (
		<section
			aria-label="Loading settings list"
			className="flex flex-col gap-2.5 w-full"
		>
			{settingSections.map((section) => (
				<Fragment key={section.id}>
					<Skeleton className="h-4 w-36 rounded-md bg-grey300/40 mx-1" />
					<div className="rounded-2xl bg-white shadow-lg divide-y divide-grey300/50 overflow-hidden">
						{section.items.map((item) => (
							<div
								key={item.id}
								className="min-h-14 px-4 py-3 flex items-center gap-3"
							>
								<Skeleton className="size-10 shrink-0 rounded-xl bg-grey300/40" />
								<Skeleton className="h-4 w-28 rounded-md bg-grey300/40 flex-1 max-w-[140px]" />
								<Skeleton className="size-5 shrink-0 rounded-md bg-grey300/40 ml-auto" />
							</div>
						))}
					</div>
				</Fragment>
			))}

			<div className="w-full py-7">
				<Skeleton className="h-12 w-full rounded-lg bg-grey300/40" />
			</div>
		</section>
	);
}
