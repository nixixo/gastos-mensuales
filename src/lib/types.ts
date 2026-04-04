export interface Expense {
  id: string;
  userId: string;
  name: string;
  amount: number;
  icon: string;
  date: string; // ISO format: YYYY-MM-DD
  isMonthly: boolean;
  month: number;
  year: number;
  createdAt: number;
}

export interface NameMapping {
  id: string;
  userId: string;
  customName: string;
  iconKey: string;
  createdAt: number;
}

export interface MonthKey {
  month: number;
  year: number;
}

export interface User {
  id: string;
  username: string;
  createdAt: number;
}
