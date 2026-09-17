-- ==============================================================================
-- STUDY TRACKER & PERSONAL GROWTH DASHBOARD (ASCEND // STUDY OS)
-- SUPABASE POSTGRESQL SCHEMA MIGRATION 003: REMOVE AUTO DEFAULT CATEGORIES
-- ==============================================================================

-- Description:
-- Updates the new user trigger function so that when a new user signs up,
-- their Profile, initial Score (500), and Streak (0) are created,
-- but NO default categories or starter tasks are automatically inserted.
-- New users start with a clean workspace to create their own custom categories and missions.
-- Existing users' categories, tasks, and data are 100% UNTOUCHED and PRESERVED.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- 1. Create Profile
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    );

    -- 2. Create Initial Study Score (Starting baseline at 500)
    INSERT INTO public.study_scores (user_id, current_score, highest_score)
    VALUES (NEW.id, 500, 500)
    ON CONFLICT (user_id) DO NOTHING;

    -- 3. Create Initial Streak Record (0 days)
    INSERT INTO public.streaks (user_id, current_streak, longest_streak)
    VALUES (NEW.id, 0, 0)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-bind trigger to auth.users (ensuring clean hook)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
