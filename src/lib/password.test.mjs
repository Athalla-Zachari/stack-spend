import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  ATTEMPT_WINDOW_MS,
  MAX_FAILED_ATTEMPTS,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_BYTES,
  evaluatePasswordStrength,
  getIncorrectPasswordError,
  getThrottleStatus,
  getVisibleServerError,
  recordFailedAttempt,
  validatePasswordChangeInput,
} from "./password.ts";

test("evaluatePasswordStrength scores empty, weak, fair, and strong with globals.css tokens", () => {
  const empty = evaluatePasswordStrength("");
  assert.equal(empty.score, 0);
  assert.equal(empty.level, "empty");

  const weakShort = evaluatePasswordStrength("Ab1!");
  assert.equal(weakShort.score, 1);
  assert.equal(weakShort.level, "weak");
  assert.equal(weakShort.barColorClass, "bg-error");

  const weakLong = evaluatePasswordStrength("Password");
  assert.equal(weakLong.score, 1);
  assert.equal(weakLong.level, "weak");
  assert.equal(weakLong.barColorClass, "bg-error");

  const fairMissingSymbol = evaluatePasswordStrength("Password1");
  assert.equal(fairMissingSymbol.score, 2);
  assert.equal(fairMissingSymbol.level, "fair");
  assert.equal(fairMissingSymbol.barColorClass, "bg-warning");
  assert.equal(fairMissingSymbol.checks.hasSymbol, false);

  const fairMissingUpper = evaluatePasswordStrength("password1!");
  assert.equal(fairMissingUpper.score, 2);
  assert.equal(fairMissingUpper.level, "fair");
  assert.equal(fairMissingUpper.checks.hasUppercase, false);

  const weakFiveChars = evaluatePasswordStrength("Ab1!x");
  assert.equal(weakFiveChars.score, 1);
  assert.equal(weakFiveChars.level, "weak");

  const fairSixChars = evaluatePasswordStrength("Ab1!xy");
  assert.equal(fairSixChars.score, 2);
  assert.equal(fairSixChars.level, "fair");

  const strong = evaluatePasswordStrength("Pass123!");
  assert.equal(strong.score, 3);
  assert.equal(strong.level, "strong");
  assert.equal(strong.barColorClass, "bg-green");
  assert.deepEqual(strong.checks, {
    minLength: true,
    hasUppercase: true,
    hasNumber: true,
    hasSymbol: true,
  });
});

test("evaluatePasswordStrength flags passwords exceeding 72 UTF-8 bytes as Too long instead of Strong", () => {
  const exact72Ascii = `A1!${"a".repeat(MAX_PASSWORD_BYTES - 3)}`;
  assert.equal(evaluatePasswordStrength(exact72Ascii).score, 3);
  assert.equal(evaluatePasswordStrength(exact72Ascii).label, "Strong");

  const over72Ascii = `A1!${"a".repeat(MAX_PASSWORD_BYTES - 2)}`;
  const asciiResult = evaluatePasswordStrength(over72Ascii);
  assert.equal(asciiResult.score, 1);
  assert.equal(asciiResult.level, "weak");
  assert.equal(asciiResult.label, "Too long");
  assert.equal(asciiResult.barColorClass, "bg-error");
  assert.equal(asciiResult.barBorderClass, "border border-error");
  assert.equal(asciiResult.textColorClass, "text-red-700");

  const over72Multibyte = `A1!${"😀".repeat(18)}`; // 3 + 72 = 75 UTF-8 bytes, only 39 UTF-16 code units
  const multiResult = evaluatePasswordStrength(over72Multibyte);
  assert.equal(multiResult.score, 1);
  assert.equal(multiResult.label, "Too long");
  assert.equal(multiResult.barColorClass, "bg-error");
});

test("evaluatePasswordStrength does not count spaces as symbols", () => {
  const withSpace = evaluatePasswordStrength("Password 1");
  assert.equal(withSpace.checks.hasSymbol, false);
  assert.equal(withSpace.level, "fair");
});

