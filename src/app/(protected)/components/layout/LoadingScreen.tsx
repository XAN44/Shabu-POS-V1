import React from "react";

interface LoadingScreenProps {
  title: string;
  subtitle: string;
}

export function LoadingScreen({ title, subtitle }: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto shadow-lg"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-indigo-400 rounded-full animate-spin mx-auto mt-2 ml-2"></div>
          <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-purple-300 rounded-full animate-spin mx-auto mt-4 ml-4"></div>
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
          {title}
        </h2>
        <p className="text-gray-600 text-lg">{subtitle}</p>
      </div>
    </div>
  );
}
