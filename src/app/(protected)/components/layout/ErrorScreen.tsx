import React from "react";
import { X } from "lucide-react";

interface ErrorScreenProps {
  title: string;
  description: string;
  buttonText: string;
  gradientFrom: string;
  gradientVia: string;
  gradientTo: string;
  buttonGradient: string;
  buttonHover: string;
}

export function ErrorScreen({
  title,
  description,
  buttonText,
  gradientFrom,
  gradientVia,
  gradientTo,
  buttonGradient,
  buttonHover,
}: ErrorScreenProps) {
  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${gradientFrom} ${gradientVia} ${gradientTo} flex items-center justify-center p-6`}
    >
      <div className="max-w-lg w-full bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl p-10 text-center border border-white/30 relative overflow-hidden">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradientFrom}/20 ${gradientTo}/20 pointer-events-none`}
        ></div>
        <div className="relative z-10">
          <div
            className={`w-20 h-20 bg-gradient-to-br ${buttonGradient} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}
          >
            <X className="w-10 h-10 text-white" />
          </div>
          <h1
            className={`text-3xl font-bold bg-gradient-to-r ${buttonGradient} bg-clip-text text-transparent mb-4`}
          >
            {title}
          </h1>
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
            {description}
          </p>
          <button
            onClick={() => window.location.reload()}
            className={`w-full bg-gradient-to-r ${buttonGradient} ${buttonHover} text-white py-4 px-6 rounded-2xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-200`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