test("validatePasswordChangeInput enforces current password, policy, bcrypt byte limit, reuse, and confirm match", () => {
  assert.deepEqual(validatePasswordChangeInput("", "Pass123!", "Pass123!"), {
    ok: false,
    field: "currentPassword",
    error: "Please enter your current password.",
  });

  assert.deepEqual(
    validatePasswordChangeInput("OldPass1!", "Ab1!567", "Ab1!567"),
    {
      ok: false,
      field: "newPassword",
      error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    },
  );

  assert.deepEqual(
    validatePasswordChangeInput("OldPass1!", "password1!", "password1!"),
    {
      ok: false,
      field: "newPassword",
      error: "New password must include at least one uppercase letter.",
    },
  );

  assert.deepEqual(
    validatePasswordChangeInput("OldPass1!", "Password!", "Password!"),
    {
      ok: false,
      field: "newPassword",
      error: "New password must include at least one number.",
    },
  );

  assert.deepEqual(
    validatePasswordChangeInput("OldPass1!", "Password1", "Password1"),
    {
      ok: false,
      field: "newPassword",
      error: "New password must include at least one symbol.",
    },
  );

  const exact72 = `A1!${"a".repeat(MAX_PASSWORD_BYTES - 3)}`;
  assert.deepEqual(validatePasswordChangeInput("OldPass1!", exact72, exact72), {
    ok: true,
  });

  const over72Ascii = `A1!${"a".repeat(MAX_PASSWORD_BYTES - 2)}`;
  assert.deepEqual(
    validatePasswordChangeInput("OldPass1!", over72Ascii, over72Ascii),
    {
      ok: false,
      field: "newPassword",
      error: `New password must be ${MAX_PASSWORD_BYTES} bytes or less.`,
    },
  );

  const over72Multibyte = `A1!${"😀".repeat(18)}`;
  assert.deepEqual(
    validatePasswordChangeInput("OldPass1!", over72Multibyte, over72Multibyte),
    {
      ok: false,
      field: "newPassword",
      error: `New password must be ${MAX_PASSWORD_BYTES} bytes or less.`,
    },
  );

  assert.deepEqual(
    validatePasswordChangeInput("SamePass1!", "SamePass1!", "SamePass1!"),
    {
      ok: false,
      field: "newPassword",
      error: "New password must be different from your current password.",
    },
  );

  assert.deepEqual(
    validatePasswordChangeInput("OldPass1!", "NewPass1!", "Mismatch1!"),
    {
      ok: false,
      field: "confirmPassword",
      error: "Confirmation password does not match the new password.",
    },
  );

  assert.deepEqual(
    validatePasswordChangeInput("OldPass1!", "NewPass1!", "NewPass1!"),
    { ok: true },
  );
});

test("getVisibleServerError hides dismissed field and general errors while keeping active ones", () => {
  const fieldState = {
    field: "currentPassword",
    error: "Current password is incorrect.",
  };
  assert.equal(
    getVisibleServerError(fieldState, "currentPassword", []),
    "Current password is incorrect.",
  );
  assert.equal(
    getVisibleServerError(fieldState, "currentPassword", ["currentPassword"]),
    null,
  );
  assert.equal(getVisibleServerError(fieldState, "newPassword", []), null);
  assert.equal(getVisibleServerError(fieldState, "general", []), null);

  const generalState = { error: "Could not update password. Please try again." };
  assert.equal(
    getVisibleServerError(generalState, "general", []),
    "Could not update password. Please try again.",
  );
  assert.equal(
    getVisibleServerError(generalState, "general", ["general"]),
    null,
  );
  assert.equal(getVisibleServerError(null, "currentPassword", []), null);
});

test("evaluatePasswordStrength provides >= 3:1 bar border classes on bg-mist for all states", () => {
  assert.equal(evaluatePasswordStrength("").barBorderClass, "border border-grey500");
  assert.equal(evaluatePasswordStrength("Ab1!").barBorderClass, "border border-error");
  assert.equal(
    evaluatePasswordStrength("Password1").barBorderClass,
    "border border-amber-700",
  );
  assert.equal(
    evaluatePasswordStrength("Pass123!").barBorderClass,
    "border border-green",
  );
});

test("attempt throttle locks after 5 failures within the window and resets once expired", () => {
  const store = new Map();
  const t0 = 1_000_000;

  assert.deepEqual(getThrottleStatus(store, "user-1", t0), {
    blocked: false,
    count: 0,
  });

  for (let i = 1; i < MAX_FAILED_ATTEMPTS; i++) {
    assert.equal(recordFailedAttempt(store, "user-1", t0 + i * 1000), i);
    assert.deepEqual(getThrottleStatus(store, "user-1", t0 + i * 1000), {
      blocked: false,
      count: i,
    });
  }

  assert.equal(
    getIncorrectPasswordError(2),
    "Current password is incorrect.",
  );
  assert.equal(
    getIncorrectPasswordError(3),
    "Current password is incorrect. 2 attempts remaining before temporary lock.",
  );
  assert.equal(
    getIncorrectPasswordError(4),
    "Current password is incorrect. 1 attempt remaining before temporary lock.",
  );

  assert.equal(
    recordFailedAttempt(store, "user-1", t0 + 10_000),
    MAX_FAILED_ATTEMPTS,
  );
  assert.deepEqual(getThrottleStatus(store, "user-1", t0 + 10_000), {
    blocked: true,
    count: MAX_FAILED_ATTEMPTS,
  });
  assert.equal(
    getIncorrectPasswordError(MAX_FAILED_ATTEMPTS),
    "Current password is incorrect. Too many failed attempts; wait 5 minutes before retrying.",
  );

  assert.deepEqual(
    getThrottleStatus(store, "user-1", t0 + ATTEMPT_WINDOW_MS + 1000),
    { blocked: false, count: 0 },
  );
  assert.equal(store.has("user-1"), false);
});

