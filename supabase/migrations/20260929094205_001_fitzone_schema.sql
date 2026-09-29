/*
# FitZone - Core Database Schema

1. Purpose
   - Creates the core tables for the FitZone fitness platform.
   - Exercises are stored in a single unified table with a category field for simplicity.
   - User-specific data (favorites, workout history, custom workouts, recently viewed) is owner-scoped.

2. New Tables
   - `profiles` — extends auth.users with a display name and role (user/admin)
   - `exercises` — unified exercise library (strength, yoga, warmup, stretching, cardio)
   - `workout_plans` — predefined workout plans (admin-managed)
   - `custom_workouts` — user-created personal workouts
   - `favorites` — user's saved exercises
   - `workout_history` — completed exercise log
   - `recently_viewed` — track of recently viewed exercises

3. Security
   - RLS enabled on all tables.
   - `exercises` and `workout_plans`: public read (anon + authenticated), admin-only writes.
   - `profiles`: users read/update own profile; admins can read all profiles.
   - `favorites`, `custom_workouts`, `workout_history`, `recently_viewed`: owner-scoped CRUD.
   - Admin role is stored in `raw_app_meta_data` (user-immutable), checked via `auth.jwt() ->> 'role'`.
*/

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(auth.jwt() ->> 'role', '') = 'admin'
$$;

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR is_admin());

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- Exercises table (unified)
CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  muscle_group text,
  target_muscles text,
  difficulty text NOT NULL DEFAULT 'Beginner',
  equipment text DEFAULT 'No Equipment',
  description text,
  instructions text,
  video_url text,
  image_url text,
  sets text,
  repetitions text,
  duration text,
  rest_time text,
  common_mistakes text,
  safety_tips text,
  beginner_modification text,
  correct_form text,
  breathing_technique text,
  benefits text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_exercises" ON exercises;
CREATE POLICY "read_exercises" ON exercises FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_exercises_admin" ON exercises;
CREATE POLICY "insert_exercises_admin" ON exercises FOR INSERT
  TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "update_exercises_admin" ON exercises;
CREATE POLICY "update_exercises_admin" ON exercises FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "delete_exercises_admin" ON exercises;
CREATE POLICY "delete_exercises_admin" ON exercises FOR DELETE
  TO authenticated USING (is_admin());

-- Workout plans table (predefined, admin-managed)
CREATE TABLE IF NOT EXISTS workout_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  difficulty text DEFAULT 'Beginner',
  days_per_week int DEFAULT 3,
  days jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_workout_plans" ON workout_plans;
CREATE POLICY "read_workout_plans" ON workout_plans FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_workout_plans_admin" ON workout_plans;
CREATE POLICY "insert_workout_plans_admin" ON workout_plans FOR INSERT
  TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "update_workout_plans_admin" ON workout_plans;
CREATE POLICY "update_workout_plans_admin" ON workout_plans FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "delete_workout_plans_admin" ON workout_plans;
CREATE POLICY "delete_workout_plans_admin" ON workout_plans FOR DELETE
  TO authenticated USING (is_admin());

-- Custom workouts table (user-created)
CREATE TABLE IF NOT EXISTS custom_workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_ids jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE custom_workouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_custom_workouts" ON custom_workouts;
CREATE POLICY "select_own_custom_workouts" ON custom_workouts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_custom_workouts" ON custom_workouts;
CREATE POLICY "insert_own_custom_workouts" ON custom_workouts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_custom_workouts" ON custom_workouts;
CREATE POLICY "update_own_custom_workouts" ON custom_workouts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_custom_workouts" ON custom_workouts;
CREATE POLICY "delete_own_custom_workouts" ON custom_workouts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, exercise_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_favorites" ON favorites;
CREATE POLICY "select_own_favorites" ON favorites FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_favorites" ON favorites;
CREATE POLICY "insert_own_favorites" ON favorites FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_favorites" ON favorites;
CREATE POLICY "delete_own_favorites" ON favorites FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Workout history table
CREATE TABLE IF NOT EXISTS workout_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id uuid REFERENCES exercises(id) ON DELETE SET NULL,
  exercise_name text,
  workout_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE workout_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_history" ON workout_history;
CREATE POLICY "select_own_history" ON workout_history FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_history" ON workout_history;
CREATE POLICY "insert_own_history" ON workout_history FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_history" ON workout_history;
CREATE POLICY "delete_own_history" ON workout_history FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Recently viewed table
CREATE TABLE IF NOT EXISTS recently_viewed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  viewed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, exercise_id)
);

ALTER TABLE recently_viewed ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_recently_viewed" ON recently_viewed;
CREATE POLICY "select_own_recently_viewed" ON recently_viewed FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_recently_viewed" ON recently_viewed;
CREATE POLICY "insert_own_recently_viewed" ON recently_viewed FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_recently_viewed" ON recently_viewed;
CREATE POLICY "delete_own_recently_viewed" ON recently_viewed FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);
CREATE INDEX IF NOT EXISTS idx_exercises_muscle_group ON exercises(muscle_group);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_history_user ON workout_history(user_id);
CREATE INDEX IF NOT EXISTS idx_recently_viewed_user ON recently_viewed(user_id);
