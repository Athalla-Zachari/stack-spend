"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import {
  changePasswordAction,
  type PasswordActionState,
} from "@/app/actions/password";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toast, useActionToast } from "@/components/ui/toast";
import {
  MAX_PASSWORD_BYTES,
  MIN_PASSWORD_LENGTH,
  evaluatePasswordStrength,
  getUtf8ByteLength,
  getVisibleServerError,
  type PasswordErrorTarget,
  type PasswordField,
} from "@/lib/password";
import { PasswordFieldInput } from "./PasswordFieldInput";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";

export default function PasswordEditor() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<
    PasswordActionState | null,
    FormData
  >(changePasswordAction, null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);
  const [formVersion, setFormVersion] = useState(0);
  const [dismissedState, setDismissedState] = useState<{
    forState: PasswordActionState | null;
    targets: PasswordErrorTarget[];
  }>({ forState: null, targets: [] });
  const [prevActionState, setPrevActionState] =
    useState<PasswordActionState | null>(null);

  const { toast, closeToast } = useActionToast(state?.success ? state : null, {
    successMessage: "Password updated.",
  });

  if (state !== prevActionState) {
    setPrevActionState(state);
    if (state?.success) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsCapsLockOn(false);
      setFormVersion((prev) => prev + 1);
    }
  }

  const dismissedTargets =
    dismissedState.forState === state ? dismissedState.targets : [];

  const dismissServerError = (...fields: PasswordField[]) => {
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

  const strength = evaluatePasswordStrength(newPassword);
  const isOverMaxBytes = getUtf8ByteLength(newPassword) > MAX_PASSWORD_BYTES;
  const isSameAsCurrent =
    newPassword.length > 0 &&
    currentPassword.length > 0 &&
    newPassword === currentPassword;
  const isConfirmMismatch =
    confirmPassword.length > 0 && confirmPassword !== newPassword;
  const isConfirmMatched =
    confirmPassword.length > 0 && confirmPassword === newPassword;

  const currentServerError = getVisibleServerError(
    state,
    "currentPassword",
    dismissedTargets,
  );
  const newServerError = getVisibleServerError(
    state,
    "newPassword",
    dismissedTargets,
  );
  const confirmServerError = getVisibleServerError(
    state,
    "confirmPassword",
    dismissedTargets,
  );
  const generalServerError = getVisibleServerError(
    state,
    "general",
    dismissedTargets,
  );

  const newFieldError = isOverMaxBytes
    ? `New password must be ${MAX_PASSWORD_BYTES} bytes or less.`
    : isSameAsCurrent
      ? "New password must be different from your current password."
      : newServerError;

  const confirmFieldError = isConfirmMismatch
    ? "Confirmation password does not match the new password."
    : confirmServerError;

  const canSubmit =
    !isPending &&
    currentPassword.length > 0 &&
    strength.score === 3 &&
    !isOverMaxBytes &&
    !isSameAsCurrent &&
    isConfirmMatched;

  return (
    <section
      aria-labelledby="change-password-heading"
      className="bg-white rounded-2xl shadow-lg p-5 border border-grey300/40"
    >
      <div className="mb-5">
        <h2
          id="change-password-heading"
          className="text-base font-bold text-teal-deep leading-tight"
        >
          Change Password
        </h2>
        <p className="text-xs text-subtext mt-1">
          Verify your current password and choose a strong replacement.
        </p>
      </div>

      {isCapsLockOn && (
        <div
          role="alert"
          className="mb-4 flex items-center gap-2.5 rounded-xl bg-beige border border-warning/50 px-3.5 py-2.5 text-xs font-medium text-charcoal"
        >
          <AlertTriangle
            className="size-4 shrink-0 text-teal-deep"
            aria-hidden="true"
          />
          <span>Caps Lock is on. Passwords are case-sensitive.</span>
        </div>
      )}

      {generalServerError && (
        <div
          role="alert"
          className="mb-4 rounded-xl bg-error/10 border border-error/40 px-3.5 py-2.5 text-xs font-medium text-red-700"
        >
          {generalServerError}
        </div>
      )}

      <form action={formAction} className="flex flex-col gap-5">
        <PasswordFieldInput
          key={`current-${formVersion}`}
          id="currentPassword"
          label="Current Password"
          value={currentPassword}
          onChange={(value) => {
            setCurrentPassword(value);
            dismissServerError("currentPassword");
          }}
          placeholder="Enter current password"
          autoComplete="current-password"
          toggleSubject="current password"
          error={currentServerError}
          onCapsLockChange={setIsCapsLockOn}
        />

        <PasswordFieldInput
          key={`new-${formVersion}`}
          id="newPassword"
          label="New Password"
          hint={`Use at least ${MIN_PASSWORD_LENGTH} characters with an uppercase letter, number, and symbol.`}
          minLength={MIN_PASSWORD_LENGTH}
          value={newPassword}
          onChange={(value) => {
            setNewPassword(value);
            dismissServerError("newPassword", "confirmPassword");
          }}
          placeholder="Enter new password"
          autoComplete="new-password"
          toggleSubject="new password"
          error={newFieldError}
          onCapsLockChange={setIsCapsLockOn}
        >
          <PasswordStrengthMeter password={newPassword} strength={strength} />
        </PasswordFieldInput>

        <PasswordFieldInput
          key={`confirm-${formVersion}`}
          id="confirmPassword"
          label="Confirm New Password"
          value={confirmPassword}
          onChange={(value) => {
            setConfirmPassword(value);
            dismissServerError("confirmPassword");
          }}
          placeholder="Re-enter new password"
          autoComplete="new-password"
          toggleSubject="confirm new password"
          error={confirmFieldError}
          validMessage={isConfirmMatched ? "Passwords match." : null}
          onCapsLockChange={setIsCapsLockOn}
        />

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1">
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={isPending}
            onClick={() => router.push("/settings")}
            className="w-full sm:flex-1 min-h-12 text-base cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="solid"
            size="lg"
            disabled={!canSubmit}
            className="w-full sm:flex-1 min-h-12 text-base hover:bg-teal-mid cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
          >
            {isPending ? "Updating..." : "Update Password"}
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

export function PasswordEditorSkeleton() {
  return (
    <section
      aria-label="Loading password settings"
      className="bg-white rounded-2xl shadow-lg p-5 border border-grey300/40 flex flex-col gap-5"
    >
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-5 w-36 rounded-md bg-grey300/40" />
        <Skeleton className="h-3.5 w-60 max-w-full rounded-md bg-grey300/40" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-32 rounded-md bg-grey300/40" />
        <Skeleton className="h-12 w-full rounded-xl bg-grey300/40" />
      </div>

      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-28 rounded-md bg-grey300/40" />
        <Skeleton className="h-12 w-full rounded-xl bg-grey300/40" />
        <Skeleton className="h-24 w-full rounded-xl bg-grey300/40" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-40 rounded-md bg-grey300/40" />
        <Skeleton className="h-12 w-full rounded-xl bg-grey300/40" />
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1">
        <Skeleton className="h-12 w-full sm:flex-1 rounded-lg bg-grey300/40" />
        <Skeleton className="h-12 w-full sm:flex-1 rounded-lg bg-grey300/40" />
      </div>
    </section>
  );
}
