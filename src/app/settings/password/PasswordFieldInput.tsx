"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";
import { Check, Eye, EyeOff } from "lucide-react";
import type { PasswordField } from "@/lib/password";

interface PasswordFieldInputProps {
  id: PasswordField;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete: "current-password" | "new-password";
  toggleSubject: string;
  hint?: string;
  minLength?: number;
  error?: string | null;
  validMessage?: string | null;
  onCapsLockChange: (isOn: boolean) => void;
  children?: ReactNode;
}

export function PasswordFieldInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  toggleSubject,
  hint,
  minLength,
  error,
  validMessage,
  onCapsLockChange,
  children,
}: PasswordFieldInputProps) {
  const [visible, setVisible] = useState(false);

  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
    undefined;

  const borderClass = error
    ? "border-error focus-visible:border-error focus-visible:ring-error/40"
    : validMessage
      ? "border-teal focus-visible:border-teal focus-visible:ring-teal/40"
      : "border-grey500 focus-visible:border-teal focus-visible:ring-teal/40";

  const handleKeyModifiers = (e: KeyboardEvent<HTMLInputElement>) => {
    onCapsLockChange(e.getModifierState("CapsLock"));
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-teal-deep">
        {label}
      </label>

      {hint && (
        <p id={hintId} className="text-xs text-subtext">
          {hint}
        </p>
      )}

      <div className="relative flex items-center">
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          required
          minLength={minLength}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyModifiers}
          onKeyUp={handleKeyModifiers}
          onBlur={() => onCapsLockChange(false)}
          placeholder={placeholder}
          className={`min-h-11 w-full px-3.5 py-3 pr-12 rounded-xl border text-charcoal text-base outline-none focus-visible:ring-2 ${borderClass}`}
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? `Hide ${toggleSubject}` : `Show ${toggleSubject}`}
          aria-pressed={visible}
          className="absolute right-0.5 min-h-11 min-w-11 inline-flex items-center justify-center rounded-xl text-subtext hover:text-charcoal cursor-pointer focus-visible:outline-2 focus-visible:outline-teal"
        >
          {visible ? (
            <EyeOff className="size-5" aria-hidden="true" />
          ) : (
            <Eye className="size-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {error ? (
        <p id={errorId} role="alert" className="text-xs font-medium text-red-700">
          {error}
        </p>
      ) : validMessage ? (
        <p className="text-xs font-medium text-teal flex items-center gap-1">
          <Check className="size-3.5 shrink-0" aria-hidden="true" />
          <span>{validMessage}</span>
        </p>
      ) : null}

      {children}
    </div>
  );
}
