import Image from "next/image";
import spendItLogo from "../../public/assets/make-it-rain.svg";
import MotionTypewriter from "@/components/ui/typewriter";
import { LoginForm } from "./LoginForm";

export default function Home() {
  return (
    <main className="min-h-screen w-full pt-24 flex flex-col items-center gap-16 bg-beige">
      <div className="flex flex-col items-center w-full">
        <MotionTypewriter text="StackSpend" speed={0.08} />
        <p className="text-subtext text-sm">My daily personal expense tracker</p>
      </div>

      <div className="w-full flex justify-center">
        <Image
          src={spendItLogo}
          alt="StackSpend illustration"
          priority
          className="h-34 w-auto object-contain"
        />
      </div>

      <LoginForm />
    </main>
  );
}
