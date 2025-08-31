// components/Dashboard/LoadingScreen.tsx
"use client";

import React from "react";

interface LoadingScreenProps {
  message?: string;
  showProgress?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "กำลังโหลดข้อมูล...",
  showProgress = false,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          {/* Animated loading spinner */}
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>

          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {message}
          </h2>
          <p className="text-sm text-gray-600">กรุณารอสักครู่...</p>
        </div>

        {showProgress && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full animate-pulse"
              style={{ width: "60%" }}
            ></div>
          </div>
        )}

        {/* Animated dots */}
        <div className="flex justify-center space-x-1 mt-4">
          <div
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

// components/Dashboard/MinimalLoadingScreen.tsx
export const MinimalLoadingScreen: React.FC<{ message?: string }> = ({
  message = "กำลังโหลด...",
}) => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="relative w-8 h-8 mx-auto mb-3">
          <div className="absolute inset-0 border-2 border-gray-300 rounded-full"></div>
          <div className="absolute inset-0 border-2 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
};
