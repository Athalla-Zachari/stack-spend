"use client";

import { useActionState, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Trash2 } from "lucide-react";
import { updateProfileAction } from "@/app/actions/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toast } from "@/components/ui/toast";
import {
  MAX_AVATAR_DATA_URL_LENGTH,
  MAX_DISPLAY_NAME_LENGTH,
  MIN_DISPLAY_NAME_LENGTH,
  getInitials,
} from "@/lib/profile";

const MAX_RAW_IMAGE_BYTES = 5 * 1024 * 1024;
const AVATAR_SIZE_PX = 192;
const ALLOWED_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

interface ProfileEditorProps {
  initialDisplayName: string;
  initialAvatarUrl: string | null;
  email: string;
}

type ToastState = {
  id: number;
  isOpen: boolean;
  message: string;
  variant: "error" | "success";
};

function resizeAvatarImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      reject(new Error("Please choose a PNG, JPEG, or WebP image."));
      return;
    }

    if (file.size > MAX_RAW_IMAGE_BYTES) {
      reject(new Error("Image must be 5 MB or smaller."));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new window.Image();

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = AVATAR_SIZE_PX;
        canvas.height = AVATAR_SIZE_PX;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not process image in this browser."));
          return;
        }

        // Center-crop to a square before scaling down for consistent circular avatars.
        const cropSize = Math.min(img.naturalWidth, img.naturalHeight);
        const sx = Math.floor((img.naturalWidth - cropSize) / 2);
        const sy = Math.floor((img.naturalHeight - cropSize) / 2);

        ctx.drawImage(
          img,
          sx,
          sy,
          cropSize,
          cropSize,
          0,
          0,
          AVATAR_SIZE_PX,
          AVATAR_SIZE_PX,
        );

        let dataUrl = canvas.toDataURL("image/webp", 0.82);
        if (
          !dataUrl.startsWith("data:image/webp") ||
          dataUrl.length > MAX_AVATAR_DATA_URL_LENGTH
        ) {
          dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        }
        if (dataUrl.length > MAX_AVATAR_DATA_URL_LENGTH) {
          dataUrl = canvas.toDataURL("image/jpeg", 0.6);
        }
        if (dataUrl.length > MAX_AVATAR_DATA_URL_LENGTH) {
          reject(
            new Error("Image is still too large after compression. Try another photo."),
          );
          return;
        }

        resolve(dataUrl);
      } catch {
        reject(new Error("Could not process the selected image."));
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read the selected image file."));
    };

    img.src = objectUrl;
  });
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
  const [savedSnapshot, setSavedSnapshot] = useState({
    displayName: initialDisplayName,
    avatarUrl: initialAvatarUrl,
  });
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>({
    id: 0,
    isOpen: false,
    message: "",
    variant: "error",
  });

  const [prevActionState, setPrevActionState] = useState(state);
  if (state !== prevActionState) {
    setPrevActionState(state);
    if (state?.error) {
      setToast((prev) => ({
        id: prev.id + 1,
        isOpen: true,
        message: state.error ?? "Could not save profile changes.",
        variant: "error",
      }));
    } else if (state?.success) {
      const nextName = state.displayName ?? displayName.trim();
      const nextAvatar = state.avatarUrl ?? null;
      setDisplayName(nextName);
      setAvatarUrl(nextAvatar);
      setSavedSnapshot({ displayName: nextName, avatarUrl: nextAvatar });
      setToast((prev) => ({
        id: prev.id + 1,
        isOpen: true,
        message: "Profile updated.",
        variant: "success",
      }));
    }
  }

  const trimmedName = displayName.trim();
  const hasChanges =
    trimmedName !== savedSnapshot.displayName ||
    avatarUrl !== savedSnapshot.avatarUrl;
  const initials = getInitials(trimmedName || savedSnapshot.displayName);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setImageError(null);
    setIsProcessingImage(true);
    try {
      const compressed = await resizeAvatarImage(file);
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
		<form action={formAction} className="flex flex-col gap-6">
			<input type="hidden" name="avatarUrl" value={avatarUrl ?? ""} />

			<div className="flex flex-col items-center gap-3 pt-1">
			<Avatar className="size-24 ring-2 ring-grey300/60">
				{avatarUrl && (
				<AvatarImage
					src={avatarUrl}
					alt={trimmedName || savedSnapshot.displayName}
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
				<p role="alert" className="text-xs font-medium text-error text-center">
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
				value={displayName}
				onChange={(e) => setDisplayName(e.target.value)}
				placeholder="Your username"
				className="min-h-11 px-3.5 py-3 rounded-xl border border-grey300 text-charcoal text-base outline-none focus:border-teal focus:ring-1 focus:ring-teal"
			/>
			<p className="text-xs text-subtext">
				Shown across the app and accepted when signing in.
			</p>
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
			onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
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
