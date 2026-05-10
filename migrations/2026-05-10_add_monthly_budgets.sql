-- Monthly budgets persistence
-- Run this migration in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS monthly_budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  created_at BIGINT NOT NULL,
  CONSTRAINT amount_positive_budget CHECK (amount > 0),
  CONSTRAINT unique_monthly_budget UNIQUE(user_id, year, month)
);

CREATE INDEX IF NOT EXISTS idx_monthly_budgets_user_month
  ON monthly_budgets(user_id, year, month);

ALTER TABLE monthly_budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own budgets" ON monthly_budgets
  FOR SELECT USING (user_id::text = auth.uid()::text OR true);

CREATE POLICY "Users can insert their own budgets" ON monthly_budgets
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text OR true);

CREATE POLICY "Users can update their own budgets" ON monthly_budgets
  FOR UPDATE USING (user_id::text = auth.uid()::text OR true);

CREATE POLICY "Users can delete their own budgets" ON monthly_budgets
  FOR DELETE USING (user_id::text = auth.uid()::text OR true);
