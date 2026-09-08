-- ==============================================================================
-- STUDY TRACKER & PERSONAL GROWTH DASHBOARD (ASCEND // STUDY OS)
-- SUPABASE POSTGRESQL SCHEMA MIGRATION 001
-- ==============================================================================

-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- 2. CATEGORIES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'Rocket',
    description TEXT,
    importance_level TEXT NOT NULL DEFAULT 'Medium Impact',
    point_multiplier NUMERIC(3, 2) NOT NULL DEFAULT 1.0,
    is_skill_category BOOLEAN NOT NULL DEFAULT false,
    color TEXT NOT NULL DEFAULT 'indigo',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own categories"
    ON public.categories FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);

-- ------------------------------------------------------------------------------
-- 3. TASKS TABLE (with Weekly Frequency & Weekday Schedules)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 25 CHECK (points >= 1 AND points <= 100),
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
    weekly_frequency INTEGER NOT NULL DEFAULT 5 CHECK (weekly_frequency >= 1 AND weekly_frequency <= 7),
    specific_days TEXT[] NOT NULL DEFAULT ARRAY['Mon', 'Tue', 'Wed', 'Thu', 'Fri']::TEXT[],
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own tasks"
    ON public.tasks FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_category_id ON public.tasks(category_id);

-- ------------------------------------------------------------------------------
-- 4. DAILY RECORDS TABLE (One row per user per date)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    completion_percentage INTEGER NOT NULL DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    daily_points INTEGER NOT NULL DEFAULT 0,
    score_change INTEGER NOT NULL DEFAULT 0,
    credit_score_after INTEGER NOT NULL DEFAULT 500 CHECK (credit_score_after >= 0 AND credit_score_after <= 1000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_daily_records_user_date UNIQUE (user_id, date)
);

ALTER TABLE public.daily_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own daily records"
    ON public.daily_records FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_daily_records_user_date ON public.daily_records(user_id, date);

-- ------------------------------------------------------------------------------
-- 5. COMPLETED TASKS TABLE (Individual task completions per date)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.completed_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_completed_tasks_user_task_date UNIQUE (user_id, task_id, date)
);

ALTER TABLE public.completed_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own completed tasks"
    ON public.completed_tasks FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_completed_tasks_user_date ON public.completed_tasks(user_id, date);

-- ------------------------------------------------------------------------------
-- 6. STUDY SCORES TABLE (Persistent 0 - 1000 Score)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.study_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    current_score INTEGER NOT NULL DEFAULT 500 CHECK (current_score >= 0 AND current_score <= 1000),
    highest_score INTEGER NOT NULL DEFAULT 500 CHECK (highest_score >= 0 AND highest_score <= 1000),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.study_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own study score"
    ON public.study_scores FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 7. STREAKS TABLE (Persistent Streak Tracking)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_active_date DATE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own streak"
    ON public.streaks FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 8. ACHIEVEMENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_type TEXT NOT NULL,
    achievement_name TEXT NOT NULL,
    achieved_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_achievements_user_type UNIQUE (user_id, achievement_type)
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own achievements"
    ON public.achievements FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 9. AUTOMATIC TRIGGER TO INITIALIZE NEW USERS
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_skills_id UUID;
    v_routine_id UUID;
    v_fitness_id UUID;
    v_reading_id UUID;
BEGIN
    -- 1. Create Profile
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    );

    -- 2. Create Initial Study Score (Starting at 500)
    INSERT INTO public.study_scores (user_id, current_score, highest_score)
    VALUES (NEW.id, 500, 500);

    -- 3. Create Initial Streak Record
    INSERT INTO public.streaks (user_id, current_streak, longest_streak)
    VALUES (NEW.id, 0, 0);

    -- 4. Create Default Categories
    INSERT INTO public.categories (user_id, name, icon, description, importance_level, point_multiplier, is_skill_category, color)
    VALUES (NEW.id, 'Skills & Study', 'Rocket', 'High-leverage academic & career-defining skills.', 'High Impact', 2.2, true, 'indigo')
    RETURNING id INTO v_skills_id;

    INSERT INTO public.categories (user_id, name, icon, description, importance_level, point_multiplier, is_skill_category, color)
    VALUES (NEW.id, 'Daily Routine', 'Sun', 'Foundational morning/evening discipline habits.', 'Low Impact', 0.3, false, 'amber')
    RETURNING id INTO v_routine_id;

    INSERT INTO public.categories (user_id, name, icon, description, importance_level, point_multiplier, is_skill_category, color)
    VALUES (NEW.id, 'Fitness & Health', 'Dumbbell', 'Physical conditioning and wellness.', 'Medium Impact', 1.2, false, 'emerald')
    RETURNING id INTO v_fitness_id;

    INSERT INTO public.categories (user_id, name, icon, description, importance_level, point_multiplier, is_skill_category, color)
    VALUES (NEW.id, 'Reading & Intellect', 'BookOpen', 'Engineering papers, deep reading, and mental models.', 'Medium Impact', 1.1, false, 'purple')
    RETURNING id INTO v_reading_id;

    -- 5. Create Default Starter Tasks
    INSERT INTO public.tasks (user_id, category_id, name, points, priority, weekly_frequency, specific_days)
    VALUES
        (NEW.id, v_skills_id, 'DSA & Algorithms (LeetCode / NeetCode)', 40, 'High', 5, ARRAY['Mon', 'Tue', 'Wed', 'Fri', 'Sat']),
        (NEW.id, v_skills_id, 'Full-Stack Web Dev (React & System Architecture)', 35, 'High', 5, ARRAY['Mon', 'Tue', 'Thu', 'Fri', 'Sun']),
        (NEW.id, v_skills_id, 'Mathematics & Discrete Structures', 35, 'Medium', 3, ARRAY['Tue', 'Thu', 'Sat']),
        (NEW.id, v_routine_id, 'Wake Up at 6:00 AM', 5, 'Medium', 7, ARRAY['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']),
        (NEW.id, v_routine_id, 'Morning Hydration (1L) & Cold Splash', 3, 'Low', 7, ARRAY['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']),
        (NEW.id, v_routine_id, 'Evening Review & Next-Day Blueprint', 6, 'Medium', 7, ARRAY['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']),
        (NEW.id, v_fitness_id, '45-Min Calisthenics / Strength Session', 15, 'Medium', 4, ARRAY['Mon', 'Wed', 'Fri', 'Sun']),
        (NEW.id, v_reading_id, 'Read 20 Pages of Engineering / Philosophy', 15, 'Medium', 5, ARRAY['Mon', 'Tue', 'Wed', 'Thu', 'Sat']);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Realtime for multi-device sync
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_records;
ALTER PUBLICATION supabase_realtime ADD TABLE public.completed_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.study_scores;
ALTER PUBLICATION supabase_realtime ADD TABLE public.streaks;
