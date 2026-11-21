"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import {
  createPocketAction,
  type PocketActionState,
} from "@/app/actions/pockets";
import { Button } from "@/components/ui/button";
import {
  MAX_POCKET_NAME_LENGTH,
  MIN_POCKET_NAME_LENGTH,
  focusInitialDialogElement,
} from "@/lib/pockets";

interface AddPocketDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (pocketName: string) => void;
}

function isOutsideRect(e: PointerEvent, el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  return (
    e.clientX < rect.left ||
    e.clientX > rect.right ||
    e.clientY < rect.top ||
    e.clientY > rect.bottom
  );
}

function AddPocketForm({
  onCancel,
  onCreated,
}: {
  onCancel: () => void;
  onCreated: (pocketName: string) => void;
}) {
  const [state, formAction, isPending] = useActionState<
    PocketActionState | null,
    FormData
  >(createPocketAction, null);
  const [name, setName] = useState("");
  const handledStateRef = useRef<PocketActionState | null>(null);

  useEffect(() => {
    if (state && state !== handledStateRef.current) {
      handledStateRef.current = state;
      if (state.success && state.pocketName) {
        onCreated(state.pocketName);
      }
    }
  }, [state, onCreated]);

  const trimmedLength = name.trim().replace(/\s+/g, " ").length;
  const serverError = state?.error ?? null;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="pocket-name-input"
          className="text-sm font-semibold text-teal-deep"
        >
          Pocket Name
        </label>
        <p id="pocket-name-hint" className="text-xs text-subtext">
          Starts with IDR 0. Top up later via Transfer or Transactions.
        </p>
        <input
          id="pocket-name-input"
          name="name"
          type="text"
          required
          data-dialog-initial-focus=""
          autoComplete="off"
          minLength={MIN_POCKET_NAME_LENGTH}
          maxLength={MAX_POCKET_NAME_LENGTH}
          aria-invalid={serverError ? true : undefined}
          aria-describedby={
            serverError
              ? "pocket-name-error pocket-name-hint"
              : "pocket-name-hint"
          }
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Bank, e-wallet, or cash"
          className={`min-h-11 px-3.5 py-3 rounded-xl border text-charcoal text-base bg-white outline-none focus-visible:ring-2 ${
            serverError
              ? "border-error focus-visible:border-error focus-visible:ring-error/40"
              : "border-grey300 focus-visible:border-teal focus-visible:ring-teal/40"
          }`}
        />
        {serverError && (
          <p
            id="pocket-name-error"
            role="alert"
            className="text-xs font-medium text-red-700"
          >
            {serverError}
          </p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={isPending}
          onClick={onCancel}
          className="flex-1 min-h-12 rounded-xl border-grey300 text-teal-deep hover:bg-mist cursor-pointer disabled:cursor-not-allowed"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="solid"
          size="lg"
          disabled={isPending || trimmedLength < MIN_POCKET_NAME_LENGTH}
          className="flex-1 min-h-12 rounded-xl bg-teal hover:bg-teal-mid active:bg-teal-deep text-white font-semibold cursor-pointer disabled:cursor-not-allowed"
        >
          {isPending ? "Adding..." : "Add Pocket"}
        </Button>
      </div>
    </form>
  );
}

export function AddPocketDrawer({
  isOpen,
  onClose,
  onCreated,
}: AddPocketDrawerProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.setAttribute("closedby", "any");

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
      focusInitialDialogElement(dialog);
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      dialog.returnValue = "";
      onClose();
    };

    dialog.addEventListener("close", handleClose);

    // Fallback light dismiss for browsers without native dialog closedby support (e.g. Safari).
    const supportsClosedBy = "closedBy" in HTMLDialogElement.prototype;
    let pressedOutside = false;

    const handlePointerDown = (e: PointerEvent) => {
      pressedOutside = isOutsideRect(e, dialog);
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (pressedOutside && isOutsideRect(e, dialog) && dialog.open) {
        dialog.close();
      }
      pressedOutside = false;
    };

    if (!supportsClosedBy) {
      dialog.addEventListener("pointerdown", handlePointerDown);
      dialog.addEventListener("pointerup", handlePointerUp);
    }

    return () => {
      dialog.removeEventListener("close", handleClose);
      if (!supportsClosedBy) {
        dialog.removeEventListener("pointerdown", handlePointerDown);
        dialog.removeEventListener("pointerup", handlePointerUp);
      }
    };
  }, [onClose]);

  const handleRequestClose = () => {
    dialogRef.current?.close();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="add-pocket-title"
      className="fixed inset-x-0 bottom-0 top-auto m-0 w-full max-w-none bg-white rounded-t-4xl p-6 shadow-2xl border-t border-grey300/60 max-h-[90dvh] overflow-y-auto open:flex flex-col backdrop:bg-teal-deep/40 backdrop:backdrop-blur-xs"
    >
      <div
        className="w-12 h-1 bg-grey300 rounded-full mx-auto mb-4 shrink-0"
        aria-hidden="true"
      />

      <div className="flex items-center justify-between gap-3 mb-4 shrink-0">
        <h2
          id="add-pocket-title"
          className="text-xl font-bold text-teal-deep leading-tight"
        >
          Add pocket
        </h2>
        <Button
          type="button"
          variant="icon"
          size="icon"
          aria-label="Close add pocket dialog"
          onClick={handleRequestClose}
          className="min-h-11 min-w-11 size-11 text-subtext hover:text-charcoal hover:bg-mist cursor-pointer flex items-center justify-center rounded-full"
        >
          <X className="size-5" aria-hidden="true" />
        </Button>
      </div>

      {isOpen && (
        <AddPocketForm onCancel={handleRequestClose} onCreated={onCreated} />
      )}
    </dialog>
  );
}
