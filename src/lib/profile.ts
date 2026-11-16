export const MIN_DISPLAY_NAME_LENGTH = 2;
export const MAX_DISPLAY_NAME_LENGTH = 50;
export const MAX_AVATAR_DATA_URL_LENGTH = 200_000;

const ALLOWED_AVATAR_DATA_URL_REGEX =
  /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/;

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export type ProfileValidationResult =
  | { ok: true; displayName: string; avatarUrl: string | null }
  | { ok: false; error: string };

export function validateProfileInput(
  rawDisplayName: string,
  rawAvatarUrl: string | null | undefined,
): ProfileValidationResult {
  const displayName = rawDisplayName.trim();

  if (displayName.length < MIN_DISPLAY_NAME_LENGTH) {
    return {
      ok: false,
      error: `Username must be at least ${MIN_DISPLAY_NAME_LENGTH} characters.`,
    };
  }

  if (displayName.length > MAX_DISPLAY_NAME_LENGTH) {
    return {
      ok: false,
      error: `Username must be ${MAX_DISPLAY_NAME_LENGTH} characters or less.`,
    };
  }

  const trimmedAvatar = rawAvatarUrl?.trim() ?? "";
  if (!trimmedAvatar) {
    return { ok: true, displayName, avatarUrl: null };
  }

  if (trimmedAvatar.length > MAX_AVATAR_DATA_URL_LENGTH) {
    return {
      ok: false,
      error: "Profile picture is too large. Please choose a smaller image.",
    };
  }

  if (!ALLOWED_AVATAR_DATA_URL_REGEX.test(trimmedAvatar)) {
    return {
      ok: false,
      error: "Profile picture must be a PNG, JPEG, or WebP image.",
    };
  }

  return { ok: true, displayName, avatarUrl: trimmedAvatar };
}
