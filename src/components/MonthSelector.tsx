"use client";

import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { getMonthName } from "@/lib/utils";

interface MonthSelectorProps {
  month: number;
  year: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function MonthSelector({
  month,
  year,
  onPrev,
  onNext,
}: MonthSelectorProps) {
  return (
    <div className="flex items-center justify-between w-full max-w-xs mx-auto">
      <button
        onClick={onPrev}
        className="p-2 rounded-full hover:bg-white/5 transition-colors"
      >
        <LuChevronLeft size={20} />
      </button>
      <h2 className="text-lg font-medium tracking-tight">
        {getMonthName(month)} {year}
      </h2>
      <button
        onClick={onNext}
        className="p-2 rounded-full hover:bg-white/5 transition-colors"
      >
        <LuChevronRight size={20} />
      </button>
    </div>
  );
}
