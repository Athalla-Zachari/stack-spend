import { CardContainerSkeleton } from "./CardContainer";

export default function HomeLoading() {
  return (
    <main className="w-full flex flex-col bg-beige">
      <CardContainerSkeleton />
    </main>
  );
}