test("PasswordEditor separates field input and strength meter cleanly without dead classes", () => {
  const editorSource = readFileSync(
    new URL("../app/settings/password/PasswordEditor.tsx", import.meta.url),
    "utf8",
  );
  const fieldSource = readFileSync(
    new URL("../app/settings/password/PasswordFieldInput.tsx", import.meta.url),
    "utf8",
  );
  const meterSource = readFileSync(
    new URL("../app/settings/password/PasswordStrengthMeter.tsx", import.meta.url),
    "utf8",
  );

  assert.match(editorSource, /from "\.\/PasswordFieldInput"/);
  assert.match(editorSource, /from "\.\/PasswordStrengthMeter"/);
  assert.match(editorSource, /\bgetVisibleServerError\b/);
  assert.match(editorSource, /\bdismissServerError\b/);
  assert.match(editorSource, /flex flex-col-reverse sm:flex-row gap-3 pt-1/);
  assert.match(editorSource, /w-full sm:flex-1 min-h-12 text-base/);
  assert.doesNotMatch(editorSource, /disabled:cursor-not-allowed/);

  assert.match(fieldSource, /onBlur=\{\(\) => onCapsLockChange\(false\)\}/);
  assert.match(fieldSource, /aria-pressed=\{visible\}/);

  assert.match(meterSource, /strength\.barBorderClass/);
  assert.match(meterSource, /bg-grey300 border border-grey500/);
  assert.match(meterSource, /className="sr-only"[\s\S]*Met: [\s\S]*Missing: /);
});

test("changing password keeps the user signed in and resets the form with a success toast", () => {
  const actionSource = readFileSync(
    new URL("../app/actions/password.ts", import.meta.url),
    "utf8",
  );
  const editorSource = readFileSync(
    new URL("../app/settings/password/PasswordEditor.tsx", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(actionSource, /\bclearSession\b/);
  assert.doesNotMatch(actionSource, /\bredirect\(/);
  assert.match(actionSource, /return\s*\{\s*success:\s*true\s*\};/);

  assert.match(
    editorSource,
    /useActionToast\(state\?\.success \? state : null,\s*\{\s*successMessage:\s*"Password updated\."\s*,?\s*\}\)/,
  );
  assert.doesNotMatch(editorSource, /sign you out/i);
  assert.doesNotMatch(editorSource, /\bShieldAlert\b/);
});

test("password controls and toast meet WCAG AA text, focus-visible, touch-target, and border contrast", () => {
  const editorSource = readFileSync(
    new URL("../app/settings/password/PasswordEditor.tsx", import.meta.url),
    "utf8",
  );
  const fieldSource = readFileSync(
    new URL("../app/settings/password/PasswordFieldInput.tsx", import.meta.url),
    "utf8",
  );
  const errorSource = readFileSync(
    new URL("../app/settings/password/error.tsx", import.meta.url),
    "utf8",
  );
  const toastSource = readFileSync(
    new URL("../components/ui/toast.tsx", import.meta.url),
    "utf8",
  );

  // Important #1: visible focus ring and >= 4.5:1 hover contrast on buttons
  assert.match(
    editorSource,
    /focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal/,
  );
  assert.match(editorSource, /\bhover:bg-teal-mid\b/);
  assert.match(
    errorSource,
    /focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal/,
  );

  // Important #2: WCAG AA toast surfaces and 44x44px dismiss control
  assert.match(toastSource, /success:\s*"bg-teal-mid text-white"/);
  assert.match(toastSource, /error:\s*"bg-red-700 text-white"/);
  assert.match(toastSource, /min-h-11 min-w-11/);

  // Important #3: >= 3:1 resting input border on white card
  assert.match(fieldSource, /border-grey500 focus-visible:border-teal/);
  assert.doesNotMatch(fieldSource, /border-grey300/);
});
