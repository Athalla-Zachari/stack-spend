export const MIN_DISPLAY_NAME_LENGTH = 2;
export const MAX_DISPLAY_NAME_LENGTH = 50;
export const MAX_EMAIL_LENGTH = 254;
export const MAX_AVATAR_DATA_URL_LENGTH = 200_000;

export type ProfileField = "displayName" | "email" | "avatarUrl";
export type ProfileErrorTarget = ProfileField | "general";

const ALLOWED_AVATAR_DATA_URL_REGEX =
  /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/;
const EMAIL_LOCAL_REGEX = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/;
const DOMAIN_LABEL_REGEX = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/;
const DOMAIN_TLD_REGEX = /^(?:[A-Za-z]{2,}|xn--[A-Za-z0-9-]{2,})$/;

export interface ProfileIdentityCandidate {
  displayName: string;
  email: string;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function isValidEmailFormat(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_EMAIL_LENGTH) return false;
  if (trimmed.includes("..")) return false;

  const atIndex = trimmed.indexOf("@");
  if (atIndex <= 0 || atIndex !== trimmed.lastIndexOf("@")) return false;

  const local = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1);
  if (
    local.length > 64 ||
    local.startsWith(".") ||
    local.endsWith(".") ||
    !EMAIL_LOCAL_REGEX.test(local)
  ) {
    return false;
  }

  const labels = domain.split(".");
  if (labels.length < 2) return false;
  if (!labels.every((label) => DOMAIN_LABEL_REGEX.test(label))) return false;

  const tld = labels[labels.length - 1];
  return DOMAIN_TLD_REGEX.test(tld);
}

export function findProfileConflict(
  candidates: readonly ProfileIdentityCandidate[],
  displayName: string,
  normalizedEmail: string,
): { field: "displayName" | "email"; error: string } | null {
  const normalizedDisplayName = displayName.trim().toLowerCase();

  for (const user of candidates) {
    const existingName = user.displayName.trim();
    const existingEmail = user.email.trim().toLowerCase();
    if (
      existingName === displayName ||
      existingEmail === normalizedDisplayName
    ) {
      return {
        field: "displayName",
        error: "That username is already taken.",
      };
    }
  }

  for (const user of candidates) {
    const existingNameLower = user.displayName.trim().toLowerCase();
    const existingEmail = user.email.trim().toLowerCase();
    if (
      existingEmail === normalizedEmail ||
      existingNameLower === normalizedEmail
    ) {
      return {
        field: "email",
        error: "That email is already in use.",
      };
    }
  }

  return null;
}

export function getVisibleProfileError(
  state: { error?: string; field?: ProfileField } | null,
  target: ProfileErrorTarget,
  dismissedTargets: readonly ProfileErrorTarget[],
): string | null {
  if (!state?.error || dismissedTargets.includes(target)) {
    return null;
  }
  if (target === "general") {
    return state.field ? null : state.error;
  }
  return state.field === target ? state.error : null;
}

export type ProfileValidationResult =
  | {
      ok: true;
      displayName: string;
      email: string;
      avatarUrl: string | null;
    }
  | { ok: false; field: ProfileField; error: string };

export function validateProfileInput(
  rawDisplayName: string,
  rawEmail: string,
  rawAvatarUrl: string | null | undefined,
): ProfileValidationResult {
  const displayName = rawDisplayName.trim();

  if (displayName.length < MIN_DISPLAY_NAME_LENGTH) {
    return {
      ok: false,
      field: "displayName",
      error: `Username must be at least ${MIN_DISPLAY_NAME_LENGTH} characters.`,
    };
  }

  if (displayName.length > MAX_DISPLAY_NAME_LENGTH) {
    return {
      ok: false,
      field: "displayName",
      error: `Username must be ${MAX_DISPLAY_NAME_LENGTH} characters or less.`,
    };
  }

  const email = rawEmail.trim().toLowerCase();

  if (!email) {
    return {
      ok: false,
      field: "email",
      error: "Please enter an email address.",
    };
  }

  if (email.length > MAX_EMAIL_LENGTH) {
    return {
      ok: false,
      field: "email",
      error: `Email must be ${MAX_EMAIL_LENGTH} characters or less.`,
    };
  }

  if (!isValidEmailFormat(email)) {
    return {
      ok: false,
      field: "email",
      error: "Please enter a valid email address.",
    };
  }

  const trimmedAvatar = rawAvatarUrl?.trim() ?? "";
  if (!trimmedAvatar) {
    return { ok: true, displayName, email, avatarUrl: null };
  }

  if (trimmedAvatar.length > MAX_AVATAR_DATA_URL_LENGTH) {
    return {
      ok: false,
      field: "avatarUrl",
      error: "Profile picture is too large. Please choose a smaller image.",
    };
  }

  if (!ALLOWED_AVATAR_DATA_URL_REGEX.test(trimmedAvatar)) {
    return {
      ok: false,
      field: "avatarUrl",
      error: "Profile picture must be a PNG, JPEG, or WebP image.",
    };
  }

  return { ok: true, displayName, email, avatarUrl: trimmedAvatar };
}
