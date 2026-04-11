"use client";

import { useState, useEffect } from "react";
import { LuCalendar, LuChevronDown } from "react-icons/lu";
import { getPastMonths, type MonthSummary, getExpensesByMonth } from "@/lib/db";
import { getMonthName, formatCLP, getCurrentMonth, formatDateString } from "@/lib/utils";
import { ICON_MAP } from "@/lib/icon-map";
import type { Expense } from "@/lib/types";

interface HistoryProps {
  userId: string;
}

interface ExpandedMonth {
  year: number;
  month: number;
  expenses: Expense[];
}

export default function History({ userId }: HistoryProps) {
  const [months, setMonths] = useState<MonthSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<ExpandedMonth | null>(null);

  useEffect(() => {
    const { month, year } = getCurrentMonth();
    getPastMonths(userId, month, year).then((data) => {
      setMonths(data);
      setLoading(false);
    });
  }, [userId]);

  const handleExpandMonth = async (month: number, year: number) => {
    if (expanded?.month === month && expanded?.year === year) {
      setExpanded(null);
      return;
    }
    
    const expenses = await getExpensesByMonth(userId, year, month);
    setExpanded({ year, month, expenses });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-5 w-5 border-2 border-ui rounded-full animate-spin" style={{borderTopColor: 'var(--color-text-primary)'}} />
      </div>
    );
  }

  if (months.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <LuCalendar size={32} className="text-tertiary opacity-50" />
        <p className="text-sm text-tertiary">Sin historial todavia</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-ui">
      {months.map((m) => {
        const isExpanded = expanded?.month === m.month && expanded?.year === m.year;
        
        return (
          <div key={`${m.year}-${m.month}`}>
            <button
              onClick={() => handleExpandMonth(m.month, m.year)}
              className="w-full flex items-center justify-between py-4 px-1 hover:bg-ui-hover transition-colors rounded-lg"
            >
              <div className="flex flex-col text-left flex-1">
                <span className="text-sm font-medium">
                  {getMonthName(m.month)} {m.year}
                </span>
                <span className="text-xs text-tertiary">
                  {m.count} {m.count === 1 ? "gasto" : "gastos"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium tabular-nums">
                  {formatCLP(m.total)}
                </span>
                <LuChevronDown
                  size={18}
                  className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
                />
              </div>
            </button>

            {/* Expanded content */}
            {isExpanded && expanded && (
              <div className="pl-2 pb-4 space-y-2 border-l border-ui ml-2">
                {expanded.expenses.map((expense) => {
                  const iconEntry = ICON_MAP[expense.icon];
                  const Icon = iconEntry?.icon;
                  
                  return (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between bg-ui-input rounded-lg px-3 py-2"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {Icon && (
                          <Icon
                            size={16}
                            className="shrink-0 text-secondary"
                            style={
                              iconEntry.color && iconEntry.category === "brand"
                                ? { color: iconEntry.color }
                                : undefined
                            }
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate">{expense.name}</p>
                          <p className="text-xs text-tertiary">
                            {formatDateString(expense.date)}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-medium ml-2 shrink-0">
                        {formatCLP(expense.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
