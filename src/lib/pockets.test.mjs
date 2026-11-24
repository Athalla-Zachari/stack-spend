import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  MIN_POCKET_NAME_LENGTH,
  MAX_POCKET_NAME_LENGTH,
  validatePocketName,
  normalizePocketNameKey,
  hasDuplicateActivePocketName,
  getPocketInitials,
  getPocketBadgeTone,
  focusInitialDialogElement,
  formatActivePocketsLabel,
} from "./pockets.ts";

test("validatePocketName trims, collapses spaces, and enforces length bounds", () => {
  assert.deepEqual(validatePocketName("   "), {
    ok: false,
    error: `Pocket name must be at least ${MIN_POCKET_NAME_LENGTH} characters.`,
  });
  assert.deepEqual(validatePocketName("A"), {
    ok: false,
    error: `Pocket name must be at least ${MIN_POCKET_NAME_LENGTH} characters.`,
  });
  assert.deepEqual(validatePocketName("a".repeat(MAX_POCKET_NAME_LENGTH + 1)), {
    ok: false,
    error: `Pocket name must be ${MAX_POCKET_NAME_LENGTH} characters or less.`,
  });
  assert.deepEqual(validatePocketName("  Bank   Jago  "), {
    ok: true,
    name: "Bank Jago",
  });
});

test("hasDuplicateActivePocketName matches case-insensitively with normalized spaces", () => {
  assert.equal(normalizePocketNameKey("  Bank   Jago "), "bank jago");
  assert.equal(hasDuplicateActivePocketName(["BCA", "Cash"], " bca "), true);
  assert.equal(hasDuplicateActivePocketName(["Bank Jago"], "bank   jago"), true);
  assert.equal(hasDuplicateActivePocketName(["BCA", "Cash"], "Mandiri"), false);
  assert.equal(hasDuplicateActivePocketName([], "BCA"), false);
});

test("getPocketInitials matches mockup abbreviations and handles edge inputs", () => {
  assert.equal(getPocketInitials("BCA"), "BC");
  assert.equal(getPocketInitials("Mandiri"), "MD");
  assert.equal(getPocketInitials("BNI"), "BN");
  assert.equal(getPocketInitials("ShopeePay"), "SP");
  assert.equal(getPocketInitials("Cash"), "CS");
  assert.equal(getPocketInitials("Bank Jago"), "BJ");
  assert.equal(getPocketInitials("GoPay"), "GP");
  assert.equal(getPocketInitials("123"), "12");
  assert.equal(getPocketInitials("---"), "P");
});

test("getPocketBadgeTone rotates valid token classes deterministically", () => {
  const first = getPocketBadgeTone(0);
  const fifth = getPocketBadgeTone(4);
  assert.deepEqual(first, fifth);
  assert.ok(first.bgClass.startsWith("bg-"));
  assert.ok(first.textClass.startsWith("text-"));
});

test("focusInitialDialogElement focuses the marked initial target after showModal", () => {
  let focused = false;
  const fakeDialog = {
    querySelector(selector) {
      if (selector === "[data-dialog-initial-focus]") {
        return {
          focus() {
            focused = true;
          },
        };
      }
      return null;
    },
  };

  assert.equal(focusInitialDialogElement(fakeDialog), true);
  assert.equal(focused, true);
  assert.equal(
    focusInitialDialogElement({ querySelector: () => null }),
    false,
  );
});

test("SettingLists comingSoon row does not place aria-disabled on a role-less div", () => {
  const source = readFileSync(
    new URL("../app/settings/SettingLists.tsx", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(source, /<div[^>]*aria-disabled=/);
});

test("formatActivePocketsLabel formats singular, plural, zero, nullish, and defensive counts", () => {
  assert.equal(formatActivePocketsLabel(0), "0 Active Pockets");
  assert.equal(formatActivePocketsLabel(1), "1 Active Pocket");
  assert.equal(formatActivePocketsLabel(5), "5 Active Pockets");
  assert.equal(formatActivePocketsLabel(-2), "0 Active Pockets");
  assert.equal(formatActivePocketsLabel(Number.NaN), "0 Active Pockets");
  assert.equal(formatActivePocketsLabel(null), "Pocket count unavailable");
  assert.equal(formatActivePocketsLabel(undefined), "Pocket count unavailable");
});

test("settings layout uses min-h-dvh and unstable_rethrow when handling ProfileCard errors", () => {
  const layoutSource = readFileSync(
    new URL("../app/settings/layout.tsx", import.meta.url),
    "utf8",
  );
  assert.match(layoutSource, /\bmin-h-dvh\b/);
  assert.match(layoutSource, /\bunstable_rethrow\b/);
});

test("PocketCard size=sm scales proportionally without clipping while keeping default unconstrained", () => {
  const cardSource = readFileSync(
    new URL("../components/PocketCard.tsx", import.meta.url),
    "utf8",
  );
  // aspect-[1.6/1] belongs on size="sm" only so /home size="default" neither clips at 320px nor balloons on desktop
  assert.doesNotMatch(
    cardSource,
    /pocketCardVariants = cva\(\s*"[^"]*aspect-\[1\.6\/1\]/,
  );
  assert.match(cardSource, /sm:\s*"[^"]*\bmax-w-70\b[^"]*aspect-\[1\.6\/1\]/);
  assert.match(cardSource, /isSm\s*\?\s*"h-6"\s*:\s*"h-10"/);
  assert.match(cardSource, /isSm\s*\?\s*"h-12"\s*:\s*"h-24"/);
  assert.match(
    cardSource,
    /pocketCardSkeletonVariants = cva\(\s*"[^"]*overflow-hidden/,
  );
  assert.match(cardSource, /isSm\s*\?\s*"size-12"\s*:\s*"size-24"/);
});

test("PocketsManager uses size=sm and peek width for multi-pocket carousel", () => {
  const managerSource = readFileSync(
    new URL("../app/settings/pockets/PocketsManager.tsx", import.meta.url),
    "utf8",
  );
  assert.match(managerSource, /<PocketCard[\s\S]*?size="sm"/);
  assert.match(managerSource, /w-\[78%\]\s+max-w-70/);
  assert.match(managerSource, /<PocketCardSkeleton\s+size="sm"/);
});


