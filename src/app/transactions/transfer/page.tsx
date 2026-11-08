import { Suspense } from "react";
import { getUserPockets } from "@/db/queries";
import TransferContainer, {
	TransferContainerSkeleton,
} from "./TransferContainer";

async function TransferSection() {
	const userPockets = await getUserPockets();

	return <TransferContainer pockets={userPockets} />;
}

export default function TransferPage() {
	return (
		<main className="flex-1 flex flex-col justify-end">
			<Suspense fallback={<TransferContainerSkeleton />}>
				<TransferSection />
			</Suspense>
		</main>
	);
}
