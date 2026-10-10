-- ============================================================================
-- AlgoPulse: Production PostgreSQL Relational Schema
-- Unified Competitive Programming Architecture
-- Platforms: LeetCode, Codeforces, CodeChef
-- Scale: Internal Unified Rating (800 - 3500)
-- ============================================================================

-- 1. EXTENSIONS & ENUMS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE platform_type AS ENUM ('leetcode', 'codeforces', 'codechef');
CREATE TYPE submission_status AS ENUM ('AC', 'WA', 'TLE', 'MLE', 'RE', 'CE');
CREATE TYPE contest_status AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED');
CREATE TYPE sync_state AS ENUM ('idle', 'queued', 'syncing', 'completed', 'failed');

-- 2. USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    target_rating INT DEFAULT 2000 CHECK (target_rating BETWEEN 800 AND 3500),
    preferred_language VARCHAR(50) DEFAULT 'cpp',
    discord_webhook_url TEXT,
    telegram_chat_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. PLATFORM ACCOUNTS TABLE
CREATE TABLE platform_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform platform_type NOT NULL,
    handle VARCHAR(100) NOT NULL,
    current_rating INT DEFAULT 0,
    max_rating INT DEFAULT 0,
    rank_title VARCHAR(100) DEFAULT 'Unrated',
    total_solved INT DEFAULT 0,
    last_synced_at TIMESTAMPTZ,
    sync_status sync_state DEFAULT 'idle',
    sync_error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_user_platform UNIQUE (user_id, platform)
);

-- 4. CANONICAL TOPICS TABLE (Self-referencing tree hierarchy)
CREATE TABLE canonical_topics (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL, -- e.g. 'Algorithms', 'Data Structures', 'Mathematics'
    parent_topic_id VARCHAR(100) REFERENCES canonical_topics(id) ON DELETE SET NULL,
    description TEXT,
    platform_synonyms JSONB NOT NULL DEFAULT '{"leetcode":[],"codeforces":[],"codechef":[]}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. PROBLEMS TABLE (Normalized to 800 - 3500 scale)
CREATE TABLE problems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform platform_type NOT NULL,
    platform_problem_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    problem_url TEXT NOT NULL,
    raw_difficulty VARCHAR(50) NOT NULL, -- e.g., 'Medium', '1600', '4★'
    normalized_rating INT NOT NULL CHECK (normalized_rating BETWEEN 800 AND 3500),
    canonical_topic_id VARCHAR(100) NOT NULL REFERENCES canonical_topics(id) ON DELETE RESTRICT,
    sub_topic_id VARCHAR(100) REFERENCES canonical_topics(id) ON DELETE SET NULL,
    tags JSONB DEFAULT '[]'::jsonb,
    solved_count INT DEFAULT 0,
    acceptance_rate NUMERIC(5, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_platform_problem UNIQUE (platform, platform_problem_id)
);

-- 6. USER SUBMISSIONS TABLE
CREATE TABLE user_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    platform platform_type NOT NULL,
    submission_id VARCHAR(150) NOT NULL,
    status submission_status NOT NULL,
    attempts_before_ac INT DEFAULT 1,
    solve_time_minutes INT DEFAULT 0,
    memory_kb INT DEFAULT 0,
    execution_time_ms INT DEFAULT 0,
    code_language VARCHAR(50) NOT NULL,
    submitted_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_user_submission_external UNIQUE (user_id, platform, submission_id)
);

-- 7. TOPIC MASTERY & WEAKNESS ENGINE TABLE
CREATE TABLE topic_mastery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    canonical_topic_id VARCHAR(100) NOT NULL REFERENCES canonical_topics(id) ON DELETE CASCADE,
    total_solved INT DEFAULT 0,
    total_attempted INT DEFAULT 0,
    attempt_to_ac_ratio NUMERIC(5, 2) DEFAULT 1.00,
    average_solve_time_minutes NUMERIC(6, 2) DEFAULT 0.00,
    difficulty_weighted_score NUMERIC(5, 2) DEFAULT 0.00 CHECK (difficulty_weighted_score BETWEEN 0 AND 100),
    is_weakness BOOLEAN DEFAULT FALSE,
    weakness_reasons JSONB DEFAULT '[]'::jsonb,
    remedial_priority INT DEFAULT 0, -- Higher means urgent attention
    last_practiced_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_user_topic_mastery UNIQUE (user_id, canonical_topic_id)
);

-- 8. SPACED REPETITION (SM-2) REVISION QUEUE TABLE
CREATE TABLE spaced_repetition_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    repetition_number INT DEFAULT 0 NOT NULL,
    interval_days INT DEFAULT 1 NOT NULL,
    ease_factor NUMERIC(4, 2) DEFAULT 2.50 NOT NULL CHECK (ease_factor >= 1.30),
    due_date TIMESTAMPTZ NOT NULL,
    last_reviewed_at TIMESTAMPTZ,
    quality_history INT[] DEFAULT '{}',
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_user_problem_sm2 UNIQUE (user_id, problem_id)
);

-- 9. CONTESTS TABLE
CREATE TABLE contests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform platform_type NOT NULL,
    external_contest_id VARCHAR(150) NOT NULL,
    name VARCHAR(255) NOT NULL,
    contest_url TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration_seconds INT NOT NULL,
    division VARCHAR(100),
    is_rated BOOLEAN DEFAULT TRUE,
    status contest_status DEFAULT 'UPCOMING',
    synced_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_platform_contest UNIQUE (platform, external_contest_id)
);

-- 10. REMINDERS & NOTIFICATION WEBHOOKS TABLE
CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contest_id UUID NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
    notify_24h BOOLEAN DEFAULT TRUE,
    notify_1h BOOLEAN DEFAULT TRUE,
    notify_15m BOOLEAN DEFAULT TRUE,
    sent_24h BOOLEAN DEFAULT FALSE,
    sent_1h BOOLEAN DEFAULT FALSE,
    sent_15m BOOLEAN DEFAULT FALSE,
    discord_webhook_url TEXT,
    telegram_chat_id VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_user_contest_reminder UNIQUE (user_id, contest_id)
);

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================
CREATE INDEX idx_problems_rating ON problems(normalized_rating);
CREATE INDEX idx_problems_topic ON problems(canonical_topic_id);
CREATE INDEX idx_submissions_user ON user_submissions(user_id);
CREATE INDEX idx_submissions_submitted ON user_submissions(submitted_at DESC);
CREATE INDEX idx_submissions_problem ON user_submissions(problem_id);
CREATE INDEX idx_contests_start_time ON contests(start_time ASC);
CREATE INDEX idx_contests_platform ON contests(platform);
CREATE INDEX idx_sm2_user_due ON spaced_repetition_items(user_id, due_date ASC);
CREATE INDEX idx_mastery_user ON topic_mastery(user_id);

-- ============================================================================
-- AUTOMATED TRIGGER FOR UPDATED_AT TIMESTAMP
-- ============================================================================
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_problems
BEFORE UPDATE ON problems
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_topic_mastery
BEFORE UPDATE ON topic_mastery
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
