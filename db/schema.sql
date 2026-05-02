-- schema.sql
-- PostgreSQL database schema for TORQai MVP (Supabase compatible)

-- 1. Dealer Requests
CREATE TABLE IF NOT EXISTS requests (
    id SERIAL PRIMARY KEY,
    dealer_id TEXT NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year_min INTEGER,
    year_max INTEGER,
    max_price INTEGER,
    status TEXT DEFAULT 'pending', -- pending, searching, fulfilled
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Matches found by OpenClaw / Inventory Service
CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES requests(id) ON DELETE CASCADE,
    carapi_id TEXT, -- Legacy, but keeping for compatibility
    vin TEXT,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    price INTEGER NOT NULL,
    mileage INTEGER,
    owners INTEGER,
    damage TEXT,
    recalls JSONB,
    description TEXT,
    photos JSONB,
    location TEXT,
    ai_match_score INTEGER,
    image_url TEXT,
    status TEXT DEFAULT 'pending_review', -- pending_review, approved, rejected
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Outbound Messages (Human-in-the-loop gate)
CREATE TABLE IF NOT EXISTS outbound_messages (
    id SERIAL PRIMARY KEY,
    match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,
    channel TEXT NOT NULL, -- 'whatsapp' or 'email'
    recipient TEXT NOT NULL,
    message_body TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Audit Logs (Compliance)
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    action_type TEXT NOT NULL, -- e.g., 'AGENT_SEARCH_INIT', 'MESSAGE_DRAFTED', 'HUMAN_APPROVED'
    entity_id INTEGER, -- ID of request, match, or message
    details JSONB, -- JSON payload of action details
    actor TEXT NOT NULL, -- 'system', 'agent', or 'human'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security) - Best practice for Supabase
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbound_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Note: For MVP purposes, if accessed purely via service_role key on the backend, 
-- policies might not be strictly necessary, but creating a basic public access 
-- policy or skipping it is up to the API implementation.
-- Example policy (if needed for anon key):
-- CREATE POLICY "Enable read access for all users" ON requests FOR SELECT USING (true);
