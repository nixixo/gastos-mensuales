"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { LuPlus, LuLogOut, LuSettings, LuListTodo } from "react-icons/lu";
import { useAuth } from "@/hooks/useAuth";
import { useExpenses } from "@/hooks/useExpenses";
import { formatCLP, getCurrentMonth, getMonthName, getMonthYearFromDate } from "@/lib/utils";
import DonutChart from "@/components/DonutChart";
import ExpenseList from "@/components/ExpenseList";
import AddExpenseModal from "@/components/AddExpenseModal";
import History from "@/components/History";
import ThemeSelector from "@/components/ThemeSelector";
import BudgetSelector from "@/components/BudgetSelector";
import { useMonthlyBudget } from "@/hooks/useMonthlyBudget";
import { useShoppingList } from "@/hooks/useShoppingList";
import ShoppingListModal from "@/components/ShoppingListModal";
import type { ShoppingItem, Expense } from "@/lib/types";

const current = getCurrentMonth();

type Tab = "actual" | "historial";

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("actual");
  const [modalOpen, setModalOpen] = useState(false);
  const [shoppingOpen, setShoppingOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showFab, setShowFab] = useState(true);
  const lastScrollY = useRef(0);

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

  // Hide FAB on scroll down, show it on scroll up
  useEffect(() => {
    lastScrollY.current = window.scrollY;
    let ticking = false;

    const updateFabVisibility = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;

      if (currentScrollY <= 24) {
        setShowFab(true);
      } else if (delta > 8) {
        setShowFab(false);
      } else if (delta < -2) {
        setShowFab(true);
      }
      lastScrollY.current = currentScrollY;

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateFabVisibility);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const userId = user?.id ?? "";
  const { expenses, total, isLoading, addExpense, addPreparedExpense, deleteExpense, updateAmount, updateName } =
    useExpenses(userId, current.month, current.year);
  const { budget, setBudget } = useMonthlyBudget(userId, current.month, current.year);
  const {
    items: shoppingItems,
    isLoading: shoppingLoading,
    addItem: addShoppingItem,
    deleteItem: deleteShoppingItem,
  } = useShoppingList(userId);
  const remaining = budget !== null ? budget - total : null;

  // Hold UI until auth and initial expenses are ready
  if (!isClient || authLoading || !user || !userId || isLoading) {
    return (
      <div className="flex flex-1 w-full items-center justify-center px-4 py-8">
        <div className="h-8 w-8 border-2 border-ui border-t-[var(--color-accent-primary)] rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/auth");
  };

  const handleConfirmShoppingItem = async (item: ShoppingItem) => {
    const { month, year } = getMonthYearFromDate(item.date);
    const expense: Expense = {
      id: crypto.randomUUID(),
      userId: item.userId,
      name: item.name,
      amount: item.amount,
      icon: item.icon,
      date: item.date,
      isMonthly: false,
      month,
      year,
      createdAt: Date.now(),
    };

    await addPreparedExpense(expense);
    await deleteShoppingItem(item.id);
  };

  return (
    <div className="flex flex-col flex-1 w-full max-w-md mx-auto px-4 py-8 gap-6 animate-page-fade-in">
      {/* User header with logout */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-secondary">Bienvenido</p>
          <h1 className="text-lg font-semibold text-primary">{user.username}</h1>
        </div>
        <div className="flex gap-2">
          <ThemeSelector />
          <BudgetSelector budget={budget} onChange={setBudget} />
          <button
            onClick={() => setShoppingOpen(true)}
            className="p-2 hover:bg-ui-hover rounded-lg transition-colors text-primary relative"
            title="Lista por comprar"
          >
            <LuListTodo size={20} />
            {shoppingItems.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-[var(--color-accent-primary)] text-[var(--color-accent-contrast)] text-[10px] font-semibold flex items-center justify-center">
                {shoppingItems.length}
              </span>
            )}
          </button>
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
      {budget !== null && (
        <div className="text-center">
          <p className="text-xs text-tertiary">Saldo restante</p>
          <p
            className={`text-base font-semibold ${
              remaining !== null && remaining < 0
                ? "text-red-400"
                : "text-[var(--color-accent-primary)]"
            }`}
          >
            {formatCLP(remaining ?? 0)}
          </p>
        </div>
      )}

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

          <div className="flex-1 pb-20 sm:pb-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-5 w-5 border-2 border-ui border-t-[var(--color-accent-primary)] rounded-full animate-spin" />
              </div>
            ) : (
              <ExpenseList
                expenses={expenses}
                onDelete={deleteExpense}
                onUpdateAmount={updateAmount}
                onUpdateName={updateName}
              />
            )}
          </div>

          {/* FAB */}
          <button
            onClick={() => setModalOpen(true)}
            className={`fixed right-6 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] h-14 w-14 flex items-center justify-center rounded-full btn-primary shadow-lg active:scale-95 transition-all duration-200 ${
              showFab
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 translate-y-3 pointer-events-none"
            }`}
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

      <ShoppingListModal
        open={shoppingOpen}
        onClose={() => setShoppingOpen(false)}
        userId={user.id}
        items={shoppingItems}
        isLoading={shoppingLoading}
        onAdd={addShoppingItem}
        onConfirm={handleConfirmShoppingItem}
        onDelete={deleteShoppingItem}
      />
    </div>
  );
}
