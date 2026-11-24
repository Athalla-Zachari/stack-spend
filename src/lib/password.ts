export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_BYTES = 72;
export const MAX_FAILED_ATTEMPTS = 5;
export const ATTEMPT_WINDOW_MS = 5 * 60 * 1000;

export interface AttemptRecord {
  count: number;
  resetAt: number;
}

export type PasswordStrengthLevel = "empty" | "weak" | "fair" | "strong";

export type PasswordField =
  | "currentPassword"
  | "newPassword"
  | "confirmPassword";

export type PasswordErrorTarget = PasswordField | "general";

export interface PasswordChecks {
  minLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3;
  level: PasswordStrengthLevel;
  label: string;
  barColorClass: string;
  barBorderClass: string;
  textColorClass: string;
  checks: PasswordChecks;
}

export type PasswordValidationResult =
  | { ok: true }
  | { ok: false; field: PasswordField; error: string };

const UPPERCASE_REGEX = /[A-Z]/;
const NUMBER_REGEX = /[0-9]/;
const SYMBOL_REGEX = /[^A-Za-z0-9\s]/;

export function getUtf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

export function evaluatePasswordStrength(password: string): PasswordStrength {
  const checks: PasswordChecks = {
    minLength: password.length >= MIN_PASSWORD_LENGTH,
    hasUppercase: UPPERCASE_REGEX.test(password),
    hasNumber: NUMBER_REGEX.test(password),
    hasSymbol: SYMBOL_REGEX.test(password),
  };

  if (password.length === 0) {
    return {
      score: 0,
      level: "empty",
      label: "Not set",
      barColorClass: "bg-grey300",
      barBorderClass: "border border-grey500",
      textColorClass: "text-subtext",
      checks,
    };
  }

  if (getUtf8ByteLength(password) > MAX_PASSWORD_BYTES) {
    return {
      score: 1,
      level: "weak",
      label: "Too long",
      barColorClass: "bg-error",
      barBorderClass: "border border-error",
      textColorClass: "text-red-700",
      checks,
    };
  }

  const metCount =
    Number(checks.minLength) +
    Number(checks.hasUppercase) +
    Number(checks.hasNumber) +
    Number(checks.hasSymbol);

  if (metCount === 4) {
    return {
      score: 3,
      level: "strong",
      label: "Strong",
      barColorClass: "bg-green",
      barBorderClass: "border border-green",
      textColorClass: "text-teal",
      checks,
    };
  }

  if (metCount === 3 && password.length >= 6) {
    return {
      score: 2,
      level: "fair",
      label: "Fair",
      barColorClass: "bg-warning",
      barBorderClass: "border border-amber-700",
      textColorClass: "text-charcoal",
      checks,
    };
  }

  return {
    score: 1,
    level: "weak",
    label: "Weak",
    barColorClass: "bg-error",
    barBorderClass: "border border-error",
    textColorClass: "text-red-700",
    checks,
  };
}

export function getThrottleStatus(
  store: Map<string, AttemptRecord>,
  userId: string,
  now: number,
): { blocked: boolean; count: number } {
  const entry = store.get(userId);
  if (!entry || now >= entry.resetAt) {
    store.delete(userId);
    return { blocked: false, count: 0 };
  }
  return {
    blocked: entry.count >= MAX_FAILED_ATTEMPTS,
    count: entry.count,
  };
}

export function recordFailedAttempt(
  store: Map<string, AttemptRecord>,
  userId: string,
  now: number,
): number {
  const entry = store.get(userId);
  if (!entry || now >= entry.resetAt) {
    store.set(userId, {
      count: 1,
      resetAt: now + ATTEMPT_WINDOW_MS,
    });
    return 1;
  }
  const nextCount = entry.count + 1;
  store.set(userId, {
    count: nextCount,
    resetAt: entry.resetAt,
  });
  return nextCount;
}

export function getIncorrectPasswordError(attempts: number): string {
  const remaining = Math.max(0, MAX_FAILED_ATTEMPTS - attempts);
  if (remaining === 0) {
    return "Current password is incorrect. Too many failed attempts; wait 5 minutes before retrying.";
  }
  if (remaining <= 2) {
    return `Current password is incorrect. ${remaining} ${remaining === 1 ? "attempt" : "attempts"} remaining before temporary lock.`;
  }
  return "Current password is incorrect.";
}

export function getVisibleServerError(
  state: { error?: string; field?: PasswordField } | null,
  target: PasswordErrorTarget,
  dismissedTargets: readonly PasswordErrorTarget[],
): string | null {
  if (!state?.error || dismissedTargets.includes(target)) {
    return null;
  }
  if (target === "general") {
    return state.field ? null : state.error;
  }
  return state.field === target ? state.error : null;
}

export function validatePasswordChangeInput(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
): PasswordValidationResult {
  if (!currentPassword) {
    return {
      ok: false,
      field: "currentPassword",
      error: "Please enter your current password.",
    };
  }

  const { checks } = evaluatePasswordStrength(newPassword);

  if (!checks.minLength) {
    return {
      ok: false,
      field: "newPassword",
      error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    };
  }

  if (getUtf8ByteLength(newPassword) > MAX_PASSWORD_BYTES) {
    return {
      ok: false,
      field: "newPassword",
      error: `New password must be ${MAX_PASSWORD_BYTES} bytes or less.`,
    };
  }

  if (!checks.hasUppercase) {
    return {
      ok: false,
      field: "newPassword",
      error: "New password must include at least one uppercase letter.",
    };
  }

  if (!checks.hasNumber) {
    return {
      ok: false,
      field: "newPassword",
      error: "New password must include at least one number.",
    };
  }

  if (!checks.hasSymbol) {
    return {
      ok: false,
      field: "newPassword",
      error: "New password must include at least one symbol.",
    };
  }

  if (newPassword === currentPassword) {
    return {
      ok: false,
      field: "newPassword",
      error: "New password must be different from your current password.",
    };
  }

  if (confirmPassword !== newPassword) {
    return {
      ok: false,
      field: "confirmPassword",
      error: "Confirmation password does not match the new password.",
    };
  }

  return { ok: true };
}
