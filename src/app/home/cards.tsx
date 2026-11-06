import Image from "next/image";
import { type Pocket } from "@/db";
import walletLogo from "../../../public/assets/empty-wallet.svg";
import chip from "../../../public/assets/Circuit.svg";

interface CardsProps {
  pockets: Pocket[];
  userName: string;
}

export default function Cards({ pockets, userName }: CardsProps) {
  return (
    <section className="flex items-center gap-4 w-full overflow-x-auto pb-2 snap-x snap-mandatory">
      {pockets.map((pocket) => (
        /* the card itself */
        <div
          key={pocket.id}
          className="relative w-full shrink-0 snap-center rounded-xl shadow-xl p-5 flex flex-col justify-between gap-3 bg-lime overflow-hidden"
        >
          <h1 className="text-teal-deep text-lg font-bold leading-tight truncate z-10">
            IDR {Number(pocket.balance || 0).toLocaleString("id-ID")}
          </h1>

          <div className="w-full flex justify-between items-center z-10">
            <Image
              src={chip}
              alt="sim-chip"
              className="h-10 w-auto object-contain shrink-0"
            />
            <Image
              src={walletLogo}
              alt="empty-wallet-logo"
              className="h-24 w-auto object-contain shrink-0"
            />
          </div>

          <h1 className="text-teal-mid text-[14px] font-bold leading-tight uppercase truncate z-10">
            {pocket.name} - {userName}
          </h1>
        </div>
      ))}
    </section>
  );
}
