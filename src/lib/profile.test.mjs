import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  MAX_DISPLAY_NAME_LENGTH,
  MAX_EMAIL_LENGTH,
  MIN_DISPLAY_NAME_LENGTH,
  findProfileConflict,
  getInitials,
  getVisibleProfileError,
  isValidEmailFormat,
  validateProfileInput,
} from "./profile.ts";

test("isValidEmailFormat accepts standard emails and rejects malformed values", () => {
  assert.equal(isValidEmailFormat("athalla@stackspend.app"), true);
  assert.equal(isValidEmailFormat("first.last+tag@sub.domain.co.id"), true);
  assert.equal(isValidEmailFormat("USER@EXAMPLE.COM"), true);
  assert.equal(isValidEmailFormat("user@xn--bcher-kva.example"), true);

  assert.equal(isValidEmailFormat(""), false);
  assert.equal(isValidEmailFormat("plainaddress"), false);
  assert.equal(isValidEmailFormat("a@b"), false);
  assert.equal(isValidEmailFormat("a@b."), false);
  assert.equal(isValidEmailFormat("a@.com"), false);
  assert.equal(isValidEmailFormat("@example.com"), false);
  assert.equal(isValidEmailFormat("a b@example.com"), false);
  assert.equal(isValidEmailFormat("a..b@example.com"), false);
  assert.equal(isValidEmailFormat("a@example..com"), false);
  assert.equal(isValidEmailFormat(".a@example.com"), false);
  assert.equal(isValidEmailFormat("a.@example.com"), false);
  assert.equal(isValidEmailFormat("user@gmail,co.id"), false);
  assert.equal(isValidEmailFormat("user@foo/bar.com"), false);
  assert.equal(isValidEmailFormat("user@sub_domain.com"), false);
  assert.equal(isValidEmailFormat("user@-example.com"), false);
  assert.equal(isValidEmailFormat("user@example-.com"), false);
  assert.equal(isValidEmailFormat("user<1>@example.com"), false);
  assert.equal(isValidEmailFormat("user@example.12"), false);
  assert.equal(isValidEmailFormat(`${"a".repeat(65)}@example.com`), false);
  assert.equal(isValidEmailFormat(`user@${"b".repeat(64)}.com`), false);
});

test("validateProfileInput validates username, normalizes email, and checks bounds with field targets", () => {
  assert.deepEqual(
    validateProfileInput("  Athalla  ", "  Athalla@StackSpend.APP ", ""),
    {
      ok: true,
      displayName: "Athalla",
      email: "athalla@stackspend.app",
      avatarUrl: null,
    },
  );

  assert.deepEqual(
    validateProfileInput("A", "athalla@stackspend.app", ""),
    {
      ok: false,
      field: "displayName",
      error: `Username must be at least ${MIN_DISPLAY_NAME_LENGTH} characters.`,
    },
  );

  assert.deepEqual(
    validateProfileInput(
      "a".repeat(MAX_DISPLAY_NAME_LENGTH + 1),
      "athalla@stackspend.app",
      "",
    ),
    {
      ok: false,
      field: "displayName",
      error: `Username must be ${MAX_DISPLAY_NAME_LENGTH} characters or less.`,
    },
  );

  assert.deepEqual(validateProfileInput("Athalla", "   ", ""), {
    ok: false,
    field: "email",
    error: "Please enter an email address.",
  });

  assert.deepEqual(validateProfileInput("Athalla", "not-an-email", ""), {
    ok: false,
    field: "email",
    error: "Please enter a valid email address.",
  });

  const exactMaxEmail = `${"a".repeat(64)}@${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(57)}.com`;
  assert.equal(exactMaxEmail.length, MAX_EMAIL_LENGTH);
  assert.equal(validateProfileInput("Athalla", exactMaxEmail, "").ok, true);

  const overMaxEmail = `${exactMaxEmail}x`;
  assert.equal(overMaxEmail.length, MAX_EMAIL_LENGTH + 1);
  assert.deepEqual(validateProfileInput("Athalla", overMaxEmail, ""), {
    ok: false,
    field: "email",
    error: `Email must be ${MAX_EMAIL_LENGTH} characters or less.`,
  });

  assert.deepEqual(
    validateProfileInput("Athalla", "athalla@stackspend.app", "https://bad.url/x.png"),
    {
      ok: false,
      field: "avatarUrl",
      error: "Profile picture must be a PNG, JPEG, or WebP image.",
    },
  );
});

