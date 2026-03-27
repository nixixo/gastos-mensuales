"use client";

import { useState } from "react";
import { LuPlus } from "react-icons/lu";
import { useExpenses } from "@/hooks/useExpenses";
import { getCurrentMonth, getMonthName } from "@/lib/utils";
import DonutChart from "@/components/DonutChart";
import ExpenseList from "@/components/ExpenseList";
import AddExpenseModal from "@/components/AddExpenseModal";
import History from "@/components/History";

const current = getCurrentMonth();

type Tab = "actual" | "historial";

export default function Home() {
  const [tab, setTab] = useState<Tab>("actual");
  const [modalOpen, setModalOpen] = useState(false);

  const { expenses, total, isLoading, addExpense, deleteExpense, updateAmount } =
    useExpenses(current.month, current.year);

  return (
    <div className="flex flex-col flex-1 w-full max-w-md mx-auto px-4 py-8 gap-6">
      {/* Month header */}
      <h2 className="text-lg font-medium tracking-tight text-center">
        {getMonthName(current.month)} {current.year}
      </h2>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1">
        <button
          onClick={() => setTab("actual")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            tab === "actual"
              ? "bg-white/10 text-white"
              : "text-white/40 hover:text-white/60"
          }`}
        >
          Actual
        </button>
        <button
          onClick={() => setTab("historial")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            tab === "historial"
              ? "bg-white/10 text-white"
              : "text-white/40 hover:text-white/60"
          }`}
        >
          Historial
        </button>
      </div>

      {tab === "actual" ? (
        <>
          {!isLoading && <DonutChart expenses={expenses} total={total} />}

          <div className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            ) : (
              <ExpenseList expenses={expenses} onDelete={deleteExpense} onUpdateAmount={updateAmount} />
            )}
          </div>

          {/* FAB */}
          <button
            onClick={() => setModalOpen(true)}
            className="fixed bottom-6 right-6 h-14 w-14 flex items-center justify-center rounded-full bg-white text-black shadow-lg hover:bg-white/90 transition-colors active:scale-95"
          >
            <LuPlus size={24} />
          </button>

          <AddExpenseModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onAdd={addExpense}
          />
        </>
      ) : (
        <History />
      )}
    </div>
  );
}
