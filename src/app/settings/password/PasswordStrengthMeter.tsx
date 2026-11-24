"use client";

import { Check, Circle, X } from "lucide-react";
import { MIN_PASSWORD_LENGTH, type PasswordStrength } from "@/lib/password";

interface PasswordStrengthMeterProps {
  password: string;
  strength: PasswordStrength;
}

export function PasswordStrengthMeter({
  password,
  strength,
}: PasswordStrengthMeterProps) {
  const hasInput = password.length > 0;
  const requirements = [
    {
      id: "length",
      label: `At least ${MIN_PASSWORD_LENGTH} characters`,
      met: strength.checks.minLength,
    },
    {
      id: "upper",
      label: "Uppercase letter (A-Z)",
      met: strength.checks.hasUppercase,
    },
    {
      id: "number",
      label: "Number (0-9)",
      met: strength.checks.hasNumber,
    },
    {
      id: "symbol",
      label: "Symbol (!@#$...)",
      met: strength.checks.hasSymbol,
    },
  ] as const;

  return (
    <div className="mt-1.5 rounded-xl bg-mist p-3 border border-grey300/50 flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-semibold text-subtext">Password strength</span>
        <span
          aria-live="polite"
          className={`font-bold ${strength.textColorClass}`}
        >
          {strength.label}
        </span>
      </div>

      <div
        role="progressbar"
        aria-label="Password strength"
        aria-valuemin={0}
        aria-valuemax={3}
        aria-valuenow={strength.score}
        aria-valuetext={strength.label}
        className="grid grid-cols-3 gap-2"
      >
        {[1, 2, 3].map((segment) => {
          const isFilled = segment <= strength.score;
          return (
            <div
              key={segment}
              className={`h-2.5 rounded-full transition-colors motion-reduce:transition-none ${
                isFilled
                  ? `${strength.barColorClass} ${strength.barBorderClass}`
                  : "bg-grey300 border border-grey500"
              }`}
            />
          );
        })}
      </div>

      <ul
        role="list"
        aria-label="Password requirements"
        className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-0.5"
      >
        {requirements.map((req) => (
          <li
            key={req.id}
            className={`flex items-center gap-1.5 text-xs ${
              req.met
                ? "text-teal font-medium"
                : hasInput
                  ? "text-red-700"
                  : "text-subtext"
            }`}
          >
            {req.met ? (
              <Check className="size-3.5 shrink-0" aria-hidden="true" />
            ) : hasInput ? (
              <X className="size-3.5 shrink-0" aria-hidden="true" />
            ) : (
              <Circle className="size-3 shrink-0" aria-hidden="true" />
            )}
            <span className="sr-only">{req.met ? "Met: " : "Missing: "}</span>
            <span>{req.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
