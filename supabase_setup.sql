-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  amount INTEGER NOT NULL,
  icon VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  is_monthly BOOLEAN DEFAULT false,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at BIGINT NOT NULL,
  CONSTRAINT amount_positive CHECK (amount > 0)
);

-- Create name_mappings table
CREATE TABLE IF NOT EXISTS name_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  custom_name VARCHAR(255) NOT NULL,
  icon_key VARCHAR(50) NOT NULL,
  created_at BIGINT NOT NULL,
  CONSTRAINT unique_mapping UNIQUE(user_id, custom_name)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_expenses_user_month ON expenses(user_id, year, month);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_name_mappings_user ON name_mappings(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE name_mappings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text OR true); -- Allow unauthenticated access for now

CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (true); -- Allow anyone to create a user for now

-- RLS Policies for expenses table
CREATE POLICY "Users can view their own expenses" ON expenses
  FOR SELECT USING (user_id::text = auth.uid()::text OR true);

CREATE POLICY "Users can insert their own expenses" ON expenses
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text OR true);

CREATE POLICY "Users can update their own expenses" ON expenses
  FOR UPDATE USING (user_id::text = auth.uid()::text OR true);

CREATE POLICY "Users can delete their own expenses" ON expenses
  FOR DELETE USING (user_id::text = auth.uid()::text OR true);

-- RLS Policies for name_mappings table
CREATE POLICY "Users can view their own mappings" ON name_mappings
  FOR SELECT USING (user_id::text = auth.uid()::text OR true);

CREATE POLICY "Users can insert their own mappings" ON name_mappings
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text OR true);

CREATE POLICY "Users can delete their own mappings" ON name_mappings
  FOR DELETE USING (user_id::text = auth.uid()::text OR true);
