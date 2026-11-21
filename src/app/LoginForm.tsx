"use client";

import { useState, useActionState } from "react";
import { motion } from "motion/react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toast, useActionToast } from "@/components/ui/toast";
import { loginAction } from "@/app/actions/auth";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const { toast, triggerToast, closeToast } = useActionToast(state);

  return (
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
      <div className="bg-grey500 rounded-full h-2 w-15" />

      <div className="w-full align-baseline py-4">
        <h2 className="font-semibold text-lg text-teal-deep">Welcome Back</h2>
        <p className="text-sm text-subtext">
          Login to keep track of todays expenses
        </p>
      </div>

      <form action={formAction} className="w-full flex flex-col gap-5">
        <section>
          <label
            htmlFor="identifier"
            className="font-semibold text-[15px] text-teal-deep"
          >
            Full name
          </label>
          <input
            id="identifier"
            name="identifier"
            type="text"
            required
            placeholder="Fullname..."
            className="px-3 py-3 rounded-xl border border-grey300 w-full mt-1"
          />
        </section>

        <section>
          <label
            htmlFor="password"
            className="font-semibold text-[15px] text-teal-deep"
          >
            Password
          </label>
          <div className="relative flex items-center mt-1">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="Password"
              className="px-3 py-3 pr-11 rounded-xl border border-grey300 w-full"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-1 min-h-11 min-w-11 inline-flex items-center justify-center text-subtext hover:text-charcoal transition-colors cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Eye className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </section>

        <Button
          type="button"
          variant="link"
          size="link"
          className="mr-auto text-sm cursor-pointer"
          onClick={() =>
            triggerToast("Fitur reset password belum tersedia", "warning")
          }
        >
          Forgot Password?
        </Button>

        <Button
          type="submit"
          disabled={isPending}
          variant="solid"
          size="lg"
          className="w-full cursor-pointer"
        >
          {isPending ? "Logging in..." : "Login"}
        </Button>

        {toast.isOpen && (
          <Toast
            key={toast.id}
            variant={toast.variant}
            position="top-center"
            isOpen={toast.isOpen}
            onClose={closeToast}
            message={toast.message}
          />
        )}
      </form>
    </motion.section>
  );
}
