import { TransferContainerSkeleton } from "./TransferContainer";

export default function TransferLoading() {
	return (
		<main className="flex-1 flex flex-col justify-end">
			<TransferContainerSkeleton />
		</main>
	);
}
