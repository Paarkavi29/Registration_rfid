-- ===========================
-- RFID Registration Database
-- ===========================

-- Log of every tap from all portals
CREATE TABLE logs (
    id SERIAL PRIMARY KEY,
    log_time TIMESTAMP NOT NULL DEFAULT NOW(),
    rfid_card_id VARCHAR(32) NOT NULL,
    portal TEXT NOT NULL,                     -- which portal saw the tap
    label VARCHAR(50) NOT NULL              -- REGISTER, EXITOUT, Z1, etc.
);

-- ---------------------------
-- Registration Table
-- ---------------------------
CREATE TABLE registration (
    id SERIAL PRIMARY KEY,
    portal TEXT NOT NULL,                     -- portal where registration happened
    province TEXT,
    district TEXT,
    school TEXT,
    university TEXT,
    age_range TEXT,
    sex TEXT,
    lang TEXT,
    group_size INTEGER DEFAULT 1            -- 1 = individual, >1 = group
);

-- ---------------------------
-- Members Table
-- ---------------------------
CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    registration_id INT NOT NULL REFERENCES registration(id) ON DELETE CASCADE,
    rfid_card_id VARCHAR(32) UNIQUE NOT NULL,
    role TEXT CHECK (role IN ('LEADER','MEMBER','INDIVIDUAL')) NOT NULL,
    portal TEXT
);


-- RFID card pool (optional)
CREATE TABLE rfid_cards (
  rfid_card_id VARCHAR(32) PRIMARY KEY,
  status VARCHAR(16) NOT NULL DEFAULT 'available',
  portal TEXT,                                -- portal where card was first assigned
  CONSTRAINT rfid_cards_status_chk CHECK (LOWER(status) IN ('available','assigned'))
);

-- Users
CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT,
      role TEXT DEFAULT 'user',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
)

-- Indexes
CREATE INDEX idx_registration_portal ON registration(portal);
CREATE INDEX idx_members_portal_leader ON members(portal, registration_id);
CREATE INDEX idx_logs_portal_card_time ON logs (portal, rfid_card_id, log_time);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
