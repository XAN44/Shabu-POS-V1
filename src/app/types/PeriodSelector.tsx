"use client";
import React from "react";
import { TimePeriod } from "./typesChart";

interface PeriodSelectorProps {
  activePeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  className?: string;
}

const periodLabels: Record<TimePeriod, string> = {
  today: "วันนี้",
  thisWeek: "สัปดาห์นี้",
  thisMonth: "เดือนนี้",
  thisYear: "ปีนี้",
};

const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  activePeriod,
  onPeriodChange,
  className = "",
}) => {
  const periods: TimePeriod[] = ["today", "thisWeek", "thisMonth", "thisYear"];

  return (
    <div className={`flex flex-wrap gap-2 mb-4 ${className}`}>
      {periods.map((period) => (
        <button
          key={period}
          onClick={() => onPeriodChange(period)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            activePeriod === period
              ? "bg-blue-500 text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {periodLabels[period]}
        </button>
      ))}
    </div>
  );
};

export default PeriodSelector;
