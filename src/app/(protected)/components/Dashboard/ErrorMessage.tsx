import React from "react";
import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
  error: string;
  onDismiss: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  onDismiss,
}) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 shadow-sm">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
        </div>
        <div className="flex-1">
          <h4 className="text-red-800 font-medium">เกิดข้อผิดพลาด</h4>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
        <button
          onClick={onDismiss}
          className="text-red-500 hover:text-red-700 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
