-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create players table
CREATE TABLE players (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    "secondaryRole" TEXT,
    available BOOLEAN DEFAULT true,
    "tournamentsPlayed" JSONB DEFAULT '[]'::JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL  -- links to auth user (one profile per user)
);

-- Create tournaments table
CREATE TABLE tournaments (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    name TEXT NOT NULL,
    date TEXT,
    time TEXT,
    format TEXT,
    type TEXT,
    "prizePool" TEXT,
    status TEXT,
    "availablePlayers" JSONB DEFAULT '[]'::JSONB,
    lineup JSONB DEFAULT '{"Jungle": "", "Gold": "", "Exp": "", "Mid": "", "Roam": ""}'::JSONB,
    substitutes JSONB DEFAULT '[]'::JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================
-- AUTH & ROLE MANAGEMENT TABLES
-- =============================================================

-- Profiles table (linked to Supabase Auth users)
-- Stores role info; auto-created on first login via the API
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    display_name TEXT,
    role TEXT NOT NULL DEFAULT 'user',  -- 'admin' or 'user'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User submissions: one-time entries per submission_type per user
CREATE TABLE user_submissions (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    submission_type TEXT NOT NULL,       -- e.g. 'player_registration'
    data JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, submission_type)    -- enforce one per type per user
);

-- =============================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================

-- Players: public read, admin-only write (enforced via API middleware)
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on players" ON players
    FOR ALL USING (true);

-- Tournaments: public read, admin-only write (enforced via API middleware)
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on tournaments" ON tournaments
    FOR ALL USING (true);

-- Profiles: service_role can do everything (API uses service key)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on profiles" ON profiles
    FOR ALL USING (true);

-- User submissions: service_role can do everything (API uses service key)
ALTER TABLE user_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on user_submissions" ON user_submissions
    FOR ALL USING (true);

-- =============================================================
-- PROMOTE YOUR ADMIN ACCOUNT (run after first login)
-- Replace 'your-admin@email.com' with your actual admin email
-- =============================================================
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
