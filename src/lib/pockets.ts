export const MIN_POCKET_NAME_LENGTH = 2;
export const MAX_POCKET_NAME_LENGTH = 30;

export type PocketNameValidationResult =
  | { ok: true; name: string }
  | { ok: false; error: string };

export interface PocketBadgeTone {
  bgClass: string;
  textClass: string;
}

const KNOWN_POCKET_INITIALS: Record<string, string> = {
  mandiri: "MD",
  cash: "CS",
  spay: "SP",
  shopeepay: "SP",
};

const POCKET_BADGE_TONES: readonly PocketBadgeTone[] = [
  { bgClass: "bg-teal/10", textClass: "text-teal-deep" },
  { bgClass: "bg-beige", textClass: "text-charcoal" },
  { bgClass: "bg-aqua/20", textClass: "text-teal-deep" },
  { bgClass: "bg-mist", textClass: "text-teal-mid" },
] as const;

export function normalizePocketNameKey(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

export function validatePocketName(
  rawName: string,
): PocketNameValidationResult {
  const name = rawName.trim().replace(/\s+/g, " ");

  if (name.length < MIN_POCKET_NAME_LENGTH) {
    return {
      ok: false,
      error: `Pocket name must be at least ${MIN_POCKET_NAME_LENGTH} characters.`,
    };
  }

  if (name.length > MAX_POCKET_NAME_LENGTH) {
    return {
      ok: false,
      error: `Pocket name must be ${MAX_POCKET_NAME_LENGTH} characters or less.`,
    };
  }

  return { ok: true, name };
}

export function hasDuplicateActivePocketName(
  activeNames: readonly string[],
  candidateName: string,
): boolean {
  const targetKey = normalizePocketNameKey(candidateName);
  return activeNames.some((name) => normalizePocketNameKey(name) === targetKey);
}

export function getPocketInitials(name: string): string {
  const cleaned = name.trim().replace(/\s+/g, " ");
  if (!cleaned) return "P";

  const known = KNOWN_POCKET_INITIALS[cleaned.toLowerCase()];
  if (known) return known;

  const words = cleaned
    .split(" ")
    .map((word) => word.replace(/[^a-zA-Z0-9]/g, ""))
    .filter(Boolean);

  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  const single = words[0] ?? "";
  if (!single) return "P";

  const camelMatch = single.match(/^([a-zA-Z])[a-z]+([A-Z])/);
  if (camelMatch) {
    return `${camelMatch[1]}${camelMatch[2]}`.toUpperCase();
  }

  return single.slice(0, 2).toUpperCase();
}

export function getPocketBadgeTone(index: number): PocketBadgeTone {
  const len = POCKET_BADGE_TONES.length;
  return POCKET_BADGE_TONES[((index % len) + len) % len];
}

export function focusInitialDialogElement(root: {
  querySelector: (selector: string) => { focus?: () => void } | null;
}): boolean {
  const target = root.querySelector("[data-dialog-initial-focus]");
  if (target && typeof target.focus === "function") {
    target.focus();
    return true;
  }
  return false;
}
