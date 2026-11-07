"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

import bcaLogo from "../../../public/assets/BCA.webp";
import bniLogo from "../../../public/assets/BNI.webp";
import mandiriLogo from "../../../public/assets/mandiri.webp";
import spayLogo from "../../../public/assets/spay.webp";

const POCKET_SOURCES = [
    { id: "bca", label: "BCA", logo: bcaLogo },
    { id: "bni", label: "BNI", logo: bniLogo },
    { id: "mandiri", label: "Mandiri", logo: mandiriLogo },
    { id: "spay", label: "ShopeePay", logo: spayLogo },
] as const;

export default function Transfer() {
    const [selectedPocket, setSelectedPocket] = useState<string>("bca");

    return (
        <main className="flex-1 flex flex-col justify-end">
        <section className="w-full flex flex-col gap-3 h-[80vh] px-7 py-9 bg-white rounded-tl-4xl rounded-tr-4xl">
            <section className="flex items-center gap-2">
            {POCKET_SOURCES.map((source) => {
                const isSelected = selectedPocket === source.id;

                return (
                <Button
                    key={source.id}
                    type="button"
                    variant={"outline"}
                    onClick={() => setSelectedPocket(source.id)}
                    className={`h-9 py-2 transition-all hover:cursor-pointer ${
                    isSelected
                        ? "border-teal-mid bg-teal/10 "
                        : "opacity-70 hover:opacity-100"
                    }`}
                >
                    <Image
                    src={source.logo}
                    alt={`${source.label}-logo`}
                    className="h-full w-auto object-contain"
                    />
                </Button>
                );
            })}
            </section>
    
            <form className="w-full flex flex-col">
                <section>
                <h1 className="font-semibold text-[15px] text-teal-deep">
                    Notes
                    </h1>
                    <input
                    name="identifier"
                    type="text"
                    required
                    placeholder="Notes..."
                    className="px-3 py-3 rounded-xl border border-grey300 w-full"
                    />
                </section>
            </form>

        </section>

        </main>
    );
}
