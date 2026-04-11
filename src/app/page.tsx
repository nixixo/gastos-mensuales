"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LuPlus, LuLogOut, LuSettings } from "react-icons/lu";
import { useAuth } from "@/hooks/useAuth";
import { useExpenses } from "@/hooks/useExpenses";
import { getCurrentMonth, getMonthName } from "@/lib/utils";
import DonutChart from "@/components/DonutChart";
import ExpenseList from "@/components/ExpenseList";
import AddExpenseModal from "@/components/AddExpenseModal";
import History from "@/components/History";
import ThemeSelector from "@/components/ThemeSelector";

const current = getCurrentMonth();

type Tab = "actual" | "historial";

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("actual");
  const [modalOpen, setModalOpen] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [isClient, setIsClient] = useState(false);

  // Hydration fix: only render on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [authLoading, user, router]);

  // Mantener userId estable incluso cuando user cambia
  useEffect(() => {
    if (user?.id) {
      setUserId(user.id);
    }
  }, [user?.id]);

  const { expenses, total, isLoading, addExpense, deleteExpense, updateAmount } =
    useExpenses(userId, current.month, current.year);

  // Prevent hydration mismatch during auth check
  if (!isClient || authLoading || !user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/auth");
  };

  return (
    <div className="flex flex-col flex-1 w-full max-w-md mx-auto px-4 py-8 gap-6">
      {/* User header with logout */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-secondary">Bienvenido</p>
          <h1 className="text-lg font-semibold text-primary">{user.username}</h1>
        </div>
        <div className="flex gap-2">
          <ThemeSelector />
          <button
            onClick={() => router.push("/settings")}
            className="p-2 hover:bg-ui-hover rounded-lg transition-colors"
            title="Configuración"
          >
            <LuSettings size={20} />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-ui-hover rounded-lg transition-colors"
            title="Cerrar sesión"
          >
            <LuLogOut size={20} />
          </button>
        </div>
      </div>

      {/* Month header */}
      <h2 className="text-lg font-medium tracking-tight text-center">
        {getMonthName(current.month)} {current.year}
      </h2>

      {/* Tabs */}
      <div className="flex gap-1 bg-ui-input rounded-xl p-1">
        <button
          onClick={() => setTab("actual")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            tab === "actual"
              ? "bg-ui-hover text-primary"
              : "text-tertiary hover:text-secondary"
          }`}
        >
          Actual
        </button>
        <button
          onClick={() => setTab("historial")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            tab === "historial"
              ? "bg-ui-hover text-primary"
              : "text-tertiary hover:text-secondary"
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
            className="fixed bottom-6 right-6 h-14 w-14 flex items-center justify-center rounded-full btn-primary shadow-lg active:scale-95"
          >
            <LuPlus size={24} />
          </button>

          <AddExpenseModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onAdd={addExpense}
            userId={user.id}
          />
        </>
      ) : (
        <History userId={user.id} />
      )}
    </div>
  );
}
