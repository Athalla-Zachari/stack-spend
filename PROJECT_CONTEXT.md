# My Daily Expense Tracker — Your Guided Build Plan

## What it is
A personal finance web app that YOU build yourself on the blueprint's exact stack (Next.js + Supabase + Vercel), with me as your on-demand assistant: you drive and ask the questions, I explain, unblock, and write code only when you tell me to. All amounts are in Indonesian Rupiah, data is private per account, and the finished app installs on your phone like an app.

## Who it's for
You — comfortable enough with frontend, new to backend/database work, with VS Code and a Supabase account already set up. The working agreement: most of the time you ask and I answer; when you want code, you say so and I provide it piece by piece with a plain explanation of what it does. Supabase setup gets the closest supervision — one small step at a time, checking your result before moving to the next.

## Core features and experience
From your blueprint PDF and ER diagram, all in Rupiah:
1. **Accounts** — email + password login (Supabase Auth). Every record belongs to one user, enforced by database-level rules (Row Level Security), not just hidden in the UI.
2. **Expense logging** — quick entry with reusable templates for variable expenses (food, gas, entertainment) and fixed ones (electricity, rent/kos, weekly shops): amount, category, date, note.
3. **Income** — logged alongside expenses so totals, budgets, and savings progress are mathematically grounded.
4. **Insights** — day/week/month views; largest and smallest expense; rankings by item and by category; trend charts.
5. **Budgets** — daily/weekly limits (optionally per category) with live progress and an over-budget warning.
6. **Savings targets** — a monthly target plus its purpose; real-time progress computed from net income.
7. **Debts** — creditor, total amount, paid so far, due date, status; payoff progress; due-soon/overdue badges plus a dashboard alert (in-app only, no emails).
8. **Reports** — daily/weekly/monthly summaries, exportable.
9. **Mobile-first PWA** — installable to the home screen; bottom-sheet quick entry.

## Phase 1: what gets built now
Guided step by step — you run everything, I check each result. Phase 1 ends with a working end-to-end slice: sign up → log in → log your first expense → see it on screen, stored in your own Supabase database.

1. **Project skeleton** — create the Next.js app locally (App Router, TypeScript, Tailwind, shadcn UI), push it to a GitHub repo.
2. **Supabase wiring** — grab the Project URL and anon key (for this build you never need the scary database connection strings), create the six tables from your ERD using ready-made SQL I give you, enable email/password sign-in, and turn on Row Level Security with per-user policies on every table.
3. **Auth flow** — sign-up/sign-in pages, a protected app layout that signed-out users can't see, and session-refresh middleware — using the current Supabase libraries (@supabase/ssr, which replaced the deprecated auth-helpers).
4. **First feature** — default categories seeded, then a "log an expense" bottom-sheet form that writes to Supabase and renders in a list, automatically filtered to the logged-in user.

After Phase 1, each remaining module — budgets, savings, debts, insights/reports, PWA install — becomes its own phase on the same pattern. Approving this plan starts Phase 1 only.


## DB Query
PRAGMA foreign_keys = ON;

-- 1. Tabel profiles
CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    display_name TEXT NOT NULL,
    created_at TEXT DEFAULT (CURRENT_TIMESTAMP)
);

-- 2. Tabel pockets (Tanpa account_number)
CREATE TABLE IF NOT EXISTS pockets (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    created_at TEXT DEFAULT (CURRENT_TIMESTAMP),
    CONSTRAINT fk_pockets_user
        FOREIGN KEY (user_id) REFERENCES profiles(id)
        ON DELETE CASCADE
);

-- 3. Tabel categories
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    description TEXT,
    CHECK (
        (type = 'income' AND name IN ('salary', 'transfer')) OR
        (type = 'expense' AND name IN ('beverages', 'maintenance', 'entertainment', 'bills', 'withdrawal', 'groceries','other'))
    )
);

-- 4. Tabel savings_targets
CREATE TABLE IF NOT EXISTS savings_targets (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    user_id TEXT NOT NULL,
    pocket_id TEXT, 
    goal_title TEXT NOT NULL,
    target_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL CHECK (year >= 2000),
    CONSTRAINT fk_savings_user
        FOREIGN KEY (user_id) REFERENCES profiles(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_savings_pocket
        FOREIGN KEY (pocket_id) REFERENCES pockets(id)
        ON DELETE SET NULL
);

-- 5. Tabel debts
CREATE TABLE IF NOT EXISTS debts (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    user_id TEXT NOT NULL,
    creditor_name TEXT NOT NULL,
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    paid_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    due_date TEXT,
    status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partial', 'paid')),
    CONSTRAINT fk_debts_user
        FOREIGN KEY (user_id) REFERENCES profiles(id)
        ON DELETE CASCADE
);

-- 6. Tabel transactions
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    user_id TEXT NOT NULL,
    pocket_id TEXT NOT NULL,
    related_pocket_id TEXT, 
    category_id TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    transaction_date TEXT NOT NULL DEFAULT (CURRENT_DATE),
    note TEXT,
    CONSTRAINT fk_transactions_user
        FOREIGN KEY (user_id) REFERENCES profiles(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_transactions_pocket
        FOREIGN KEY (pocket_id) REFERENCES pockets(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_transactions_related_pocket
        FOREIGN KEY (related_pocket_id) REFERENCES pockets(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_transactions_category
        FOREIGN KEY (category_id) REFERENCES categories(id)
        ON DELETE RESTRICT
);


