export interface Exercise {
  id: string;
  name: string;
  category: string;
  muscle_group: string | null;
  target_muscles: string | null;
  difficulty: string;
  equipment: string | null;
  description: string | null;
  instructions: string | null;
  video_url: string | null;
  image_url: string | null;
  sets: string | null;
  repetitions: string | null;
  duration: string | null;
  rest_time: string | null;
  common_mistakes: string | null;
  safety_tips: string | null;
  beginner_modification: string | null;
  correct_form: string | null;
  breathing_technique: string | null;
  created_at: string;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description: string | null;
  difficulty: string;
  days_per_week: number;
  days: WorkoutDay[];
  created_at: string;
}

export interface WorkoutDay {
  day: string;
  exercises: {
    name: string;
    sets: string;
    reps: string;
    rest: string;
  }[];
}

export interface CustomWorkout {
  id: string;
  name: string;
  user_id: string;
  exercise_ids: string[];
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  exercise_id: string;
  exercise: Exercise;
  created_at: string;
}

export interface WorkoutHistory {
  id: string;
  user_id: string;
  exercise_id: string | null;
  exercise_name: string | null;
  workout_date: string;
  created_at: string;
}

export interface RecentlyViewed {
  id: string;
  user_id: string;
  exercise_id: string;
  exercise: Exercise;
  viewed_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  role: string;
  created_at: string;
}
