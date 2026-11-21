"use client";

import { useActionState, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Trash2 } from "lucide-react";
import { updateProfileAction } from "@/app/actions/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toast, useActionToast } from "@/components/ui/toast";
import { resizeSquareImage } from "@/lib/image";
import {
  MAX_AVATAR_DATA_URL_LENGTH,
  MAX_DISPLAY_NAME_LENGTH,
  MIN_DISPLAY_NAME_LENGTH,
  getInitials,
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
  const [state, formAction, isPending] = useActionState(
    updateProfileAction,
    null,
  );

  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const { toast, closeToast } = useActionToast(state, {
    successMessage: "Profile updated.",
  });

  const savedDisplayName =
    state?.success && state.displayName ? state.displayName : initialDisplayName;
  const savedAvatarUrl = state?.success
    ? (state.avatarUrl ?? null)
    : initialAvatarUrl;

  const trimmedName = displayName.trim();
  const hasChanges =
    trimmedName !== savedDisplayName || avatarUrl !== savedAvatarUrl;
  const initials = getInitials(trimmedName || savedDisplayName);
  const serverError = state?.error ?? null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setImageError(null);
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
      <form
        action={formAction}
        onSubmit={() => setImageError(null)}
        className="flex flex-col gap-6"
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

          <p className="text-xs text-subtext truncate max-w-full">{email}</p>

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
              className="min-h-11 px-4 rounded-xl border-grey300 text-teal-deep hover:bg-mist cursor-pointer"
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
                  setAvatarUrl(null);
                }}
                className="min-h-11 px-4 rounded-xl border-error/40 text-error hover:bg-error/10 cursor-pointer"
              >
                <Trash2 className="size-4" aria-hidden="true" />
                <span>Remove</span>
              </Button>
            )}
          </div>

          {imageError && (
            <p
              role="alert"
              className="text-xs font-medium text-error text-center"
            >
              {imageError}
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
            aria-invalid={Boolean(serverError)}
            aria-describedby={
              serverError ? "displayName-error" : "displayName-help"
            }
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your username"
            className={`min-h-11 px-3.5 py-3 rounded-xl border text-charcoal text-base outline-none focus:ring-1 ${
              serverError
                ? "border-error focus:border-error focus:ring-error"
                : "border-grey300 focus:border-teal focus:ring-teal"
            }`}
          />
          {serverError ? (
            <p
              id="displayName-error"
              role="alert"
              className="text-xs font-medium text-error"
            >
              {serverError}
            </p>
          ) : (
            <p id="displayName-help" className="text-xs text-subtext">
              Shown across the app and accepted when signing in.
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-1">
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={isPending}
            onClick={() => router.push("/settings")}
            className="flex-1 min-h-12 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="solid"
            size="lg"
            disabled={
              isPending ||
              isProcessingImage ||
              !hasChanges ||
              trimmedName.length < MIN_DISPLAY_NAME_LENGTH
            }
            className="flex-1 min-h-12 cursor-pointer"
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
      className="bg-white rounded-2xl shadow-lg p-5 border border-grey300/40 flex flex-col gap-6"
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
        <Skeleton className="h-3.5 w-56 rounded-md bg-grey300/40" />
      </div>

      <div className="flex gap-3 pt-1">
        <Skeleton className="h-12 flex-1 rounded-lg bg-grey300/40" />
        <Skeleton className="h-12 flex-1 rounded-lg bg-grey300/40" />
      </div>
    </section>
  );
}
