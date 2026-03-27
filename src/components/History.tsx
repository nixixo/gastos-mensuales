"use client";

import { useState, useEffect } from "react";
import { LuCalendar } from "react-icons/lu";
import { getPastMonths, type MonthSummary } from "@/lib/db";
import { getMonthName, formatCLP, getCurrentMonth } from "@/lib/utils";

export default function History() {
  const [months, setMonths] = useState<MonthSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { month, year } = getCurrentMonth();
    getPastMonths(month, year).then((data) => {
      setMonths(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (months.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <LuCalendar size={32} className="text-white/15" />
        <p className="text-sm text-white/30">Sin historial todavia</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-white/5">
      {months.map((m) => (
        <div
          key={`${m.year}-${m.month}`}
          className="flex items-center justify-between py-4 px-1"
        >
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {getMonthName(m.month)} {m.year}
            </span>
            <span className="text-xs text-white/40">
              {m.count} {m.count === 1 ? "gasto" : "gastos"}
            </span>
          </div>
          <span className="text-sm font-medium tabular-nums">
            {formatCLP(m.total)}
          </span>
        </div>
      ))}
    </div>
  );
}