test("getVisibleProfileError scopes errors by field and hides dismissed targets", () => {
  const emailState = {
    field: "email",
    error: "That email is already in use.",
  };
  assert.equal(
    getVisibleProfileError(emailState, "email", []),
    "That email is already in use.",
  );
  assert.equal(getVisibleProfileError(emailState, "email", ["email"]), null);
  assert.equal(getVisibleProfileError(emailState, "displayName", []), null);
  assert.equal(getVisibleProfileError(emailState, "general", []), null);

  const generalState = { error: "Could not save profile changes. Please try again." };
  assert.equal(
    getVisibleProfileError(generalState, "general", []),
    "Could not save profile changes. Please try again.",
  );
  assert.equal(
    getVisibleProfileError(generalState, "general", ["general"]),
    null,
  );
});

test("getInitials computes clean fallback initials", () => {
  assert.equal(getInitials("Athalla Zachari"), "AZ");
  assert.equal(getInitials("Athalla"), "AT");
  assert.equal(getInitials("   "), "U");
});

test("updateProfileAction and ProfileEditor handle email updates, session sync, and WCAG accessibility", () => {
  const actionSource = readFileSync(
    new URL("../app/actions/profile.ts", import.meta.url),
    "utf8",
  );
  const editorSource = readFileSync(
    new URL("../app/settings/profile/ProfileEditor.tsx", import.meta.url),
    "utf8",
  );

  // Server action validates email, checks conflicts via findProfileConflict, updates DB + session
  assert.match(actionSource, /formData\.get\("email"\)/);
  assert.match(actionSource, /email:\s*validated\.email/);
  assert.match(actionSource, /\bfindProfileConflict\(/);

  // Editor uses proper email input, field-scoped errors, accessible borders/focus, and success-only toast
  assert.match(editorSource, /type="email"/);
  assert.match(editorSource, /id="email"/);
  assert.match(editorSource, /name="email"/);
  assert.doesNotMatch(editorSource, /\bsetDisplayEmail\b/);
  assert.match(
    editorSource,
    /useActionToast\(state\?\.success \? state : null,\s*\{\s*successMessage:\s*"Profile updated\."\s*,?\s*\}\)/,
  );
  assert.match(editorSource, /border-grey500/);
  assert.match(
    editorSource,
    /focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal/,
  );
  assert.match(editorSource, /flex flex-col-reverse sm:flex-row gap-3 pt-1/);
});

test("findProfileConflict catches same-column and cross-column username/email collisions", () => {
  const existing = [
    { displayName: "Alice", email: "alice@example.com" },
    { displayName: "bob@example.com", email: "bob.real@example.com" },
  ];

  assert.equal(
    findProfileConflict(existing, "Charlie", "charlie@example.com"),
    null,
  );
  assert.deepEqual(
    findProfileConflict(existing, "Alice", "charlie@example.com"),
    { field: "displayName", error: "That username is already taken." },
  );
  assert.deepEqual(
    findProfileConflict(existing, "alice@example.com", "charlie@example.com"),
    { field: "displayName", error: "That username is already taken." },
  );
  assert.deepEqual(
    findProfileConflict(existing, "Charlie", "alice@example.com"),
    { field: "email", error: "That email is already in use." },
  );
  assert.deepEqual(
    findProfileConflict(existing, "Charlie", "bob@example.com"),
    { field: "email", error: "That email is already in use." },
  );
});

test("auth login iterates all matching rows and ProfileEditor preserves contrast, toast dismissal, and saved baseline", () => {
  const authSource = readFileSync(
    new URL("../app/actions/auth.ts", import.meta.url),
    "utf8",
  );
  const profileActionSource = readFileSync(
    new URL("../app/actions/profile.ts", import.meta.url),
    "utf8",
  );
  const editorSource = readFileSync(
    new URL("../app/settings/profile/ProfileEditor.tsx", import.meta.url),
    "utf8",
  );

  // Critical #1: loginAction evaluates all candidate rows and profileAction checks cross-column conflicts
  assert.match(authSource, /\.all\(\)/);
  assert.doesNotMatch(authSource, /\.get\(\)/);
  assert.match(profileActionSource, /\bfindProfileConflict\b/);

  // Important #3: Remove button uses full-opacity border-error (>= 3:1 on white)
  assert.doesNotMatch(editorSource, /border-error\/60/);
  assert.match(editorSource, /border-error text-red-700/);

  // Important #4: dismiss stale toast on submit and persist savedProfile across failed retries
  assert.match(editorSource, /onSubmit=\{\(\) => \{[\s\S]*?closeToast\(\)/);
  assert.match(editorSource, /\bsavedProfile\b/);
});
