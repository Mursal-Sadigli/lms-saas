-- =========================================
-- LearnHub LMS — Verilənlər Bazası Sxemi
-- Neon SQL Editor-a kopyalayıb işlət
-- =========================================

-- UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 1. USERS ──────────────────────────────
-- Clerk autentifikasiyadan gələn istifadəçilər
CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,        -- Clerk userId (clerk_xxxx)
  email       TEXT UNIQUE NOT NULL,
  first_name  TEXT,
  last_name   TEXT,
  role        TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'educator')),
  image_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. COURSES ────────────────────────────
CREATE TABLE IF NOT EXISTS courses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  description  TEXT,
  price        NUMERIC(10,2) NOT NULL DEFAULT 0,
  thumbnail    TEXT,
  category     TEXT,
  educator_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_published BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. COURSE VIDEOS ──────────────────────
CREATE TABLE IF NOT EXISTS course_videos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  video_url   TEXT NOT NULL,
  duration    TEXT,             -- "45 dəq"
  position    INTEGER NOT NULL, -- sıralama üçün
  is_free     BOOLEAN DEFAULT false,
  description TEXT,
  quiz        JSONB,            -- [{ question, options, correctIndex }]
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. ENROLLMENTS ────────────────────────
CREATE TABLE IF NOT EXISTS enrollments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  payment_id      TEXT,          -- Stripe payment intent id
  amount_paid     NUMERIC(10,2),
  progress        INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  enrolled_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)    -- eyni kursa 2 dəfə qeydiyyat olmur
);

-- ── 5. REVIEWS ────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)    -- bir istifadəçi bir kursa bir rəy
);

-- ── 6. COUPONS ────────────────────────────
CREATE TABLE IF NOT EXISTS coupons (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code             TEXT UNIQUE NOT NULL,
  discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  course_id        UUID REFERENCES courses(id) ON DELETE CASCADE, -- specific course, if NULL applies globally for educator
  educator_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  max_uses         INTEGER,
  used_count       INTEGER DEFAULT 0,
  expires_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  is_active        BOOLEAN DEFAULT true
);

-- ── İNDEKSLƏR (performans üçün) ───────────
CREATE INDEX IF NOT EXISTS idx_courses_educator ON courses(educator_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_reviews_course ON reviews(course_id);
CREATE INDEX IF NOT EXISTS idx_videos_course ON course_videos(course_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_educator ON coupons(educator_id);

-- ── TEST DATA (isteğe bağlı, sil əgər lazım deyil) ──
-- INSERT INTO users (id, email, first_name, role)
-- VALUES ('test_educator', 'educator@test.az', 'Test', 'educator');
