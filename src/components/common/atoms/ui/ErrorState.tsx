// components/common/atoms/ui/ErrorState.tsx
import useLanguage from "@/hooks/useLanguage";
import React from "react";

interface ErrorStateProps {
  message?: string;
  showRetry?: boolean;
  onRetry?: () => void;
}

const ErrorState = ({
  message = "Error loading data",
  showRetry = false,
  onRetry,
}: ErrorStateProps) => {
  const { t } = useLanguage();
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-secondary rounded-full p-6 mb-4">
        <svg
          className="w-12 h-12 text-red-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Document Base */}
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          {/* Document Fold */}
          <polyline points="14 2 14 8 20 8" />
          {/* Error X */}
          <line x1="9" y1="12" x2="15" y2="18" />
          <line x1="15" y1="12" x2="9" y2="18" />
        </svg>
      </div>
      <h3 className="text-xl font-medium text-twhite mb-2">
        {t("Something went wrong")}
      </h3>
      <p className="text-tmid mb-6">{t(message)}</p>
      {showRetry && (
        <button
          onClick={onRetry}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-md transition-colors duration-200 flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
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
          {t("Try Again")}
        </button>
      )}
    </div>
  );
};

export default ErrorState;
