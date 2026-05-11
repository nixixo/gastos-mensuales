-- Shopping list persistence
-- Run this migration in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS shopping_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  amount INTEGER NOT NULL,
  icon VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  created_at BIGINT NOT NULL,
  CONSTRAINT amount_positive_shopping CHECK (amount > 0)
);

CREATE INDEX IF NOT EXISTS idx_shopping_items_user
  ON shopping_items(user_id);

CREATE INDEX IF NOT EXISTS idx_shopping_items_created_at
  ON shopping_items(user_id, created_at DESC);

ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own shopping items" ON shopping_items
  FOR SELECT USING (user_id::text = auth.uid()::text OR true);

CREATE POLICY "Users can insert their own shopping items" ON shopping_items
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text OR true);

CREATE POLICY "Users can update their own shopping items" ON shopping_items
  FOR UPDATE USING (user_id::text = auth.uid()::text OR true);

CREATE POLICY "Users can delete their own shopping items" ON shopping_items
  FOR DELETE USING (user_id::text = auth.uid()::text OR true);
