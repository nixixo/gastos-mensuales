"use client";

import { useState } from "react";
import { LuCheck, LuPlus, LuShoppingBag, LuX } from "react-icons/lu";
import type { ShoppingItem } from "@/lib/types";
import { ICON_MAP } from "@/lib/icon-map";
import { formatCLP, formatDateString } from "@/lib/utils";
import AddExpenseModal from "./AddExpenseModal";

interface ShoppingListModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  items: ShoppingItem[];
  isLoading: boolean;
  onAdd: (name: string, amount: number, icon: string, date: string) => void;
  onConfirm: (item: ShoppingItem) => void;
  onDelete: (id: string) => void;
}

export default function ShoppingListModal({
  open,
  onClose,
  userId,
  items,
  isLoading,
  onAdd,
  onConfirm,
  onDelete,
}: ShoppingListModalProps) {
  const [showAddModal, setShowAddModal] = useState(false);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center">
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="relative w-full sm:max-w-md bg-secondary border border-ui rounded-t-2xl sm:rounded-2xl p-6 flex flex-col gap-5 animate-slide-up max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Lista por comprar</h3>
              <p className="text-sm text-tertiary">Pendientes antes de convertirlos en gasto real</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
            >
              <LuX size={18} />
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="w-full py-3 rounded-xl btn-primary font-medium text-sm flex items-center justify-center gap-2"
          >
            <LuPlus size={16} />
            Agregar a la lista
          </button>

          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-5 w-5 border-2 border-ui border-t-[var(--color-accent-primary)] rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="py-10 text-center">
              <LuShoppingBag size={28} className="mx-auto text-tertiary mb-3" />
              <p className="text-sm text-secondary">No hay compras pendientes</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {items.map((item) => {
                const entry = ICON_MAP[item.icon] ?? ICON_MAP.other;
                const Icon = entry.icon;
                const brandColor = entry.category === "brand" ? entry.color : undefined;

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 py-3 px-1"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ui-input">
                      <Icon
                        size={18}
                        className={brandColor ? "" : "text-secondary"}
                        style={brandColor ? { color: brandColor } : undefined}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-tertiary">
                        {formatDateString(item.date)} • {formatCLP(item.amount)}
                      </p>
                    </div>

                    <button
                      onClick={() => onConfirm(item)}
                      className="p-2 rounded-full hover:bg-ui-hover transition-colors text-[var(--color-accent-primary)]"
                      title="Convertir en gasto"
                    >
                      <LuCheck size={16} />
                    </button>

                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-2 rounded-full hover:bg-ui-hover transition-colors text-secondary hover:text-primary"
                      title="Eliminar"
                    >
                      <LuX size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AddExpenseModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={(name, amount, icon, date) => onAdd(name, amount, icon, date)}
        userId={userId}
        title="Agregar compra pendiente"
        submitLabel="Agregar a la lista"
        showMonthlyOption={false}
      />
    </>
  );
}
