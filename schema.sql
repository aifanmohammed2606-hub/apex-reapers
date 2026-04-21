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
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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

-- Policies (Optional: Open for now for rapid prototyping)
-- IMPORTANT: Update these policies later before going to production
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on players" ON players
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on tournaments" ON tournaments
    FOR ALL USING (true);
