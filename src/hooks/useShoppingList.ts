"use client";

import { useCallback, useEffect, useState } from "react";
import type { ShoppingItem } from "@/lib/types";
import {
  addShoppingItem as dbAddShoppingItem,
  deleteShoppingItem as dbDeleteShoppingItem,
  getShoppingItems,
} from "@/lib/db";

export function useShoppingList(userId: string) {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!userId) {
        if (active) {
          setItems([]);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      const data = await getShoppingItems(userId);
      if (active) {
        setItems(data);
        setIsLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [userId]);

  const addItem = useCallback(
    async (name: string, amount: number, icon: string, date: string) => {
      const item: ShoppingItem = {
        id: crypto.randomUUID(),
        userId,
        name,
        amount,
        icon,
        date,
        createdAt: Date.now(),
      };

      await dbAddShoppingItem(item);
      setItems((current) => [item, ...current]);
    },
    [userId]
  );

  const deleteItem = useCallback(async (id: string) => {
    await dbDeleteShoppingItem(id);
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  return { items, isLoading, addItem, deleteItem };
}
