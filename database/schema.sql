-- =============================================================================
-- TeenSpend Database Schema (Supabase PostgreSQL)
-- Production-ready schema for Teen Expense Tracker
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. USERS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    age INT NOT NULL CHECK (age >= 10 AND age <= 25),
    currency VARCHAR(5) NOT NULL DEFAULT 'USD',
    monthly_income NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (monthly_income >= 0),
    savings_goal NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (savings_goal >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for email lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- -----------------------------------------------------------------------------
-- 2. EXPENSES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    category VARCHAR(50) NOT NULL,
    description VARCHAR(255) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'Cash',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance and scoping queries
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_user_category ON expenses(user_id, category);

-- -----------------------------------------------------------------------------
-- 3. INCOME TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS income (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    source VARCHAR(100) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for income queries
CREATE INDEX IF NOT EXISTS idx_income_user_id ON income(user_id);
CREATE INDEX IF NOT EXISTS idx_income_user_date ON income(user_id, date DESC);

-- -----------------------------------------------------------------------------
-- 4. BUDGETS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    month INT NOT NULL CHECK (month >= 1 AND month <= 12),
    year INT NOT NULL CHECK (year >= 2020),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_category_month_year UNIQUE (user_id, category, month, year)
);

-- Index for fast budget retrieval per period
CREATE INDEX IF NOT EXISTS idx_budgets_user_period ON budgets(user_id, year, month);

-- -----------------------------------------------------------------------------
-- 5. SAVINGS GOALS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS savings_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    target_amount NUMERIC(12, 2) NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (current_amount >= 0),
    target_date DATE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON savings_goals(user_id);

-- -----------------------------------------------------------------------------
-- 6. RECURRING EXPENSES TABLE (Subscriptions & recurring commitments)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recurring_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('Weekly', 'Monthly', 'Yearly')),
    next_payment_date DATE NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'Subscriptions',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recurring_user_id ON recurring_expenses(user_id);

-- -----------------------------------------------------------------------------
-- 7. CUSTOM CATEGORIES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS custom_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    icon VARCHAR(20) DEFAULT '🏷️',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_category_name UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_custom_categories_user ON custom_categories(user_id);

-- -----------------------------------------------------------------------------
-- 8. AUTOMATIC UPDATED_AT TRIGGER FUNCTION
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_users_updated_at') THEN
        CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_expenses_updated_at') THEN
        CREATE TRIGGER trg_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_income_updated_at') THEN
        CREATE TRIGGER trg_income_updated_at BEFORE UPDATE ON income FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_budgets_updated_at') THEN
        CREATE TRIGGER trg_budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_goals_updated_at') THEN
        CREATE TRIGGER trg_goals_updated_at BEFORE UPDATE ON savings_goals FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_recurring_updated_at') THEN
        CREATE TRIGGER trg_recurring_updated_at BEFORE UPDATE ON recurring_expenses FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE income ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_categories ENABLE ROW LEVEL SECURITY;

-- Note: When querying via Supabase Service Role Key on backend, RLS is bypassed by design
-- for admin/backend services, but these policies guarantee zero data leakage when
-- authenticated Supabase JWTs or Supabase Auth are used.

DROP POLICY IF EXISTS "Users can only read their own user record" ON users;
CREATE POLICY "Users can only read their own user record" ON users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can only update their own user record" ON users;
CREATE POLICY "Users can only update their own user record" ON users
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can manage their own expenses" ON expenses;
CREATE POLICY "Users can manage their own expenses" ON expenses
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own income" ON income;
CREATE POLICY "Users can manage their own income" ON income
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own budgets" ON budgets;
CREATE POLICY "Users can manage their own budgets" ON budgets
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own goals" ON savings_goals;
CREATE POLICY "Users can manage their own goals" ON savings_goals
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own recurring expenses" ON recurring_expenses;
CREATE POLICY "Users can manage their own recurring expenses" ON recurring_expenses
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own custom categories" ON custom_categories;
CREATE POLICY "Users can manage their own custom categories" ON custom_categories
    FOR ALL USING (auth.uid() = user_id);
