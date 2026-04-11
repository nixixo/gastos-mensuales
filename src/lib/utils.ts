const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export function getMonthName(month: number): string {
  return MONTH_NAMES[month - 1];
}

export function formatCLP(amount: number): string {
  return "$" + amount.toLocaleString("es-CL");
}

export function getCurrentMonth(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export function getPreviousMonth(month: number, year: number) {
  if (month === 1) return { month: 12, year: year - 1 };
  return { month: month - 1, year };
}

export function getNextMonth(month: number, year: number) {
  if (month === 12) return { month: 1, year: year + 1 };
  return { month: month + 1, year };
}

/**
 * Formats a date string (YYYY-MM-DD) safely without timezone issues.
 * Parses manually to avoid `new Date(string)` UTC interpretation.
 */
export function formatDateString(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr; // fallback if invalid format
  
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  
  // Create Date in local timezone
  const date = new Date(year, month - 1, day);
  
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
  });
}
