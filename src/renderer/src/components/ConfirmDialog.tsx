import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import {
  currentConfirmationSelector,
  hasConfirmationsSelector,
  useConfirmStore,
} from "@/store/confirmStore";
import { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { useShallow } from "zustand/shallow";

export const ConfirmDialog = () => {
  const dialogRef = useRef(null);

  const { confirmations, closeCurrentConfirm } = useConfirmStore();
  const currentConfirmation = useConfirmStore(
    useShallow(currentConfirmationSelector),
  );
  const hasConfirmations = useConfirmStore(
    useShallow(hasConfirmationsSelector),
  );

  useOnClickOutside({
    ref: dialogRef,
    handler: closeCurrentConfirm,
  });

  if (!hasConfirmations || !currentConfirmation) {
    return null;
  }

  const { title, description, actions } = currentConfirmation;

  return (
    <Dialog open={hasConfirmations} onOpenChange={closeCurrentConfirm}>
      <DialogContent ref={dialogRef}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}

          {/* Show queue indicator if there are multiple confirmations */}
          {confirmations.length > 1 && (
            <DialogDescription className="text-xs text-muted-foreground">
              {confirmations.length -
                confirmations.indexOf(currentConfirmation)}{" "}
              of {confirmations.length} confirmations
            </DialogDescription>
          )}
        </DialogHeader>

        <DialogFooter>
          {/* Render actions from current confirmation */}
          {actions.map((act) => (
            <Button
              key={act.key}
              variant={act.variant ?? "default"}
              onClick={() => {
                // Run callback first (if any)
                try {
                  act.callbackFn?.();
                } catch (e) {
                  console.error("Error in confirmation callback:", e);
                  // Optionally show error toast or handle error
                }
                // Close current confirmation and show next one
                closeCurrentConfirm();
              }}
              style={{ marginLeft: 8 }}
            >
              {act.text}
            </Button>
          ))}

          {/* Optional: Add "Skip All" button if there are multiple confirmations */}
          {confirmations.length > 1 && (
            <Button
              variant="outline"
              onClick={() => {
                // Close all confirmations
                useConfirmStore.getState().clearAllConfirmations();
              }}
              style={{ marginLeft: 8 }}
            >
              Skip All ({confirmations.length})
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
