"use client";

import { useActionState, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Trash2 } from "lucide-react";
import {
  updateProfileAction,
  type ProfileActionState,
} from "@/app/actions/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toast, useActionToast } from "@/components/ui/toast";
import { resizeSquareImage } from "@/lib/image";
import {
  MAX_AVATAR_DATA_URL_LENGTH,
  MAX_DISPLAY_NAME_LENGTH,
  MAX_EMAIL_LENGTH,
  MIN_DISPLAY_NAME_LENGTH,
  getInitials,
  getVisibleProfileError,
  isValidEmailFormat,
  type ProfileErrorTarget,
  type ProfileField,
} from "@/lib/profile";

interface ProfileEditorProps {
  initialDisplayName: string;
  initialAvatarUrl: string | null;
  email: string;
}

export default function ProfileEditor({
  initialDisplayName,
  initialAvatarUrl,
  email,
}: ProfileEditorProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [state, formAction, isPending] = useActionState<
    ProfileActionState | null,
    FormData
  >(updateProfileAction, null);

  const [savedProfile, setSavedProfile] = useState({
    displayName: initialDisplayName,
    email,
    avatarUrl: initialAvatarUrl,
  });
  const [prevInitialProps, setPrevInitialProps] = useState({
    displayName: initialDisplayName,
    email,
    avatarUrl: initialAvatarUrl,
  });
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [emailInput, setEmailInput] = useState(email);
  const [emailTouched, setEmailTouched] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [dismissedState, setDismissedState] = useState<{
    forState: ProfileActionState | null;
    targets: ProfileErrorTarget[];
  }>({ forState: null, targets: [] });
  const [prevActionState, setPrevActionState] =
    useState<ProfileActionState | null>(null);

  const { toast, closeToast } = useActionToast(state?.success ? state : null, {
    successMessage: "Profile updated.",
  });

  if (
    prevInitialProps.displayName !== initialDisplayName ||
    prevInitialProps.email !== email ||
    prevInitialProps.avatarUrl !== initialAvatarUrl
  ) {
    setPrevInitialProps({
      displayName: initialDisplayName,
      email,
      avatarUrl: initialAvatarUrl,
    });
    setSavedProfile({
      displayName: initialDisplayName,
      email,
      avatarUrl: initialAvatarUrl,
    });
  }

  if (state !== prevActionState) {
    setPrevActionState(state);
    if (state?.success) {
      const nextSaved = {
        displayName: state.displayName ?? savedProfile.displayName,
        email: state.email ?? savedProfile.email,
        avatarUrl: state.avatarUrl ?? null,
      };
      setSavedProfile(nextSaved);
      setDisplayName(nextSaved.displayName);
      setEmailInput(nextSaved.email);
      setAvatarUrl(nextSaved.avatarUrl);
      setEmailTouched(false);
    }
  }

  const dismissedTargets =
    dismissedState.forState === state ? dismissedState.targets : [];

  const dismissServerError = (...fields: ProfileField[]) => {
    if (!state?.error) return;
    setDismissedState((prev) => {
      const base = prev.forState === state ? prev.targets : [];
      const next = [...base];
      for (const field of fields) {
        if (!next.includes(field)) next.push(field);
      }
      if (!next.includes("general")) next.push("general");
      return { forState: state, targets: next };
    });
  };

  const savedDisplayName = savedProfile.displayName;
  const savedEmail = savedProfile.email;
  const savedAvatarUrl = savedProfile.avatarUrl;

  const trimmedName = displayName.trim();
  const normalizedEmail = emailInput.trim().toLowerCase();
  const isEmailValid = isValidEmailFormat(normalizedEmail);
  const hasChanges =
    trimmedName !== savedDisplayName ||
    normalizedEmail !== savedEmail.trim().toLowerCase() ||
    avatarUrl !== savedAvatarUrl;
  const initials = getInitials(trimmedName || savedDisplayName);

  const displayNameError = getVisibleProfileError(
    state,
    "displayName",
    dismissedTargets,
  );
  const emailServerError = getVisibleProfileError(
    state,
    "email",
    dismissedTargets,
  );
  const avatarServerError = getVisibleProfileError(
    state,
    "avatarUrl",
    dismissedTargets,
  );
  const generalServerError = getVisibleProfileError(
    state,
    "general",
    dismissedTargets,
  );

  const emailClientError =
    emailTouched && !isEmailValid
      ? !normalizedEmail
        ? "Please enter an email address."
        : normalizedEmail.length > MAX_EMAIL_LENGTH
          ? `Email must be ${MAX_EMAIL_LENGTH} characters or less.`
          : "Please enter a valid email address."
      : null;

  const emailError = emailClientError ?? emailServerError;
  const avatarError = imageError ?? avatarServerError;

  const canSave =
    !isPending &&
    !isProcessingImage &&
    hasChanges &&
    trimmedName.length >= MIN_DISPLAY_NAME_LENGTH &&
    isEmailValid;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setImageError(null);
    dismissServerError("avatarUrl");
    setIsProcessingImage(true);
    try {
      const compressed = await resizeSquareImage(file, {
        maxDataUrlLength: MAX_AVATAR_DATA_URL_LENGTH,
      });
      setAvatarUrl(compressed);
    } catch (err) {
      setImageError(
        err instanceof Error ? err.message : "Could not load selected image.",
      );
    } finally {
      setIsProcessingImage(false);
    }
  };

  return (
    <section
      aria-label="Edit profile"
      className="bg-white rounded-2xl shadow-lg p-5 border border-grey300/40"
    >
      {generalServerError && (
        <div
          role="alert"
          className="mb-4 rounded-xl bg-error/10 border border-error/40 px-3.5 py-2.5 text-xs font-medium text-red-700"
        >
          {generalServerError}
        </div>
      )}

      <form
        action={formAction}
        onSubmit={() => {
          setImageError(null);
          closeToast();
        }}
        className="flex flex-col gap-4"
      >
        <input type="hidden" name="avatarUrl" value={avatarUrl ?? ""} />

        <div className="flex flex-col items-center gap-3 pt-1">
          <Avatar className="size-24 ring-2 ring-grey300/60">
            {avatarUrl && (
              <AvatarImage
                src={avatarUrl}
                alt={trimmedName || savedDisplayName}
              />
            )}
            <AvatarFallback className="bg-teal/15 text-teal-deep text-2xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <p className="text-xs text-subtext truncate max-w-full">
            {savedEmail}
          </p>

          <input
            ref={fileInputRef}
            id="avatar-upload"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            className="sr-only"
          />

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              disabled={isPending || isProcessingImage}
              onClick={() => fileInputRef.current?.click()}
              className="min-h-11 px-4 rounded-xl border-grey500 text-teal-deep hover:bg-mist cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
            >
              <Camera className="size-4" aria-hidden="true" />
              <span>
                {isProcessingImage
                  ? "Processing..."
                  : avatarUrl
                    ? "Change Photo"
                    : "Upload Photo"}
              </span>
            </Button>

            {avatarUrl && (
              <Button
                type="button"
                variant="outline"
                disabled={isPending || isProcessingImage}
                onClick={() => {
                  setImageError(null);
                  dismissServerError("avatarUrl");
                  setAvatarUrl(null);
                }}
                className="min-h-11 px-4 rounded-xl border-error text-red-700 hover:bg-error/10 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
              >
                <Trash2 className="size-4" aria-hidden="true" />
                <span>Remove</span>
              </Button>
            )}
          </div>

          {avatarError && (
            <p
              role="alert"
              className="text-xs font-medium text-red-700 text-center"
            >
              {avatarError}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="displayName"
            className="text-sm font-semibold text-teal-deep"
          >
            Username
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            required
            minLength={MIN_DISPLAY_NAME_LENGTH}
            maxLength={MAX_DISPLAY_NAME_LENGTH}
            autoComplete="username"
            aria-invalid={displayNameError ? true : undefined}
            aria-describedby={
              displayNameError ? "displayName-error" : "displayName-help"
            }
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              dismissServerError("displayName");
            }}
            placeholder="Your username"
            className={`min-h-11 w-full px-3.5 py-3 rounded-xl border text-charcoal text-base outline-none focus-visible:ring-2 ${
              displayNameError
                ? "border-error focus-visible:border-error focus-visible:ring-error/40"
                : "border-grey500 focus-visible:border-teal focus-visible:ring-teal/40"
            }`}
          />
          {displayNameError ? (
            <p
              id="displayName-error"
              role="alert"
              className="text-xs font-medium text-red-700"
            >
              {displayNameError}
            </p>
          ) : (
            <p id="displayName-help" className="text-xs text-subtext">
              Shown across the app and accepted when signing in.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="text-sm font-semibold text-teal-deep"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            required
            maxLength={MAX_EMAIL_LENGTH}
            autoComplete="email"
            aria-invalid={emailError ? true : undefined}
            aria-describedby={emailError ? "email-error" : "email-help"}
            value={emailInput}
            onChange={(e) => {
              setEmailInput(e.target.value);
              dismissServerError("email");
            }}
            onBlur={() => setEmailTouched(true)}
            placeholder="name@example.com"
            className={`min-h-11 w-full px-3.5 py-3 rounded-xl border text-charcoal text-base outline-none focus-visible:ring-2 ${
              emailError
                ? "border-error focus-visible:border-error focus-visible:ring-error/40"
                : "border-grey500 focus-visible:border-teal focus-visible:ring-teal/40"
            }`}
          />
          {emailError ? (
            <p
              id="email-error"
              role="alert"
              className="text-xs font-medium text-red-700"
            >
              {emailError}
            </p>
          ) : (
            <p id="email-help" className="text-xs text-subtext">
              Used for signing in and shown on your profile card.
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1">
          <Button
            type="submit"
            variant="solid"
            size="lg"
            disabled={!canSave}
            className="w-full sm:flex-1 min-h-12 text-base hover:bg-teal-mid cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>

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
    </section>
  );
}

export function ProfileEditorSkeleton() {
  return (
    <section
      aria-label="Loading profile editor"
      className="bg-white rounded-2xl shadow-lg p-5 border border-grey300/40 flex flex-col gap-5"
    >
      <div className="flex flex-col items-center gap-3 pt-1">
        <Skeleton className="size-24 rounded-full bg-grey300/40" />
        <Skeleton className="h-3.5 w-40 rounded-md bg-grey300/40" />
        <div className="flex gap-2.5">
          <Skeleton className="h-11 w-32 rounded-xl bg-grey300/40" />
          <Skeleton className="h-11 w-24 rounded-xl bg-grey300/40" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-20 rounded-md bg-grey300/40" />
        <Skeleton className="h-12 w-full rounded-xl bg-grey300/40" />
        <Skeleton className="h-3.5 w-56 max-w-full rounded-md bg-grey300/40" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-16 rounded-md bg-grey300/40" />
        <Skeleton className="h-12 w-full rounded-xl bg-grey300/40" />
        <Skeleton className="h-3.5 w-56 max-w-full rounded-md bg-grey300/40" />
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1">
        <Skeleton className="h-12 w-full sm:flex-1 rounded-lg bg-grey300/40" />
        <Skeleton className="h-12 w-full sm:flex-1 rounded-lg bg-grey300/40" />
      </div>
    </section>
  );
}
