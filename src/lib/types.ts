export interface Expense {
  id: string;
  name: string;
  amount: number;
  icon: string;
  month: number;
  year: number;
  createdAt: number;
}

export interface MonthKey {
  month: number;
  year: number;
}
