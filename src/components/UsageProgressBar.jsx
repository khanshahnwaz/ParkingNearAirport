"use client";
import React from "react";

export default function UsageProgressBar({ uses_count = 0, usage_limit = 0 }) {
  const usedPercent =
    usage_limit > 0 ? Math.min((uses_count / usage_limit) * 100, 100) : 0;

  const color =
    usedPercent >= 90
      ? "bg-red-500"
      : usedPercent >= 60
      ? "bg-yellow-400"
      : "bg-green-500";

  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>
          Used: {uses_count}/{usage_limit > 0 ? usage_limit : "∞"}
        </span>
        {usage_limit > 0 && <span>{usedPercent.toFixed(0)}%</span>}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`${color} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${usedPercent}%` }}
        ></div>
      </div>
    </div>
  );
}
