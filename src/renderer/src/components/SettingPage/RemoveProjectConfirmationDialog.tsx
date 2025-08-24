import { cn } from "@/lib/utils";
import { AlertTriangle, Info } from "lucide-react";
import { FC, useEffect, useState } from "react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "danger" | "warning" | "info";
  requiresTextConfirmation?: boolean;
  confirmationText?: string;
}

export const ConfirmationDialog: FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  type = "info",
  requiresTextConfirmation = false,
  confirmationText = "",
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isValid, setIsValid] = useState(!requiresTextConfirmation);

  useEffect(() => {
    if (requiresTextConfirmation) {
      setIsValid(inputValue === confirmationText);
    }
  }, [inputValue, confirmationText, requiresTextConfirmation]);

  useEffect(() => {
    if (!isOpen) {
      setInputValue("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-xl rounded-lg max-w-md w-full mx-4 border-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            {type === "danger" && (
              <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            )}
            {type === "warning" && (
              <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
            )}
            {type === "info" && (
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Info className="w-5 h-5 text-blue-600" />
              </div>
            )}
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <p className="text-muted-foreground mb-6">{message}</p>

          {requiresTextConfirmation && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Type "{confirmationText}" to confirm:
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full px-3 py-2 border-0 bg-muted/50 focus:bg-muted/70 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                placeholder={confirmationText}
              />
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-border rounded-md hover:bg-muted/50 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={!isValid}
              className={cn(
                "px-4 py-2 rounded-md transition-colors text-white disabled:cursor-not-allowed",
                {
                  "bg-red-600 hover:bg-red-700 disabled:bg-red-400":
                    type === "danger",
                  "bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400":
                    type === "warning",
                  "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400":
                    type === "info",
                },
              )}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
