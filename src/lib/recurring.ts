import type { Expense } from './types';
import { getExpensesByMonth, addExpense } from './db';

/**
 * Handles monthly recurring expenses
 * Copies expenses with isMonthly=true from previous month to current month
 */
export async function handleMonthlyRecurring(
  userId: string,
  currentMonth: number,
  currentYear: number
): Promise<void> {
  try {
    // Calculate previous month
    let prevMonth = currentMonth - 1;
    let prevYear = currentYear;
    
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear -= 1;
    }

    // Get all expenses from previous month
    const prevMonthExpenses = await getExpensesByMonth(userId, prevYear, prevMonth);

    // Filter to only monthly recurring expenses
    const monthlyExpenses = prevMonthExpenses.filter((e) => e.isMonthly);

    if (monthlyExpenses.length === 0) {
      return; // No recurring expenses to copy
    }

    // Get the current month's expenses to avoid duplicates
    const currentMonthExpenses = await getExpensesByMonth(userId, currentYear, currentMonth);
    const currentMonthNames = new Set(currentMonthExpenses.map((e) => e.name));

    // Create copies of recurring expenses in current month
    for (const expense of monthlyExpenses) {
      // Skip if we already have an expense with the same name in this month
      // (avoid duplicate copies in case this function runs twice)
      if (currentMonthNames.has(expense.name)) {
        continue;
      }

      // Calculate new date: preserve day of month if possible
      const originalDate = new Date(expense.date);
      const dayOfMonth = originalDate.getDate();
      
      // Create date in current month
      const newDate = new Date(currentYear, currentMonth - 1, dayOfMonth);
      
      // Make sure the date is within the current month
      // (in case original was on day 30/31 and current month is shorter)
      if (newDate.getMonth() !== currentMonth - 1) {
        // If date rolled over to next month, use last day of current month
        newDate.setDate(0);
      }

      const newExpense: Expense = {
        id: crypto.randomUUID(),
        userId,
        name: expense.name,
        amount: expense.amount,
        icon: expense.icon,
        date: newDate.toISOString().split('T')[0],
        isMonthly: true,
        month: currentMonth,
        year: currentYear,
        createdAt: Date.now(),
      };

      try {
        await addExpense(newExpense);
      } catch (e) {
        console.warn(`Failed to copy recurring expense "${expense.name}":`, e);
        // Continue with next expense even if one fails
      }
    }
  } catch (e) {
    console.error('Error handling monthly recurring expenses:', e);
    // Non-fatal: don't break the app if recurring logic fails
  }
}
