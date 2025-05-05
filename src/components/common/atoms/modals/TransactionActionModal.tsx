import useLanguage from "@/hooks/useLanguage";
import { useEffect, useState } from "react";

type ActionType =
  | "approve"
  | "reject"
  | "send_back"
  | "restart"
  | "finish"
  | "done";

interface TransactionActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (note: string) => void;
  actionType: ActionType;
}

const TransactionActionModal = ({
  isOpen,
  onClose,
  onSubmit,
  actionType,
}: TransactionActionModalProps) => {
  const { t } = useLanguage();
  const [note, setNote] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      setTimeout(() => setIsVisible(false), 200);
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(note);
    setNote("");
    onClose();
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const getActionColor = () => {
    switch (actionType) {
      case "approve":
      case "done":
      case "finish":
        return "bg-green-500/10 text-green-500";
      case "reject":
        return "bg-red-500/10 text-red-500";
      case "send_back":
        return "bg-yellow-500/10 text-yellow-500";
      case "restart":
        return "bg-blue-500/10 text-blue-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  const getActionIcon = () => {
    switch (actionType) {
      case "approve":
      case "done":
      case "finish":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case "reject":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
      case "send_back":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
            />
          </svg>
        );
      case "restart":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 -top-4 z-50 ${isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
        } transition-opacity duration-300`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            className={`bg-secondary rounded-xl p-6 max-w-md w-full transform ${isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              } transition-all duration-300`}
          >
            {/* Title */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${getActionColor()}`}>
                {getActionIcon()}
              </div>
              <h2 className="text-xl font-semibold text-twhite">
                {t(actionType.charAt(0).toUpperCase() + actionType.slice(1))}
              </h2>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="gap-4">
              <div>
                <label className="block text-sm text-tmid mb-2">
                  {t("Note")}
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-main rounded-lg p-3 text-twhite resize-none min-h-[100px] outline-none"
                  required
                  placeholder={t("Enter your note here...")}
                  autoFocus
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700/30">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-dark text-tmid hover:bg-tblack hover:text-twhite transition-colors"
                >
                  {t("Cancel")}
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-lg ${getActionColor()} hover:opacity-90 transition-colors`}
                >
                  {t("Confirm")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionActionModal;
