import { Skeleton } from "@/components/ui/skeleton";

export default function DebtsContainerSkeleton() {
	return (
		<section className="w-full flex-1 flex flex-col gap-4 px-7 py-8 bg-white rounded-tl-4xl rounded-tr-4xl min-h-[80vh]">
			<div className="flex justify-between items-center">
				<Skeleton className="h-6 w-28" />
				<Skeleton className="h-9 w-24 rounded-lg" />
			</div>
			<div className="flex flex-col gap-3">
				{[1, 2, 3].map((item) => (
					<Skeleton key={item} className="h-20 w-full rounded-2xl" />
				))}
			</div>
		</section>
	);
}
