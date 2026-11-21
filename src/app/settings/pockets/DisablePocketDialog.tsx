"use client";

import { useActionState, useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";
import type { Pocket } from "@/db/schema";
import {
  disablePocketAction,
  type PocketActionState,
} from "@/app/actions/pockets";
import { Button } from "@/components/ui/button";
import { focusInitialDialogElement } from "@/lib/pockets";

interface DisablePocketDialogProps {
  pocket: Pocket | null;
  onClose: () => void;
  onDisabled: (pocketName: string) => void;
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

function DisablePocketForm({
  pocket,
  onCancel,
  onDisabled,
}: {
  pocket: Pocket;
  onCancel: () => void;
  onDisabled: (pocketName: string) => void;
}) {
  const [state, formAction, isPending] = useActionState<
    PocketActionState | null,
    FormData
  >(disablePocketAction, null);
  const handledStateRef = useRef<PocketActionState | null>(null);

  useEffect(() => {
    if (state && state !== handledStateRef.current) {
      handledStateRef.current = state;
      if (state.success && state.disabledPocketName) {
        onDisabled(state.disabledPocketName);
      }
    }
  }, [state, onDisabled]);

  const numericBalance = Number(pocket.balance || 0);
  const hasBalance = numericBalance > 0;
  const serverError = state?.error ?? null;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="pocketId" value={pocket.id} />

      <p className="text-sm text-charcoal leading-relaxed">
        Disabling{" "}
        <span className="font-bold text-teal-deep">{pocket.name}</span> removes
        it from Home, pocket lists, and new transactions. Past transactions in
        History stay intact.
      </p>

      {hasBalance && (
        <div
          role="note"
          className="flex items-start gap-2.5 rounded-xl bg-beige border border-warning/40 px-3.5 py-3 text-charcoal"
        >
          <AlertTriangle
            className="size-4.5 shrink-0 text-teal-deep mt-0.5"
            aria-hidden="true"
          />
          <p className="text-xs leading-relaxed">
            This pocket still has{" "}
            <span className="font-bold text-teal-deep">
              IDR {numericBalance.toLocaleString("id-ID")}
            </span>
            . Transfer the balance out first if you want to keep using those
            funds.
          </p>
        </div>
      )}

      {serverError && (
        <p role="alert" className="text-xs font-medium text-red-700">
          {serverError}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <Button
          type="button"
          variant="outline"
          size="lg"
          data-dialog-initial-focus=""
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
          disabled={isPending}
          className="flex-1 min-h-12 rounded-xl bg-red-700 hover:bg-red-700/90 text-white font-semibold cursor-pointer disabled:cursor-not-allowed"
        >
          {isPending ? "Disabling..." : "Disable Pocket"}
        </Button>
      </div>
    </form>
  );
}

export function DisablePocketDialog({
  pocket,
  onClose,
  onDisabled,
}: DisablePocketDialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const isOpen = pocket !== null;

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
      aria-labelledby="disable-pocket-title"
      className="fixed inset-x-0 bottom-0 top-auto m-0 w-full max-w-none bg-white rounded-t-4xl p-6 shadow-2xl border-t border-grey300/60 max-h-[90dvh] overflow-y-auto open:flex flex-col backdrop:bg-teal-deep/40 backdrop:backdrop-blur-xs"
    >
      <div
        className="w-12 h-1 bg-grey300 rounded-full mx-auto mb-4 shrink-0"
        aria-hidden="true"
      />

      <div className="flex items-center justify-between gap-3 mb-3 shrink-0">
        <h2
          id="disable-pocket-title"
          className="text-xl font-bold text-teal-deep leading-tight"
        >
          Disable pocket?
        </h2>
        <Button
          type="button"
          variant="icon"
          size="icon"
          aria-label="Close disable confirmation dialog"
          onClick={handleRequestClose}
          className="min-h-11 min-w-11 size-11 text-subtext hover:text-charcoal hover:bg-mist cursor-pointer flex items-center justify-center rounded-full"
        >
          <X className="size-5" aria-hidden="true" />
        </Button>
      </div>

      {pocket && (
        <DisablePocketForm
          key={pocket.id}
          pocket={pocket}
          onCancel={handleRequestClose}
          onDisabled={onDisabled}
        />
      )}
    </dialog>
  );
}
