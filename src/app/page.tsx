"use client"
import { useState, useActionState } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { motion } from 'motion/react';
import { Eye, EyeOff } from "lucide-react";
import spendItLogo from "../../public/assets/make-it-rain.svg";
import MotionTypewriter from "@/components/ui/typewriter";
import { loginAction } from "@/app/actions/auth";

export default function Home() {
	const [showPassword, setShowPassword] = useState(false);
	const [state, formAction, isPending] = useActionState(loginAction, null);

	return(
	<div className="min-h-screen w-full pt-24 flex flex-col items-center gap-16 bg-beige">
		
		<div className="flex flex-col items-center w-full">
			<MotionTypewriter text="StackSpend" speed={0.08}/>
			<motion.p
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ delay: 0.2, duration: 0.8 }}
			className="text-subtext text-sm"
			>
			My daily personal expense tracker
			</motion.p>
		</div>

		<motion.div 
		initial={{ opacity: 0 }}
		animate={{ opacity: 1 }}
		transition={{ delay: 0.3, duration: 1 }}
		className="w-full flex justify-center">
		<Image
			src={spendItLogo}
			alt="spend-it-logo"
			className="h-34 w-auto object-contain"
		/>
		</motion.div>

		<motion.section 
		initial={{ opacity: 0, y: 60 }}
		animate={{ opacity: 1, y: 0 }}
		transition={{
			duration: 1.2,
			delay: 0.6,
			ease: [0.16, 1, 0.3, 1],
		}}
		className="w-full flex-1 flex flex-col items-center gap-3 bg-white rounded-tr-[40px] rounded-tl-[40px] px-6 py-6 shadow-md"
		>
			<div className="bg-grey500 rounded-full h-2 w-15"></div>

			<div className="w-full align-baseline py-4">
			<h1 className="font-semibold text-lg text-teal-deep">Welcome Back</h1>
			<p className="text-sm text-subtext">Login to keep track of todays expenses</p>
			</div>

			<form action={formAction} className="w-full flex flex-col gap-5">
				{state?.error && (
					<div className="bg-red-50 border border-error/20 text-error text-sm px-4 py-2.5 rounded-xl text-center">
						{state.error}
					</div>
				)}
				<section>
				<h1 className="font-semibold text-[15px] text-teal-deep">Full name</h1>
				<input 
					name="identifier"
					type="text" 
					required
					placeholder="Fullname..." 
					className="px-3 py-3 rounded-xl border border-grey300 w-full"
				/>	
				</section>
				<section>
				<h1 className="font-semibold text-[15px] text-teal-deep">Password</h1>
				<div className="relative flex items-center mt-1">
					<input 
					name="password"
					type={showPassword ? "text" : "password"} 
					required
					placeholder="Password" 
					className="px-3 py-3 pr-10 rounded-xl border border-grey300 w-full"
					/>	
					<button
					type="button"
					onClick={() => setShowPassword((prev) => !prev)}
					className="absolute right-3 text-grey500 hover:text-charcoal transition-colors focus:outline-none"
					aria-label={showPassword ? "Hide password" : "Show password"}
					>
						{showPassword ? (
							<EyeOff className="h-5 w-5" />
						) : (
							<Eye className="h-5 w-5" />
						)}
					</button>
				</div>
				</section>

				<Button
				type="button"
				variant={"link"}
				size={"link"}
				className={" mr-auto text-sm"}
				>
					Forgot Password?
				</Button>

				<Button
				type="submit"
				disabled={isPending}
				variant={"solid"}
				size={"lg"}
				className={"w-full"}
				>
					{isPending ? "Logging in..." : "Login"}
				</Button>
			</form>
		</motion.section>
	</div>
	);
}
