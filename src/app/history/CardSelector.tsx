"use client";

import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Pocket } from "@/db/schema";
import { PocketCard } from "@/components/PocketCard";

interface CardsProps {
  pockets: Pocket[];
  userName: string;
}

const ALL_POCKETS_ID = "all";

export function CardSelector({ pockets, userName }: CardsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlPocketId = searchParams.get("pocket") ?? ALL_POCKETS_ID;
  const [optimisticPick, setOptimisticPick] = useState<{
    fromUrl: string;
    targetId: string;
  } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const activePocketId =
    optimisticPick && optimisticPick.fromUrl === urlPocketId
      ? optimisticPick.targetId
      : urlPocketId;

  // Gabungkan kartu virtual "All Pockets" di urutan pertama beserta seluruh pocket user
  const allCards = useMemo<Pocket[]>(() => {
    const totalBalance = pockets.reduce(
      (sum, item) => sum + Number(item.balance || 0),
      0,
    );

    const allPocketsCard: Pocket = {
      id: ALL_POCKETS_ID,
      userId: pockets[0]?.userId ?? ALL_POCKETS_ID,
      name: "All Pockets",
      balance: String(totalBalance),
      createdAt: null,
    };

    return [allPocketsCard, ...pockets];
  }, [pockets]);

  const resolvedActiveId = useMemo(() => {
    const exists = allCards.some((c) => c.id === activePocketId);
    return exists ? activePocketId : ALL_POCKETS_ID;
  }, [allCards, activePocketId]);

  const stackOrderMap = useMemo(() => {
    const map = new Map<string, number>();
    map.set(resolvedActiveId, 0);

    let order = 1;
    for (const card of allCards) {
      if (card.id !== resolvedActiveId) {
        map.set(card.id, order++);
      }
    }
    return map;
  }, [allCards, resolvedActiveId]);

  const handleCardInteraction = (pocketId: string) => {
    if (!isExpanded) {
      setIsExpanded(true);
      return;
    }

    setOptimisticPick({ fromUrl: urlPocketId, targetId: pocketId });
    setIsExpanded(false);

    const params = new URLSearchParams(searchParams.toString());
    if (pocketId === ALL_POCKETS_ID) {
      params.delete("pocket");
    } else {
      params.set("pocket", pocketId);
    }

    const queryString = params.toString();
    router.push(queryString ? `/history?${queryString}` : "/history", {
      scroll: false,
    });
  };

  const handleCardKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    pocketId: string,
  ) => {
    if (event.key === "Escape" && isExpanded) {
      event.preventDefault();
      setIsExpanded(false);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      // Ignore keyboard activation bubbling up from the inner visibility button.
      if (event.target !== event.currentTarget) return;
      event.preventDefault();
      handleCardInteraction(pocketId);
    }
  };

  return (
    <section
      aria-label="Filter history by pocket"
      className={`relative w-full max-w-[320px] mx-auto flex flex-col items-center ${
        isExpanded ? "gap-4 pb-2" : "pb-7"
      }`}
    >
      {allCards.map((pocket, index) => {
        const stackOrder = stackOrderMap.get(pocket.id) ?? 0;
        const isFrontCard = stackOrder === 0;
        const isHiddenInStack = !isExpanded && !isFrontCard;
        const clampedOrder = Math.min(stackOrder, 3);

        const scale = isExpanded ? 1 : 1 - clampedOrder * 0.045;
        const yOffset = isExpanded ? 0 : clampedOrder * 13;
        const opacity = isExpanded ? 1 : stackOrder > 3 ? 0 : 1;
        const zIndex = isExpanded ? 10 : allCards.length + 10 - stackOrder;

        return (
          <motion.div
            key={pocket.id}
            layout
            initial={false}
            animate={{
              scale,
              y: yOffset,
              opacity,
              zIndex,
            }}
            transition={{
              type: "spring",
              stiffness: 360,
              damping: 30,
            }}
            style={{
              transformOrigin: "bottom center",
            }}
            role="button"
            tabIndex={isHiddenInStack ? -1 : 0}
            aria-expanded={isExpanded}
            aria-hidden={isHiddenInStack || undefined}
            inert={isHiddenInStack}
            aria-label={
              isExpanded
                ? `Select ${pocket.name} pocket`
                : `Active pocket: ${pocket.name}. Expand pocket list`
            }
            onClick={() => handleCardInteraction(pocket.id)}
            onKeyDown={(event) => handleCardKeyDown(event, pocket.id)}
            className={`w-full rounded-xl cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-deep ${
              isExpanded
                ? `relative ${
                    isFrontCard
                      ? "ring-3 ring-teal-deep shadow-xl"
                      : "hover:scale-[1.01]"
                  }`
                : isFrontCard
                  ? "relative"
                  : "absolute top-0 inset-x-0 pointer-events-none"
            }`}
          >
            <PocketCard
              pocket={pocket}
              userName={userName}
              index={index}
              isVisible={isVisible}
              size="sm"
              onToggleVisibility={() => setIsVisible((prev) => !prev)}
            />
          </motion.div>
        );
      })}
    </section>
  );
}
